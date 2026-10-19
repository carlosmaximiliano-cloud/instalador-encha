import { randomBytes } from "node:crypto";
import {
  discoverContext,
  getServiceExact,
  getStackFile,
  listServiceTasks,
  listStacks,
  PortainerError,
  updateServiceRestartPolicy,
  withServiceToken,
  type DockerServiceFull,
} from "./portainer";
import { hasServiceCredentials } from "./auth/local-admin";
import { reconciliacaoRestartLigada } from "./flag-sincronizacao";
import { logAudit } from "./audit";
import { gravarComposeEmDisco, StackDiscoError } from "./stack-disco";
import { lerEstadoDoSidecar } from "./estado-sidecar";
import { lerEstadoDoUpdaterTracker } from "./estado-updater-tracker";
import { STACK_ENCHAT } from "./fixar-versoes";
import { lerEstadoSync, liberarLease, podeTentarAuto, registrarResultado, tentarLease, tentarLeaseDetalhado } from "./stack-sync-store";
import {
  aplicarPatchRestartCompose,
  dentroDaJanela,
  descreverPolitica,
  emUpdateEmCurso,
  planejarStack,
  politicaConforme,
  politicaDoServico,
  RestartPolicyError,
  STACK_RESTART_TRACKER,
  STACKS_RECONCILIADAS,
  type Passo,
  type ResultadoPatchRestart,
  type StackRestart,
} from "./restart-policy";

// Agendador do reconciliador da restart_policy (ver restart-policy.ts para o
// porquê). Mesmo padrão do sync-runtime.ts: setTimeout/setInterval com
// .unref(), token de serviço, nunca lança. DESLIGADO por padrão: só age com a
// chave remota `reconciliar_restart` ligada no Console (flag-sincronizacao.ts)
// e sem ENCHA_RECONCILIAR_RESTART=off.
//
// Ordem por stack:
//   1. ARQUIVO da stack no Portainer (gravarComposeEmDisco, compare-and-swap) —
//      qualquer hora; sem redeploy, nada reinicia;
//   2. SERVIÇO ao vivo — só entre 02h e 05h (America/Sao_Paulo), porque trocar a
//      RestartPolicy substitui as tasks. Banco primeiro, espera convergir (até
//      3 min), depois os dependentes. Não convergiu = para e registra.
// Arquivo ANTES do serviço: se o serviço falhar, "Update the stack" já traz a
// política certa; o contrário deixaria o arquivo mandando de volta on-failure.
//
// Lease: tomado uma vez no início (com o relógio de verdade) e RENOVADO, com o relógio de
// verdade, antes de ler o estado do sidecar, antes de gravar o arquivo, antes de cada serviço ao vivo e a cada
// checagem de convergência que deu negativa. O passo ao vivo pode passar dos
// 10 min do TTL; renovando, o prazo nunca vence com o processo vivo e vence em
// até 10 min se ele morrer. Se a renovação falha (outro dono assumiu), o tick
// aborta sem tocar nada depois, como "aguardando" (não conta falha nem backoff).
//
// Timeout: cada chamada de API ao Portainer tem 60 s e o que roda um job (gravação
// do arquivo, leitura do estado do sidecar) 4 min, ambos abaixo do TTL. Estourou =
// aborto "portainer_travado" (aguardando, sem backoff) e o lease NÃO é solto: a
// chamada abandonada ainda pode pousar, e outro dono só assume depois do TTL.

const PRIMEIRA_TENTATIVA_MS = 3 * 60_000;
const INTERVALO_MS = 30 * 60_000;
const LEASE_MS = 10 * 60_000;
export const CONVERGENCIA_MS = 3 * 60_000;
const PASSO_ESPERA_MS = 5_000;
const ESPERA_BUSY_MS = 250;
// Timeout por chamada de API e para o que roda um job (ambos abaixo do TTL do lease).
const CHAMADA_MS = 60_000;
const JOB_MS = 4 * 60_000;

const DONO = `restart-${process.pid}-${randomBytes(4).toString("hex")}`;

// Exclusão dentro do processo (o lease cobre o outro processo / o sincronizador).
let emAndamentoLocal = false;

export type EtapaTick =
  | "conforme"
  | "backoff"
  | "ocupado"
  | "stack_nao_instalada"
  | "update_em_curso"
  | "sidecar_ocupado"
  | "arquivo_gravado"
  | "arquivo_mudou"
  | "fora_da_janela"
  | "aplicado"
  | "nao_convergiu"
  | "lease_perdido"
  | "lease_indisponivel"
  | "portainer_travado"
  | "falhou";

