import { NextResponse } from "next/server";
import type { Locale } from "./locale-shared";

// Fase 2 (i18n/GLOSSARY.md): substitui as ~156 mensagens de erro de API que
// eram texto livre em português por {error: <código estável>, message:
// <texto já no idioma da requisição>}. `message` é resolvido AQUI, no
// servidor, via resolveLocale() (mesmo cookie que decide <html lang>) — o
// cliente não precisa de dicionário próprio pra erro de API, só mostra
// `data.message`. `error` continua estável entre versões, mesmo padrão já
// usado em registry-auth.ts/release-info.ts para os códigos do Console.
//
// Cada rota declara seu próprio dicionário de códigos, colocado no arquivo
// da rota (mesmo padrão dos *.i18n.ts de componente — sem catálogo
// monolítico, sem estado de módulo compartilhado):
//
//   const ERROS = {
//     cpf_invalido: { pt: "CPF inválido.", en: "Invalid CPF.", es: "CPF inválido." },
//   } satisfies Record<string, Record<Locale, string>>;
//
//   return apiError(ERROS, "cpf_invalido", locale, 400);
//
// TypeScript garante em tempo de compilação que `code` existe no dicionário
// passado — errar o nome do código é erro de build, não 500 em produção.
export function apiError<E extends Record<string, Record<Locale, string>>>(
  errors: E,
  code: keyof E & string,
  locale: Locale,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  const porIdioma = errors[code];
  const message = porIdioma[locale] ?? porIdioma.pt;
  return NextResponse.json({ error: code, message, ...extra }, { status });
}

// A mesma resposta 401 "Não autenticado" era repetida, hardcoded em
// português, em ~24 rotas — centralizada aqui em vez de duplicar a entrada
// em cada .i18n de rota. Cobre também middleware.ts (Edge runtime — ele não
// pode importar daqui, que usa next/headers/node:fs via locale.ts; a mesma
// mensagem está reimplementada ali com a leitura de locale compatível com
// Edge, ver o comentário em middleware.ts).
const NAO_AUTENTICADO = {
  pt: "Não autenticado",
  en: "Not authenticated",
  es: "No autenticado",
} satisfies Record<Locale, string>;

export function unauthenticatedResponse(locale: Locale): NextResponse {
  return NextResponse.json(
    { error: "nao_autenticado", message: NAO_AUTENTICADO[locale] },
    { status: 401 }
  );
}
