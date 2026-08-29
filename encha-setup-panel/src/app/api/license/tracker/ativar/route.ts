import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { getOrCreateMachineId } from "@/lib/pairing-store";
import { resolverAppHostname } from "@/lib/installer";
import { ativarTrackerPorEmail, TrackerAtivacaoError } from "@/lib/tracker-ativacao";
import { APP_VERSION } from "@/lib/version";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  stackId: z.string().min(1).max(60),
  email: z.string().email(),
});

// Ativa a licença do Tracker por e-mail num POST só — sem sessão de
// pareamento, sem polling (Ciclo 20b). O fingerprint NUNCA chega ao
// browser: resolvido aqui via getOrCreateMachineId(stackId, appHostname) —
// a MESMA linha que installer.ts usa no caminho de registryAuth sem
// pareamento (Ciclo 20), então duas chamadas pra mesma stack sempre
// resolvem o MESMO fingerprint, não importa quantas vezes o operador
// clique ativar de novo.
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });

  const auth = await requireSessionToken();
  if (!auth) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Inválido" }, { status: 400 });
  const { stackId, email } = parsed.data;

  const def = getStack(stackId);
  if (!def?.emailActivation) {
    return NextResponse.json({ error: "Stack sem ativação por e-mail" }, { status: 404 });
  }

  const ip = getClientIp(req);
  // Espelha o próprio limite do Console por fingerprint/e-mail — falhar
  // aqui ANTES de gastar uma das tentativas que o Console impõe é o que
  // faz a mensagem de erro ser "aguarde" em vez de uma ativação recusada
  // sem explicação.
  const rl = checkRateLimit(`license.tracker.ativar:${ip}:${stackId}`, 5, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` }, { status: 429 });
  }

  const hostname = resolverAppHostname(def, "emailActivation");
  const { fingerprint } = getOrCreateMachineId(stackId, hostname);

  try {
    const { chave } = await ativarTrackerPorEmail(def.emailActivation.consoleBaseUrl, email, fingerprint, APP_VERSION);
    logAudit({
      user: session.user,
      ip,
      action: "license.tracker.ativar",
      target: stackId,
      result: "ok",
      // NUNCA a chave nem o e-mail — só o suficiente pra auditoria interna
      // saber que uma ativação aconteceu, sem carregar dado sensível.
      meta: { stackId },
    });
    return NextResponse.json({ chave });
  } catch (e) {
    const reason = e instanceof TrackerAtivacaoError ? e.reason : "erro_desconhecido";
    const httpStatus = e instanceof TrackerAtivacaoError ? statusForReason(e.reason) : 500;
    logAudit({
      user: session.user,
      ip,
      action: "license.tracker.ativar.fail",
      target: stackId,
      result: "error",
      meta: { stackId, reason },
    });
    const message = e instanceof TrackerAtivacaoError ? e.message : "Falha inesperada na ativação.";
    return NextResponse.json({ error: reason, message }, { status: httpStatus });
  }
}

function statusForReason(reason: string): number {
  switch (reason) {
    case "ativacao_recusada":
      return 409;
    case "rate_limited":
      return 429;
    case "registry_nao_configurado":
      return 503;
    case "timeout":
      return 504;
    case "network":
    case "server":
    case "malformed":
    case "contract":
      return 502;
    default:
      return 500;
  }
}
