import { NextRequest, NextResponse } from "next/server";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import {
  discoverContext,
  listSwarmStackStatuses,
  getServiceByName,
  updateServiceImage,
} from "@/lib/portainer";
import { getStack } from "@/lib/stacks/registry";
import { computePendingUpdates, computeReleaseBasedPendingUpdates } from "@/lib/stacks/updates";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/audit";
import { applyReleaseUpdate } from "@/lib/stack-update-release";
import { resolveLocale } from "@/lib/locale";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";
import type { Locale } from "@/lib/locale-shared";

type Ctx = { params: Promise<{ id: string }> };

const ERROS = {
  origem_invalida: { pt: "Origem inválida", en: "Invalid origin", es: "Origen inválido" },
  csrf_invalido: { pt: "CSRF inválido", en: "Invalid CSRF", es: "CSRF inválido" },
  stack_desconhecida: { pt: "Stack desconhecida", en: "Unknown stack", es: "Stack desconocida" },
  falha_consultar_portainer: {
    pt: "Falha ao consultar o Portainer",
    en: "Failed to query Portainer",
    es: "Fallo al consultar Portainer",
  },
  sem_atualizacao_inplace: {
    pt: "Esta stack não suporta atualização in-place",
    en: "This stack does not support in-place updates",
    es: "Este stack no admite actualización in-place",
  },
} satisfies Record<string, Record<Locale, string>>;

function msgMuitasTentativas(segundos: number, locale: Locale): string {
  const t = {
    pt: `Muitas tentativas — aguarde ${segundos}s`,
    en: `Too many attempts — wait ${segundos}s`,
    es: `Demasiados intentos — espere ${segundos}s`,
  };
  return t[locale] ?? t.pt;
}

function msgFalhaAtualizar(detalhe: string, locale: Locale): string {
  const t = {
    pt: `Falha ao atualizar: ${detalhe}`,
    en: `Failed to update: ${detalhe}`,
    es: `Fallo al actualizar: ${detalhe}`,
  };
  return t[locale] ?? t.pt;
}

/**
 * Quais serviços desta stack estão rodando uma imagem diferente da que a
 * definição manda. Usado pelo botão "Atualizar" para se mostrar ou não.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const locale = await resolveLocale();
  const auth = await requireSessionToken();
  if (!auth) return unauthenticatedResponse(locale);
  const { token } = auth;

  const { id } = await params;
  const def = getStack(id);
  if (!def) return apiError(ERROS, "stack_desconhecida", locale, 404);

  try {
    const { endpointId } = await discoverContext(token);
    const statuses = await listSwarmStackStatuses(token, endpointId);
    const pending = def.updateViaRelease
      ? await computeReleaseBasedPendingUpdates(def, statuses)
      : computePendingUpdates(def, statuses);
    return NextResponse.json({ updateAvailable: pending.length > 0, pending });
  } catch (e) {
    console.error(`[api/stacks/${id}/update] falha checando atualização:`, e);
    return apiError(ERROS, "falha_consultar_portainer", locale, 502);
  }
}

/**
 * Aplica a atualização como rolling update do Swarm (troca só a imagem,
 * preservando o resto do Spec). Não recria a stack, então volumes e bancos
 * ficam intactos — é isso que preserva as instâncias pareadas da Evolution.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
  const locale = await resolveLocale();
  if (!verifyOrigin(req)) return apiError(ERROS, "origem_invalida", locale, 403);
  if (!(await verifyCsrf(req))) return apiError(ERROS, "csrf_invalido", locale, 403);

  const auth = await requireSessionToken();
  if (!auth) return unauthenticatedResponse(locale);
  const { session, token } = auth;

  const { id } = await params;
  const ip = getClientIp(req);

  const rl = checkRateLimit(`update:${ip}:${id}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "muitas_tentativas", message: msgMuitasTentativas(Math.ceil(rl.resetMs / 1000), locale) },
      { status: 429 }
    );
  }

  const def = getStack(id);
  if (!def) return apiError(ERROS, "stack_desconhecida", locale, 404);
  if (!def.updatableImages?.length && !def.updateViaRelease) {
    return apiError(ERROS, "sem_atualizacao_inplace", locale, 400);
  }

  // Caminho novo (Ciclo 29) — versão vinda de `release:`, pré-pull
  // autenticado + troca de imagem via applyReleaseUpdate. Vem ANTES do
  // caminho de `updatableImages` (que continua intocado para as outras
  // stacks), mas DEPOIS do rate limit/CSRF/Origin acima — nunca pula esses
  // guards de entrada.
  if (def.updateViaRelease) {
    try {
      const { atualizados } = await applyReleaseUpdate({ token, stackId: id, def, user: session.user, ip });
      return NextResponse.json({
        ok: true,
        updated: atualizados,
        message: atualizados.length ? undefined : "Já está na versão mais recente",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[api/stacks/${id}/update] falhou (updateViaRelease):`, e);
      return NextResponse.json(
        { error: "falha_atualizar", message: msgFalhaAtualizar(msg, locale) },
        { status: 500 }
      );
    }
  }

  try {
    const { endpointId } = await discoverContext(token);
    const statuses = await listSwarmStackStatuses(token, endpointId);
    const pending = computePendingUpdates(def, statuses);

    if (pending.length === 0) {
      return NextResponse.json({ ok: true, updated: [], message: "Já está na versão mais recente" });
    }

    const updated: string[] = [];
    for (const p of pending) {
      const svc = await getServiceByName(token, endpointId, p.serviceName);
      if (!svc) {
        throw new Error(`Serviço '${p.serviceName}' não encontrado no Swarm`);
      }
      await updateServiceImage(token, endpointId, svc, p.target);
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
    return NextResponse.json(
      { error: "falha_atualizar", message: msgFalhaAtualizar(msg, locale) },
      { status: 500 }
    );
  }
}
