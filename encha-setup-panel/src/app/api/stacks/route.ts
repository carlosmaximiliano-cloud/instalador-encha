import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { installStack, listInstalledStacks } from "@/lib/installer";
import { getStack, getPublicCatalog } from "@/lib/stacks/registry";
import { expectedStackNames } from "@/lib/stacks/types";

const installSchema = z.object({
  stackId: z.string().min(1).max(60),
  values: z.record(z.unknown()),
  swarmCtx: z.object({
    networkName: z.string().min(1),
    serverName: z.string().min(1),
    email: z.string().email(),
  }),
});

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const catalog = getPublicCatalog();
  const installed = await listInstalledStacks(session.jwt).catch((err) => {
    console.error("[api/stacks] Falha listando stacks do Portainer:", err);
    return [];
  });

  console.log(
    "[api/stacks] Portainer retornou",
    installed.length,
    "stacks:",
    installed.map((s) => s.Name).join(", ") || "(nenhuma)"
  );

  const installedNames = new Set(installed.map((s) => s.Name));
  const catalogPayload = catalog.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    icon: s.icon,
    dependsOn: s.dependsOn,
    repoUrl: s.repoUrl,
    installVia: s.installVia ?? "panel",
    optionNumber: s.optionNumber,
    installed: expectedStackNames(s).every((n) => installedNames.has(n)),
  }));

  const knownNames = new Set<string>();
  for (const s of catalog) {
    for (const n of expectedStackNames(s)) knownNames.add(n);
  }

  const detectedInstalled = catalogPayload.filter((c) => c.installed).length;
  return NextResponse.json(
    {
      catalog: catalogPayload,
      installed: installed.map((s) => ({
        id: s.Id,
        name: s.Name,
        createdAt: s.CreationDate,
        external: !knownNames.has(s.Name),
      })),
    },
    {
      headers: {
        "x-stack-detection": `portainer=${installed.length};catalog=${detectedInstalled}`,
      },
    }
  );
}

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

  const parsed = installSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Inválido" }, { status: 400 });
  }

  const def = getStack(parsed.data.stackId);
  if (!def) return NextResponse.json({ error: "Stack desconhecida" }, { status: 404 });

  const result = await installStack({
    stackId: parsed.data.stackId,
    values: parsed.data.values,
    swarmCtx: parsed.data.swarmCtx,
    token: session.jwt,
    user: session.user,
    ip: getClientIp(req),
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({
    ok: true,
    stackId: result.stack?.Id,
    accessUrl: def.postInstall?.accessUrl?.(parsed.data.values),
    notes: def.postInstall?.notes ?? [],
  });
}
