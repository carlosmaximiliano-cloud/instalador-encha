import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { deleteStack, discoverContext } from "@/lib/portainer";
import { logAudit } from "@/lib/audit";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });

  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await ctx.params;
  const stackId = Number(id);
  if (!Number.isInteger(stackId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const { endpointId } = await discoverContext(session.jwt);
    await deleteStack(session.jwt, stackId, endpointId);
    logAudit({
      user: session.user,
      ip: getClientIp(req),
      action: "stack.remove",
      target: String(stackId),
      result: "ok",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    logAudit({
      user: session.user,
      ip: getClientIp(req),
      action: "stack.remove.fail",
      target: String(stackId),
      result: "error",
      meta: { error: msg },
    });
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
