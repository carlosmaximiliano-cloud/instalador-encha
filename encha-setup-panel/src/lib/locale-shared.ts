// Tipos e constantes de locale compartilhados entre client e server — SEM
// `next/headers` nem `node:fs` aqui (isso é server-only, fica em locale.ts).
// Um componente "use client" que importasse locale.ts direto quebraria o
// build ("You're importing a component that needs next/headers").

export type Locale = "pt" | "en" | "es";

export const LOCALES: Locale[] = ["pt", "en", "es"];

// Nome do cookie que a Fase 1 usa para a preferência de idioma escolhida
// pelo usuário no painel — sobrepõe o idioma da instalação (arquivo
// encha_locale) e o Accept-Language do navegador. Ver resolveLocale() em
// locale.ts.
export const LOCALE_COOKIE = "encha_locale";

export function isLocale(v: string | null | undefined): v is Locale {
  return v === "pt" || v === "en" || v === "es";
}

// pt-BR (não "pt" genérico — o produto é brasileiro) e es-419 (espanhol
// neutro/latino-americano — decisão registrada em i18n/GLOSSARY.md, não
// es-ES). Usado em <html lang> e em Intl/toLocaleString.
const BCP47: Record<Locale, string> = { pt: "pt-BR", en: "en-US", es: "es-419" };

export function toBcp47(locale: Locale): string {
  return BCP47[locale];
}

export const LOCALE_LABEL: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};
