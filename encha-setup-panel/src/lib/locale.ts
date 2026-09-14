import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, isLocale, toBcp47, type Locale } from "./locale-shared";

const CTX_DIR = process.env.VPS_CONTEXT_DIR ?? "/app/vps-context";

// /root/dados_vps/encha_locale (bind-montado em /app/vps-context) — arquivo
// PRÓPRIO gravado por salvar_idioma_escolhido() em main.sh, não uma chave
// dentro do texto de dados_vps (mesmo padrão de dados_portainer etc.: um
// arquivo por assunto). Instalação anterior à Fase 1 não tem esse arquivo —
// resolveLocale() cai para o Accept-Language e por fim pt.
export function readInstallLocale(): Locale | null {
  try {
    const p = join(CTX_DIR, "encha_locale");
    if (!existsSync(p)) return null;
    const raw = readFileSync(p, "utf8").trim();
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

// Exportada para teste direto (função pura) — mesmo padrão de
// parseDadosVps em vps-context.ts.
export function parseAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  // "en-US,en;q=0.9,pt-BR;q=0.8" -> ["en-us","en","pt-br"] -> primeiros 2
  // chars de cada um, primeiro que bater com um locale que suportamos.
  const candidatos = header
    .split(",")
    .map((parte) => parte.split(";")[0]?.trim().toLowerCase().slice(0, 2));
  for (const c of candidatos) {
    if (isLocale(c)) return c;
  }
  return null;
}

// Ordem de resolução: cookie (escolha explícita do usuário nesta sessão do
// painel) → arquivo da instalação (encha_locale) → Accept-Language do
// navegador → "pt" (default). O painel roda com filesystem read-only e sem
// banco de preferências de usuário — cookie é onde a troca manual vive,
// mesmo padrão do ThemeProvider (que usa localStorage; aqui precisa ser
// cookie porque o <html lang> do server component precisa ler ANTES do
// primeiro paint, e localStorage não existe no server).
export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const fromInstall = readInstallLocale();
  if (fromInstall) return fromInstall;

  const headerStore = await headers();
  const fromHeader = parseAcceptLanguage(headerStore.get("accept-language"));
  if (fromHeader) return fromHeader;

  return "pt";
}

export function htmlLang(locale: Locale): string {
  return toBcp47(locale);
}

export type { Locale };
