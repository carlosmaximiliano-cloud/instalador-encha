import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { buscarPareamento } from "@/lib/pairing-store";
import { signupStart, PairingError } from "@/lib/license-pairing";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  stackId: z.string().min(1).max(60),
  pairingId: z.string().regex(/^[0-9a-f]{32}$/),
  nome: z.string().min(1).max(200),
  cpf: z.string().min(11).max(14),
  celular: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
});

// Anexa a INTENÇÃO de signup a uma sessão de pareamento JÁ ABERTA — não gera
// conta nenhuma por si só (ver src/app/api/signup/start/route.ts no repo
// Console: essa rota só faz UPDATE em `pareamento`). A confirmação de
// verdade continua sendo o WhatsApp: o mesmo código já exibido tem que ser
// mandado pra provar o telefone — é isso que o webhook do Pinfy consome pra
// provisionar a conta grátis, atomicamente. PII (nome/CPF/celular/e-mail)
// nunca vai para audit — só o resultado ok/erro.
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
  if (!parsed.success) return NextResponse.json({ error: "Preencha nome, CPF e celular corretamente" }, { status: 400 });
  const { stackId, pairingId, nome, cpf, celular, email } = parsed.data;

  const def = getStack(stackId);
  if (!def?.pairing) return NextResponse.json({ error: "Stack sem pareamento de licença" }, { status: 404 });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`license.signup:${ip}`, 3, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` }, { status: 429 });
  }

  const row = buscarPareamento(pairingId);
  if (!row || row.stack_id !== stackId || !row.codigo_exibicao) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  try {
    await signupStart(def.pairing.consoleBaseUrl, { codigo: row.codigo_exibicao, nome, cpf, celular, email: email || undefined });
    logAudit({ user: session.user, ip, action: "license.signup", target: stackId, result: "ok", meta: { pairing_id: pairingId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const meta: Record<string, unknown> = { error: e instanceof Error ? e.message : "Erro desconhecido", pairing_id: pairingId };
    let httpStatus = 502;
    if (e instanceof PairingError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      httpStatus = e.reason === "recusado" ? 409 : e.reason === "rate_limited" ? 429 : 502;
    }
    logAudit({ user: session.user, ip, action: "license.signup.fail", target: stackId, result: "error", meta });
    return NextResponse.json({ error: "Não foi possível registrar o cadastro — confira os dados e tente de novo" }, { status: httpStatus });
  }
}
