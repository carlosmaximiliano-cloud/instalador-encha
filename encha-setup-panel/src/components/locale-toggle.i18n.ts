import type { Locale } from "@/lib/locale-shared";

// Só o texto AO REDOR do nome do idioma traduz. O nome em si (LOCALE_LABEL,
// em locale-shared.ts) é o autônimo — "Español" continua "Español" mesmo
// com a UI em inglês, mesma convenção de qualquer seletor de idioma.
export type LocaleToggleText = {
  titleFor: (label: string) => string;
};

export const localeToggleText: Record<Locale, LocaleToggleText> = {
  pt: { titleFor: (label) => `Idioma: ${label} (clique para alternar)` },
  en: { titleFor: (label) => `Language: ${label} (click to switch)` },
  es: { titleFor: (label) => `Idioma: ${label} (clic para cambiar)` },
};
