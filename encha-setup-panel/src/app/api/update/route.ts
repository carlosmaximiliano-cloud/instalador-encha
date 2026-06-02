import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { fetchLatestVersion } from "@/lib/monitor";
import { triggerSelfUpdate } from "@/lib/updater";
import { APP_VERSION, compareSemver } from "@/lib/version";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });

  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`update:${ip}`, 2, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` },
      { status: 429 }
    );
  }

  // Fonte da verdade da versão alvo é o Monitor — evita downgrade/no-op.
  const release = await fetchLatestVersion();
  const latest = release?.latest_version;
  if (!latest) {
    return NextResponse.json({ error: "Nenhuma versão publicada disponível" }, { status: 503 });
  }
  if (compareSemver(latest, APP_VERSION) <= 0) {
    return NextResponse.json({ error: "Você já está na versão mais recente" }, { status: 409 });
  }

  const result = await triggerSelfUpdate(session.jwt, latest);

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
