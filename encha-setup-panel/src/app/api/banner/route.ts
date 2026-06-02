import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { fetchBanner } from "@/lib/monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const banner = await fetchBanner();
  if (!banner) return new NextResponse(null, { status: 204 });

  return NextResponse.json(banner, {
    headers: { "Cache-Control": "private, max-age=120" },
  });
}
