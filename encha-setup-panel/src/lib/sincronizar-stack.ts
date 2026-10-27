import { randomBytes } from "node:crypto";
import {
  discoverContext,
  getServiceExact,
  getStackFile,
  listServiceTasks,
  listStacks,
  PortainerError,
  type DockerServiceFull,
  type Stack,
} from "./portainer";
import { logAudit } from "./audit";
import {
  FixarVersoesError,
  STACK_ENCHAT,
  ler,
  lerServicosAssentados,
  paraPrevia,
  type Mudanca,
  type Previa,
} from "./fixar-versoes";
import { gravarComposeEmDisco, StackDiscoError } from "./stack-disco";
import { lerEstadoDoSidecar, portaoEstado, type LeituraEstado } from "./estado-sidecar";
import { lerEstadoDoUpdaterTracker } from "./estado-updater-tracker";
import { desligarAuto, liberarLease, registrarResultado, tentarLease, tentarLeaseDetalhado } from "./stack-sync-store";

// Mantém o arquivo da stack `enchat` (Portainer) IGUAL ao que está rodando, para
// que "Update the stack" nunca volte versão nem edição. Escreve só as 3 linhas
// `image:` (referência exata do spec, com digest) DIRETO no disco do Portainer —
// sem redeploy, então nada reinicia (um PUT logo após uma atualização por fora
// do YAML recriava sidecar/Pinfy; ver F0 em side-session-notes).
//
// Modos:
//  - auto  (agendador): só age se repo/tag de algum serviço difere do arquivo
//    (diferença só de digest não dispara), com o portão do estado.json aberto,
//    e NÃO acrescenta variáveis.
//  - manual (botão): também acrescenta ENCHAT_ADMIN_*; se o estado.json não
//    puder ser lido segue (o admin viu a prévia), mas se o sidecar discordar do
//    que roda (regressão) RECUSA.

export type ModoSync = "auto" | "manual";

export type ResultadoSincronizacao = Previa & {
  aplicada: boolean;
  /** Por que não aplicou (modo auto). */
  motivo?: string;
  estado: "ok" | "ausente" | "ilegivel";
};

const DONO = `${process.pid}-${randomBytes(4).toString("hex")}`;
const LEASE_MS = 10 * 60_000;
const ESPERA_BUSY_MS = 250;

// Dentro do MESMO processo o lease do SQLite deixa o mesmo dono renovar, então a
// exclusão entre agendador e botão manual é feita aqui; o lease cobre o outro
// processo (painel antigo e novo coexistindo na autoatualização dele).
let emAndamentoLocal = false;

const semDigest = (ref: string): string => ref.replace(/@.*$/, "");

/** Alguma troca muda repo ou tag (e não só o digest)? */
export function diferemRepoTag<T extends { de: string; para: string }>(mudancas: T[]): boolean {
  return mudancas.some((m) => semDigest(m.de) !== semDigest(m.para));
}

