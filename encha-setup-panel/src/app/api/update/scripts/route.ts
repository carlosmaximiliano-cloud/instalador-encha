import { NextRequest, NextResponse } from "next/server";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { fetchLatestVersion } from "@/lib/monitor";
import { updateHostScripts } from "@/lib/host-updater";
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

// Passo 1 do update sequencial (scripts do host, via container avulso no
// Portainer). O passo 2 (imagem do painel) é /api/update, inalterado — o
// cliente só o chama depois que este responder ok:true, garantindo a ordem
// "scripts primeiro, painel por último".
export async function POST(req: NextRequest) {
  const locale = await resolveLocale();
  if (!verifyOrigin(req)) return apiError(ERROS, "origem_invalida", locale, 403);
  if (!(await verifyCsrf(req))) return apiError(ERROS, "csrf_invalido", locale, 403);

  const auth = await requireSessionToken();
  if (!auth) return unauthenticatedResponse(locale);
  const { session, token } = auth;

  const ip = getClientIp(req);
  // Janela mais longa que a do /api/update (2/60s) — subir um container é
  // uma operação bem mais cara que um POST de service update.
  const rl = checkRateLimit(`update-scripts:${ip}`, 2, 300_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "muitas_tentativas", message: msgMuitasTentativas(Math.ceil(rl.resetMs / 1000), locale) },
      { status: 429 }
    );
  }

  // Mesma fonte da verdade do /api/update — evita downgrade/no-op e garante
  // que os dois passos alvejam a mesma versão publicada no Monitor.
  const release = await fetchLatestVersion();
  const latest = release?.latest_version;
  if (!latest) {
    return apiError(ERROS, "nenhuma_versao_disponivel", locale, 503);
  }
  if (compareSemver(latest, APP_VERSION) <= 0) {
    return apiError(ERROS, "ja_na_versao_mais_recente", locale, 409);
  }

  const result = await updateHostScripts(token, latest);

  logAudit({
    user: session.user,
    ip,
    action: result.ok ? "host.scripts.update" : "host.scripts.update.fail",
    target: latest,
    result: result.ok ? "ok" : "error",
    meta: result.ok
      ? { from: APP_VERSION, to: latest, installedVersion: result.installedVersion }
      : { from: APP_VERSION, to: latest, error: result.error, logs: result.logs?.slice(-4000) },
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });

  return NextResponse.json({ ok: true, installedVersion: result.installedVersion });
}
