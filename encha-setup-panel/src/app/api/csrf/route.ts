import { NextResponse } from "next/server";
import { readCsrfCookie, setCsrfCookie } from "@/lib/session";
import { newCsrfToken } from "@/lib/csrf";

export async function GET() {
  let token = await readCsrfCookie();
  if (!token) {
    token = newCsrfToken();
    await setCsrfCookie(token);
  }
  return NextResponse.json({ token });
}
