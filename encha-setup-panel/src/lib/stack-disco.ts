import {
  getServiceExact,
  getVolumeMountpoint,
  imageExistsLocally,
  listServiceTasks,
  pullImage,
  runOneShotJob,
  type Stack,
} from "./portainer";
import { APP_VERSION } from "./version";
import { createHash } from "node:crypto";

// Grava o arquivo (compose) de uma stack Portainer DIRETO no disco do node, sem
// redeploy (F0/H4, encha-test 2026-10-09): `GET /api/stacks/{id}/file` lê esse
// arquivo, então a próxima vez que alguém clicar "Update the stack" o editor já
// traz as imagens fixadas — e, ao contrário de um PUT, nada reinicia (um PUT
// logo depois de uma atualização por fora do YAML recriava o sidecar/Pinfy:
// ordem dos mounts e UpdateConfig reescritos).
//
// Segurança: o job roda como root no host com bind RW em UM diretório
// (<dados do Portainer>/compose/<id>), nunca no volume inteiro. O caminho vem
// da API do Portainer (ProjectPath/EntryPoint) e é validado por regex estrita;
// nenhum valor de usuário entra no corpo do script — tudo vai por variáveis de
// ambiente validadas (hex/base64) e o script é uma constante.

const PANEL_IMAGE_REPO = "ghcr.io/enchaaluno/setup-panel";
const FALLBACK_IMAGE = "alpine/git:2.45.2";
const NOME_JOB = "encha-stack-sync";
const LABEL_JOB = "com.encha.role=stack-sync";

export const RE_PROJECT_PATH = /^\/data\/compose\/\d+$/;
export const RE_ENTRYPOINT = /^[A-Za-z0-9._-]+\.ya?ml$/;
const RE_SHA256 = /^[0-9a-f]{64}$/;
const RE_B64 = /^[A-Za-z0-9+/=]+$/;
// O arquivo é um YAML de poucas dezenas de KB; recusa algo absurdo.
const MAX_BYTES = 256 * 1024;

export class StackDiscoError extends Error {
  constructor(
    public readonly codigo:
      | "sem_diretorio"
      | "caminho_invalido"
      | "sem_arquivo"
      | "divergiu"
      | "corrompido"
      | "job_falhou"
      | "verificacao_falhou",
    detalhe?: string
  ) {
    super(detalhe ? `${codigo}: ${detalhe}` : codigo);
    this.name = "StackDiscoError";
  }
}

export const sha256 = (txt: string): string => createHash("sha256").update(txt, "utf8").digest("hex");

export const MARCA_OK = "ENCHA_SYNC_OK";
export const MARCA_SEM_ARQUIVO = "ENCHA_SYNC_SEM_ARQUIVO";
export const MARCA_DIVERGIU = "ENCHA_SYNC_DIVERGIU";
export const MARCA_CORROMPIDO = "ENCHA_SYNC_CORROMPIDO";
export const MARCA_RESTAURADO = "ENCHA_SYNC_RESTAURADO";

// Compare-and-swap: só troca se o arquivo atual tem o hash esperado; escreve
// num temporário no MESMO diretório, confere o hash, guarda cópia do original
// (<arquivo>.enchat-pre-sync), copia dono/permissão e finaliza com `mv`
// (atômico no mesmo filesystem).
export const SCRIPT_GRAVAR = [
  "set -eu",
  'D=/stackdir; F="$D/$ARQ"; T="$D/.enchat-sync.tmp"',
  `if [ ! -f "$F" ]; then echo ${MARCA_SEM_ARQUIVO}; exit 0; fi`,
  'atual=$(sha256sum "$F" | cut -d" " -f1)',
  `if [ "$atual" != "$ESPERADO_SHA" ]; then echo ${MARCA_DIVERGIU}; exit 0; fi`,
  `printf '%s' "$NOVO_B64" | base64 -d > "$T"`,
  'novo=$(sha256sum "$T" | cut -d" " -f1)',
  `if [ "$novo" != "$NOVO_SHA" ]; then rm -f "$T"; echo ${MARCA_CORROMPIDO}; exit 0; fi`,
  'cp -p "$F" "$F.enchat-pre-sync"',
  'chmod "$(stat -c %a "$F")" "$T"',
  'chown "$(stat -c %u:%g "$F")" "$T"',
  'mv "$T" "$F"',
  `echo ${MARCA_OK}`,
].join("\n");

