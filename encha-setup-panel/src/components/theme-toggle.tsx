"use client";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./theme-provider";
import { useDict } from "@/lib/i18n/use-dict";
import { themeToggleText } from "./theme-toggle.i18n";
import { cn } from "@/lib/utils";

const ORDER: Theme[] = ["light", "dark", "system"];
const ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const t = useDict(themeToggleText);
  const LABELS = { light: t.light, dark: t.dark, system: t.system } as const;
  const Icon = ICONS[theme];

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      title={t.titleFor(LABELS[theme])}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 dark:text-warm-300 hover:bg-glass-strong hover:text-foreground transition-all",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{LABELS[theme]}</span>
    </button>
  );
}
