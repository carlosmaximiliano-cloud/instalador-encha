import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { buscarPareamento } from "@/lib/pairing-store";
import { pairChoose, PairingError } from "@/lib/license-pairing";
import { logAudit } from "@/lib/audit";
import { resolveLocale } from "@/lib/locale";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";

const bodySchema = z.object({
  stackId: z.string().min(1).max(60),
  pairingId: z.string().regex(/^[0-9a-f]{32}$/),
  licenseId: z.number().int().positive(),
});

const ERROS = {
  origem_invalida: { pt: "Origem inválida", en: "Invalid origin", es: "Origen inválido" },
  csrf_invalido: { pt: "CSRF inválido", en: "Invalid CSRF token", es: "CSRF inválido" },
  payload_invalido: { pt: "Payload inválido", en: "Invalid payload", es: "Payload inválido" },
  corpo_invalido: { pt: "Inválido", en: "Invalid request", es: "Solicitud inválida" },
  stack_sem_pareamento: {
    pt: "Stack sem pareamento de licença",
    en: "Stack has no license pairing",
    es: "El stack no tiene emparejamiento de licencia",
  },
  sessao_nao_encontrada: { pt: "Sessão não encontrada", en: "Session not found", es: "Sesión no encontrada" },
  nao_confirmou_licenca: {
    pt: "Não foi possível confirmar a licença escolhida",
    en: "Could not confirm the chosen license",
    es: "No fue posible confirmar la licencia elegida",
  },
} satisfies Record<string, Record<import("@/lib/locale-shared").Locale, string>>;

const RATE_LIMIT_MSG = {
  pt: (s: number) => `Muitas tentativas — aguarde ${s}s`,
  en: (s: number) => `Too many attempts — wait ${s}s`,
  es: (s: number) => `Demasiados intentos — espere ${s}s`,
};

// Finaliza a etapa de escolha, quando o CPF tem ≥2 licenças elegíveis (poll
// devolveu "escolha_pendente"). Não consome nada aqui — quem confirma é o
// PRÓXIMO poll, mesmo padrão do app Go (EscolherLicenca).
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
  if (!parsed.success) return apiError(ERROS, "corpo_invalido", locale, 400);
  const { stackId, pairingId, licenseId } = parsed.data;

  const def = getStack(stackId);
  if (!def?.pairing) return apiError(ERROS, "stack_sem_pareamento", locale, 404);

  const ip = getClientIp(req);
  const rl = checkRateLimit(`license.pair.choose:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "muitas_tentativas", message: RATE_LIMIT_MSG[locale](Math.ceil(rl.resetMs / 1000)) },
      { status: 429 }
    );
  }

  const row = buscarPareamento(pairingId);
  if (!row || row.stack_id !== stackId) return apiError(ERROS, "sessao_nao_encontrada", locale, 404);

  try {
    await pairChoose(def.pairing.consoleBaseUrl, { sessionId: row.console_session_id ?? "", fingerprint: row.fingerprint, licenseId });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const meta: Record<string, unknown> = { error: e instanceof Error ? e.message : "Erro desconhecido", pairing_id: pairingId, license_id: licenseId };
    let httpStatus = 502;
    if (e instanceof PairingError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      httpStatus = e.reason === "recusado" ? 409 : e.reason === "rate_limited" ? 429 : 502;
    }
    logAudit({ user: session.user, ip, action: "license.pair.choose.fail", target: stackId, result: "error", meta });
    return apiError(ERROS, "nao_confirmou_licenca", locale, httpStatus);
  }
}
