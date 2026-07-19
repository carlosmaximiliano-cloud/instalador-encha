import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { dirname } from "node:path";

const SECRET_PATH = "/run/secrets/master_key";
const FALLBACK_PATH = process.env.MASTER_KEY_PATH ?? "./data/master.key";

let cachedKey: Buffer | null = null;

export function getMasterKey(): Buffer {
  if (cachedKey) return cachedKey;

  if (existsSync(SECRET_PATH)) {
    cachedKey = readFileSync(SECRET_PATH);
    if (cachedKey.length !== 32) throw new Error("master_key inválida: precisa ter 32 bytes");
    return cachedKey;
  }

  if (existsSync(FALLBACK_PATH)) {
    cachedKey = readFileSync(FALLBACK_PATH);
    if (cachedKey.length !== 32) throw new Error("master_key inválida: precisa ter 32 bytes");
    return cachedKey;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "master_key não encontrada em /run/secrets/master_key. O Swarm Secret 'encha_panel_master_key' precisa estar montado."
    );
  }

  const dir = dirname(FALLBACK_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const key = randomBytes(32);
  writeFileSync(FALLBACK_PATH, key, { mode: 0o600 });
  chmodSync(FALLBACK_PATH, 0o600);
  cachedKey = key;
  return key;
}