export async function sincronizarStackEnchat(input: {
  token: string;
  modo: ModoSync;
  user: string;
  ip: string;
  /** Relógio do lease (padrão Date.now): tomada e renovações falam do mesmo tempo. */
  relogio?: () => number;
}): Promise<ResultadoSincronizacao> {
  const { token, modo, user, ip } = input;
  const relogio = input.relogio ?? Date.now;
  // Renova o lease antes de cada passo que cria job ou escreve. Outro dono = perdeu;
  // banco ocupado depois de uma nova tentativa também aborta (o detalhe distingue).
  const renovarLease = async (): Promise<void> => {
    let r = tentarLeaseDetalhado(STACK_ENCHAT, DONO, LEASE_MS, relogio());
    if (r === "ocupado") {
      await new Promise<void>((ok) => setTimeout(ok, ESPERA_BUSY_MS));
      r = tentarLeaseDetalhado(STACK_ENCHAT, DONO, LEASE_MS, relogio());
    }
    if (r !== "tomado") throw new FixarVersoesError("lease_perdido", r);
  };
  if (emAndamentoLocal || !tentarLease(STACK_ENCHAT, DONO, LEASE_MS, relogio())) throw new FixarVersoesError("em_andamento");
  emAndamentoLocal = true;
  try {
    const { endpointId, stack, composeAtual, alvo, patch, foto } = await ler(token, { inserirAdmin: modo === "manual" });
    const previa = paraPrevia(alvo, patch);

    if (patch.nadaAFazer || (modo === "auto" && !diferemRepoTag(patch.mudancas))) {
      registrarResultado(STACK_ENCHAT, "sincronizada", null);
      return { ...previa, aplicada: false, estado: "ok" };
    }

    // Portão do estado.json do sidecar (a leitura cria um job no Portainer).
    await renovarLease();
    const leitura = await lerEstadoDoSidecar(token, endpointId);
    const estado: ResultadoSincronizacao["estado"] = leitura.estado ? "ok" : (leitura.motivo ?? "ilegivel");
    if (leitura.estado) {
      const portao = portaoEstado(leitura.estado, alvo);
      if (!portao.abre) {
        if (modo === "auto") {
          registrarResultado(STACK_ENCHAT, "aguardando", portao.motivo ?? null);
          return { ...previa, aplicada: false, motivo: portao.motivo, estado };
        }
        // Edição regredida (CRM/Tráfego voltou a Grátis): o botão Atualizar de um
        // sidecar antigo aplicaria a edição GRÁTIS, então a orientação é outra.
        throw new FixarVersoesError(portao.tipo === "edicao" ? "edicao_regredida" : "estado_diverge", portao.motivo);
      }
    } else if (modo === "auto") {
      registrarResultado(STACK_ENCHAT, "aguardando", `estado do sidecar ${estado}`);
      return { ...previa, aplicada: false, motivo: `estado do sidecar ${estado}`, estado };
    }

    // Reconfere os serviços logo antes de gravar (atualização de um clique,
    // autoatualização do sidecar, rollback…): qualquer mudança aborta.
    const depois = await lerServicosAssentados(token, endpointId);
    for (const k of ["app", "pinfy", "updater"] as const) {
      if (depois[k].imagem !== foto[k].imagem || depois[k].indice !== foto[k].indice) {
        throw new FixarVersoesError("mudou_durante");
      }
    }

    await renovarLease(); // a gravação é a única escrita na stack
    try {
      await gravarComposeEmDisco(token, endpointId, stack, composeAtual, patch.compose, () => getStackFile(token, stack.Id));
    } catch (e) {
      if (e instanceof StackDiscoError) throw new FixarVersoesError("gravacao_falhou", e.codigo);
      throw e;
    }

    registrarResultado(STACK_ENCHAT, "aplicada", null, {
      highWater: { app: alvo.app, pinfy: alvo.pinfy, updater: alvo.updater },
    });
    logAudit({
      user,
      ip,
      action: "stack.sincronizar",
      target: STACK_ENCHAT,
      result: "ok",
      meta: {
        modo,
        versao: alvo.tag,
        edicao: alvo.edicao,
        mudancas: patch.mudancas.map((m) => `${m.servico}: ${m.de} → ${m.para}`),
        varsAdmin: patch.varsAdmin,
        protegida: previa.protegida,
        estado,
      },
    });
    return { ...previa, aplicada: true, estado };
  } catch (e) {
    const codigo = e instanceof FixarVersoesError ? e.codigo : e instanceof Error ? e.message : "erro";
    // "em andamento" é só concorrência; os demais bloqueios de segurança do modo
    // auto já viram "aguardando" acima. Falha real conta para o backoff.
    const transitorio = e instanceof FixarVersoesError && (e.codigo === "nao_convergida" || e.codigo === "mudou_durante" || e.codigo === "lease_perdido");
    // Só o agendador conta para o backoff/desligamento: um clique manual que
    // deu errado não pode desligar a sincronização automática.
    if (modo === "auto") {
      if (e instanceof FixarVersoesError && e.codigo === "stack_nao_instalada") {
        // Painel sem a stack enchat: nada a sincronizar, e isso não é falha.
      } else if (e instanceof FixarVersoesError && e.codigo === "stack_externa") {
        // Sem arquivo para editar (criada fora do Portainer): desliga, não adianta insistir.
        desligarAuto(STACK_ENCHAT, "stack_externa");
      } else {
        registrarResultado(STACK_ENCHAT, transitorio ? "aguardando" : "falhou", codigo);
      }
    }
    const detalhe = e instanceof FixarVersoesError ? e.detalhe : undefined;
    logAudit({
      user,
      ip,
      action: "stack.sincronizar.fail",
      target: STACK_ENCHAT,
      result: "error",
      meta: { modo, error: codigo, ...(detalhe ? { detalhe } : {}) },
    });
    throw e;
  } finally {
    emAndamentoLocal = false;
    liberarLease(STACK_ENCHAT, DONO);
  }
}

