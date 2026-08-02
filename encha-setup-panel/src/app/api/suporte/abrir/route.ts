import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hostname } from "node:os";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getDeviceId } from "@/lib/device-id";
import { getVpsContext } from "@/lib/vps-context";
import { APP_VERSION } from "@/lib/version";
import { suporteAbrir, SuporteError } from "@/lib/suporte";
import { suporteRequesterToken, salvarSuporteRequesterToken, salvarSuporteAcessoToken } from "@/lib/suporte-store";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  scope: z.string().min(1).max(60),
  assunto: z.string().trim().min(1).max(160),
  mensagem: z.string().trim().min(1).max(8000),
  contextoErro: z.string().max(2000).optional(),
});

// Abre um ticket de suporte a partir do wizard — ANTES de existir licença
// (chave nunca faz parte do payload, ver header de suporte.ts). `scope` é o
// stackId da instalação em curso (ex.: "enchat") — cada wizard lista só os
// próprios chamados via o mesmo requester_token.
//
// O que o SERVIDOR injeta, sobrescrevendo qualquer coisa que viesse do
// corpo: device_id (é o "Agent ID" deste lado), origem, versao_app,
// contato_email (do usuário logado no painel), contexto (hostname/nome do
// servidor/rede + stack_id + erro de instalação truncado), ip_navegador. O
// navegador só controla assunto/mensagem/contextoErro (texto livre, nunca
// interpretado como JSON estruturado do lado do Console).
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });

  const auth = await requireSessionToken();
  if (!auth) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Inválido" }, { status: 400 });
  const { scope, assunto, mensagem, contextoErro } = parsed.data;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`suporte.abrir:${ip}:${scope}`, 5, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` }, { status: 429 });
  }

  const vps = getVpsContext();
  const contexto: Record<string, unknown> = {
    hostname: hostname(),
    nome_servidor: vps.nome_servidor,
    rede: vps.nome_rede_interna,
    stack_id: scope,
  };
  if (contextoErro) contexto.erro_instalacao = contextoErro.slice(0, 2000);

  try {
    const resultado = await suporteAbrir({
      assunto,
      mensagem,
      requesterToken: suporteRequesterToken(scope) ?? undefined,
      deviceId: getDeviceId(),
      versaoApp: APP_VERSION,
      contatoEmail: session.user,
      ipNavegador: ip,
      contexto,
    });

    salvarSuporteAcessoToken(resultado.ticketId, scope, resultado.acessoToken);
    salvarSuporteRequesterToken(scope, resultado.requesterToken);

    logAudit({ user: session.user, ip, action: "suporte.abrir", target: scope, result: "ok", meta: { ticket_id: resultado.ticketId } });

    return NextResponse.json({ ticketId: resultado.ticketId, status: resultado.status });
  } catch (e) {
    const meta: Record<string, unknown> = { error: e instanceof Error ? e.message : "Erro desconhecido" };
    let httpStatus = 502;
    if (e instanceof SuporteError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      httpStatus = e.reason === "rate_limited" ? 429 : e.reason === "recusado" ? 409 : 502;
    }
    logAudit({ user: session.user, ip, action: "suporte.abrir.fail", target: scope, result: "error", meta });
    return NextResponse.json(
      { error: e instanceof SuporteError ? e.message : "Não foi possível abrir o chamado agora" },
      { status: httpStatus }
    );
  }
}
