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
import { ensureRegistry, exchangeLicenseForGhcrCredentials } from "./registry-auth";
import { ensureHostDirs } from "./host-dirs";
import { logAudit } from "./audit";
import { encryptSecret } from "./crypto";
import { getDb } from "./db";
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
  generatedSecrets?: GeneratedSecret[];
};

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
    const reused = await loadReusedSecrets();
    const generated = def.generateSecrets?.(parsed.data) ?? [];
    const secretMap = buildSecretMap(generated, reused);

    const sharedToPersist: Record<string, string> = { ...reused };
    for (const g of generated) {
      if (g.value === "REUSE_POSTGRES" || g.value === "REUSE_MINIO" || g.value === "REUSE_MYSQL") continue;
      if (def.id === "postgres" && g.name === "senha_postgres") sharedToPersist.senha_postgres = g.value;
      if (def.id === "minio" && g.name === "minio_access") sharedToPersist.minio_access = g.value;
      if (def.id === "mysql" && g.name === "senha_mysql") sharedToPersist.senha_mysql = g.value;
    }

    const yaml = def.generateYaml(parsed.data, secretMap, input.swarmCtx);
    const { endpointId, swarmId } = await discoverContext(input.token);

    // Credencial de registro privado (ex.: GHCR) — precisa existir no
    // Portainer ANTES do deploy, é lá que ele resolve o EncodedRegistryAuth
    // por serviço. O pré-pull falha rápido se a chave não tiver acesso, em
    // vez de deixar as tasks presas em `pending` sem explicação.
    if (def.registryAuth) {
      try {
        const chave = String(parsed.data[def.registryAuth.licenseField] ?? "");
        const creds = await exchangeLicenseForGhcrCredentials(def.registryAuth.exchangeUrl, chave);
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
          meta: { registryId, username: creds.username }, // nunca a chave nem o token
        });
        for (const img of def.registryAuth.images(parsed.data)) {
          await pullImageWithRegistry(input.token, endpointId, img, registryId);
        }
      } catch (e) {
        logAudit({
          user: input.user,
          ip: input.ip,
          action: "registry.auth.fail",
          target: def.registryAuth.registryHost,
          result: "error",
          meta: { error: e instanceof Error ? e.message : "Erro desconhecido" },
        });
        throw e;
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
    logAudit({
      user: input.user,
      ip: input.ip,
      action: "stack.install.fail",
      target: input.stackId,
      result: "error",
      meta: { error: msg },
    });
    return { ok: false, error: msg };
  }
}

export async function listInstalledStacks(token: string): Promise<Stack[]> {
  return listStacks(token);
}