// Desfaz a gravação SÓ se o arquivo ainda é exatamente o que gravamos.
export const SCRIPT_RESTAURAR = [
  "set -eu",
  'D=/stackdir; F="$D/$ARQ"; T="$D/.enchat-sync.tmp"',
  `if [ ! -f "$F.enchat-pre-sync" ]; then echo ${MARCA_SEM_ARQUIVO}; exit 0; fi`,
  'atual=$(sha256sum "$F" | cut -d" " -f1)',
  `if [ "$atual" != "$ESPERADO_SHA" ]; then echo ${MARCA_DIVERGIU}; exit 0; fi`,
  'cp -p "$F.enchat-pre-sync" "$T"',
  'mv "$T" "$F"',
  `echo ${MARCA_RESTAURADO}`,
].join("\n");

export type ParamsGravar = { arquivo: string; esperadoSha: string; novoSha: string; novoB64: string };

/** Valida e monta as variáveis de ambiente do job (nunca interpola no script). */
export function envDoJob(p: ParamsGravar & { modo: "gravar" | "restaurar" }): string[] {
  if (!RE_ENTRYPOINT.test(p.arquivo)) throw new StackDiscoError("caminho_invalido", "arquivo");
  if (!RE_SHA256.test(p.esperadoSha)) throw new StackDiscoError("caminho_invalido", "sha esperado");
  if (p.modo === "gravar") {
    if (!RE_SHA256.test(p.novoSha)) throw new StackDiscoError("caminho_invalido", "sha novo");
    if (!RE_B64.test(p.novoB64) || p.novoB64.length > Math.ceil((MAX_BYTES * 4) / 3) + 4) {
      throw new StackDiscoError("caminho_invalido", "conteúdo");
    }
  }
  const env = [`ARQ=${p.arquivo}`, `ESPERADO_SHA=${p.esperadoSha}`];
  if (p.modo === "gravar") env.push(`NOVO_SHA=${p.novoSha}`, `NOVO_B64=${p.novoB64}`);
  return env;
}

async function imagemDoJob(token: string, endpointId: number): Promise<string> {
  let image = `${PANEL_IMAGE_REPO}:${APP_VERSION}`;
  if (!(await imageExistsLocally(token, endpointId, image))) {
    image = FALLBACK_IMAGE;
    if (!(await imageExistsLocally(token, endpointId, image))) await pullImage(token, endpointId, image);
  }
  return image;
}

/** Diretório da stack NO HOST + nó onde ele está (o do Portainer). */
export async function localizarDiretorioDaStack(
  token: string,
  endpointId: number,
  stack: Pick<Stack, "Id"> & { ProjectPath?: string; EntryPoint?: string }
): Promise<{ hostDir: string; arquivo: string; constraint: string }> {
  if (!stack.ProjectPath || !RE_PROJECT_PATH.test(stack.ProjectPath)) throw new StackDiscoError("caminho_invalido", "ProjectPath");
  if (!stack.EntryPoint || !RE_ENTRYPOINT.test(stack.EntryPoint)) throw new StackDiscoError("caminho_invalido", "EntryPoint");

  const svc = await getServiceExact(token, endpointId, "portainer_portainer");
  if (!svc) throw new StackDiscoError("sem_diretorio", "serviço do Portainer não encontrado");
  const mounts =
    (svc.Spec.TaskTemplate?.ContainerSpec as { Mounts?: { Type?: string; Source?: string; Target?: string }[] } | undefined)?.Mounts ?? [];
  const dados = mounts.find((m) => m.Target === "/data");
  if (!dados?.Source) throw new StackDiscoError("sem_diretorio", "montagem /data do Portainer");

  let base: string | null;
  if (dados.Type === "bind") base = dados.Source;
  else base = await getVolumeMountpoint(token, endpointId, dados.Source);
  if (!base || !/^\/[A-Za-z0-9._/-]+$/.test(base) || base.includes("..")) throw new StackDiscoError("sem_diretorio", "base");

  const tasks = (await listServiceTasks(token, endpointId, svc.ID)).filter(
    (t) => t.DesiredState === "running" && t.Status?.State === "running" && t.NodeID
  );
  if (!tasks.length) throw new StackDiscoError("sem_diretorio", "Portainer sem task rodando");
  const hostDir = `${base.replace(/\/$/, "")}${stack.ProjectPath.slice("/data".length)}`;
  return { hostDir, arquivo: stack.EntryPoint, constraint: `node.id == ${tasks[0].NodeID}` };
}

