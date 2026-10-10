import { getDb } from "./db";

// Estado persistido da sincronização automática do arquivo da stack (ver
// sincronizar-stack.ts). Tudo aqui é SQLite local do painel (/app/data).

export type ResultadoSync =
  | "sincronizada" // já estava igual (nada a fazer)
  | "aplicada" // arquivo gravado
  | "aguardando" // portão não abriu (update em andamento, estado ilegível…)
  | "falhou"
  | "desligada";

export type EstadoSync = {
  stackId: string;
  attempts: number;
  nextAttemptAt: number;
  autoDisabledReason: string | null;
  lastResult: ResultadoSync | null;
  lastDetail: string | null;
  lastAt: number | null;
  highWater: Record<string, string> | null;
};

type Linha = {
  stack_id: string;
  lease_owner: string | null;
  lease_until: number;
  attempts: number;
  next_attempt_at: number;
  auto_disabled_reason: string | null;
  last_result: string | null;
  last_detail: string | null;
  last_at: number | null;
  high_water: string | null;
};

const MAX_TENTATIVAS = 3;
// Backoff entre tentativas que FALHARAM (não entre ticks): 5, 15, 45 min.
const BACKOFF_MS = [5 * 60_000, 15 * 60_000, 45 * 60_000];

function garantirLinha(stackId: string): void {
  getDb().prepare("INSERT OR IGNORE INTO stack_sync (stack_id) VALUES (?)").run(stackId);
}

export function lerEstadoSync(stackId: string): EstadoSync {
  garantirLinha(stackId);
  const r = getDb().prepare("SELECT * FROM stack_sync WHERE stack_id = ?").get(stackId) as Linha;
  let hw: Record<string, string> | null = null;
  try {
    hw = r.high_water ? (JSON.parse(r.high_water) as Record<string, string>) : null;
  } catch {
    hw = null;
  }
  return {
    stackId,
    attempts: r.attempts,
    nextAttemptAt: r.next_attempt_at,
    autoDisabledReason: r.auto_disabled_reason,
    lastResult: (r.last_result as ResultadoSync | null) ?? null,
    lastDetail: r.last_detail,
    lastAt: r.last_at,
    highWater: hw,
  };
}

/**
 * Lease com expiração entre processos. `BEGIN IMMEDIATE` serializa a decisão;
 * SQLITE_BUSY (outro processo segurando a escrita além do busy_timeout) conta
 * como "não peguei". Devolve true se este `dono` agora detém o lease.
 */
export function tentarLease(stackId: string, dono: string, ttlMs: number, agora = Date.now()): boolean {
  garantirLinha(stackId);
  const db = getDb();
  try {
    return db.transaction(() => {
      const r = db.prepare("SELECT lease_owner, lease_until FROM stack_sync WHERE stack_id = ?").get(stackId) as {
        lease_owner: string | null;
        lease_until: number;
      };
      if (r.lease_owner && r.lease_owner !== dono && r.lease_until > agora) return false;
      db.prepare("UPDATE stack_sync SET lease_owner = ?, lease_until = ? WHERE stack_id = ?").run(dono, agora + ttlMs, stackId);
      return true;
    }).immediate();
  } catch (e) {
    if (e instanceof Error && /SQLITE_BUSY|database is locked/i.test(e.message)) return false;
    throw e;
  }
}

export function liberarLease(stackId: string, dono: string): void {
  getDb().prepare("UPDATE stack_sync SET lease_owner = NULL, lease_until = 0 WHERE stack_id = ? AND lease_owner = ?").run(stackId, dono);
}

/** O agendador pode tentar agora? (desligado por falhas, ou em backoff, não pode.) */
export function podeTentarAuto(stackId: string, agora = Date.now()): { pode: boolean; motivo?: string } {
  const e = lerEstadoSync(stackId);
  if (e.autoDisabledReason) return { pode: false, motivo: `desligada: ${e.autoDisabledReason}` };
  if (e.nextAttemptAt > agora) return { pode: false, motivo: "backoff" };
  return { pode: true };
}

export function registrarResultado(
  stackId: string,
  resultado: ResultadoSync,
  detalhe: string | null,
  opts: { highWater?: Record<string, string>; agora?: number } = {}
): void {
  garantirLinha(stackId);
  const agora = opts.agora ?? Date.now();
  const db = getDb();
  if (resultado === "falhou") {
    const atual = lerEstadoSync(stackId);
    const tent = atual.attempts + 1;
    const desliga = tent >= MAX_TENTATIVAS ? "falhas_consecutivas" : null;
    db.prepare(
      `UPDATE stack_sync SET attempts = ?, next_attempt_at = ?, auto_disabled_reason = COALESCE(?, auto_disabled_reason),
       last_result = ?, last_detail = ?, last_at = ? WHERE stack_id = ?`
    ).run(tent, agora + BACKOFF_MS[Math.min(tent - 1, BACKOFF_MS.length - 1)], desliga, resultado, detalhe, agora, stackId);
    return;
  }
  const hw = opts.highWater ? JSON.stringify(opts.highWater) : null;
  db.prepare(
    `UPDATE stack_sync SET attempts = CASE WHEN ? IN ('aplicada','sincronizada') THEN 0 ELSE attempts END,
     next_attempt_at = CASE WHEN ? IN ('aplicada','sincronizada') THEN 0 ELSE next_attempt_at END,
     last_result = ?, last_detail = ?, last_at = ?, high_water = COALESCE(?, high_water) WHERE stack_id = ?`
  ).run(resultado, resultado, resultado, detalhe, agora, hw, stackId);
}

/** Desliga a sincronização automática nesta instalação (ex.: task reiniciou sem querer). */
export function desligarAuto(stackId: string, motivo: string): void {
  garantirLinha(stackId);
  getDb().prepare("UPDATE stack_sync SET auto_disabled_reason = ? WHERE stack_id = ?").run(motivo, stackId);
}

/** Religar (ação manual do admin): zera falhas e o desligamento. */
export function religarAuto(stackId: string): void {
  garantirLinha(stackId);
  getDb().prepare("UPDATE stack_sync SET auto_disabled_reason = NULL, attempts = 0, next_attempt_at = 0 WHERE stack_id = ?").run(stackId);
}
