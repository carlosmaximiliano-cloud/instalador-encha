import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { buscarPareamento, reabrirPareamento } from "@/lib/pairing-store";
import { pairMigrar, PairingError } from "@/lib/license-pairing";
import { logAudit } from "@/lib/audit";
import { resolveLocale } from "@/lib/locale";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";

const bodySchema = z.object({
  stackId: z.string().min(1).max(60),
  pairingId: z.string().regex(/^[0-9a-f]{32}$/),
  email: z.string().min(1).max(200),
  senha: z.string().min(1).max(200),
});

const ERROS = {
  origem_invalida: { pt: "Origem inválida", en: "Invalid origin", es: "Origen inválido" },
  csrf_invalido: { pt: "CSRF inválido", en: "Invalid CSRF token", es: "CSRF inválido" },
  payload_invalido: { pt: "Payload inválido", en: "Invalid payload", es: "Payload inválido" },
  email_senha_obrigatorios: {
    pt: "Informe email e senha",
    en: "Enter email and password",
    es: "Ingrese el email y la contraseña",
  },
  stack_sem_pareamento: {
    pt: "Stack sem pareamento de licença",
    en: "Stack has no license pairing",
    es: "El stack no tiene emparejamiento de licencia",
  },
  sessao_nao_encontrada: { pt: "Sessão não encontrada", en: "Session not found", es: "Sesión no encontrada" },
  migracao_falhou: {
    pt: "Não foi possível migrar a licença — tente de novo em instantes",
    en: "Could not migrate the license — try again shortly",
    es: "No fue posible migrar la licencia — intente de nuevo en instantes",
  },
  senha_fraca: {
    pt: "Senha muito curta — use pelo menos 10 caracteres (esta será a senha do Super Admin da sua conta).",
    en: "Password too short — use at least 10 characters (this will be your account's Super Admin password).",
    es: "Contraseña muy corta — use al menos 10 caracteres (esta será la contraseña del Super Admin de su cuenta).",
  },
  email_em_uso: {
    pt: "Este email já está em uso por outra conta — informe o email do dono desta licença.",
    en: "This email is already in use by another account — enter the email of this license's owner.",
    es: "Este email ya está en uso por otra cuenta — indique el email del propietario de esta licencia.",
  },
} satisfies Record<string, Record<import("@/lib/locale-shared").Locale, string>>;

const RATE_LIMIT_MSG = {
  pt: (s: number) => `Muitas tentativas — aguarde ${s}s`,
  en: (s: number) => `Too many attempts — wait ${s}s`,
  es: (s: number) => `Demasiados intentos — espere ${s}s`,
};

// Migração self-service de VPS — o cliente clicou "esta licença é minha,
// migrar pra esta instalação" na tela de "já ativada em outra VPS" (ver
// LicensePairing.tsx). Só chega até aqui depois do CPF já conferido nesta
// MESMA sessão — é essa prova de posse que autoriza o rebind no Console
// (aplicarMigracaoDeVps, repo Console), sem precisar de admin.
export async function POST(req: NextRequest) {
  const locale = await resolveLocale();
  if (!verifyOrigin(req)) return apiError(ERROS, "origem_invalida", locale, 403);
  if (!(await verifyCsrf(req))) return apiError(ERROS, "csrf_invalido", locale, 403);

  const auth = await requireSessionToken();
  if (!auth) return unauthenticatedResponse(locale);
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(ERROS, "payload_invalido", locale, 400);
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return apiError(ERROS, "email_senha_obrigatorios", locale, 400);
  const { stackId, pairingId, email, senha } = parsed.data;

  const def = getStack(stackId);
  if (!def?.pairing) return apiError(ERROS, "stack_sem_pareamento", locale, 404);

  const ip = getClientIp(req);
  // Mesmo teto de pair/cpf — é uma operação sensível (rebind de licença),
  // não precisa de um limite mais frouxo.
  const rl = checkRateLimit(`license.pair.migrar:${ip}`, 5, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "muitas_tentativas", message: RATE_LIMIT_MSG[locale](Math.ceil(rl.resetMs / 1000)) },
      { status: 429 }
    );
  }

  const row = buscarPareamento(pairingId);
  if (!row || row.stack_id !== stackId) return apiError(ERROS, "sessao_nao_encontrada", locale, 404);

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
    let codigo: keyof typeof ERROS = "migracao_falhou";
    if (e instanceof PairingError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      httpStatus = e.reason === "recusado" ? 409 : e.reason === "rate_limited" ? 429 : 502;
      if (e.reason === "recusado" && e.serverDetail === "senha_fraca") {
        codigo = "senha_fraca";
      } else if (e.reason === "recusado" && e.serverDetail === "email_em_uso") {
        codigo = "email_em_uso";
      }
    }
    logAudit({ user: session.user, ip, action: "license.pair.migrar.fail", target: stackId, result: "error", meta });
    return apiError(ERROS, codigo, locale, httpStatus, { ok: false });
  }
}
