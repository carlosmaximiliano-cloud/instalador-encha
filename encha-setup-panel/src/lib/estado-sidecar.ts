import { getServiceExact, imageExistsLocally, listServiceTasks, pullImage, runOneShotJob } from "./portainer";
import { APP_VERSION } from "./version";
import { semverMaiorOuIgual } from "./semver";
import type { AlvoImagens } from "./fixar-versoes";

// Lê o estado.json do sidecar (enchat-updater) por um job pontual de LEITURA
// (bind /var:/host-var:ro, caminho fixo, script constante) e decide se é seguro
// sincronizar o arquivo da stack com o que está rodando.
//
// O estado.json é DADO, nunca autoridade: serve só como PORTÃO ("o sidecar
// terminou o que estava fazendo e concorda com o que roda"), jamais como fonte
// das imagens (isso é o spec em execução).

const NOME_JOB = "encha-estado-probe";
const LABEL_JOB = "com.encha.role=estado-probe";
const PANEL_IMAGE_REPO = "ghcr.io/enchaaluno/setup-panel";
const FALLBACK_IMAGE = "alpine/git:2.45.2";

export const CAMINHO_ESTADO = "/host-var/enchat/updater/estado.json";
export const MARCA_INICIO = "ENCHA_ESTADO_INICIO";
export const MARCA_FIM = "ENCHA_ESTADO_FIM";
export const MARCA_AUSENTE = "ENCHA_ESTADO_AUSENTE";
const MAX_BYTES = 65536;

export const SCRIPT_LER_ESTADO = [
  "set -eu",
  `F=${CAMINHO_ESTADO}`,
  `if [ ! -f "$F" ]; then echo ${MARCA_AUSENTE}; exit 0; fi`,
  `echo ${MARCA_INICIO}`,
  `head -c ${MAX_BYTES} "$F"`,
  "echo",
  `echo ${MARCA_FIM}`,
].join("\n");

export type EstadoSidecar = {
  em_andamento?: boolean;
  versao_atual?: string;
  concluido_em?: string;
  auto_atualizacao?: string;
  imagem_aplicada?: string;
  app_imagem_aplicada?: string;
  operacao?: string;
  erro?: string;
};

export type LeituraEstado = { estado: EstadoSidecar | null; motivo?: "ausente" | "ilegivel" };

/** Extrai e valida o JSON entre as marcas (função pura). */
export function parseEstado(logs: string): LeituraEstado {
  const limpo = logs.replace(/\r/g, "");
  if (limpo.includes(MARCA_AUSENTE)) return { estado: null, motivo: "ausente" };
  const i = limpo.indexOf(MARCA_INICIO);
  const f = limpo.indexOf(MARCA_FIM);
  if (i === -1 || f === -1 || f < i) return { estado: null, motivo: "ilegivel" };
  const corpo = limpo.slice(i + MARCA_INICIO.length, f).trim();
  try {
    const j = JSON.parse(corpo) as unknown;
    if (!j || typeof j !== "object" || Array.isArray(j)) return { estado: null, motivo: "ilegivel" };
    const o = j as Record<string, unknown>;
    const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : undefined);
    return {
      estado: {
        em_andamento: typeof o.em_andamento === "boolean" ? o.em_andamento : undefined,
        versao_atual: str("versao_atual"),
        concluido_em: str("concluido_em"),
        auto_atualizacao: str("auto_atualizacao"),
        imagem_aplicada: str("imagem_aplicada"),
        app_imagem_aplicada: str("app_imagem_aplicada"),
        operacao: str("operacao"),
        erro: str("erro"),
      },
    };
  } catch {
    return { estado: null, motivo: "ilegivel" };
  }
}

const QUINZE_MIN = 15 * 60_000;
const repoDe = (ref: string): string => ref.replace(/@.*$/, "").replace(/:[^:/]+$/, "");

export type Portao = { abre: boolean; motivo?: string };

/**
 * O estado.json concorda com o que roda e o sidecar terminou? Fechado (abre
 * false) em qualquer dúvida.
 *  - em_andamento: o sidecar está aplicando algo → espera;
 *  - versao_atual ≠ tag do app: o app está numa versão que o sidecar NÃO
 *    aplicou por último (regressão por "Update the stack", rollback…) —
 *    fixar isso congelaria um estado transitório/errado;
 *  - app_imagem_aplicada ≠ repo do app: edição divergente;
 *  - autoatualização do sidecar ainda pendente: espera assentar (sidecar na
 *    versão_atual, ou 15 min desde concluido_em).
 * Beta (tag beta-<sha>): o sidecar versiona o beta como 0.1.N, não dá para
 * comparar com a tag — pula só essa comparação.
 */
export function portaoEstado(estado: EstadoSidecar, alvo: AlvoImagens, agora = Date.now()): Portao {
  if (estado.em_andamento) return { abre: false, motivo: "sidecar aplicando uma operação" };
  const beta = alvo.tag.startsWith("beta-");
  if (!beta && estado.versao_atual !== undefined && estado.versao_atual !== alvo.tag) {
    return { abre: false, motivo: `o sidecar aplicou ${estado.versao_atual} e o app roda ${alvo.tag}` };
  }
  if (!beta && estado.versao_atual === undefined) return { abre: false, motivo: "estado sem versao_atual" };
  if (estado.app_imagem_aplicada && repoDe(estado.app_imagem_aplicada) !== repoDe(alvo.app)) {
    return { abre: false, motivo: "edição aplicada pelo sidecar difere da que roda" };
  }
  if (estado.auto_atualizacao?.startsWith("solicitada")) {
    const tagSidecar = alvo.tagUpdater;
    const mesmaVersao = estado.versao_atual !== undefined && semverMaiorOuIgual(tagSidecar, estado.versao_atual);
    const ha = estado.concluido_em ? agora - Date.parse(estado.concluido_em) : 0;
    if (!mesmaVersao && !(ha > QUINZE_MIN)) return { abre: false, motivo: "autoatualização do sidecar ainda não assentou" };
  }
  return { abre: true };
}

// Cache curto: nunca mais de 1 job de leitura a cada 5 min (cada leitura é um
// serviço Swarm criado e removido).
let cache: { em: number; leitura: LeituraEstado } | null = null;
const CACHE_MS = 5 * 60_000;

export function limparCacheEstado(): void {
  cache = null;
}

export async function lerEstadoDoSidecar(token: string, endpointId: number, agora = Date.now(), forcar = false): Promise<LeituraEstado> {
  if (!forcar && cache && agora - cache.em < CACHE_MS) return cache.leitura;
  let leitura: LeituraEstado;
  try {
    const svc = await getServiceExact(token, endpointId, "enchat_enchat_updater");
    if (!svc) return { estado: null, motivo: "ilegivel" };
    const t = (await listServiceTasks(token, endpointId, svc.ID)).find((x) => x.DesiredState === "running" && x.NodeID);
    if (!t?.NodeID) return { estado: null, motivo: "ilegivel" };

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
        Cmd: [SCRIPT_LER_ESTADO],
        User: "0",
        Tty: true,
        Labels: { "com.encha.role": "estado-probe" },
        HostConfig: { Binds: ["/var:/host-var:ro"], NetworkMode: "bridge", Privileged: false, RestartPolicy: { Name: "no" } },
      },
    });
    leitura = timedOut || exitCode !== 0 ? { estado: null, motivo: "ilegivel" } : parseEstado(logs);
  } catch {
    leitura = { estado: null, motivo: "ilegivel" };
  }
  cache = { em: agora, leitura };
  return leitura;
}
