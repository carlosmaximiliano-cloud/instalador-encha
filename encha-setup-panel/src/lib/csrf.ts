import { NextRequest } from "next/server";
import { randomToken, constantTimeEqual } from "./crypto";
import { readCsrfCookie } from "./session";

export function newCsrfToken(): string {
  return randomToken(32);
}

export async function verifyCsrf(req: NextRequest): Promise<boolean> {
  const header = req.headers.get("x-csrf-token");
  const cookie = await readCsrfCookie();
  if (!header || !cookie) return false;
  return constantTimeEqual(header, cookie);
}

export function verifyOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    const o = new URL(origin);
    return o.host === host;
  } catch {
    return false;
  }
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
