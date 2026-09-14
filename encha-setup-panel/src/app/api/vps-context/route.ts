import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { getVpsContext } from "@/lib/vps-context";
import { resolveLocale } from "@/lib/locale";
import { unauthenticatedResponse } from "@/lib/api-error";

export async function GET() {
  const locale = await resolveLocale();
  const session = await readSession();
  if (!session) {
    return unauthenticatedResponse(locale);
  }
  const ctx = getVpsContext();
  return NextResponse.json(ctx);
}
