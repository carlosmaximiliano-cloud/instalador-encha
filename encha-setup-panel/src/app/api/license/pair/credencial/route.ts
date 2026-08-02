import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { buscarPareamento } from "@/lib/pairing-store";
import { pairCredencial, PairingError } from "@/lib/license-pairing";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  stackId: z.string().min(1).max(60),
  pairingId: z.string().regex(/^[0-9a-f]{32}$/),
  email: z.string().min(1).max(200),
  senha: z.string().min(1).max(200),
});

// Segundo fator de posse (Fase 2): destrava a sessão de pareamento depois
// do CPF errar 2x seguidas (motivo 'aguardando_credencial' de pair/cpf) —
// email+senha do Super Admin do app EnchaT. NUNCA loga a senha, só o
// resultado. O Console resolve o customerId de forma independente do CPF
// pinado nesta sessão (que pode estar errado).
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
  if (!parsed.success) return NextResponse.json({ error: "Informe email e senha" }, { status: 400 });
  const { stackId, pairingId, email, senha } = parsed.data;

  const def = getStack(stackId);
  if (!def?.pairing) return NextResponse.json({ error: "Stack sem pareamento de licença" }, { status: 404 });

  const ip = getClientIp(req);
  // Mesmo teto de pair/cpf — é login (mesmo sem prova de posse de VPS
  // adicional), então merece o mesmo cuidado.
  const rl = checkRateLimit(`license.pair.credencial:${ip}`, 5, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` }, { status: 429 });
  }

  const row = buscarPareamento(pairingId);
  if (!row || row.stack_id !== stackId) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });

  try {
    const resultado = await pairCredencial(def.pairing.consoleBaseUrl, {
      sessionId: row.console_session_id ?? "",
      fingerprint: row.fingerprint,
      email,
      senha,
    });
    logAudit({
      user: session.user,
      ip,
      action: "license.pair.credencial",
      target: stackId,
      result: "ok",
      meta: { pairing_id: pairingId },
    });
    return NextResponse.json({ ok: true, escolha_pendente: resultado.escolhaPendente });
  } catch (e) {
    const meta: Record<string, unknown> = { error: e instanceof Error ? e.message : "Erro desconhecido", pairing_id: pairingId }; // nunca a senha
    let httpStatus = 502;
    if (e instanceof PairingError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      httpStatus = e.reason === "recusado" ? 409 : e.reason === "rate_limited" ? 429 : 502;
    }
    logAudit({ user: session.user, ip, action: "license.pair.credencial.fail", target: stackId, result: "error", meta });
    return NextResponse.json(
      { ok: false, error: "Não foi possível entrar com essas credenciais" },
      { status: httpStatus }
    );
  }
}
