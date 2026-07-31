import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import {
  discoverContext,
  listSwarmStackStatuses,
  getServiceByName,
  updateServiceImage,
} from "@/lib/portainer";
import { getStack } from "@/lib/stacks/registry";
import { computePendingUpdates } from "@/lib/stacks/updates";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Quais serviços desta stack estão rodando uma imagem diferente da que a
 * definição manda. Usado pelo botão "Atualizar" para se mostrar ou não.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const def = getStack(id);
  if (!def) return NextResponse.json({ error: "Stack desconhecida" }, { status: 404 });

  try {
    const { endpointId } = await discoverContext(session.jwt);
    const statuses = await listSwarmStackStatuses(session.jwt, endpointId);
    const pending = computePendingUpdates(def, statuses);
    return NextResponse.json({ updateAvailable: pending.length > 0, pending });
  } catch (e) {
    console.error(`[api/stacks/${id}/update] falha checando atualização:`, e);
    return NextResponse.json({ error: "Falha ao consultar o Portainer" }, { status: 502 });
  }
}

/**
 * Aplica a atualização como rolling update do Swarm (troca só a imagem,
 * preservando o resto do Spec). Não recria a stack, então volumes e bancos
 * ficam intactos — é isso que preserva as instâncias pareadas da Evolution.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });

  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const ip = getClientIp(req);

  const rl = checkRateLimit(`update:${ip}:${id}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` },
      { status: 429 }
    );
  }

  const def = getStack(id);
  if (!def) return NextResponse.json({ error: "Stack desconhecida" }, { status: 404 });
  if (!def.updatableImages?.length) {
    return NextResponse.json(
      { error: "Esta stack não suporta atualização in-place" },
      { status: 400 }
    );
  }

  try {
    const { endpointId } = await discoverContext(session.jwt);
    const statuses = await listSwarmStackStatuses(session.jwt, endpointId);
    const pending = computePendingUpdates(def, statuses);

    if (pending.length === 0) {
      return NextResponse.json({ ok: true, updated: [], message: "Já está na versão mais recente" });
    }

    const updated: string[] = [];
    for (const p of pending) {
      const svc = await getServiceByName(session.jwt, endpointId, p.serviceName);
      if (!svc) {
        throw new Error(`Serviço '${p.serviceName}' não encontrado no Swarm`);
      }
      await updateServiceImage(session.jwt, endpointId, svc, p.target);
      updated.push(`${p.serviceName}: ${p.current} → ${p.target}`);
    }

    logAudit({
      user: session.user,
      ip,
      action: "stack.update",
      target: id,
      result: "ok",
      meta: { updated },
    });

    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[api/stacks/${id}/update] falhou:`, e);
    logAudit({
      user: session.user,
      ip,
      action: "stack.update.fail",
      target: id,
      result: "error",
      meta: { error: msg },
    });
    return NextResponse.json({ error: `Falha ao atualizar: ${msg}` }, { status: 500 });
  }
}