async function rodar(
  token: string,
  endpointId: number,
  loc: { hostDir: string; constraint: string },
  script: string,
  env: string[]
): Promise<string> {
  const image = await imagemDoJob(token, endpointId);
  const { exitCode, logs, timedOut } = await runOneShotJob(token, endpointId, {
    name: NOME_JOB,
    label: LABEL_JOB,
    timeoutMs: 60_000,
    constraints: [loc.constraint],
    spec: {
      Image: image,
      Entrypoint: ["/bin/sh", "-c"],
      Cmd: [script],
      Env: env,
      User: "0",
      Tty: true,
      Labels: { "com.encha.role": "stack-sync" },
      HostConfig: {
        Binds: [`${loc.hostDir}:/stackdir`],
        NetworkMode: "bridge",
        Privileged: false,
        RestartPolicy: { Name: "no" },
      },
    },
  });
  if (timedOut) throw new StackDiscoError("job_falhou", "timeout");
  if (exitCode !== 0) throw new StackDiscoError("job_falhou", `exit ${exitCode}`);
  return logs;
}

/** CAS: `atual` precisa ser o conteúdo lido (por hash). Lança em qualquer desvio. */
export async function gravarComposeEmDisco(
  token: string,
  endpointId: number,
  stack: Pick<Stack, "Id"> & { ProjectPath?: string; EntryPoint?: string },
  atual: string,
  novo: string,
  getFile: () => Promise<string>
): Promise<void> {
  const loc = await localizarDiretorioDaStack(token, endpointId, stack);
  const params: ParamsGravar = {
    arquivo: loc.arquivo,
    esperadoSha: sha256(atual),
    novoSha: sha256(novo),
    novoB64: Buffer.from(novo, "utf8").toString("base64"),
  };
  const logs = await rodar(token, endpointId, loc, SCRIPT_GRAVAR, envDoJob({ ...params, modo: "gravar" }));
  if (logs.includes(MARCA_DIVERGIU)) throw new StackDiscoError("divergiu");
  if (logs.includes(MARCA_SEM_ARQUIVO)) throw new StackDiscoError("sem_arquivo");
  if (logs.includes(MARCA_CORROMPIDO)) throw new StackDiscoError("corrompido");
  if (!logs.includes(MARCA_OK)) throw new StackDiscoError("job_falhou", "resposta inesperada");

  // Conferência pela API: o Portainer tem de ENXERGAR o que gravamos. Senão,
  // desfaz (só se o arquivo ainda é o nosso) e falha fechado.
  let confere = false;
  try {
    confere = sha256(await getFile()) === params.novoSha;
  } catch {
    confere = false;
  }
  if (!confere) {
    try {
      await rodar(token, endpointId, loc, SCRIPT_RESTAURAR, envDoJob({ ...params, esperadoSha: params.novoSha, modo: "restaurar" }));
    } catch {
      // melhor esforço: o erro principal é a verificação.
    }
    throw new StackDiscoError("verificacao_falhou");
  }
}
