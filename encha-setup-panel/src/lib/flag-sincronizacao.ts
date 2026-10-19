import { getDb } from "./db";
import { CONSOLE_BASE_URL } from "./stacks/enchat";

// Chave remota da sincronização automática (fail-safe): o Console decide se esta
// instalação sincroniza sozinha. Só pode DESLIGAR: ausente, erro, resposta
// inesperada ou Console fora do ar = desligado. O botão manual não depende dela.
//
// Resposta esperada de GET {CONSOLE}/api/v1/setup/flags?fp=<fingerprint>:
//   { "sincronizar_stack_enchat": "desligado" | "canario" | "ligado",
//     "reconciliar_restart": "desligado" | "ligado",   // aditiva: reconciliador da restart_policy
//     "canario"?: string[] }   // fingerprints liberados quando "canario"
// Cada chave é independente: só um valor explícito liga; chave ausente (Console
// antigo) = desligado. `reconciliar_restart` aceita SÓ "ligado": o canário dela é
// resolvido no Console (que devolve "ligado" ao fingerprint liberado), então
// "canario" e a lista `canario` são ignorados nessa chave.

export type EstadoFlag = "desligado" | "canario" | "ligado";

export type ChaveFlag = "sincronizar_stack_enchat" | "reconciliar_restart";

export function decidirFlag(corpo: unknown, fingerprint: string | null, chave: ChaveFlag = "sincronizar_stack_enchat"): boolean {
  if (!corpo || typeof corpo !== "object") return false;
  const o = corpo as Record<string, unknown>;
  const v = o[chave];
  if (v === "ligado") return true;
  if (v === "canario" && chave !== "reconciliar_restart") {
    if (!fingerprint || !Array.isArray(o.canario)) return false;
    return o.canario.some((x) => typeof x === "string" && x === fingerprint);
  }
  return false;
}

function fingerprintLocal(stackIds: readonly string[]): string | null {
  try {
    for (const id of stackIds) {
      const r = getDb().prepare("SELECT fingerprint FROM stack_machine_ids WHERE stack_id = ?").get(id) as
        | { fingerprint: string }
        | undefined;
      if (r?.fingerprint) return r.fingerprint;
    }
    return null;
  } catch {
    return null;
  }
}

const cache = new Map<ChaveFlag, { em: number; valor: boolean }>();
const CACHE_MS = 10 * 60_000;

export function limparCacheFlag(): void {
  cache.clear();
}

async function consultarFlag(chave: ChaveFlag, stackIds: readonly string[], agora: number, fetchImpl: typeof fetch): Promise<boolean> {
  const c = cache.get(chave);
  if (c && agora - c.em < CACHE_MS) return c.valor;
  let valor = false;
  try {
    const fp = fingerprintLocal(stackIds);
    const url = `${CONSOLE_BASE_URL}/api/v1/setup/flags${fp ? `?fp=${encodeURIComponent(fp)}` : ""}`;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(4000), headers: { accept: "application/json" }, cache: "no-store" });
    if (res.ok) valor = decidirFlag(await res.json(), fp, chave);
  } catch {
    valor = false;
  }
  cache.set(chave, { em: agora, valor });
  return valor;
}

export async function sincronizacaoAutomaticaLigada(agora = Date.now(), fetchImpl: typeof fetch = fetch): Promise<boolean> {
  // Kill switch local (variável de ambiente da stack do painel).
  if (process.env.ENCHA_SYNC_STACK?.trim().toLowerCase() === "off") return false;
  return consultarFlag("sincronizar_stack_enchat", ["enchat"], agora, fetchImpl);
}

/**
 * Reconciliador da restart_policy (restart-policy-runtime.ts). DESLIGADO por
 * padrão: só liga com `reconciliar_restart` explícito do Console. A variável
 * local ENCHA_RECONCILIAR_RESTART=off vence o Console. O fingerprint é o do
 * enchat ou, numa instalação só com o Tracker, o dele.
 */
export async function reconciliacaoRestartLigada(agora = Date.now(), fetchImpl: typeof fetch = fetch): Promise<boolean> {
  if (process.env.ENCHA_RECONCILIAR_RESTART?.trim().toLowerCase() === "off") return false;
  return consultarFlag("reconciliar_restart", ["enchat", "encha-tracker"], agora, fetchImpl);
}
