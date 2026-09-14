"use client";
import { Languages } from "lucide-react";
import { useLocale } from "./locale-provider";
import { LOCALES, LOCALE_LABEL } from "@/lib/locale-shared";
import { cn } from "@/lib/utils";

// Mesmo padrão do ThemeToggle: um botão que cicla entre as opções — não um
// dropdown. A Fase 2 é quem traduz o resto da UI; por ora a troca já
// funciona (persiste em cookie, <html lang> e as datas já respeitam),
// mesmo que o texto ao redor continue em português até lá.
export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  function cycle() {
    const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];
    setLocale(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Idioma: ${LOCALE_LABEL[locale]} (clique para alternar)`}
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
