import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { buscarPareamento } from "@/lib/pairing-store";
import { pairCpf, PairingError } from "@/lib/license-pairing";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  stackId: z.string().min(1).max(60),
  pairingId: z.string().regex(/^[0-9a-f]{32}$/),
  cpf: z.string().min(11).max(14),
});

// Informa o CPF depois do telefone já confirmado por WhatsApp (protocolo
// "aguardando_cpf" — ver pair/poll). O CPF em si NUNCA é persistido aqui
// nem em audit — só repassado ao Console. cpf_nao_confere/aguardando_
// credencial (Fase 2, 2 tentativas) SÃO revelados de propósito — ver o
// catch abaixo; os demais motivos continuam genéricos (anti-oráculo).
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
  if (!parsed.success) return NextResponse.json({ error: "Informe um CPF válido (11 dígitos)" }, { status: 400 });
  const { stackId, pairingId, cpf } = parsed.data;

  const def = getStack(stackId);
  if (!def?.pairing) return NextResponse.json({ error: "Stack sem pareamento de licença" }, { status: 404 });

  const ip = getClientIp(req);
  // Espelha o teto de 3 tentativas de CPF POR SESSÃO que o Console já impõe
  // (excesso_tentativas_cpf) — este aqui é só uma segunda camada por IP,
  // pra não deixar um único IP disparar CPFs contra várias sessões abertas.
  const rl = checkRateLimit(`license.pair.cpf:${ip}`, 5, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` }, { status: 429 });
  }

  const row = buscarPareamento(pairingId);
  if (!row || row.stack_id !== stackId) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });

  try {
    await pairCpf(def.pairing.consoleBaseUrl, { sessionId: row.console_session_id ?? "", fingerprint: row.fingerprint, cpf });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const meta: Record<string, unknown> = { error: e instanceof Error ? e.message : "Erro desconhecido", pairing_id: pairingId }; // nunca o CPF
    let httpStatus = 502;
    let motivoConsole: string | undefined;
    let tentativasRestantes: number | undefined;
    if (e instanceof PairingError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      httpStatus = e.reason === "recusado" ? 409 : e.reason === "rate_limited" ? 429 : 502;
      motivoConsole = (e.body?.error as string | undefined) ?? e.serverDetail;
      if (typeof e.body?.tentativas_restantes === "number") tentativasRestantes = e.body.tentativas_restantes;
    }
    logAudit({ user: session.user, ip, action: "license.pair.cpf.fail", target: stackId, result: "error", meta });

    // cpf_nao_confere/aguardando_credencial (Fase 2) SÃO revelados — quem
    // chega aqui já provou posse de um WhatsApp cadastrado, então só
    // descobre algo sobre a PRÓPRIA conta, nunca de terceiros.
    if (motivoConsole === "cpf_nao_confere" || motivoConsole === "aguardando_credencial") {
      return NextResponse.json(
        { ok: false, error: motivoConsole, tentativas_restantes: tentativasRestantes },
        { status: httpStatus }
      );
    }
    return NextResponse.json(
      { error: "Não foi possível confirmar com este CPF — confira os dados e tente de novo" },
      { status: httpStatus }
    );
  }
}