export type Diagnostico = {
  previa: Previa;
  /** O que o sidecar lembra concorda com o que roda? (null = não deu para ler) */
  sidecar: { ok: boolean; motivo?: string; tipo?: "edicao" | "versao" | "ocupado" } | null;
};

/** Prévia + diagnóstico do estado.json, para a tela mostrar o problema ANTES do clique. */
export async function diagnosticarSincronizacao(token: string): Promise<Diagnostico> {
  const { endpointId, alvo, patch } = await ler(token);
  const previa = paraPrevia(alvo, patch);
  const leitura = await lerEstadoDoSidecar(token, endpointId);
  if (!leitura.estado) return { previa, sidecar: null };
  const p = portaoEstado(leitura.estado, alvo);
  return { previa, sidecar: { ok: p.abre, motivo: p.motivo, tipo: p.tipo } };
}


// ── Stack do Encha Tracker (Ciclo 101 F5) ────────────────────────────────
// O updater do Tracker (e o próprio painel, em applyReleaseUpdate) troca a
// imagem dos serviços por fora do YAML; sem esta rotina o arquivo da stack no
// Portainer fica na versão instalada e um `service update --force`, reboot ou
// redeploy cairia numa imagem que a VPS já nem tem. Aqui o arquivo é regravado
// DIRETO no disco (sem redeploy) com as duas linhas `image:` do Tracker.
//
// Portão (fechado em qualquer dúvida, salvo o estado ausente):
//  - `em_andamento` lido SEM cache (o cache de 5 min deixaria gravar no meio
//    de uma atualização);
//  - estado ausente LIBERA (o updater nunca rodou: instalação atualizada só
//    pelo painel); ilegível ESPERA no automático; `erro` antigo não trava.
// Lease, trava local e backoff próprios: nada compartilhado com o enchat.

export const STACK_TRACKER = "encha_tracker";
const SVC_TRACKER_APP = "encha_tracker_app";
const SVC_TRACKER_UPDATER = "encha_tracker_updater";

/** Imagens do Tracker: conta do produto no GHCR, tag de versão, digest opcional. */
const RE_IMG_TRACKER = /^ghcr\.io\/cheiodecoisa\/(encha-tracker|tracker-updater):(\d+\.\d+\.\d+|beta-[0-9a-f]{12})(@sha256:[0-9a-f]{64})?$/;
export const ehImgTracker = (ref: string): boolean => RE_IMG_TRACKER.test(ref);

/** A referência que o arquivo deve ter para o app: o spec ao vivo, ou a `imagem_atual` do updater (com digest) quando é a mesma repo:tag e o spec ainda não tem digest. */
export function refDoAppTracker(specApp: string, imagemAtual?: string): string {
  if (imagemAtual && ehImgTracker(imagemAtual) && !specApp.includes("@") && semDigest(imagemAtual) === specApp) return imagemAtual;
  return specApp;
}

export type MudancaTracker = { servico: "encha_tracker_app" | "encha_tracker_updater"; de: string; para: string };
export type PatchTracker = { compose: string; mudancas: MudancaTracker[]; nadaAFazer: boolean };

