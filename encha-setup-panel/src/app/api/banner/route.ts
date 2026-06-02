import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { fetchBanner } from "@/lib/monitor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const position = req.nextUrl.searchParams.get("position") === "sidebar" ? "sidebar" : "top";
  const banner = await fetchBanner(position);
  if (!banner) return new NextResponse(null, { status: 204 });

  return NextResponse.json(banner, {
    headers: { "Cache-Control": "private, max-age=120" },
  });
}
