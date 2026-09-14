import type { Locale } from "@/lib/locale-shared";

export type ThemeToggleText = {
  light: string;
  dark: string;
  system: string;
  titleFor: (label: string) => string;
};

export const themeToggleText: Record<Locale, ThemeToggleText> = {
  pt: {
    light: "Claro",
    dark: "Escuro",
    system: "Sistema",
    titleFor: (label) => `Tema: ${label} (clique para alternar)`,
  },
  en: {
    light: "Light",
    dark: "Dark",
    system: "System",
    titleFor: (label) => `Theme: ${label} (click to switch)`,
  },
  es: {
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    titleFor: (label) => `Tema: ${label} (clic para cambiar)`,
  },
};
