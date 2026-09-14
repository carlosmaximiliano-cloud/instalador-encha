import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { reportBannerClick } from "@/lib/monitor";
import { getDeviceId } from "@/lib/device-id";
import { logAudit } from "@/lib/audit";
import { resolveLocale } from "@/lib/locale";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

const clickSchema = z.object({ bannerId: z.number().int().positive() });

const ERROS = {
  origem_invalida: { pt: "Origem inválida", en: "Invalid origin", es: "Origen inválido" },
  csrf_invalido: { pt: "CSRF inválido", en: "Invalid CSRF token", es: "Token CSRF inválido" },
  payload_invalido: { pt: "Payload inválido", en: "Invalid payload", es: "Payload inválido" },
  invalido: { pt: "Inválido", en: "Invalid", es: "Inválido" },
} satisfies Record<string, Record<import("@/lib/locale-shared").Locale, string>>;

export async function POST(req: NextRequest) {
  const locale = await resolveLocale();

  if (!verifyOrigin(req)) return apiError(ERROS, "origem_invalida", locale, 403);
  if (!(await verifyCsrf(req))) return apiError(ERROS, "csrf_invalido", locale, 403);

  const session = await readSession();
  if (!session) return unauthenticatedResponse(locale);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(ERROS, "payload_invalido", locale, 400);
  }
  const parsed = clickSchema.safeParse(body);
  if (!parsed.success) return apiError(ERROS, "invalido", locale, 400);

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  logAudit({
    user: session.user,
    ip,
    action: "banner.click",
    target: String(parsed.data.bannerId),
    result: "ok",
  });

  // Best-effort: não bloqueia a resposta se o Monitor estiver fora.
  void reportBannerClick({
    bannerId: parsed.data.bannerId,
    deviceId: getDeviceId(),
    userAgent,
    ts: Math.floor(Date.now() / 1000),
  });

  return NextResponse.json({ ok: true });
}
