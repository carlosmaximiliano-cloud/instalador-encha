import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { reportBannerClick } from "@/lib/monitor";
import { getDeviceId } from "@/lib/device-id";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const clickSchema = z.object({ bannerId: z.number().int().positive() });

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });

  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  const parsed = clickSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Inválido" }, { status: 400 });

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  logAudit({
    user: session.user,
    ip,
    action: "banner.click",
    target: String(parsed.data.bannerId),
    result: "ok",
  });

  // Best-effort: não bloqueia a resposta se o Monitor estiver fora.
  void reportBannerClick({
    bannerId: parsed.data.bannerId,
    deviceId: getDeviceId(),
    userAgent,
    ts: Math.floor(Date.now() / 1000),
  });

  return NextResponse.json({ ok: true });
}
