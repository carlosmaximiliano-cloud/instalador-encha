import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { getVpsContext } from "@/lib/vps-context";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const ctx = getVpsContext();
  return NextResponse.json(ctx);
}
