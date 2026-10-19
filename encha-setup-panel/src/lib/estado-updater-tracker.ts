import { getServiceExact, getVolumeMountpoint, imageExistsLocally, listServiceTasks, pullImage, runOneShotJob } from "./portainer";
import { APP_VERSION } from "./version";
import { MARCA_AUSENTE, MARCA_FIM, MARCA_INICIO, parseEstado, type LeituraEstado } from "./estado-sidecar";

// Lê o estado.json do sidecar tracker-updater por um job pontual de LEITURA, como
// estado-sidecar.ts faz para o enchat. É só um PORTÃO ("o updater não está no meio
// de uma operação"): o estado é dado, nunca autoridade, e o parser e as marcas são
// os de estado-sidecar.ts (o `em_andamento` do Go é o mesmo campo JSON).
//
// O estado mora no volume nomeado `encha_tracker_updater_data` (/data do updater).
// `runOneShotJob` converte todo Bind em montagem do tipo bind, então o volume é
// resolvido para o ponto de montagem no host (como stack-disco.ts) e montado
// somente leitura em /host-estado, preso ao nó da task do updater (volume local).

const SERVICO_UPDATER = "encha_tracker_updater";
const VOLUME_ESTADO = "encha_tracker_updater_data";
const NOME_JOB = "encha-tracker-estado-probe";
const LABEL_JOB = "com.encha.role=tracker-estado-probe";
const PANEL_IMAGE_REPO = "ghcr.io/enchaaluno/setup-panel";
const FALLBACK_IMAGE = "alpine/git:2.45.2";
const MAX_BYTES = 65536;

export const CAMINHO_ESTADO_TRACKER = "/host-estado/estado.json";
// O mountpoint é DADO devolvido pelo Docker e entra na string do bind: mesma validação de stack-disco.ts
// (absoluto, só [A-Za-z0-9._/-], sem ..). ":" ou "," mudariam o sentido do bind.
const RE_MOUNTPOINT = /^\/[A-Za-z0-9._/-]+$/;

export const SCRIPT_LER_ESTADO_TRACKER = [
  "set -eu",
  `F=${CAMINHO_ESTADO_TRACKER}`,
  `if [ ! -f "$F" ]; then echo ${MARCA_AUSENTE}; exit 0; fi`,
  `echo ${MARCA_INICIO}`,
  `head -c ${MAX_BYTES} "$F"`,
  "echo",
  `echo ${MARCA_FIM}`,
].join("\n");

const ILEGIVEL: LeituraEstado = { estado: null, motivo: "ilegivel" };

// Cache curto: nunca mais de 1 job de leitura a cada 5 min (cada leitura é um serviço Swarm criado e removido).
let cache: { em: number; leitura: LeituraEstado } | null = null;
const CACHE_MS = 5 * 60_000;

export function limparCacheEstadoTracker(): void {
  cache = null;
}

export async function lerEstadoDoUpdaterTracker(token: string, endpointId: number, agora = Date.now(), forcar = false): Promise<LeituraEstado> {
  if (!forcar && cache && agora - cache.em < CACHE_MS) return cache.leitura;
  let leitura: LeituraEstado;
  try {
    const svc = await getServiceExact(token, endpointId, SERVICO_UPDATER);
    if (!svc) return ILEGIVEL;
    const t = (await listServiceTasks(token, endpointId, svc.ID)).find((x) => x.DesiredState === "running" && x.NodeID);
    if (!t?.NodeID) return ILEGIVEL;
    const mountpoint = await getVolumeMountpoint(token, endpointId, VOLUME_ESTADO);
    if (!mountpoint || !RE_MOUNTPOINT.test(mountpoint) || mountpoint.includes("..")) return ILEGIVEL;

    let image = `${PANEL_IMAGE_REPO}:${APP_VERSION}`;
    if (!(await imageExistsLocally(token, endpointId, image))) {
      image = FALLBACK_IMAGE;
      if (!(await imageExistsLocally(token, endpointId, image))) await pullImage(token, endpointId, image);
    }
    const { exitCode, logs, timedOut } = await runOneShotJob(token, endpointId, {
      name: NOME_JOB,
      label: LABEL_JOB,
      timeoutMs: 30_000,
      constraints: [`node.id == ${t.NodeID}`],
      spec: {
        Image: image,
        Entrypoint: ["/bin/sh", "-c"],
        Cmd: [SCRIPT_LER_ESTADO_TRACKER],
        User: "0",
        Tty: true,
        Labels: { "com.encha.role": "tracker-estado-probe" },
        HostConfig: { Binds: [`${mountpoint}:/host-estado:ro`], NetworkMode: "bridge", Privileged: false, RestartPolicy: { Name: "no" } },
      },
    });
    leitura = timedOut || exitCode !== 0 ? ILEGIVEL : parseEstado(logs);
  } catch {
    leitura = ILEGIVEL;
  }
  cache = { em: agora, leitura };
  return leitura;
}
