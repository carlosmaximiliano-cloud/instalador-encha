import { cookies } from "next/headers";
import { encryptSecret, decryptSecret } from "./crypto";
import { isJwtExpired } from "./jwt";

const SESSION_COOKIE = "__Host-encha_session";
const CSRF_COOKIE = "__Host-encha_csrf";
const MAX_AGE_SECONDS = 8 * 60 * 60;

export type Session = {
  user: string;
  // Ausente no modo "local" (admin próprio do painel) — o token do Portainer
  // é obtido sob demanda com as credenciais de serviço (ver
  // src/lib/auth/require-token.ts). Presente no modo legado "portainer", em
  // que o login é um proxy direto para o Portainer.
  jwt?: string;
  exp: number;
  mode?: "local" | "portainer";
};

const isProd = process.env.NODE_ENV === "production";

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

export async function createSession(s: Session): Promise<void> {
  const c = await cookies();
  const blob = encryptSecret(JSON.stringify(s));
  c.set(SESSION_COOKIE, blob, cookieOpts(MAX_AGE_SECONDS));
}

export async function readSession(): Promise<Session | null> {
  const c = await cookies();
  const v = c.get(SESSION_COOKIE)?.value;
  if (!v) return null;
  try {
    const s = JSON.parse(decryptSecret(v)) as Session;
    if (s.exp < Date.now()) return null;
    // Sessões no modo local não carregam jwt — nada a checar aqui; o token
    // de serviço tem seu próprio ciclo de vida (ver getServiceToken).
    if (s.jwt && isJwtExpired(s.jwt)) return null;
    return s;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
  c.delete(CSRF_COOKIE);
}

export async function setCsrfCookie(token: string): Promise<void> {
  const c = await cookies();
  c.set(CSRF_COOKIE, token, { ...cookieOpts(MAX_AGE_SECONDS), httpOnly: false });
}

export async function readCsrfCookie(): Promise<string | null> {
  const c = await cookies();
  return c.get(CSRF_COOKIE)?.value ?? null;
}