/** Troca só as duas linhas `image:` do Tracker (exatamente uma de cada); o resto do arquivo fica byte a byte. */
export function aplicarPatchTracker(compose: string, app: string, updater: string): PatchTracker {
  const mudancas: MudancaTracker[] = [];
  const vistos = { app: 0, updater: 0 };
  const novo = compose.replace(/^([ \t]+image:[ \t]*)(\S+)([ \t]*)$/gm, (linha, pre: string, ref: string, pos: string) => {
    if (!ehImgTracker(ref)) return linha;
    const ehApp = ref.includes("/encha-tracker:");
    vistos[ehApp ? "app" : "updater"]++;
    const para = ehApp ? app : updater;
    if (para !== ref) mudancas.push({ servico: ehApp ? "encha_tracker_app" : "encha_tracker_updater", de: ref, para });
    return `${pre}${para}${pos}`;
  });
  if (vistos.app !== 1 || vistos.updater !== 1) {
    throw new FixarVersoesError("compose_inesperado", `linhas image: do Tracker (app ${vistos.app}, updater ${vistos.updater})`);
  }
  return { compose: novo, mudancas, nadaAFazer: mudancas.length === 0 };
}

type FotoTracker = { app: { indice: number; imagem: string }; updater: { indice: number; imagem: string } };

async function lerServicosTracker(token: string, endpointId: number): Promise<FotoTracker> {
  const foto = {} as FotoTracker;
  for (const [chave, nome] of [["app", SVC_TRACKER_APP], ["updater", SVC_TRACKER_UPDATER]] as const) {
    const svc: DockerServiceFull | null = await getServiceExact(token, endpointId, nome);
    if (!svc) throw new FixarVersoesError("stack_nao_instalada");
    const estado = svc.UpdateStatus?.State;
    if (estado && !["completed", "rollback_completed"].includes(estado)) throw new FixarVersoesError("nao_convergida", `${nome}: ${estado}`);
    const imagem = svc.Spec.TaskTemplate?.ContainerSpec?.Image ?? "";
    const desejadas = (await listServiceTasks(token, endpointId, svc.ID)).filter((t) => t.DesiredState === "running");
    const ok = desejadas.length > 0 && desejadas.every((t) => t.Status?.State === "running" && t.Spec?.ContainerSpec?.Image === imagem);
    if (!ok) throw new FixarVersoesError("nao_convergida", nome);
    foto[chave] = { indice: svc.Version.Index, imagem };
  }
  return foto;
}

export type ResultadoSincronizacaoTracker = {
  aplicada: boolean;
  motivo?: string;
  mudancas: MudancaTracker[];
  estado: "ok" | "ausente" | "ilegivel";
};

// Trava local PRÓPRIA do Tracker (a do enchat não é reaproveitada: uma não pode bloquear a outra).
let emAndamentoLocalTracker = false;

