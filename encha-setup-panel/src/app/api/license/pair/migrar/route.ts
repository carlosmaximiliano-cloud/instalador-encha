import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { buscarPareamento, reabrirPareamento } from "@/lib/pairing-store";
import { pairMigrar, PairingError } from "@/lib/license-pairing";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  stackId: z.string().min(1).max(60),
  pairingId: z.string().regex(/^[0-9a-f]{32}$/),
  email: z.string().min(1).max(200),
  senha: z.string().min(1).max(200),
});

// Migração self-service de VPS — o cliente clicou "esta licença é minha,
// migrar pra esta instalação" na tela de "já ativada em outra VPS" (ver
// LicensePairing.tsx). Só chega até aqui depois do CPF já conferido nesta
// MESMA sessão — é essa prova de posse que autoriza o rebind no Console
// (aplicarMigracaoDeVps, repo Console), sem precisar de admin.
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
  // Mesmo teto de pair/cpf — é uma operação sensível (rebind de licença),
  // não precisa de um limite mais frouxo.
  const rl = checkRateLimit(`license.pair.migrar:${ip}`, 5, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` }, { status: 429 });
  }

  const row = buscarPareamento(pairingId);
  if (!row || row.stack_id !== stackId) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });

  try {
    const result = await pairMigrar(def.pairing.consoleBaseUrl, {
      sessionId: row.console_session_id ?? "",
      fingerprint: row.fingerprint,
      email,
      senha,
    });
    if (result.sessaoReutilizavel) {
      // A sessão local já tinha sido marcada 'falhou' pelo poll anterior —
      // sem reabrir aqui, o próximo poll short-circuita em "recusado" sem
      // nem perguntar ao Console de novo (ver o guard em pair/poll/route.ts).
      reabrirPareamento(pairingId);
    }
    logAudit({
      user: session.user,
      ip,
      action: "license.pair.migrar",
      target: stackId,
      result: "ok",
      meta: { pairing_id: pairingId, sessao_reutilizavel: result.sessaoReutilizavel },
    });
    return NextResponse.json({ ok: true, sessao_reutilizavel: result.sessaoReutilizavel });
  } catch (e) {
    const meta: Record<string, unknown> = { error: e instanceof Error ? e.message : "Erro desconhecido", pairing_id: pairingId };
    let httpStatus = 502;
    // Mensagem genérica por padrão — mas dois motivos NOVOS (Console cria a
    // credencial de dono na hora, quando o customer ainda não tinha nenhuma,
    // ver verificarOuCriarCredencialDoCliente no repo Console) precisam de
    // texto específico: "tente de novo" faria o cliente repetir a MESMA
    // senha fraca / o MESMO email já usado pra sempre, sem entender por quê.
    let mensagem = "Não foi possível migrar a licença — tente de novo em instantes";
    if (e instanceof PairingError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      httpStatus = e.reason === "recusado" ? 409 : e.reason === "rate_limited" ? 429 : 502;
      if (e.reason === "recusado" && e.serverDetail === "senha_fraca") {
        mensagem = "Senha muito curta — use pelo menos 10 caracteres (esta será a senha do Super Admin da sua conta).";
      } else if (e.reason === "recusado" && e.serverDetail === "email_em_uso") {
        mensagem = "Este email já está em uso por outra conta — informe o email do dono desta licença.";
      }
    }
    logAudit({ user: session.user, ip, action: "license.pair.migrar.fail", target: stackId, result: "error", meta });
    return NextResponse.json({ ok: false, error: mensagem }, { status: httpStatus });
  }
}
