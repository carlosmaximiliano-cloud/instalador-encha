import { cookies } from "next/headers";
import { encryptSecret, decryptSecret } from "./crypto";

const SESSION_COOKIE = "__Host-encha_session";
const CSRF_COOKIE = "__Host-encha_csrf";
const MAX_AGE_SECONDS = 8 * 60 * 60;

export type Session = {
  user: string;
  jwt: string;
  exp: number;
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