export async function sincronizarStackTracker(input: {
  token: string;
  modo: ModoSync;
  user: string;
  ip: string;
  relogio?: () => number;
}): Promise<ResultadoSincronizacaoTracker> {
  const { token, modo, user, ip } = input;
  const relogio = input.relogio ?? Date.now;
  const renovarLease = async (): Promise<void> => {
    let r = tentarLeaseDetalhado(STACK_TRACKER, DONO, LEASE_MS, relogio());
    if (r === "ocupado") {
      await new Promise<void>((ok) => setTimeout(ok, ESPERA_BUSY_MS));
      r = tentarLeaseDetalhado(STACK_TRACKER, DONO, LEASE_MS, relogio());
    }
    if (r !== "tomado") throw new FixarVersoesError("lease_perdido", r);
  };
  if (emAndamentoLocalTracker || !tentarLease(STACK_TRACKER, DONO, LEASE_MS, relogio())) throw new FixarVersoesError("em_andamento");
  emAndamentoLocalTracker = true;
  try {
    const { endpointId } = await discoverContext(token);
    const foto = await lerServicosTracker(token, endpointId);
    const stack: Stack | undefined = (await listStacks(token)).find((s) => s.Name === STACK_TRACKER);
    if (!stack) throw new FixarVersoesError("stack_externa");
    let composeAtual: string;
    try {
      composeAtual = await getStackFile(token, stack.Id);
    } catch (e) {
      if (e instanceof PortainerError && e.status === 404) throw new FixarVersoesError("stack_externa");
      throw e;
    }
    const specApp = foto.app.imagem;
    const specUpd = foto.updater.imagem;
    if (!ehImgTracker(specApp) || !ehImgTracker(specUpd)) throw new FixarVersoesError("imagens_invalidas");

    // 1ª passada, só com o spec ao vivo: decide se há o que fazer antes de gastar um job de leitura.
    const previa = aplicarPatchTracker(composeAtual, specApp, specUpd);
    if (previa.nadaAFazer || (modo === "auto" && !diferemRepoTag(previa.mudancas))) {
      registrarResultado(STACK_TRACKER, "sincronizada", null);
      return { aplicada: false, mudancas: previa.mudancas, estado: "ok" };
    }

    // Portão do estado.json do updater (leitura FORÇADA, sem cache).
    await renovarLease();
    const leitura: LeituraEstado = await lerEstadoDoUpdaterTracker(token, endpointId, relogio(), true);
    const estado: ResultadoSincronizacaoTracker["estado"] = leitura.estado ? "ok" : (leitura.motivo ?? "ilegivel");
    if (leitura.estado?.em_andamento) {
      const motivo = "updater aplicando uma operação";
      if (modo === "auto") {
        registrarResultado(STACK_TRACKER, "aguardando", motivo);
        return { aplicada: false, motivo, mudancas: previa.mudancas, estado };
      }
      throw new FixarVersoesError("em_andamento", motivo);
    }
    if (!leitura.estado && leitura.motivo !== "ausente" && modo === "auto") {
      const motivo = `estado do updater ${estado}`;
      registrarResultado(STACK_TRACKER, "aguardando", motivo);
      return { aplicada: false, motivo, mudancas: previa.mudancas, estado };
    }

    // Reconfere os dois serviços logo antes de gravar: qualquer mudança aborta.
    const depois = await lerServicosTracker(token, endpointId);
    for (const k of ["app", "updater"] as const) {
      if (depois[k].imagem !== foto[k].imagem || depois[k].indice !== foto[k].indice) throw new FixarVersoesError("mudou_durante");
    }

    const patch = aplicarPatchTracker(composeAtual, refDoAppTracker(specApp, leitura.estado?.imagem_atual), specUpd);
    await renovarLease();
    try {
      await gravarComposeEmDisco(token, endpointId, stack, composeAtual, patch.compose, () => getStackFile(token, stack.Id));
    } catch (e) {
      if (e instanceof StackDiscoError) throw new FixarVersoesError("gravacao_falhou", e.codigo);
      throw e;
    }

    registrarResultado(STACK_TRACKER, "aplicada", null, {
      highWater: { app: patch.mudancas.find((m) => m.servico === "encha_tracker_app")?.para ?? specApp, updater: specUpd },
    });
    logAudit({
      user,
      ip,
      action: "stack.sincronizar",
      target: STACK_TRACKER,
      result: "ok",
      meta: { modo, mudancas: patch.mudancas.map((m) => `${m.servico}: ${m.de} → ${m.para}`), estado },
    });
    return { aplicada: true, mudancas: patch.mudancas, estado };
  } catch (e) {
    const codigo = e instanceof FixarVersoesError ? e.codigo : e instanceof Error ? e.message : "erro";
    const transitorio = e instanceof FixarVersoesError && (e.codigo === "nao_convergida" || e.codigo === "mudou_durante" || e.codigo === "lease_perdido");
    if (modo === "auto") {
      if (e instanceof FixarVersoesError && e.codigo === "stack_nao_instalada") {
        // Sem a stack do Tracker neste painel: nada a sincronizar, e isso não é falha.
      } else if (e instanceof FixarVersoesError && e.codigo === "stack_externa") {
        desligarAuto(STACK_TRACKER, "stack_externa");
      } else {
        registrarResultado(STACK_TRACKER, transitorio ? "aguardando" : "falhou", codigo);
      }
    }
    const detalhe = e instanceof FixarVersoesError ? e.detalhe : undefined;
    logAudit({
      user,
      ip,
      action: "stack.sincronizar.fail",
      target: STACK_TRACKER,
      result: "error",
      meta: { modo, error: codigo, ...(detalhe ? { detalhe } : {}) },
    });
    throw e;
  } finally {
    emAndamentoLocalTracker = false;
    liberarLease(STACK_TRACKER, DONO);
  }
}
