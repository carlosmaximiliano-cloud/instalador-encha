import { z } from "zod";
import { getStack } from "./stacks/registry";
import {
  deploySwarmStack,
  discoverContext,
  ensurePostgresDatabase,
  ensurePostgresExtension,
  ensureSwarmVolume,
  listStacks,
  pullImageWithRegistry,
  type Stack,
} from "./portainer";
import { RegistryAuthError, ensureRegistry, exchangeLicenseForGhcrCredentials } from "./registry-auth";
import { ReleaseInfoError, fetchLatestRelease } from "./release-info";
import { ensureHostDirs } from "./host-dirs";
import { logAudit } from "./audit";
import { encryptSecret } from "./crypto";
import { getDb } from "./db";
import { getOrCreateMachineId, buscarPareamento, chaveDoPareamento, consumirPareamento } from "./pairing-store";
import { fingerprintEnchat } from "./enchat-fingerprint";
import type { SwarmContext, GeneratedSecret } from "./stacks/types";

export type InstallInput = {
  stackId: string;
  values: Record<string, unknown>;
  swarmCtx: SwarmContext;
  token: string;
  user: string;
  ip: string;
};

export type InstallResult = {
  ok: boolean;
  stack?: Stack;
  error?: string;
  /** Causa estruturada (ver RegistryAuthReason/ReleaseInfoReason) — permite o cliente/API distinguir "chave errada" de "Console fora do ar" em vez de um 400 genérico pra tudo. */
  reason?: string;
  /** Status HTTP sugerido pra API route devolver — falha do lado do EnchaT vira 502/504/429, nunca 400. */
  httpStatus?: number;
  generatedSecrets?: GeneratedSecret[];
};

// Mapeia a causa estruturada de RegistryAuthError/ReleaseInfoError pro status
// HTTP que a API route deve devolver. Sem isso, TODO erro de install virava
// 400 — foi exatamente isso que escondeu o 503 "registry_nao_configurado" do
// Console original: o cliente via só "Erro na instalação", sem status nem
// motivo, e não dava pra saber se o problema era a chave ou o serviço do
// EnchaT. Ver registry-auth.ts e release-info.ts para as taxonomias.
function statusForCause(e: unknown): { httpStatus: number; reason?: string } {
  if (e instanceof RegistryAuthError) {
    switch (e.reason) {
      case "timeout":
        return { httpStatus: 504, reason: e.reason };
      case "rate_limited":
        return { httpStatus: 429, reason: e.reason };
      case "unauthorized":
      case "chave_nao_encontrada":
      case "chave_revogada":
      case "chave_expirada":
      case "fingerprint_mismatch":
      case "updates_expirados":
        // Casos que são "culpa" da chave/licença informada, não do serviço
        // do EnchaT — a distinção fina entre eles vive só na `message` e no
        // `reason` (ver registry-auth.ts); o status HTTP pro chamador é o
        // mesmo 400 pros seis.
        return { httpStatus: 400, reason: e.reason };
      case "network":
      case "server":
      case "not_found":
      case "malformed":
      case "contract":
        return { httpStatus: 502, reason: e.reason };
    }
  }
  if (e instanceof ReleaseInfoError) {
    switch (e.reason) {
      case "timeout":
        return { httpStatus: 504, reason: e.reason };
      case "network":
      case "not_found":
      case "server":
      case "malformed":
      case "contract":
        return { httpStatus: 502, reason: e.reason };
    }
  }
  // Erro não estruturado (bug de código, falha do Portainer, etc.) — 500
  // continua correto: não é nem "chave errada" nem "Console fora do ar".
  return { httpStatus: 500 };
}

function shouldEncryptField(name: string): boolean {
  return /pass|senha|secret|token|key|apikey/i.test(name);
}

// Remove campos que nunca devem ser persistidos (ex.: chave de licença) —
// nem no blob criptografado, nem no meta do audit log. Cópia rasa; não muda
// o objeto original.
function stripTransient(
  values: Record<string, unknown>,
  transientFields?: string[]
): Record<string, unknown> {
  if (!transientFields?.length) return values;
  const out = { ...values };
  for (const f of transientFields) delete out[f];
  return out;
}