export type ResultadoTick = { stack: string; etapa: EtapaTick; detalhe?: string };

export type OpcoesReconciliar = {
  token: string;
  endpointId: number;
  agora?: number;
  /** Para os testes: não esperar de verdade. */
  esperar?: (ms: number) => Promise<void>;
  convergenciaMs?: number;
  /** Para os testes: limite de cada chamada ao Portainer (padrão 60 s; 4 min para o que roda um job). */
  chamadaMs?: number;
  /** Relógio da renovação do lease (padrão Date.now); o `agora` do tick segue governando janela e backoff. */
  relogio?: () => number;
};

/** Interno: a renovação do lease falhou (outro dono assumiu). Sobe até o catch externo. */
class LeasePerdido extends Error {
  constructor(public ponto: "estado" | "arquivo" | "servico" | "convergencia") {
    super(`lease_perdido:${ponto}`);
  }
}

/** Interno: a renovação não pôde ser decidida (banco ocupado mesmo depois de uma nova tentativa). */
class LeaseIndisponivel extends Error {
  constructor(public ponto: LeasePerdido["ponto"]) {
    super(`lease_indisponivel:${ponto}`);
  }
}

/** Interno: uma chamada ao Portainer passou do limite. Sobe ao catch externo; o lease NÃO é solto (vence pelo TTL). */
class PortainerTravado extends Error {
  constructor(public rotulo: string) {
    super(`portainer_travado:${rotulo}`);
  }
}

/**
 * Corrida entre a chamada e um relógio. Não cancela o socket: a chamada original pode concluir depois do
 * aborto (por isso o lease fica retido e cada escrita é precedida de releitura/compare-and-swap). A promessa
 * original tem tratador próprio: a rejeição tardia é descartada e o relógio é limpo quando ela vence.
 */
function comTimeout<T>(chamada: Promise<T>, ms: number, rotulo: string): Promise<T> {
  return new Promise<T>((ok, ko) => {
    let estourou = false;
    const relogio = setTimeout(() => {
      estourou = true;
      ko(new PortainerTravado(rotulo));
    }, ms);
    chamada.then(
      (v) => {
        clearTimeout(relogio);
        if (!estourou) ok(v);
      },
      (e) => {
        clearTimeout(relogio);
        if (!estourou) ko(e);
      }
    );
  });
}

const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// ── Leitura (sem escrever nada) ─────────────────────────────────────────

type Leitura = {
  vivos: Record<string, DockerServiceFull | null>;
  passos: Passo[];
  instalada: boolean;
  /** null = stack sem arquivo no Portainer (externa). */
  arquivo: { stack: Awaited<ReturnType<typeof listStacks>>[number]; composeAtual: string; patch: ResultadoPatchRestart } | null;
};

async function ler(def: StackRestart, token: string, endpointId: number, ms: number): Promise<Leitura> {
  const vivos: Record<string, DockerServiceFull | null> = {};
  for (const s of def.servicos) vivos[s.swarm] = await comTimeout(getServiceExact(token, endpointId, s.swarm), ms, `getServiceExact:${s.swarm}`);
  const instalada = Object.values(vivos).some((v) => v !== null);
  const passos = planejarStack(def, vivos);
  let arquivo: Leitura["arquivo"] = null;
  if (instalada) {
    const stack = (await comTimeout(listStacks(token), ms, "listStacks")).find((s) => s.Name === def.stack);
    if (stack) {
      try {
        const composeAtual = await comTimeout(getStackFile(token, stack.Id), ms, "getStackFile");
        arquivo = { stack, composeAtual, patch: aplicarPatchRestartCompose(composeAtual, def) };
      } catch (e) {
        if (!(e instanceof PortainerError && e.status === 404)) throw e;
      }
    }
  }
  return { vivos, passos, instalada, arquivo };
}

const nadaAFazer = (l: Leitura): boolean =>
  l.passos.every((p) => p.acao !== "ajustar") && (l.arquivo === null || l.arquivo.patch.nadaAFazer);

function auditar(
  def: StackRestart,
  servico: string,
  result: "ok" | "error",
  meta: Record<string, unknown>,
  fail = false
): void {
  logAudit({
    user: "system",
    ip: "local",
    action: fail ? "stack.restart_policy.fail" : "stack.restart_policy",
    target: servico,
    result,
    meta: { stack: def.stack, ...meta },
  });
}

