import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { fetchTerms } from "@/lib/monitor";
import { hasAccepted, recordAcceptanceLocal, flushPendingAcceptances } from "@/lib/terms";
import { getDeviceId } from "@/lib/device-id";
import { getVpsContext } from "@/lib/vps-context";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/audit";
import { resolveLocale } from "@/lib/locale";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";
import type { Locale } from "@/lib/locale-shared";

export const dynamic = "force-dynamic";

const ERROS = {
  origem_invalida: { pt: "Origem inválida", en: "Invalid origin", es: "Origen inválido" },
  csrf_invalido: { pt: "CSRF inválido", en: "Invalid CSRF", es: "CSRF inválido" },
  payload_invalido: { pt: "Payload inválido", en: "Invalid payload", es: "Payload inválido" },
  invalido: { pt: "Inválido", en: "Invalid", es: "Inválido" },
  termos_desatualizados: {
    pt: "Versão dos termos desatualizada — recarregue a página",
    en: "Terms version is outdated — reload the page",
    es: "La versión de los términos está desactualizada — recargue la página",
  },
  falha_registrar_aceite: {
    pt: "Falha ao registrar o aceite — tente novamente",
    en: "Failed to record acceptance — try again",
    es: "Fallo al registrar la aceptación — intente de nuevo",
  },
} satisfies Record<string, Record<Locale, string>>;

function msgMuitasTentativas(segundos: number, locale: Locale): string {
  const t = {
    pt: `Muitas tentativas — aguarde ${segundos}s`,
    en: `Too many attempts — wait ${segundos}s`,
    es: `Demasiados intentos — espere ${segundos}s`,
  };
  return t[locale] ?? t.pt;
}

export async function GET() {
  const locale = await resolveLocale();
  const session = await readSession();
  if (!session) return unauthenticatedResponse(locale);

  const terms = await fetchTerms(locale);
  if (!terms) return new NextResponse(null, { status: 204 });

  return NextResponse.json(
    { ...terms, accepted: hasAccepted(terms.version) },
    { headers: { "Cache-Control": "private, max-age=120" } }
  );
}

const acceptSchema = z.object({
  // mesmo charset que o Monitor valida em /api/terms/accept
  version: z.string().regex(/^[a-zA-Z0-9._-]+$/).max(64),
});

export async function POST(req: NextRequest) {
  const locale = await resolveLocale();
  if (!verifyOrigin(req)) return apiError(ERROS, "origem_invalida", locale, 403);
  if (!(await verifyCsrf(req))) return apiError(ERROS, "csrf_invalido", locale, 403);

  const session = await readSession();
  if (!session) return unauthenticatedResponse(locale);

  const ip = getClientIp(req);
  const rl = checkRateLimit(`terms:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "muitas_tentativas", message: msgMuitasTentativas(Math.ceil(rl.resetMs / 1000), locale) },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(ERROS, "payload_invalido", locale, 400);
  }
  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) return apiError(ERROS, "invalido", locale, 400);

  // Nunca confia na versão que o cliente diz ter aceitado — reconsulta o
  // Monitor e exige que bata com a versão ativa agora (é o registro legal).
  const current = await fetchTerms();
  if (!current || current.version !== parsed.data.version) {
    return apiError(ERROS, "termos_desatualizados", locale, 409);
  }

  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const ts = Math.floor(Date.now() / 1000);

  let id: number;
  try {
    id = recordAcceptanceLocal({
      user: session.user,
      ip,
      userAgent,
      deviceId: getDeviceId(),
      hostname: getVpsContext().nome_servidor,
      stackId: "panel",
      termsVersion: current.version,
      ts,
    });
  } catch (e) {
    // Prova local é a fonte autoritativa — se a gravação falhar, não pode
    // ficar em silêncio (o gate reabriria sem explicação no próximo load).
    console.error("[terms] falha ao gravar aceite local:", e);
    return apiError(ERROS, "falha_registrar_aceite", locale, 500);
  }

  logAudit({
    user: session.user,
    ip,
    action: "terms.accept",
    target: current.version,
    result: "ok",
    meta: { id },
  });

  // Sincronização com o Monitor é best-effort — nunca bloqueia o aceite local.
  void flushPendingAcceptances();

  return NextResponse.json({ ok: true });
}
