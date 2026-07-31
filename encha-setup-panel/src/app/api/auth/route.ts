import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, getServiceToken, PortainerError } from "@/lib/portainer";
import { createSession, setCsrfCookie, destroySession } from "@/lib/session";
import { getLocalAdmin, hasServiceCredentials, verifyLocalAdmin } from "@/lib/auth/local-admin";
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

  const { username, password } = parsed.data;
  const exp = Date.now() + 8 * 60 * 60 * 1000;
  const localAdmin = getLocalAdmin();

  // Modo local: o painel tem admin próprio (PANEL_ADMIN_USER/PASSWORD no
  // env). O login não fala com o Portainer diretamente — a conta de serviço
  // (PORTAINER_USER/PASSWORD) é quem se autentica lá, sob demanda.
  if (localAdmin) {
    if (!hasServiceCredentials()) {
      console.error("[auth] PANEL_ADMIN_USER definido mas credenciais de serviço do Portainer ausentes");
      return NextResponse.json(
        { error: "Configuração incompleta no servidor. Contate o administrador." },
        { status: 503 }
      );
    }
    if (!verifyLocalAdmin(username, password)) {
      logAudit({ user: username, ip, action: "login.fail", result: "error", meta: { mode: "local" } });
      return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });
    }
    try {
      // Falha cedo se as credenciais de serviço estiverem erradas, em vez de
      // deixar o operador "logado" e só descobrir no primeiro /api/stacks.
      await getServiceToken();
    } catch (e) {
      console.error("[auth] falha ao autenticar credenciais de serviço do Portainer:", e);
      logAudit({ user: username, ip, action: "login.fail", result: "error", meta: { mode: "local", serviceAuth: true } });
      return NextResponse.json(
        { error: "Falha ao conectar no Portainer com as credenciais de serviço" },
        { status: 502 }
      );
    }
    await createSession({ user: username, exp, mode: "local" });
    await setCsrfCookie(newCsrfToken());
    logAudit({ user: username, ip, action: "login.success", result: "ok", meta: { mode: "local" } });
    return NextResponse.json({ ok: true });
  }

  // Modo legado: sem admin próprio, o login é um proxy direto para o
  // Portainer (comportamento anterior a esta mudança, mantido para não
  // travar instalações já existentes — ver requireSessionToken).
  try {
    const jwt = await authenticate(username, password);
    await createSession({ user: username, jwt, exp, mode: "portainer" });
    await setCsrfCookie(newCsrfToken());
    logAudit({ user: username, ip, action: "login.success", result: "ok", meta: { mode: "portainer" } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[auth] erro no login:", e);
    const status = e instanceof PortainerError ? e.status : 500;
    logAudit({
      user: username,
      ip,
      action: "login.fail",
      result: "error",
      meta: { status, mode: "portainer" },
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