// Pulos esperados (serviço que a instalação não tem, ou sem política explícita = default any): não vão para a auditoria.
const MOTIVOS_NORMAIS = new Set(["ausente", "sem_restart_policy", "sem_deploy"]);

/** Pulos: um registro por mudança de situação (não a cada 30 min). Devolve o detalhe a guardar. */
function registrarPulos(def: StackRestart, l: Leitura, chave: string): string | null {
  const pulos = [
    ...l.passos.flatMap((p) => (p.acao === "pular" && !MOTIVOS_NORMAIS.has(p.motivo) ? [`${p.servico.swarm}:${p.motivo}`] : [])),
    ...(l.arquivo?.patch.pulados.flatMap((p) => (MOTIVOS_NORMAIS.has(p.motivo) ? [] : [`arquivo/${p.servico}:${p.motivo}`])) ?? []),
  ];
  if (pulos.length === 0) return null;
  const detalhe = `pulos ${pulos.join(", ")}`;
  if (lerEstadoSync(chave).lastDetail !== detalhe) {
    for (const p of pulos) auditar(def, p.split(":")[0], "ok", { etapa: "pulo", motivo: p.split(":")[1] });
  }
  return detalhe;
}

// ── Espera de convergência de UM serviço ────────────────────────────────

/** O Swarm já trocou as tasks pela política nova e elas estão rodando? */
async function convergiu(token: string, endpointId: number, nome: string, ms: number): Promise<boolean> {
  const svc = await comTimeout(getServiceExact(token, endpointId, nome), ms, `getServiceExact:${nome}`);
  if (!svc || emUpdateEmCurso(svc)) return false;
  const rp = politicaDoServico(svc);
  if (!rp || !politicaConforme(rp)) return false;
  const desejadas = (await comTimeout(listServiceTasks(token, endpointId, svc.ID), ms, `listServiceTasks:${nome}`)).filter((t) => t.DesiredState === "running");
  // A task NOVA carrega a política nova no próprio Spec; a antiga (ainda rodando
  // logo depois do update) não — é o que impede dar "convergiu" cedo demais.
  return (
    desejadas.length > 0 &&
    desejadas.every((t) => t.Status?.State === "running" && t.Spec?.RestartPolicy !== undefined && politicaConforme(t.Spec.RestartPolicy))
  );
}

async function aguardarConvergencia(
  token: string,
  endpointId: number,
  nome: string,
  op: OpcoesReconciliar,
  renovar: () => Promise<void>
): Promise<boolean> {
  const esperar = op.esperar ?? dormir;
  const ms = op.chamadaMs ?? CHAMADA_MS; // por chamada; o laço inteiro NUNCA é embrulhado (o limite dele é CONVERGENCIA_MS)
  const tentativas = Math.max(1, Math.ceil((op.convergenciaMs ?? CONVERGENCIA_MS) / PASSO_ESPERA_MS));
  for (let i = 0; i < tentativas; i++) {
    if (await convergiu(token, endpointId, nome, ms)) return true;
    await renovar();
    await esperar(PASSO_ESPERA_MS);
  }
  return convergiu(token, endpointId, nome, ms);
}

// ── Uma stack ───────────────────────────────────────────────────────────

