import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { dirname } from "node:path";

// Identificador estável da VPS/instância do painel. Usado para atribuir aceites
// de termos e cliques de banner no Monitor. Persistido junto ao DB (mesmo volume).
const DB_PATH = process.env.DB_PATH ?? "./data/panel.db";
const DEVICE_ID_PATH = process.env.DEVICE_ID_PATH ?? `${dirname(DB_PATH)}/device.id`;

let cached: string | null = null;

export function getDeviceId(): string {
  if (cached) return cached;

  if (existsSync(DEVICE_ID_PATH)) {
    const v = readFileSync(DEVICE_ID_PATH, "utf8").trim();
    if (v) {
      cached = v;
      return v;
    }
  }

  const dir = dirname(DEVICE_ID_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const id = randomUUID();
  writeFileSync(DEVICE_ID_PATH, id, { mode: 0o600 });
  chmodSync(DEVICE_ID_PATH, 0o600);
  cached = id;
  return id;
}
