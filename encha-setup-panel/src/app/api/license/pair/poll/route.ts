import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { buscarPareamento, confirmarPareamento, falharPareamento } from "@/lib/pairing-store";
import { pairPoll, PairingError } from "@/lib/license-pairing";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({ stackId: z.string().min(1).max(60), pairingId: z.string().regex(/^[0-9a-f]{32}$/) });

// Poll de ~3s da sessão de pareamento — mesmo padrão do app Go
// (ConsultarPareamento) e do painel.py standalone. Nunca devolve a CHAVE de
// licença ao browser: no status "confirmado" ela é cifrada e guardada
// server-side (pairing-store.ts); o browser só recebe a confirmação de que
// pode seguir para o install.
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
  const { stackId, pairingId } = parsed.data;

  const def = getStack(stackId);
  if (!def?.pairing) return NextResponse.json({ error: "Stack sem pareamento de licença" }, { status: 404 });

  const ip = getClientIp(req);
  // Espelha MAX_POLLS=400 (~20min a 3s) do Console — teto generoso, só para
  // um poll travado em loop não martelar sem limite.
  const rl = checkRateLimit(`license.pair.poll:${pairingId}`, 30, 60_000);
  if (!rl.allowed) return NextResponse.json({ status: "aguardando" }); // não expõe rate limit ao poll — só "continue esperando"

  const row = buscarPareamento(pairingId);
  if (!row || row.stack_id !== stackId) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }
  if (row.status === "consumido") return NextResponse.json({ status: "consumido" });
  if (row.status === "falhou") return NextResponse.json({ status: "recusado" });
  if (row.status === "confirmado") return NextResponse.json({ status: "confirmado" }); // já confirmado antes — idempotente, não repete a chamada ao Console

  try {
    const result = await pairPoll(def.pairing.consoleBaseUrl, {
      sessionId: row.console_session_id ?? "",
      fingerprint: row.fingerprint,
      edicao: def.pairing.edicao,
    });

    switch (result.status) {
      case "confirmado":
        confirmarPareamento(pairingId, result.chave, result.plano);
        logAudit({
          user: session.user,
          ip,
          action: "license.pair.confirm",
          target: stackId,
          result: "ok",
          meta: { pairing_id: pairingId }, // nunca a chave, nunca cliente/plano (PII/comercial)
        });
        return NextResponse.json({ status: "confirmado", cliente: result.cliente, plano: result.plano });
      case "expirado":
      case "recusado":
        falharPareamento(pairingId);
        return NextResponse.json(result.status === "recusado" ? { status: "recusado", motivo: result.motivo } : { status: "expirado" });
      case "aguardando_cpf":
        return NextResponse.json({ status: "aguardando_cpf", remetenteMascarado: result.remetenteMascarado });
      case "escolha_pendente":
        return NextResponse.json({ status: "escolha_pendente", licencas: result.licencas, escolhaExpiraEm: result.escolhaExpiraEm });
      case "consumido":
        return NextResponse.json({ status: "consumido" });
      default:
        return NextResponse.json({ status: "aguardando", expiraEm: result.expiraEm, aviso: result.aviso, avisoRemetente: result.avisoRemetente });
    }
  } catch (e) {
    const meta: Record<string, unknown> = { error: e instanceof Error ? e.message : "Erro desconhecido", pairing_id: pairingId };
    if (e instanceof PairingError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      if (e.serverDetail !== undefined) meta.serverDetail = e.serverDetail;
    }
    logAudit({ user: session.user, ip, action: "license.pair.poll.fail", target: stackId, result: "error", meta });
    // Erro de transporte no poll NÃO falha a sessão (ela pode se recuperar
    // no próximo poll, igual ao app Go) — devolve "aguardando" em vez de
    // matar o pareamento por uma falha transitória de rede.
    return NextResponse.json({ status: "aguardando" });
  }
}
