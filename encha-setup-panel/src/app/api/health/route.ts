import { NextResponse } from "next/server";
import { pingPortainer } from "@/lib/portainer";

export async function GET() {
  const portainerOk = await pingPortainer();
  return NextResponse.json({ ok: true, portainer: portainerOk, ts: Date.now() });
}
