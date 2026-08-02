import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { buscarPareamento, reabrirPareamento } from "@/lib/pairing-store";
import { pairTrocarTelefone, PairingError } from "@/lib/license-pairing";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  stackId: z.string().min(1).max(60),
  pairingId: z.string().regex(/^[0-9a-f]{32}$/),
  email: z.string().min(1).max(200),
  senha: z.string().min(1).max(200),
});

// Fase 2.2 — "celular novo, CPF que já tem cadastro" (motivo
// cpf_ja_cadastrado): hoje é o único beco sem saída de verdade, porque o
// portal só entra por posse do número ANTIGO. Autentica por email+senha e
// troca o telefone cadastrado pelo número JÁ CONFIRMADO nesta sessão.
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
  const rl = checkRateLimit(`license.pair.trocar-telefone:${ip}`, 5, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` }, { status: 429 });
  }

  const row = buscarPareamento(pairingId);
  if (!row || row.stack_id !== stackId) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });

  try {
    await pairTrocarTelefone(def.pairing.consoleBaseUrl, {
      sessionId: row.console_session_id ?? "",
      fingerprint: row.fingerprint,
      email,
      senha,
    });
    // A sessão local já tinha sido marcada 'falhou' pelo poll anterior (que
    // viu 'recusado' com cpf_ja_cadastrado) — sem reabrir aqui, o próximo
    // poll short-circuita em "recusado" sem nem perguntar ao Console de novo
    // (mesmo raciocínio de pair/migrar/route.ts).
    reabrirPareamento(pairingId);
    logAudit({
      user: session.user,
      ip,
      action: "license.pair.trocar-telefone",
      target: stackId,
      result: "ok",
      meta: { pairing_id: pairingId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const meta: Record<string, unknown> = { error: e instanceof Error ? e.message : "Erro desconhecido", pairing_id: pairingId }; // nunca a senha
    let httpStatus = 502;
    if (e instanceof PairingError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      httpStatus = e.reason === "recusado" ? 409 : e.reason === "rate_limited" ? 429 : 502;
    }
    logAudit({ user: session.user, ip, action: "license.pair.trocar-telefone.fail", target: stackId, result: "error", meta });
    return NextResponse.json(
      { ok: false, error: "Não foi possível trocar o número — confira as credenciais e tente de novo" },
      { status: httpStatus }
    );
  }
}
