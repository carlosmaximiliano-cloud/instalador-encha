import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { installStack, listInstalledStacks } from "@/lib/installer";
import { discoverContext, listSwarmStackStatuses, type SwarmStackStatus } from "@/lib/portainer";
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

  const [installed, swarmStatuses] = await Promise.all([
    listInstalledStacks(session.jwt).catch((err) => {
      console.error("[api/stacks] Falha listando stacks do Portainer:", err);
      return [];
    }),
    discoverContext(session.jwt)
      .then(({ endpointId }) => listSwarmStackStatuses(session.jwt, endpointId))
      .catch((err) => {
        console.error("[api/stacks] Falha listando serviços Docker:", err);
        return [] as SwarmStackStatus[];
      }),
  ]);

  const statusByName = new Map(swarmStatuses.map((s) => [s.name, s]));
  const installedNames = new Set([
    ...installed.map((s) => s.Name),
    ...swarmStatuses.map((s) => s.name),
  ]);

  const readyDetails = swarmStatuses
    .map((s) => `${s.name}=${s.running}/${s.desired}`)
    .join(", ");
  console.log(
    "[api/stacks] Portainer:", installed.length || "(nenhuma)",
    "| Swarm:", readyDetails || "(nenhuma)"
  );

  const catalogPayload = catalog.map((s) => {
    const expected = expectedStackNames(s);
    const present = expected.every((n) => installedNames.has(n));
    const ready = present && expected.every((n) => statusByName.get(n)?.ready ?? false);
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      icon: s.icon,
      dependsOn: s.dependsOn,
      repoUrl: s.repoUrl,
      logoUrl: s.logoUrl,
      installVia: s.installVia ?? "panel",
      optionNumber: s.optionNumber,
      installed: present,
      ready,
    };
  });

  const knownNames = new Set<string>();
  for (const s of catalog) {
    for (const n of expectedStackNames(s)) knownNames.add(n);
  }

  for (const s of catalog) {
    const expected = expectedStackNames(s);
    const missing = expected.filter((n) => !installedNames.has(n));
    if (missing.length && missing.length < expected.length) {
      console.warn(
        `[api/stacks] '${s.id}': detecção parcial — esperado=[${expected.join(",")}] faltando=[${missing.join(",")}]`
      );
    }
  }

  const readyCount = catalogPayload.filter((c) => c.installed && c.ready).length;
  const deployingCount = catalogPayload.filter((c) => c.installed && !c.ready).length;

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
        "x-stack-detection": `portainer=${installed.length};swarm=${swarmStatuses.length};ready=${readyCount};deploying=${deployingCount}`,
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
