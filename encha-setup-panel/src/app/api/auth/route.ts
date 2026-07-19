import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, PortainerError } from "@/lib/portainer";
import { createSession, setCsrfCookie, destroySession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp, verifyOrigin, verifyCsrf } from "@/lib/csrf";
import { newCsrfToken } from "@/lib/csrf";

const loginSchema = z.object({
  username: z.string().min(1).max(80),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) {
    return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${Math.ceil(rl.resetMs / 1000)}s` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 400 });
  }

  try {
    const jwt = await authenticate(parsed.data.username, parsed.data.password);
    const exp = Date.now() + 8 * 60 * 60 * 1000;
    await createSession({ user: parsed.data.username, jwt, exp });
    await setCsrfCookie(newCsrfToken());
    logAudit({ user: parsed.data.username, ip, action: "login.success", result: "ok" });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[auth] erro no login:", e);
    const status = e instanceof PortainerError ? e.status : 500;
    logAudit({
      user: parsed.data.username,
      ip,
      action: "login.fail",
      result: "error",
      meta: { status },
    });
    return NextResponse.json(
      { error: status === 401 || status === 422 ? "Usuário ou senha incorretos" : "Falha ao conectar no Portainer" },
      { status: status === 401 || status === 422 ? 401 : 502 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });
  await destroySession();
  return NextResponse.json({ ok: true });
}
