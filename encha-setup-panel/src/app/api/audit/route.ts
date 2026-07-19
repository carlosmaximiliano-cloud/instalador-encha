import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { listAudit } from "@/lib/audit";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const rows = listAudit(200, 0);
  return NextResponse.json({ entries: rows });
}
