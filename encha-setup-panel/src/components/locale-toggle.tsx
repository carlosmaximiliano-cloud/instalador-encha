"use client";
import { Languages } from "lucide-react";
import { useLocale } from "./locale-provider";
import { LOCALES, LOCALE_LABEL } from "@/lib/locale-shared";
import { useDict } from "@/lib/i18n/use-dict";
import { localeToggleText } from "./locale-toggle.i18n";
import { cn } from "@/lib/utils";

// Mesmo padrão do ThemeToggle: um botão que cicla entre as opções — não um
// dropdown.
export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const t = useDict(localeToggleText);

  function cycle() {
    const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];
    setLocale(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      title={t.titleFor(LOCALE_LABEL[locale])}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 dark:text-warm-300 hover:bg-glass-strong hover:text-foreground transition-all",
        className
      )}
    >
      <Languages className="h-4 w-4" />
      <span>{LOCALE_LABEL[locale]}</span>
    </button>
  );
}
