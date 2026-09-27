import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { resolveLocale } from "@/lib/locale";
import type { Locale } from "@/lib/locale-shared";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";
import { dominioValido, verificarDns } from "@/lib/dns-check";
import { criarResolvedorDoSistema } from "@/lib/dns-resolvedor";

// Este painel só é alcançável pelo Traefik, e a regra do roteador é
// Host(`${ENCHA_PANEL_HOST}`): o cabeçalho Host que chega aqui é exatamente o
// que casou com essa regra. O X-Forwarded-Host não serve — o cliente pode
// mandá-lo, e o Traefik só o reescreve se a config confiar em quem chama. Por
// isso os IPs desta VPS vêm de resolver o Host, e a rota não usa
// X-Forwarded-Host, req.nextUrl, interface de rede nem serviço de IP público.
//
// Só DNS: nenhuma conexão é aberta ao domínio. Responde apenas { estado },
// nunca os endereços. Sem logAudit: é uma consulta de leitura que o wizard
// dispara ao digitar, e registrá-la encheria a auditoria.

const ERROS = {
  dominio_invalido: { pt: "Domínio inválido", en: "Invalid domain", es: "Dominio inválido" },
  muitas_tentativas: {
    pt: "Muitas consultas — aguarde um instante",
    en: "Too many requests — wait a moment",
    es: "Demasiadas consultas — espere un momento",
  },
} satisfies Record<string, Record<Locale, string>>;

export async function GET(req: NextRequest) {
  const locale = await resolveLocale();
  const session = await readSession();
  if (!session) return unauthenticatedResponse(locale);

  const rl = checkRateLimit(`dns.verificar:${session.user}`, 30, 60_000);
  if (!rl.allowed) return apiError(ERROS, "muitas_tentativas", locale, 429);

  const dominio = req.nextUrl.searchParams.get("dominio") ?? "";
  if (!dominioValido(dominio)) return apiError(ERROS, "dominio_invalido", locale, 400);

  const estado = await verificarDns({
    dominio,
    hostPainel: req.headers.get("host"),
    resolvedor: criarResolvedorDoSistema(),
  });
  return NextResponse.json({ estado }, { headers: { "Cache-Control": "no-store" } });
}
