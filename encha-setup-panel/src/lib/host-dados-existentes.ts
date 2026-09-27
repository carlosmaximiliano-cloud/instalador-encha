import { imageExistsLocally, pullImage, runOneShotJob, PortainerError } from "./portainer";
import { APP_VERSION } from "./version";

// Detecta, SÓ PARA LEITURA, se um arquivo já existe no host (S5-A).
//
// O contêiner do painel não monta /var do host (é read-only e sem docker.sock),
// então a única forma de olhar o disco do node manager é a mesma que o
// host-dirs.ts usa para criar diretórios: um job avulso via Portainer com
// bind /var:/host-var. Aqui o bind é READ-ONLY e o script só faz `test -e` —
// nunca escreve, nunca apaga (a instalação jamais oferece limpar dados).
//
// Uso: saber se já existe um banco do EnchaT em /var/enchat/postgres
// (PG_VERSION só existe depois que o Postgres inicializou o volume) antes de
// gerar chaves NOVAS por cima dele.

const CONTAINER_NAME = "encha-host-probe";
const CONTAINER_LABEL = "com.encha.role=host-probe";
const PANEL_IMAGE_REPO = "ghcr.io/enchaaluno/setup-panel";
const FALLBACK_IMAGE = "alpine/git:2.45.2";

const MARCA_PRESENTE = "ENCHA_HOST_PROBE_PRESENTE";
const MARCA_AUSENTE = "ENCHA_HOST_PROBE_AUSENTE";
const MARCA_INDETERMINADO = "ENCHA_HOST_PROBE_INDETERMINADO";

// Só /var/enchat/<slug>/<arquivo> — o caminho entra num script de shell, então
// nunca aceita nada fora desta forma (sem "..", sem espaço, sem aspas).
export const ALLOWED_PROBE_RE = /^\/var\/enchat\/[a-z0-9_-]+\/[A-Za-z0-9_.-]+$/;

export class HostProbeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HostProbeError";
  }
}

/**
 * Script da sonda (exportado para teste). `caminhoNoContainer` já é o caminho
 * sob /host-var, validado por ALLOWED_PROBE_RE.
 *
 * `test -e` devolve FALSO quando um diretório do caminho não pode ser
 * atravessado — e o do Postgres é 0700 de outro uid (999 na VPS). O root do
 * job só o atravessa por CAP_DAC_OVERRIDE/DAC_READ_SEARCH; com userns-remap
 * ou Docker rootless ele não tem isso, e um banco existente virava "não
 * existe" (chave nova por cima — justamente o que esta trava impede). Por
 * isso "ausente" só vale se cada diretório do caminho que existe pôde ser
 * atravessado de verdade (`cd`, que é a chamada ao kernel; `[ -x ]` não serve:
 * para root o busybox responde "sim" só olhando os bits). Senão: INDETERMINADO.
 * Sem redirecionamento nenhum (o erro do `cd` vai para o log, inofensivo): o
 * script da sonda não tem `>` — ver o teste.
 */
export function scriptSonda(caminhoNoContainer: string): string {
  const partes = caminhoNoContainer.split("/").filter(Boolean);
  const dirs: string[] = [];
  for (let i = 1; i < partes.length; i++) dirs.push("/" + partes.slice(0, i).join("/"));
  return [
    "set -u",
    `if [ -e "${caminhoNoContainer}" ]; then echo ${MARCA_PRESENTE}; exit 0; fi`,
    `for d in ${dirs.map((d) => `"${d}"`).join(" ")}; do`,
    `  if [ -e "$d" ] && ! ( cd "$d" ); then echo ${MARCA_INDETERMINADO}; exit 0; fi`,
    "done",
    `echo ${MARCA_AUSENTE}`,
  ].join("\n");
}

/**
 * true = o arquivo existe no host; false = não existe. Lança HostProbeError
 * quando não dá para saber (Portainer/job falhou): quem chama trata "não sei"
 * como "pode existir" — nunca como "não existe".
 */
export async function hostTemArquivo(token: string, endpointId: number, caminho: string): Promise<boolean> {
  if (!ALLOWED_PROBE_RE.test(caminho) || caminho.includes("..")) {
    throw new Error(`Caminho de host não permitido para checagem: "${caminho}"`);
  }

  let image = `${PANEL_IMAGE_REPO}:${APP_VERSION}`;
  const hasLocal = await imageExistsLocally(token, endpointId, image);
  if (!hasLocal) {
    image = FALLBACK_IMAGE;
    const hasFallback = await imageExistsLocally(token, endpointId, image);
    if (!hasFallback) await pullImage(token, endpointId, image);
  }

  const alvo = `/host-var${caminho.slice("/var".length)}`;
  const script = scriptSonda(alvo);

  try {
    const { exitCode, logs, timedOut } = await runOneShotJob(token, endpointId, {
      name: CONTAINER_NAME,
      label: CONTAINER_LABEL,
      timeoutMs: 30_000,
      spec: {
        Image: image,
        Entrypoint: ["/bin/sh", "-c"],
        Cmd: [script],
        User: "0",
        Tty: true,
        Labels: { "com.encha.role": "host-probe" },
        HostConfig: {
          Binds: ["/var:/host-var:ro"],
          NetworkMode: "bridge",
          Privileged: false,
          RestartPolicy: { Name: "no" },
        },
      },
    });
    if (timedOut) throw new HostProbeError("Timeout ao checar dados existentes no host (30s)");
    if (exitCode !== 0) throw new HostProbeError(`Falha ao checar dados existentes no host (exit ${exitCode}): ${logs}`);
    if (logs.includes(MARCA_PRESENTE)) return true;
    if (logs.includes(MARCA_INDETERMINADO)) {
      throw new HostProbeError(
        `Não foi possível verificar ${caminho} no host: um diretório do caminho existe mas não pôde ser lido pela sonda (userns-remap/Docker rootless?)`
      );
    }
    if (logs.includes(MARCA_AUSENTE)) return false;
    throw new HostProbeError(`Resposta inesperada ao checar dados existentes no host: ${logs}`);
  } catch (e) {
    if (e instanceof HostProbeError) throw e;
    if (e instanceof PortainerError) throw new HostProbeError(`Portainer ${e.status}: ${e.message}`);
    throw e;
  }
}
