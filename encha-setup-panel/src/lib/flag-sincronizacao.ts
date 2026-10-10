import { getDb } from "./db";
import { CONSOLE_BASE_URL } from "./stacks/enchat";

// Chave remota da sincronização automática (fail-safe): o Console decide se esta
// instalação sincroniza sozinha. Só pode DESLIGAR: ausente, erro, resposta
// inesperada ou Console fora do ar = desligado. O botão manual não depende dela.
//
// Resposta esperada de GET {CONSOLE}/api/v1/setup/flags?fp=<fingerprint>:
//   { "sincronizar_stack_enchat": "desligado" | "canario" | "ligado",
//     "canario"?: string[] }   // fingerprints liberados quando "canario"

export type EstadoFlag = "desligado" | "canario" | "ligado";

export function decidirFlag(corpo: unknown, fingerprint: string | null): boolean {
  if (!corpo || typeof corpo !== "object") return false;
  const o = corpo as Record<string, unknown>;
  const v = o.sincronizar_stack_enchat;
  if (v === "ligado") return true;
  if (v === "canario") {
    if (!fingerprint || !Array.isArray(o.canario)) return false;
    return o.canario.some((x) => typeof x === "string" && x === fingerprint);
  }
  return false;
}

function fingerprintLocal(): string | null {
  try {
    const r = getDb().prepare("SELECT fingerprint FROM stack_machine_ids WHERE stack_id = 'enchat'").get() as
      | { fingerprint: string }
      | undefined;
    return r?.fingerprint ?? null;
  } catch {
    return null;
  }
}

let cache: { em: number; valor: boolean } | null = null;
const CACHE_MS = 10 * 60_000;

export function limparCacheFlag(): void {
  cache = null;
}

export async function sincronizacaoAutomaticaLigada(agora = Date.now(), fetchImpl: typeof fetch = fetch): Promise<boolean> {
  // Kill switch local (variável de ambiente da stack do painel).
  if (process.env.ENCHA_SYNC_STACK?.trim().toLowerCase() === "off") return false;
  if (cache && agora - cache.em < CACHE_MS) return cache.valor;
  let valor = false;
  try {
    const fp = fingerprintLocal();
    const url = `${CONSOLE_BASE_URL}/api/v1/setup/flags${fp ? `?fp=${encodeURIComponent(fp)}` : ""}`;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(4000), headers: { accept: "application/json" }, cache: "no-store" });
    if (res.ok) valor = decidirFlag(await res.json(), fp);
  } catch {
    valor = false;
  }
  cache = { em: agora, valor };
  return valor;
}
