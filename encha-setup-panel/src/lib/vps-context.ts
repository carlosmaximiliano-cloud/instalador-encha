import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type VpsContext = {
  nome_servidor: string;
  nome_rede_interna: string;
  email_ssl: string;
  url_portainer: string;
};

const CTX_DIR = process.env.VPS_CONTEXT_DIR ?? "/app/vps-context";
const FALLBACK: VpsContext = {
  nome_servidor: process.env.VPS_SERVER ?? "encha",
  nome_rede_interna: process.env.VPS_NETWORK ?? "enchanet",
  email_ssl: process.env.VPS_SSL_EMAIL ?? "",
  url_portainer: process.env.VPS_PORTAINER_URL ?? "",
};

let cached: VpsContext | null = null;

// Exportada para teste direto (função pura) — mesmo padrão de
// containerSpecToServiceSpec/taskOutcome em portainer.ts.
export function parseDadosVps(content: string): Partial<VpsContext> {
  const out: Partial<VpsContext> = {};
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*([^:]+):\s*(.+?)\s*$/);
    if (!m) continue;
    const key = m[1].trim().toLowerCase();
    const value = m[2].trim();
    if (!value) continue;
    // Aceita a chave nova em inglês (instalações a partir da Fase 0 de i18n)
    // e a antiga em português (frota já instalada — dados_vps só é regravado
    // numa instalação completa nova, nunca por "Atualizar", então essas
    // instalações mantêm a chave antiga para sempre). Ver i18n/GLOSSARY.md.
    if (key.includes("nome do servidor") || key === "servidor" || key.includes("server name")) {
      out.nome_servidor = value;
    } else if (key.includes("rede interna") || key === "rede" || key.includes("internal network")) {
      out.nome_rede_interna = value;
    } else if ((key.includes("email") && key.includes("ssl")) || key.includes("ssl email")) {
      out.email_ssl = value;
    } else if (key.includes("link do portainer") || key.includes("portainer link") || key.includes("portainer")) {
      out.url_portainer = value.replace(/^https?:\/\//, "");
    }
  }
  return out;
}

export function getVpsContext(): VpsContext {
  if (cached) return cached;

  const merged: VpsContext = { ...FALLBACK };
  const dadosVpsPath = join(CTX_DIR, "dados_vps");

  if (existsSync(dadosVpsPath)) {
    try {
      const content = readFileSync(dadosVpsPath, "utf8");
      const parsed = parseDadosVps(content);
      Object.assign(merged, parsed);
    } catch (e) {
      console.warn("[vps-context] erro lendo dados_vps:", e);
    }
  }

  cached = merged;
  return merged;
}

export function resetVpsContextCache(): void {
  cached = null;
}
