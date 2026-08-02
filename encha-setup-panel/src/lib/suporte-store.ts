// Persistência das credenciais do sistema de tickets de suporte — ver
// suporte.ts para o cliente HTTP do Console e db.ts para o schema. Mesmo
// esqueleto de pairing-store.ts: nenhuma das duas credenciais aqui
// (requester_token/acesso_token) chega ao navegador — o servidor as usa
// para autenticar as chamadas seguintes ao Console em nome do usuário.
import { getDb } from "./db";
import { encryptSecret, decryptSecret } from "./crypto";

export function suporteRequesterToken(scope: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT token_encrypted FROM suporte_solicitante WHERE scope = ?").get(scope) as
    | { token_encrypted: string }
    | undefined;
  if (!row) return null;
  try {
    return decryptSecret(row.token_encrypted);
  } catch {
    return null;
  }
}

export function salvarSuporteRequesterToken(scope: string, token: string): void {
  const db = getDb();
  const enc = encryptSecret(token);
  db.prepare(
    `INSERT INTO suporte_solicitante (scope, token_encrypted, created_at) VALUES (?, ?, ?)
     ON CONFLICT(scope) DO UPDATE SET token_encrypted = excluded.token_encrypted`
  ).run(scope, enc, Date.now());
}

export function salvarSuporteAcessoToken(ticketId: number, scope: string, token: string): void {
  const db = getDb();
  const enc = encryptSecret(token);
  db.prepare(
    `INSERT INTO suporte_tickets_locais (ticket_id, scope, acesso_token_encrypted, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(ticket_id) DO UPDATE SET acesso_token_encrypted = excluded.acesso_token_encrypted`
  ).run(ticketId, scope, enc, Date.now());
}

// Devolve null quando o ticket não pertence a NENHUM scope desta instalação
// (id de outra instalação, ou nunca existiu) — o chamador deve responder o
// mesmo 404 nos dois casos, sem distinguir "não é seu" de "não existe".
export function suporteAcessoToken(ticketId: number, scope: string): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT acesso_token_encrypted FROM suporte_tickets_locais WHERE ticket_id = ? AND scope = ?")
    .get(ticketId, scope) as { acesso_token_encrypted: string } | undefined;
  if (!row) return null;
  try {
    return decryptSecret(row.acesso_token_encrypted);
  } catch {
    return null;
  }
}
