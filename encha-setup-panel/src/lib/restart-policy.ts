// Reconciliação da restart_policy das stacks que o painel instalou — parte PURA
// (sem rede, sem banco, sem relógio global). O agendador e a ordem das
// chamadas ao Portainer ficam em restart-policy-runtime.ts.
//
// Por quê (incidente de 16/10/2026): com `condition: on-failure`, o Postgres
// que sai com exit 0 no shutdown da VPS vira task "Complete" e nunca volta; um
// `max_attempts` no app esgotava as tentativas. Instalações antigas não
// recebem template novo, então o painel corrige o que já está instalado:
//   - o ARQUIVO da stack guardado no Portainer (para "Update the stack" não
//     desfazer) — aplicarPatchRestartCompose;
//   - o serviço AO VIVO (docker service update da RestartPolicy).
// Regra única: condition `any`, sem max_attempts; delay/window preservados.
//
// Allowlist FECHADA: só os serviços abaixo, pelo nome completo e com a imagem
// no padrão esperado. Qualquer outro (n8n, Grátis swarm, encha-guard, jobs) é
// ignorado. Imagem fora do padrão = registro e pulo, nunca um chute.

import type { DockerServiceFull, ServiceRestartPolicy } from "./portainer";
import { IMG } from "./fixar-versoes";
import { limitesDoServicoOuNull } from "./compose-servico";

export type PapelRestart = "banco" | "app" | "pinfy" | "updater" | "painel";

export type ServicoRestart = {
  /** Nome do serviço dentro do compose (`enchat_app`). */
  compose: string;
  /** Nome completo no Swarm (`enchat_enchat_app`). */
  swarm: string;
  papel: PapelRestart;
  /** A imagem em uso é a que esperamos para este papel? */
  imagemOk: (ref: string) => boolean;
};

export type StackRestart = {
  /** Nome da stack no Portainer. */
  stack: string;
  /** Linha do stack_sync usada como lease. Compartilhada com sincronizarStackEnchat no caso do enchat. */
  leaseKey: string;
  /** Ordem segura: banco primeiro, depois os dependentes. */
  servicos: ServicoRestart[];
};

const SHA = "(@sha256:[0-9a-f]{64})?";
const ehBanco = (ref: string): boolean => new RegExp(`^(pgvector/pgvector|postgres):[A-Za-z0-9._-]+${SHA}$`).test(ref);
const ehImgEnchat = (repos: string[]) => (ref: string): boolean => {
  const m = IMG.exec(ref);
  return m !== null && repos.includes(m[2]);
};
const ehImgTracker = (repo: "encha-tracker" | "tracker-updater") => (ref: string): boolean =>
  new RegExp(`^ghcr\\.io/cheiodecoisa/${repo}:(\\d+\\.\\d+\\.\\d+|beta-[0-9a-f]{12})${SHA}$`).test(ref);
const ehImgPainel = (ref: string): boolean => /^ghcr\.io\/enchaaluno\/setup-panel:[^\s]+$/.test(ref);

export const STACK_RESTART_ENCHAT: StackRestart = {
  stack: "enchat",
  leaseKey: "enchat", // = STACK_ENCHAT de fixar-versoes.ts: o mesmo lease de sincronizarStackEnchat
  servicos: [
    { compose: "enchat_postgres", swarm: "enchat_enchat_postgres", papel: "banco", imagemOk: ehBanco },
    { compose: "enchat_app", swarm: "enchat_enchat_app", papel: "app", imagemOk: ehImgEnchat(["enchat", "enchat-free"]) },
    { compose: "enchat_pinfy", swarm: "enchat_enchat_pinfy", papel: "pinfy", imagemOk: ehImgEnchat(["pinfy"]) },
    { compose: "enchat_updater", swarm: "enchat_enchat_updater", papel: "updater", imagemOk: ehImgEnchat(["enchat-updater"]) },
  ],
};

export const STACK_RESTART_TRACKER: StackRestart = {
  stack: "encha_tracker",
  leaseKey: "restart:encha_tracker",
  servicos: [
    { compose: "postgres", swarm: "encha_tracker_postgres", papel: "banco", imagemOk: ehBanco },
    { compose: "app", swarm: "encha_tracker_app", papel: "app", imagemOk: ehImgTracker("encha-tracker") },
    { compose: "updater", swarm: "encha_tracker_updater", papel: "updater", imagemOk: ehImgTracker("tracker-updater") },
  ],
};

/** O próprio painel: só o ARQUIVO da stack é patcheado (ver updater.ts) — ele nunca se reinicia sozinho. */
export const STACK_RESTART_PAINEL: StackRestart = {
  stack: "encha-panel",
  leaseKey: "restart:encha-panel",
  servicos: [{ compose: "panel", swarm: "encha-panel_panel", papel: "painel", imagemOk: ehImgPainel }],
};

