import { NextRequest, NextResponse } from "next/server";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { fetchLatestVersion } from "@/lib/monitor";
import { triggerSelfUpdate } from "@/lib/updater";
import { APP_VERSION, compareSemver } from "@/lib/version";
import { logAudit } from "@/lib/audit";
import { resolveLocale } from "@/lib/locale";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";
import type { Locale } from "@/lib/locale-shared";

export const dynamic = "force-dynamic";

const ERROS = {
  origem_invalida: { pt: "Origem inválida", en: "Invalid origin", es: "Origen inválido" },
  csrf_invalido: { pt: "CSRF inválido", en: "Invalid CSRF", es: "CSRF inválido" },
  nenhuma_versao_disponivel: {
    pt: "Nenhuma versão publicada disponível",
    en: "No published version available",
    es: "Ninguna versión publicada disponible",
  },
  ja_na_versao_mais_recente: {
    pt: "Você já está na versão mais recente",
    en: "You are already on the latest version",
    es: "Usted ya está en la versión más reciente",
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

export async function POST(req: NextRequest) {
  const locale = await resolveLocale();
  if (!verifyOrigin(req)) return apiError(ERROS, "origem_invalida", locale, 403);
  if (!(await verifyCsrf(req))) return apiError(ERROS, "csrf_invalido", locale, 403);

  const auth = await requireSessionToken();
  if (!auth) return unauthenticatedResponse(locale);
  const { session, token } = auth;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`update:${ip}`, 2, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "muitas_tentativas", message: msgMuitasTentativas(Math.ceil(rl.resetMs / 1000), locale) },
      { status: 429 }
    );
  }

  // Fonte da verdade da versão alvo é o Monitor — evita downgrade/no-op.
  const release = await fetchLatestVersion(locale);
  const latest = release?.latest_version;
  if (!latest) {
    return apiError(ERROS, "nenhuma_versao_disponivel", locale, 503);
  }
  if (compareSemver(latest, APP_VERSION) <= 0) {
    return apiError(ERROS, "ja_na_versao_mais_recente", locale, 409);
  }

  const result = await triggerSelfUpdate(token, latest);

  logAudit({
    user: session.user,
    ip,
    action: result.ok ? "panel.update" : "panel.update.fail",
    target: latest,
    result: result.ok ? "ok" : "error",
    meta: { from: APP_VERSION, to: latest, ...(result.ok ? {} : { error: result.error }) },
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });

  // O Swarm faz rolling update em background; este container será substituído.
  return NextResponse.json({ ok: true, updatingTo: latest });
}
