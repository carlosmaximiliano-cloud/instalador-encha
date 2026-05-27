import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { getStack } from "@/lib/stacks/registry";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await ctx.params;
  const def = getStack(id);
  if (!def) return NextResponse.json({ error: "Stack desconhecida" }, { status: 404 });

  return NextResponse.json({
    id: def.id,
    name: def.name,
    description: def.description,
    fields: def.fields,
  });
}