/** Stacks que o reconciliador mexe AO VIVO. O painel fica de fora de propósito. */
export const STACKS_RECONCILIADAS: readonly StackRestart[] = [STACK_RESTART_ENCHAT, STACK_RESTART_TRACKER];

export class RestartPolicyError extends Error {
  constructor(
    public readonly codigo: "compose_inesperado",
    public readonly detalhe?: string
  ) {
    super(detalhe ? `${codigo}: ${detalhe}` : codigo);
    this.name = "RestartPolicyError";
  }
}

// ── Janela de manutenção ─────────────────────────────────────────────────

/** 02h–05h em America/Sao_Paulo (o passo ao vivo reinicia o banco). */
export function dentroDaJanela(agora: number): boolean {
  const hora = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", hourCycle: "h23" }).format(new Date(agora))
  );
  return hora >= 2 && hora < 5;
}

// ── Serviço ao vivo ──────────────────────────────────────────────────────

const ESTADOS_ASSENTADOS = new Set(["completed", "rollback_completed"]);

/** Update/rollback em curso no serviço? (`UpdateStatus` ausente ou terminal = não.) */
export function emUpdateEmCurso(svc: DockerServiceFull): boolean {
  const estado = svc.UpdateStatus?.State;
  return estado !== undefined && !ESTADOS_ASSENTADOS.has(estado);
}

export function politicaDoServico(svc: DockerServiceFull): ServiceRestartPolicy | undefined {
  return svc.Spec.TaskTemplate?.RestartPolicy as ServiceRestartPolicy | undefined;
}

/** Ausente = default do Swarm (any, sem limite): conforme. */
export function politicaConforme(rp: ServiceRestartPolicy | undefined): boolean {
  if (!rp) return true;
  return rp.Condition === "any" && !(rp.MaxAttempts !== undefined && rp.MaxAttempts > 0);
}

/** Mantém delay/window e o resto; só força condition any e MaxAttempts 0. */
export function politicaDesejada(rp: ServiceRestartPolicy | undefined): ServiceRestartPolicy {
  return { ...rp, Condition: "any", MaxAttempts: 0 };
}

export function descreverPolitica(rp: ServiceRestartPolicy | undefined): string {
  if (!rp) return "(padrão)";
  return `${rp.Condition}${rp.MaxAttempts ? `/max_attempts=${rp.MaxAttempts}` : ""}`;
}

export type MotivoPulo =
  | "ausente"
  | "nome_fora_da_allowlist"
  | "imagem_fora_do_padrao"
  | "modo_nao_replicado"
  | "sem_restart_policy"
  | "sem_deploy"
  | "imagem_nao_literal";

export type Passo =
  | { servico: ServicoRestart; acao: "ajustar"; de: ServiceRestartPolicy | undefined; para: ServiceRestartPolicy }
  | { servico: ServicoRestart; acao: "conforme" }
  | { servico: ServicoRestart; acao: "pular"; motivo: MotivoPulo };

export function planejarServico(alvo: ServicoRestart, svc: DockerServiceFull | null): Passo {
  if (!svc) return { servico: alvo, acao: "pular", motivo: "ausente" };
  if (svc.Spec.Name !== alvo.swarm) return { servico: alvo, acao: "pular", motivo: "nome_fora_da_allowlist" };
  const imagem = svc.Spec.TaskTemplate?.ContainerSpec?.Image;
  if (!imagem || !alvo.imagemOk(imagem)) return { servico: alvo, acao: "pular", motivo: "imagem_fora_do_padrao" };
  const modo = svc.Spec.Mode as Record<string, unknown> | undefined;
  if (!modo || typeof modo.Replicated !== "object") return { servico: alvo, acao: "pular", motivo: "modo_nao_replicado" };
  const rp = politicaDoServico(svc);
  if (politicaConforme(rp)) return { servico: alvo, acao: "conforme" };
  return { servico: alvo, acao: "ajustar", de: rp, para: politicaDesejada(rp) };
}

/** Um passo por serviço da stack, na ordem segura (banco primeiro). */
export function planejarStack(def: StackRestart, vivos: Record<string, DockerServiceFull | null>): Passo[] {
  return def.servicos.map((s) => planejarServico(s, vivos[s.swarm] ?? null));
}

// ── Patch cirúrgico do arquivo da stack ──────────────────────────────────

export type MudancaRestart = { servico: string; de: string; para: string };
export type PuloRestart = { servico: string; motivo: MotivoPulo };
export type ResultadoPatchRestart = {
  compose: string;
  mudancas: MudancaRestart[];
  pulados: PuloRestart[];
  nadaAFazer: boolean;
};

