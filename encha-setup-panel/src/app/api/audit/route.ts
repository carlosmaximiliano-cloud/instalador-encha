import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { listAudit } from "@/lib/audit";
import { resolveLocale } from "@/lib/locale";
import { unauthenticatedResponse } from "@/lib/api-error";

export async function GET() {
  const locale = await resolveLocale();
  const session = await readSession();
  if (!session) return unauthenticatedResponse(locale);
  const rows = listAudit(200, 0);
  return NextResponse.json({ entries: rows });
}
