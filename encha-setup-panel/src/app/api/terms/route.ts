import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/session";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { fetchTerms } from "@/lib/monitor";
import { hasAccepted, recordAcceptanceLocal, flushPendingAcceptances } from "@/lib/terms";
import { getDeviceId } from "@/lib/device-id";
import { getVpsContext } from "@/lib/vps-context";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const terms = await fetchTerms();
  if (!terms) return new NextResponse(null, { status: 204 });

  return NextResponse.json(
    { ...terms, accepted: hasAccepted(terms.version) },
    { headers: { "Cache-Control": "private, max-age=120" } }
  );
}

const acceptSchema = z.object({
  // mesmo charset que o Monitor valida em /api/terms/accept
  version: z.string().regex(/^[a-zA-Z0-9._-]+$/).max(64),
});

export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });

  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`terms:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Inválido" }, { status: 400 });

  // Nunca confia na versão que o cliente diz ter aceitado — reconsulta o
  // Monitor e exige que bata com a versão ativa agora (é o registro legal).
  const current = await fetchTerms();
  if (!current || current.version !== parsed.data.version) {
    return NextResponse.json({ error: "Versão dos termos desatualizada — recarregue a página" }, {
      status: 409,
    });
  }

  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const ts = Math.floor(Date.now() / 1000);

  let id: number;
  try {
    id = recordAcceptanceLocal({
      user: session.user,
      ip,
      userAgent,
      deviceId: getDeviceId(),
      hostname: getVpsContext().nome_servidor,
      stackId: "panel",
      termsVersion: current.version,
      ts,
    });
  } catch (e) {
    // Prova local é a fonte autoritativa — se a gravação falhar, não pode
    // ficar em silêncio (o gate reabriria sem explicação no próximo load).
    console.error("[terms] falha ao gravar aceite local:", e);
    return NextResponse.json({ error: "Falha ao registrar o aceite — tente novamente" }, { status: 500 });
  }

  logAudit({
    user: session.user,
    ip,
    action: "terms.accept",
    target: current.version,
    result: "ok",
    meta: { id },
  });

  // Sincronização com o Monitor é best-effort — nunca bloqueia o aceite local.
  void flushPendingAcceptances();

  return NextResponse.json({ ok: true });
}
