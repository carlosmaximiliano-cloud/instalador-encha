"use client";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/locale-shared";

// Padrão da Fase 2 (i18n/GLOSSARY.md): cada componente traduzido tem um
// arquivo `<componente>.i18n.ts` colocado ao lado, exportando um objeto
// `Record<Locale, T>` — um arquivo por feature, não um dicionário monolítico
// (evita um arquivo gigante e conflito de edição entre features).
//
// Entradas com variável viram função (`(nome: string) => string`) em vez de
// string com placeholder — o TypeScript garante que pt/en/es implementam a
// mesma assinatura, e o call site já recebe autocomplete.
//
// Uso:
//   export type LoginText = { title: string; errorFor: (campo: string) => string };
//   export const loginText: Record<Locale, LoginText> = { pt: {...}, en: {...}, es: {...} };
//   const t = useDict(loginText);
//   <h1>{t.title}</h1>
export function useDict<T>(dict: Record<Locale, T>): T {
  const { locale } = useLocale();
  return dict[locale];
}
