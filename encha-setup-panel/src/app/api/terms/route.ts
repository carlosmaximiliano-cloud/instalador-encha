import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { fetchTerms } from "@/lib/monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const terms = await fetchTerms();
  if (!terms) return new NextResponse(null, { status: 204 });

  return NextResponse.json(terms, {
    headers: { "Cache-Control": "private, max-age=120" },
  });
}
