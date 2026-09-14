import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/locale-shared";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/csrf", "/api/health"];

// Mesma mensagem de src/lib/api-error.ts (unauthenticatedResponse) — não
// importada daqui de propósito: o middleware roda no Edge runtime, que não
// tem o request context de next/headers nem node:fs (api-error.ts/locale.ts
// dependem dos dois). Resolução de locale simplificada: só o cookie — sem
// arquivo da instalação nem Accept-Language, que exigiriam next/headers.
// Baixo custo: essa resposta é consumida por fetch(), não lida na tela.
const NAO_AUTENTICADO = {
  pt: "Não autenticado",
  en: "Not authenticated",
  es: "No autenticado",
} as const;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const session = req.cookies.get("__Host-encha_session");
  if (!session) {
    if (pathname.startsWith("/api/")) {
      const fromCookie = req.cookies.get(LOCALE_COOKIE)?.value;
      const locale = isLocale(fromCookie) ? fromCookie : "pt";
      return NextResponse.json(
        { error: "nao_autenticado", message: NAO_AUTENTICADO[locale] },
        { status: 401 }
      );
    }
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|gif|woff2?)$).*)",
  ],
};