export async function reconciliarStack(def: StackRestart, op: OpcoesReconciliar): Promise<ResultadoTick> {
  const { token, endpointId } = op;
  const agora = op.agora ?? Date.now();
  const chave = `restart:${def.stack}`;
  const res = (etapa: EtapaTick, detalhe?: string): ResultadoTick => ({ stack: def.stack, etapa, detalhe });

  const relogio = op.relogio ?? Date.now;
  const apiMs = op.chamadaMs ?? CHAMADA_MS;
  const jobMs = op.chamadaMs ?? JOB_MS;
  // Aborto por timeout: o lease fica com este dono até o TTL (a chamada abandonada ainda pode pousar).
  let manterLease = false;
  // Banco ocupado (SQLITE_BUSY) não é lease perdido: uma nova tentativa depois de uma espera curta;
  // persistindo, aborta como lease_indisponivel. Só "outro dono tem" é lease_perdido.
  const renovarLease = async (ponto: LeasePerdido["ponto"]): Promise<void> => {
    let r = tentarLeaseDetalhado(def.leaseKey, DONO, LEASE_MS, relogio());
    if (r === "ocupado") {
      await (op.esperar ?? dormir)(ESPERA_BUSY_MS);
      r = tentarLeaseDetalhado(def.leaseKey, DONO, LEASE_MS, relogio());
    }
    if (r === "outro_dono") throw new LeasePerdido(ponto);
    if (r === "ocupado") throw new LeaseIndisponivel(ponto);
  };

  if (!podeTentarAuto(chave, agora).pode) return res("backoff");

  try {
    // 1) Leitura barata, sem lease: tudo conforme sai cedo.
    const primeira = await ler(def, token, endpointId, apiMs);
    if (!primeira.instalada) return res("stack_nao_instalada");
    if (nadaAFazer(primeira)) {
      registrarResultado(chave, "sincronizada", registrarPulos(def, primeira, chave), { agora });
      return res("conforme");
    }

    // 2) Há o que fazer: lease (compartilhado com sincronizarStackEnchat no enchat).
    if (emAndamentoLocal || !tentarLease(def.leaseKey, DONO, LEASE_MS, relogio())) return res("ocupado");
    emAndamentoLocal = true;
    try {
      const l = await ler(def, token, endpointId, apiMs); // reconfere sob o lease
      if (!l.instalada) return res("stack_nao_instalada");
      if (nadaAFazer(l)) {
        registrarResultado(chave, "sincronizada", registrarPulos(def, l, chave), { agora });
        return res("conforme");
      }

      // Portões: update em curso, sidecar ocupado.
      if (Object.values(l.vivos).some((v) => v !== null && emUpdateEmCurso(v))) {
        registrarResultado(chave, "aguardando", "update_em_curso", { agora });
        return res("update_em_curso");
      }
      const ajustes = l.passos.filter((p): p is Extract<Passo, { acao: "ajustar" }> => p.acao === "ajustar");
      const precisaArquivo = l.arquivo !== null && !l.arquivo.patch.nadaAFazer;
      // Só falta o passo ao vivo e ainda não é a janela: nada a fazer agora (e sem
      // gastar o job de leitura do sidecar a cada rodada de 30 min).
      if (!precisaArquivo && !dentroDaJanela(agora)) {
        registrarResultado(chave, "aguardando", "fora_da_janela", { agora });
        return res("fora_da_janela");
      }
      // Portão de "sidecar ocupado" por stack: enchat pelo estado do enchat-updater, encha_tracker pelo do
      // tracker-updater (só em_andamento bloqueia; ilegível ou ausente segue, igual ao enchat). encha-panel não lê estado.
      const leitorDeEstado =
        def.leaseKey === STACK_ENCHAT
          ? () => comTimeout(lerEstadoDoSidecar(token, endpointId, agora), jobMs, "estado_sidecar")
          : def.leaseKey === STACK_RESTART_TRACKER.leaseKey
            ? () => comTimeout(lerEstadoDoUpdaterTracker(token, endpointId, agora), jobMs, "estado_updater_tracker")
            : null;
      if (leitorDeEstado) {
        // A reconferência sob o lease pode levar até 6 min e a leitura do estado até 4: renova ANTES do portão
        // para que a margem do TTL no pior caso não seja zero.
        await renovarLease("estado");
        const est = await leitorDeEstado();
        if (est.estado?.em_andamento) {
          registrarResultado(chave, "aguardando", "sidecar_ocupado", { agora });
          return res("sidecar_ocupado");
        }
      }
      registrarPulos(def, l, chave);

      // 3) ARQUIVO primeiro.
      if (l.arquivo && precisaArquivo) {
        await renovarLease("arquivo");
        try {
          await comTimeout(
            gravarComposeEmDisco(token, endpointId, l.arquivo.stack, l.arquivo.composeAtual, l.arquivo.patch.compose, () =>
              getStackFile(token, l.arquivo!.stack.Id)
            ),
            jobMs,
            "gravarComposeEmDisco"
          );
        } catch (e) {
          if (e instanceof StackDiscoError && e.codigo === "divergiu") {
            // O arquivo mudou entre a leitura e a gravação: a próxima rodada relê.
            registrarResultado(chave, "aguardando", "arquivo_mudou", { agora });
            return res("arquivo_mudou");
          }
          throw e;
        }
        for (const m of l.arquivo.patch.mudancas) auditar(def, m.servico, "ok", { etapa: "arquivo", de: m.de, para: m.para });
      }

      // 4) SERVIÇO ao vivo, só na janela de manutenção.
      if (ajustes.length === 0) {
        registrarResultado(chave, "aplicada", "arquivo", { agora });
        return res("arquivo_gravado");
      }
      if (!dentroDaJanela(agora)) {
        registrarResultado(chave, "aguardando", "fora_da_janela", { agora });
        return res("fora_da_janela");
      }
      for (const p of ajustes) {
        await renovarLease("servico");
        // Banco primeiro (a ordem vem de def.servicos); relê o serviço para pegar o Version.Index atual.
        const svc = await comTimeout(getServiceExact(token, endpointId, p.servico.swarm), apiMs, `getServiceExact:${p.servico.swarm}`);
        if (!svc || politicaConforme(politicaDoServico(svc))) continue;
        await comTimeout(updateServiceRestartPolicy(token, endpointId, svc, p.para), apiMs, `updateServiceRestartPolicy:${p.servico.swarm}`);
        auditar(def, p.servico.swarm, "ok", { etapa: "servico", papel: p.servico.papel, de: descreverPolitica(p.de), para: descreverPolitica(p.para) });
        if (!(await aguardarConvergencia(token, endpointId, p.servico.swarm, op, () => renovarLease("convergencia")))) {
          auditar(def, p.servico.swarm, "error", { etapa: "servico", motivo: "nao_convergiu" }, true);
          registrarResultado(chave, "falhou", `nao_convergiu:${p.servico.swarm}`, { agora });
          return res("nao_convergiu", p.servico.swarm);
        }
      }
      registrarResultado(chave, "aplicada", null, { agora });
      return res("aplicado");
    } catch (e) {
      if (e instanceof PortainerTravado) manterLease = true;
      throw e;
    } finally {
      emAndamentoLocal = false;
      if (!manterLease) liberarLease(def.leaseKey, DONO);
    }
  } catch (e) {
    if (e instanceof PortainerTravado) {
      // Sem backoff nem falha: o Portainer pode estar só lento; a próxima rodada relê tudo.
      auditar(def, def.stack, "error", { etapa: "portainer_travado", motivo: e.rotulo }, true);
      registrarResultado(chave, "aguardando", e.message, { agora });
      return res("portainer_travado", e.rotulo);
    }
    if (e instanceof LeaseIndisponivel) {
      // Banco local travado: nada foi decidido sobre o lease. Também não é falha do reconciliador.
      auditar(def, def.stack, "error", { etapa: "lease_indisponivel", motivo: e.ponto }, true);
      registrarResultado(chave, "aguardando", e.message, { agora });
      return res("lease_indisponivel", e.ponto);
    }
    if (e instanceof LeasePerdido) {
      // Perder o lease por causa de outro dono não é falha do reconciliador: aguardando, sem backoff.
      auditar(def, def.stack, "error", { etapa: "lease_perdido", motivo: e.ponto }, true);
      registrarResultado(chave, "aguardando", e.message, { agora });
      return res("lease_perdido", e.ponto);
    }
    const codigo = e instanceof RestartPolicyError || e instanceof StackDiscoError ? e.codigo : e instanceof Error ? e.message : "erro";
    registrarResultado(chave, "falhou", codigo, { agora });
    auditar(def, def.stack, "error", { etapa: "stack", motivo: codigo }, true);
    return res("falhou", codigo);
  }
}