const RE_DEPLOY = /^ {4}deploy:\s*(#.*)?$/;
const RE_RP = /^ {6}restart_policy:\s*(#.*)?$/;
const RE_RP_INLINE = /^ {6}restart_policy:\s*\S/;
const RE_CONDITION = /^( {8})condition:\s*["']?([^"'\s#]+)["']?\s*(#.*)?$/;
const RE_MAX = /^ {8}max_attempts:\s*["']?([^"'\s#]*)["']?\s*(#.*)?$/;
const RE_IMAGE = /^ {4}image:\s*["']?([^"'\s#]+)["']?\s*(#.*)?$/;
const vazioOuComentario = (l: string): boolean => /^\s*(#.*)?$/.test(l);

/**
 * Troca `condition` por `any` e remove `max_attempts` do `restart_policy` dos
 * serviços da allowlist, no texto do compose. Não regenera nada: delay,
 * window, update_config, labels, segredos e edições do cliente ficam como
 * estão. Idempotente (segunda aplicação = nadaAFazer). Serviço ausente, sem
 * `deploy`/`restart_policy` (o default do Swarm já é any) ou com imagem fora
 * do padrão é PULADO; formato que não sabemos editar (flow style, valor
 * interpolado, CRLF) aborta com RestartPolicyError.
 */
export function aplicarPatchRestartCompose(composeAtual: string, def: StackRestart): ResultadoPatchRestart {
  if (composeAtual.includes("\r")) throw new RestartPolicyError("compose_inesperado", "CRLF");
  const linhas = composeAtual.split("\n");
  const mudancas: MudancaRestart[] = [];
  const pulados: PuloRestart[] = [];

  for (const alvo of def.servicos) {
    const lim = limitesDoServicoOuNull(linhas, alvo.compose);
    if (!lim) {
      pulados.push({ servico: alvo.compose, motivo: "ausente" });
      continue;
    }
    // Imagem literal no padrão — a mesma checagem da allowlist ao vivo.
    const imgs = linhas.slice(lim.ini + 1, lim.fim).map((l) => RE_IMAGE.exec(l)).filter((m) => m !== null);
    if (imgs.length !== 1) throw new RestartPolicyError("compose_inesperado", `${alvo.compose}: image`);
    const imagem = imgs[0]![1];
    if (imagem.includes("$") && alvo.papel !== "painel") {
      pulados.push({ servico: alvo.compose, motivo: "imagem_nao_literal" });
      continue;
    }
    if (!alvo.imagemOk(imagem)) {
      pulados.push({ servico: alvo.compose, motivo: "imagem_fora_do_padrao" });
      continue;
    }

    const deploy = linhas.findIndex((l, i) => i > lim.ini && i < lim.fim && RE_DEPLOY.test(l));
    if (deploy === -1) {
      pulados.push({ servico: alvo.compose, motivo: "sem_deploy" });
      continue;
    }
    let fimDeploy = lim.fim;
    for (let i = deploy + 1; i < lim.fim; i++) {
      if (!vazioOuComentario(linhas[i]) && !/^ {5,}/.test(linhas[i])) {
        fimDeploy = i;
        break;
      }
    }
    if (linhas.slice(deploy + 1, fimDeploy).some((l) => RE_RP_INLINE.test(l))) {
      throw new RestartPolicyError("compose_inesperado", `${alvo.compose}: restart_policy fora do formato bloco`);
    }
    const rp = linhas.findIndex((l, i) => i > deploy && i < fimDeploy && RE_RP.test(l));
    if (rp === -1) {
      pulados.push({ servico: alvo.compose, motivo: "sem_restart_policy" });
      continue;
    }
    let fimRp = fimDeploy;
    for (let i = rp + 1; i < fimDeploy; i++) {
      if (!vazioOuComentario(linhas[i]) && !/^ {8,}/.test(linhas[i])) {
        fimRp = i;
        break;
      }
    }

    let idxCond = -1;
    let idxMax = -1;
    let cond = "any"; // sem a linha, o default do Swarm
    let max = "";
    for (let i = rp + 1; i < fimRp; i++) {
      const c = RE_CONDITION.exec(linhas[i]);
      if (c) {
        idxCond = i;
        cond = c[2];
      }
      const m = RE_MAX.exec(linhas[i]);
      if (m) {
        idxMax = i;
        max = m[1];
      }
    }
    if (cond.includes("$") || max.includes("$")) {
      throw new RestartPolicyError("compose_inesperado", `${alvo.compose}: restart_policy interpolada`);
    }
    const removerMax = idxMax !== -1 && max !== "0";
    if (cond === "any" && !removerMax) continue; // já conforme

    mudancas.push({
      servico: alvo.compose,
      de: `${cond}${removerMax ? `/max_attempts=${max}` : ""}`,
      para: "any",
    });
    if (cond !== "any") {
      linhas[idxCond] = "        condition: any";
    }
    if (removerMax) {
      // Sem a linha `condition` (default any), o max_attempts vira a própria `condition: any`
      // para o bloco nunca ficar vazio.
      if (idxCond === -1 && cond === "any") linhas[idxMax] = "        condition: any";
      else linhas.splice(idxMax, 1);
    }
  }

  return { compose: linhas.join("\n"), mudancas, pulados, nadaAFazer: mudancas.length === 0 };
}