function buildSecretMap(secrets: GeneratedSecret[], reused: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of secrets) {
    if (s.value === "REUSE_POSTGRES") {
      out[s.name] = reused.senha_postgres ?? "";
    } else if (s.value === "REUSE_MINIO") {
      out[s.name] = reused.minio_access ?? "";
    } else if (s.value === "REUSE_MYSQL") {
      out[s.name] = reused.senha_mysql ?? "";
    } else {
      out[s.name] = s.value;
    }
  }
  return out;
}

async function loadReusedSecrets(): Promise<Record<string, string>> {
  const db = getDb();
  const row = db
    .prepare("SELECT encrypted_envs FROM stack_secrets WHERE stack_name = ?")
    .get("__shared__") as { encrypted_envs: string } | undefined;
  if (!row) return {};
  try {
    const { decryptSecret } = await import("./crypto");
    return JSON.parse(decryptSecret(row.encrypted_envs));
  } catch {
    return {};
  }
}

// Segredos que a PRÓPRIA stack já gerou numa instalação anterior (ex.:
// enchat_master_key, postgres_password do "enchat"). Diferente de
// loadReusedSecrets (que só cobre os sentinels REUSE_* compartilhados entre
// stacks distintas), isto cobre o reinstall/retry da MESMA stack: sem isso,
// cada POST /api/stacks gera valores novos via randomBytes, e um segundo
// install (retry após falha parcial, ou o operador clicando "Instalar" de
// novo) troca ENCHAT_MASTER_KEY e a senha do Postgres por baixo do capô —
// a app já teria dados gravados sob a chave/senha antigas e o boot aborta
// no canary de criptografia (ver internal/crypto no repo do EnchaT).
async function loadStackOwnSecrets(stackName: string): Promise<Record<string, string>> {
  const db = getDb();
  const row = db
    .prepare("SELECT encrypted_envs FROM stack_secrets WHERE stack_name = ?")
    .get(stackName) as { encrypted_envs: string } | undefined;
  if (!row) return {};
  try {
    const { decryptSecret } = await import("./crypto");
    const parsed = JSON.parse(decryptSecret(row.encrypted_envs)) as { generated?: GeneratedSecret[] };
    const out: Record<string, string> = {};
    for (const g of parsed.generated ?? []) {
      if (g && typeof g.name === "string" && typeof g.value === "string") out[g.name] = g.value;
    }
    return out;
  } catch {
    return {};
  }
}

function saveSharedSecrets(secrets: Record<string, string>): void {
  const db = getDb();
  const blob = encryptSecret(JSON.stringify(secrets));
  const now = Date.now();
  db.prepare(
    `INSERT INTO stack_secrets (stack_name, encrypted_envs, created_at, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(stack_name) DO UPDATE SET encrypted_envs = excluded.encrypted_envs, updated_at = excluded.updated_at`
  ).run("__shared__", blob, now, now);
}

function saveStackSecrets(
  stackName: string,
  envs: Record<string, unknown>,
  generated: GeneratedSecret[],
  transientFields?: string[]
): void {
  // Defesa em profundidade: mesmo que o chamador já tenha filtrado, nunca
  // deixar um campo transiente (ex.: chave de licença) chegar aqui dentro.
  if (transientFields?.some((f) => f in envs)) {
    throw new Error("Tentativa de persistir campo transiente em stack_secrets — bug no installer.");
  }
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(envs)) {
    safe[k] = shouldEncryptField(k) ? "[encrypted]" : v;
  }
  const payload = { values: safe, generated_count: generated.length };
  const db = getDb();
  const blob = encryptSecret(JSON.stringify({ values: envs, generated }));
  const now = Date.now();
  db.prepare(
    `INSERT INTO stack_secrets (stack_name, encrypted_envs, created_at, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(stack_name) DO UPDATE SET encrypted_envs = excluded.encrypted_envs, updated_at = excluded.updated_at`
  ).run(stackName, blob, now, now);
  logAudit({
    user: "system",
    ip: "local",
    action: "stack.install",
    target: stackName,
    result: "ok",
    meta: payload,
  });
}

