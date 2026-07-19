import { getDb } from "../db";

export type RateLimitResult = { allowed: boolean; remaining: number; resetMs: number };

export function checkRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const db = getDb();
  const now = Date.now();
  const cutoff = now - windowMs;
  db.prepare("DELETE FROM rate_limit WHERE ts < ?").run(cutoff);
  const row = db
    .prepare("SELECT COUNT(*) as c FROM rate_limit WHERE key = ? AND ts > ?")
    .get(key, cutoff) as { c: number };
  if (row.c >= max) {
    const oldest = db
      .prepare("SELECT MIN(ts) as t FROM rate_limit WHERE key = ?")
      .get(key) as { t: number | null };
    const resetMs = oldest.t ? oldest.t + windowMs - now : windowMs;
    return { allowed: false, remaining: 0, resetMs };
  }
  db.prepare("INSERT INTO rate_limit (key, ts) VALUES (?, ?)").run(key, now);
  return { allowed: true, remaining: max - row.c - 1, resetMs: windowMs };
}
