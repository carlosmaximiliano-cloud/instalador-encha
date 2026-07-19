import { getDb } from "./db";
import { reportTermsAcceptance } from "./monitor";

// Aceite de termos: prova local durável (SQLite) + fila de sincronização com o Monitor.
// A instalação nunca trava por causa do Monitor — gravamos local e sincronizamos depois.

export type AcceptanceInput = {
  user: string;
  ip: string;
  userAgent: string;
  deviceId: string;
  hostname: string;
  stackId: string;
  termsVersion: string;
  ts: number; // epoch seconds
};

/** Grava o aceite localmente (síncrono, autoritativo). Retorna o id da linha. */
export function recordAcceptanceLocal(input: AcceptanceInput): number {
  const db = getDb();
  const res = db
    .prepare(
      `INSERT INTO terms_acceptances
         (ts, "user", ip, user_agent, device_id, hostname, stack_id, terms_version, agreed, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`
    )
    .run(
      input.ts,
      input.user,
      input.ip,
      input.userAgent,
      input.deviceId,
      input.hostname,
      input.stackId,
      input.termsVersion
    );
  return Number(res.lastInsertRowid);
}

function markSynced(id: number): void {
  getDb().prepare("UPDATE terms_acceptances SET synced=1 WHERE id=?").run(id);
}

type PendingRow = {
  id: number;
  ts: number;
  user_agent: string;
  device_id: string;
  hostname: string | null;
  stack_id: string;
  terms_version: string;
  ip: string;
};

/** Tenta reenviar ao Monitor os aceites pendentes (synced=0). Best-effort. */
export async function flushPendingAcceptances(limit = 20): Promise<void> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, ts, user_agent, device_id, hostname, stack_id, terms_version, ip
       FROM terms_acceptances WHERE synced=0 ORDER BY id ASC LIMIT ?`
    )
    .all(limit) as PendingRow[];

  for (const r of rows) {
    const ok = await reportTermsAcceptance({
      deviceId: r.device_id,
      hostname: r.hostname ?? "",
      userAgent: r.user_agent,
      termsVersion: r.terms_version,
      stackId: r.stack_id,
      ip: r.ip,
      ts: r.ts,
    });
    if (ok) markSynced(r.id);
    else break; // Monitor provavelmente offline — para e tenta de novo depois
  }
}
