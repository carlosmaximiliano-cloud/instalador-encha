import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH ?? "./data/panel.db";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}

function initSchema(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      user TEXT NOT NULL,
      ip TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT,
      result TEXT NOT NULL,
      meta TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log(ts DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user);

    CREATE TABLE IF NOT EXISTS rate_limit (
      key TEXT NOT NULL,
      ts INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rate_key_ts ON rate_limit(key, ts);

    CREATE TABLE IF NOT EXISTS stack_secrets (
      stack_name TEXT PRIMARY KEY,
      encrypted_envs TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Fonte ÚNICA do machine_id/fingerprint de cada stack (ver
    -- enchat-fingerprint.ts) — 1 linha por stack_id, criada uma vez e
    -- reaproveitada em TODO install/reinstall/pareamento subsequente dessa
    -- mesma stack. Deliberadamente separada de license_pairings (que é o
    -- histórico de SESSÕES de pareamento, cada uma efêmera): o machine_id
    -- tem que sobreviver a qualquer sessão de pareamento individual expirar,
    -- ser abandonada ou falhar — recalculá-lo por instalação divergiria do
    -- fingerprint já vinculado no Console, o que é irreversível
    -- (licenses_fingerprint_imutavel_trg).
    CREATE TABLE IF NOT EXISTS stack_machine_ids (
      stack_id TEXT PRIMARY KEY,
      machine_id TEXT NOT NULL,
      fingerprint TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- Sessões de pareamento self-service de licença (ver license-pairing.ts).
    -- machine_id/fingerprint aqui são uma CÓPIA histórica (o que valia
    -- quando esta sessão foi aberta) — a fonte da verdade pra "qual é o
    -- machine_id desta stack" é stack_machine_ids, não esta tabela.
    CREATE TABLE IF NOT EXISTS license_pairings (
      id TEXT PRIMARY KEY,               -- 32 hex, opaco — o que o browser vê
      stack_id TEXT NOT NULL,
      machine_id TEXT NOT NULL,
      fingerprint TEXT NOT NULL,
      console_session_id TEXT,
      codigo_exibicao TEXT,
      status TEXT NOT NULL,              -- aberto|confirmado|consumido|falhou
      chave_encrypted TEXT,
      -- Campos de EXIBIÇÃO da resposta original de pair/start — persistidos
      -- pra sobreviver a RETOMADA (reabrir o wizard antes de confirmar):
      -- nem o Console nem o poll re-enviam wa_link/wa_qr_svg depois do
      -- start, então sem guardar aqui uma retomada perderia QR/link/número.
      wa_link TEXT,
      wa_qr_svg TEXT,
      numero_exibicao TEXT,
      signup_url TEXT,
      -- Plano devolvido na confirmação (ver risco #7 do plano: um CPF com
      -- licença paga não pode instalar a imagem free com essa chave) — nulo
      -- até confirmar.
      plano TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      expires_at INTEGER
    );
    -- Um pareamento ATIVO por stack — mata na raiz a corrida de duas abas
    -- abrindo duas sessões (dois fingerprints) pra mesma instalação.
    CREATE UNIQUE INDEX IF NOT EXISTS idx_pairing_ativo
      ON license_pairings(stack_id) WHERE status IN ('aberto','confirmado');
    CREATE INDEX IF NOT EXISTS idx_pairing_stack ON license_pairings(stack_id);

    CREATE TABLE IF NOT EXISTS terms_acceptances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      user TEXT NOT NULL,
      ip TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      device_id TEXT NOT NULL,
      hostname TEXT,
      stack_id TEXT NOT NULL,
      terms_version TEXT NOT NULL,
      agreed INTEGER NOT NULL DEFAULT 1,
      synced INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_terms_version ON terms_acceptances(terms_version);
    CREATE INDEX IF NOT EXISTS idx_terms_unsynced ON terms_acceptances(synced) WHERE synced = 0;

    -- Sistema de tickets de suporte (ver suporte.ts/suporte-store.ts).
    -- requester_token: um por SCOPE (hoje, stack_id — cada wizard lista só
    -- os próprios chamados), cunhado no primeiro ticket aberto daquele
    -- escopo. Cifrado como stack_secrets.encrypted_envs — credencial durável
    -- numa máquina cujo trabalho é rodar stacks de terceiros.
    CREATE TABLE IF NOT EXISTS suporte_solicitante (
      scope TEXT PRIMARY KEY,
      token_encrypted TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- acesso_token: um por TICKET, devolvido pelo Console só na resposta do
    -- POST que abre o ticket. Sem isto, um upload de anexo posterior (ação
    -- separada do usuário, depois de ver "ticket aberto") não teria como se
    -- autenticar contra o Console sem o token chegar ao navegador.
    CREATE TABLE IF NOT EXISTS suporte_tickets_locais (
      ticket_id INTEGER PRIMARY KEY,
      scope TEXT NOT NULL,
      acesso_token_encrypted TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}