// ── Tick e agendamento ──────────────────────────────────────────────────

export async function tentarReconciliarRestart(agora = Date.now(), op: Partial<OpcoesReconciliar> = {}): Promise<ResultadoTick[]> {
  const out: ResultadoTick[] = [];
  try {
    if (!(await reconciliacaoRestartLigada(agora))) return out;
    await withServiceToken(async (token) => {
      const { endpointId } = await discoverContext(token); // falha cedo se o Portainer estiver fora
      for (const def of STACKS_RECONCILIADAS) {
        out.push(await reconciliarStack(def, { ...op, token, endpointId, agora }));
      }
    });
  } catch (e) {
    console.error("[restart-policy] tentativa falhou (a próxima rodada tenta de novo):", e instanceof Error ? e.message : e);
  }
  return out;
}

export function inicializarReconciliadorRestart(): void {
  if (!hasServiceCredentials()) {
    console.log("[restart-policy] sem credenciais de serviço do Portainer — reconciliador da restart_policy desativado.");
    return;
  }
  const primeiro = setTimeout(() => void tentarReconciliarRestart(), PRIMEIRA_TENTATIVA_MS);
  primeiro.unref?.();
  const repetido = setInterval(() => void tentarReconciliarRestart(), INTERVALO_MS);
  repetido.unref?.();
}
