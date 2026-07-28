import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { fetchLatestVersion } from "@/lib/monitor";
import { updateHostScripts } from "@/lib/host-updater";
import { APP_VERSION, compareSemver } from "@/lib/version";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Passo 1 do update sequencial (scripts do host, via container avulso no
// Portainer). O passo 2 (imagem do painel) é /api/update, inalterado — o
// cliente só o chama depois que este responder ok:true, garantindo a ordem
// "scripts primeiro, painel por último".
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });

  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const ip = getClientIp(req);
  // Janela mais longa que a do /api/update (2/60s) — subir um container é
  // uma operação bem mais cara que um POST de service update.
  const rl = checkRateLimit(`update-scripts:${ip}`, 2, 300_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` },
      { status: 429 }
    );
  }

  // Mesma fonte da verdade do /api/update — evita downgrade/no-op e garante
  // que os dois passos alvejam a mesma versão publicada no Monitor.
  const release = await fetchLatestVersion();
  const latest = release?.latest_version;
  if (!latest) {
    return NextResponse.json({ error: "Nenhuma versão publicada disponível" }, { status: 503 });
  }
  if (compareSemver(latest, APP_VERSION) <= 0) {
    return NextResponse.json({ error: "Você já está na versão mais recente" }, { status: 409 });
  }

  const result = await updateHostScripts(session.jwt, latest);

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
