import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { fetchBanner } from "@/lib/monitor";
import { resolveLocale } from "@/lib/locale";
import { unauthenticatedResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const locale = await resolveLocale();
  const session = await readSession();
  if (!session) return unauthenticatedResponse(locale);

  const position = req.nextUrl.searchParams.get("position") === "sidebar" ? "sidebar" : "top";
  const banner = await fetchBanner(position, locale);
  if (!banner) return new NextResponse(null, { status: 204 });

  return NextResponse.json(banner, {
    headers: { "Cache-Control": "private, max-age=120" },
  });
}
