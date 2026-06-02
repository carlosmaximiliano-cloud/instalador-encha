import { getDb } from "./db";

export type AuditAction =
  | "login.success"
  | "login.fail"
  | "logout"
  | "stack.install"
  | "stack.install.fail"
  | "stack.remove"
  | "stack.remove.fail"
  | "terms.accept"
  | "banner.click"
  | "panel.update"
  | "panel.update.fail";

export type AuditEntry = {
  user: string;
  ip: string;
  action: AuditAction;
  target?: string;
  result: "ok" | "error";
  meta?: Record<string, unknown>;
};

export function logAudit(entry: AuditEntry): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO audit_log (ts, user, ip, action, target, result, meta) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    Date.now(),
    entry.user,
    entry.ip,
    entry.action,
    entry.target ?? null,
    entry.result,
    entry.meta ? JSON.stringify(entry.meta) : null
  );
}

export type AuditRow = {
  id: number;
  ts: number;
  user: string;
  ip: string;
  action: string;
  target: string | null;
  result: string;
  meta: string | null;
};

export function listAudit(limit = 200, offset = 0): AuditRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM audit_log ORDER BY ts DESC LIMIT ? OFFSET ?")
    .all(limit, offset) as AuditRow[];
}