export async function installStack(input: InstallInput): Promise<InstallResult> {
  const def = getStack(input.stackId);
  if (!def) return { ok: false, error: "Stack desconhecida" };

  const parsed = def.schema.safeParse(input.values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors.map((e: z.ZodIssue) => e.message).join("; ") };
  }

  try {
    // Pareamento self-service de licença (Fase 4): se a stack declara
    // `pairing` e o form mandou uma sessão confirmada, a chave e o
    // machine_id vêm DAQUI — nunca da chave digitada à mão nem recomputados
    // por getOrCreateMachineId. É essa fonte única que garante que o
    // fingerprint usado no exchange do registryAuth (abaixo) e o
    // ENCHAT_MACHINE_ID injetado no YAML são EXATAMENTE o que o Console já
    // vinculou no pareamento — qualquer divergência aqui vira
    // fingerprint_mismatch irreversível depois do primeiro boot.
    let pareamentoId: string | undefined;
    let pareamentoMachineId: string | undefined;
    let pareamentoFingerprint: string | undefined;
    if (def.pairing) {
      const pid = String(parsed.data[def.pairing.sessionField] ?? "");
      if (pid) {
        const row = buscarPareamento(pid);
        if (!row || row.stack_id !== input.stackId) {
          throw new Error("Sessão de pareamento de licença não encontrada — gere um novo pareamento e tente de novo.");
        }
        if (row.status !== "confirmado") {
          throw new Error(`Sessão de pareamento de licença ainda não confirmada (status: ${row.status}).`);
        }
        // Sanidade: o fingerprint gravado tem que bater com a fórmula
        // aplicada ao machine_id gravado — nunca deveria divergir (os dois
        // nascem juntos em getOrCreateMachineId), mas seguir com uma
        // inconsistência aqui instalaria com um fingerprint errado, então
        // aborta em vez de tentar adivinhar qual dos dois está certo.
        if (fingerprintEnchat(row.machine_id) !== row.fingerprint) {
          throw new Error("Inconsistência no pareamento de licença (fingerprint não bate com machine_id) — instalação abortada.");
        }
        // Guarda contra instalar a edição errada com o plano errado: como
        // pairStart manda suporta_selecao=true, o Console pode confirmar
        // com uma licença PAGA (basico/pro/max) se for a única elegível pro
        // CPF — mas esta stack só instala a imagem "free". Sem esta
        // checagem, o cliente instalaria o binário Grátis com uma chave
        // paga, que na melhor hipótese é desperdício e na pior confunde o
        // /licenses/check depois. `plano` fica nulo em pareamentos de antes
        // desta checagem existir — não bloqueia esses retroativamente.
        if (def.pairing.edicao === "free" && row.plano && row.plano !== "gratis") {
          throw new Error(
            `Esta licença é do plano "${row.plano}", não do Grátis — gere uma licença grátis para instalar esta edição, ou instale a edição MAX com esta chave.`
          );
        }
        const chave = chaveDoPareamento(pid);
        if (!chave) {
          throw new Error("Não foi possível recuperar a chave de licença do pareamento confirmado.");
        }
        parsed.data[def.pairing.targetField] = chave;
        pareamentoId = pid;
        pareamentoMachineId = row.machine_id;
        pareamentoFingerprint = row.fingerprint;
      }
    }

    const reused = await loadReusedSecrets();
    const previousOwn = await loadStackOwnSecrets(input.stackId);
    const generated = (def.generateSecrets?.(parsed.data) ?? []).map((g) => {
      if (g.value === "REUSE_POSTGRES" || g.value === "REUSE_MINIO" || g.value === "REUSE_MYSQL") return g;
      const prev = previousOwn[g.name];
      return prev !== undefined ? { ...g, value: prev } : g;
    });
    const secretMap = buildSecretMap(generated, reused);

    const sharedToPersist: Record<string, string> = { ...reused };
    for (const g of generated) {
      if (g.value === "REUSE_POSTGRES" || g.value === "REUSE_MINIO" || g.value === "REUSE_MYSQL") continue;
      if (def.id === "postgres" && g.name === "senha_postgres") sharedToPersist.senha_postgres = g.value;
      if (def.id === "minio" && g.name === "minio_access") sharedToPersist.minio_access = g.value;
      if (def.id === "mysql" && g.name === "senha_mysql") sharedToPersist.senha_mysql = g.value;
    }

    // Resolve a versão/imagem pelo Console ANTES do YAML e do registryAuth —
    // as duas etapas seguintes dependem do resultado (generateYaml monta
    // `image:` a partir daqui; registryAuth.images pré-puxa a mesma imagem).
    let effectiveCtx = input.swarmCtx;
    if (def.release) {
      try {
        const release = await fetchLatestRelease(
          def.release.baseUrl,
          def.release.app,
          def.release.edicao,
          def.release.canal
        );
        effectiveCtx = { ...input.swarmCtx, release };
        logAudit({
          user: input.user,
          ip: input.ip,
          action: "release.resolve",
          target: def.release.baseUrl,
          result: "ok",
          meta: { version: release.version, image_repo: release.imageRepo, image_tag: release.imageTag },
        });
      } catch (e) {
        const meta: Record<string, unknown> = {
          error: e instanceof Error ? e.message : "Erro desconhecido",
        };
        if (e instanceof ReleaseInfoError) {
          meta.reason = e.reason;
          if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
          if (e.serverDetail !== undefined) meta.serverDetail = e.serverDetail;
        }
        logAudit({
          user: input.user,
          ip: input.ip,
          action: "release.resolve.fail",
          target: def.release.baseUrl,
          result: "error",
          meta,
        });
        throw e;
      }
    }

    // Machine id + fingerprint de instalação — mesmo gate declarativo de
    // `release` acima (stacks com registryAuth são as que precisam de
    // licenciamento vinculado a ESTA VPS). Cunhado ANTES do generateYaml
    // porque o YAML e o exchange de registryAuth precisam do MESMO valor;
    // recalcular depois abriria a chance de divergir. Se um pareamento foi
    // resolvido acima, os valores vêm DELE (nunca recomputados) — é a
    // mesma dupla que o Console já vinculou. Sem pareamento (chave colada
    // à mão), `getOrCreateMachineId` decide (e já cuida de preservar o
    // fingerprint de uma instalação anterior, nunca cunhando um novo por
    // cima de uma stack já instalada).
    if (def.registryAuth) {
      if (pareamentoMachineId !== undefined && pareamentoFingerprint !== undefined) {
        effectiveCtx = { ...effectiveCtx, machineId: pareamentoMachineId, fingerprint: pareamentoFingerprint };
      } else {
        const { machineId, fingerprint } = getOrCreateMachineId(input.stackId);
        effectiveCtx = { ...effectiveCtx, machineId, fingerprint };
      }
    }

    const yaml = def.generateYaml(parsed.data, secretMap, effectiveCtx);
    const { endpointId, swarmId } = await discoverContext(input.token);

    // Credencial de registro privado (ex.: GHCR) — precisa existir no
    // Portainer ANTES do deploy, é lá que ele resolve o EncodedRegistryAuth
    // por serviço. O pré-pull falha rápido se a chave não tiver acesso, em
    // vez de deixar as tasks presas em `pending` sem explicação.
    //
    // Retry (3 tentativas, backoff): a credencial devolvida pelo exchange
    // pode ter vida curta — repetir SÓ o pull com a mesma credencial vencida
    // falha do mesmo jeito, então cada tentativa refaz o exchange +
    // ensureRegistry (que já faz UPDATE, não INSERT, quando o registry
    // existe) antes de repetir o pré-pull. `pullImageWithRegistry` lê a
    // senha por `registryId`, então basta atualizar o registry no Portainer
    // pra a MESMA chamada de pull passar a usar a credencial nova. Só NÃO
    // repete em erro que não é transitório (chave inválida/revogada,
    // fingerprint_mismatch etc.) — aí é erro do cliente, não da rede.
    if (def.registryAuth) {
      const MAX_TENTATIVAS = 3;
      let ultimoErro: unknown;
      let sucesso = false;
      for (let tentativa = 1; tentativa <= MAX_TENTATIVAS && !sucesso; tentativa++) {
        if (tentativa > 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * tentativa));
        }
        try {
          const chave = String(parsed.data[def.registryAuth.licenseField] ?? "");
          const creds = await exchangeLicenseForGhcrCredentials(
            def.registryAuth.exchangeUrl,
            chave,
            effectiveCtx.fingerprint
          );
          const registryId = await ensureRegistry(input.token, {
            url: def.registryAuth.registryHost,
            name: def.registryAuth.registryName,
            username: creds.username,
            password: creds.token,
          });
          logAudit({
            user: input.user,
            ip: input.ip,
            action: "registry.auth",
            target: def.registryAuth.registryHost,
            result: "ok",
            meta: { registryId, username: creds.username, tentativa }, // nunca a chave nem o token
          });
          for (const img of def.registryAuth.images(parsed.data, effectiveCtx.release)) {
            await pullImageWithRegistry(input.token, endpointId, img, registryId);
          }
          sucesso = true;
        } catch (e) {
          ultimoErro = e;
          // RegistryAuthError carrega a causa estruturada (reason/httpStatus/
          // serverDetail) — grava tudo no audit em vez de só a mensagem
          // final, pra dar pra distinguir depois "chave errada" de "Console
          // fora do ar" sem precisar reproduzir o problema. Nunca inclui a
          // chave nem o token (RegistryAuthError já não os captura em lugar
          // nenhum). Falha de PULL (não é RegistryAuthError — é
          // PortainerError, lançada dentro de pullImageRaw) sempre é tratada
          // como transitória: é justamente o caso "credencial venceu no
          // meio do download", que só se resolve tentando de novo.
          const meta: Record<string, unknown> = {
            error: e instanceof Error ? e.message : "Erro desconhecido",
            tentativa,
          };
          let transitorio = true;
          if (e instanceof RegistryAuthError) {
            meta.reason = e.reason;
            if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
            if (e.serverDetail !== undefined) meta.serverDetail = e.serverDetail;
            transitorio =
              e.reason === "timeout" ||
              e.reason === "network" ||
              e.reason === "rate_limited" ||
              e.reason === "server";
          }
          logAudit({
            user: input.user,
            ip: input.ip,
            action: "registry.auth.fail",
            target: def.registryAuth.registryHost,
            result: "error",
            meta,
          });
          if (!transitorio || tentativa === MAX_TENTATIVAS) {
            throw e;
          }
        }
      }
      if (!sucesso) {
        // Inatingível de fato (o laço só sai sem sucesso lançando acima),
        // mas o TypeScript não sabe disso — guarda explícita evita "possibly
        // used before assigned" mais adiante e documenta a invariante.
        throw ultimoErro instanceof Error ? ultimoErro : new Error("Falha desconhecida no registry-auth");
      }
    }

    // Diretórios de bind mount no node manager — o Swarm não os cria sozinho.
    if (def.hostDirs?.length) {
      await ensureHostDirs(input.token, endpointId, def.hostDirs);
    }

    for (const vol of def.externalVolumes ?? []) {
      await ensureSwarmVolume(input.token, endpointId, vol);
    }
    for (const db of def.postgresDatabases ?? []) {
      await ensurePostgresDatabase(input.token, endpointId, db);
    }
    for (const { database, extensions } of def.postgresExtensions ?? []) {
      for (const ext of extensions) {
        await ensurePostgresExtension(input.token, endpointId, database, ext);
      }
    }
    const stack = await deploySwarmStack({
      token: input.token,
      name: input.stackId.replace(/-/g, "_"),
      yaml,
      swarmId,
      endpointId,
    });

    saveStackSecrets(input.stackId, stripTransient(parsed.data, def.transientFields), generated, def.transientFields);
    if (Object.keys(sharedToPersist).length > 0) saveSharedSecrets(sharedToPersist);

    // Só consome o pareamento DEPOIS do deploy ter sucesso — se o Console
    // caísse ou o deploy falhasse antes deste ponto, a chave continua
    // recuperável (cifrada em license_pairings) para uma nova tentativa,
    // em vez de perdida junto com uma sessão já marcada como usada.
    if (pareamentoId) consumirPareamento(pareamentoId);

    logAudit({
      user: input.user,
      ip: input.ip,
      action: "stack.install",
      target: input.stackId,
      result: "ok",
      meta: { portainer_stack_id: stack.Id },
    });

    return { ok: true, stack, generatedSecrets: generated };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    const { httpStatus, reason } = statusForCause(e);
    logAudit({
      user: input.user,
      ip: input.ip,
      action: "stack.install.fail",
      target: input.stackId,
      result: "error",
      meta: { error: msg, reason, httpStatus },
    });
    return { ok: false, error: msg, reason, httpStatus };
  }
}

export async function listInstalledStacks(token: string): Promise<Stack[]> {
  return listStacks(token);
}
