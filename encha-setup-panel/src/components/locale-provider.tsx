"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/locale-shared";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void };

const LocaleCtx = createContext<Ctx | null>(null);

// initialLocale vem do server (resolveLocale() em layout.tsx) — não há
// "flash" de idioma errado tipo o do tema, porque o <html lang> e qualquer
// texto traduzido já nascem certos no HTML enviado pelo servidor.
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (l: Locale) => {
      // 1 ano, mesmo padrão de expiração usado pra preferências de UI —
      // path=/ pra valer em toda rota do painel (login incluso).
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; SameSite=Lax`;
      setLocaleState(l);
      // Reexecuta os Server Components com o cookie novo — é o que faz
      // resolveLocale() (que roda no server) enxergar a troca.
      router.refresh();
    },
    [router]
  );

  return <LocaleCtx.Provider value={{ locale, setLocale }}>{children}</LocaleCtx.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleCtx);
  if (!ctx) return { locale: "pt", setLocale: () => {} };
  return ctx;
}
