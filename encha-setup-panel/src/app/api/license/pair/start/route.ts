import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStack } from "@/lib/stacks/registry";
import { getOrCreateMachineId, pareamentoAtivo, criarPareamento } from "@/lib/pairing-store";
import { pairStart, PairingError } from "@/lib/license-pairing";
import { fetchLatestRelease, ReleaseInfoError } from "@/lib/release-info";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({ stackId: z.string().min(1).max(60) });

// Abre (ou RETOMA) a sessão de pareamento self-service de licença de uma
// stack. Nunca devolve fingerprint/machine_id/session_id do Console pro
// browser — só um pairing_id opaco, que as demais rotas /api/license/pair/*
// resolvem server-side. Ver license-pairing.ts para o protocolo e
// pairing-store.ts para a persistência.
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
  const { stackId } = parsed.data;

  const def = getStack(stackId);
  if (!def?.pairing) return NextResponse.json({ error: "Stack sem pareamento de licença" }, { status: 404 });

  const ip = getClientIp(req);
  // Espelha MAX_POR_FINGERPRINT_HORA=5 do Console (pair/start/route.ts) —
  // falhar aqui ANTES de gastar uma das 5 tentativas por fingerprint que o
  // Console impõe é o que faz a mensagem de erro ser "aguarde" em vez de
  // um pareamento que nasce e já não tem chance de confirmar.
  const rl = checkRateLimit(`license.pair.start:${ip}:${stackId}`, 5, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` },
      { status: 429 }
    );
  }

  // Retomada: reabrir o wizard não deve abrir uma SEGUNDA sessão (cada uma
  // consome 1 das 5 tentativas/hora por fingerprint no Console) — devolve a
  // que já está aberta/confirmada, com os MESMOS campos de exibição da
  // resposta original (wa_link/wa_qr_svg/etc. persistidos em criarPareamento
  // exatamente pra isto — nem o Console nem o poll os reenviam depois).
  const existente = pareamentoAtivo(stackId);
  if (existente) {
    return NextResponse.json({
      pairingId: existente.id,
      status: existente.status,
      codigo: existente.codigo_exibicao,
      codigoExibicao: existente.codigo_exibicao,
      numeroExibicao: existente.numero_exibicao,
      waLink: existente.wa_link,
      waQrSvg: existente.wa_qr_svg,
      expiraEm: existente.expires_at,
      signupUrl: existente.signup_url,
      retomado: true,
    });
  }

  const { machineId, fingerprint, legacy } = getOrCreateMachineId(stackId);
  if (legacy) {
    // Instalação anterior a este mecanismo — pareamento mudaria o
    // fingerprint de uma licença possivelmente já ativada. Não abre sessão;
    // o wizard deve cair no fallback de colar a chave manualmente.
    return NextResponse.json(
      { error: "instalacao_legado", legacy: true },
      { status: 409 }
    );
  }

  try {
    const release = await fetchLatestRelease(
      def.pairing.consoleBaseUrl,
      def.id === "enchat" ? "enchat" : def.id, // versao_app é só telemetria no Console — nome da stack basta
      def.pairing.edicao,
      "stable"
    ).catch(() => null); // versao_app é informativo — não bloqueia o pareamento se o /api/version falhar

    const result = await pairStart(def.pairing.consoleBaseUrl, {
      fingerprint,
      versaoApp: release?.version ?? "desconhecida",
      edicao: def.pairing.edicao,
      nomeInstalacao: session.user,
    });

    const row = criarPareamento({
      stackId,
      machineId,
      fingerprint,
      consoleSessionId: result.sessionId,
      codigoExibicao: result.codigoExibicao ?? result.codigo,
      expiresAt: result.expiraEm,
      waLink: result.waLink,
      waQrSvg: result.waQrSvg,
      numeroExibicao: result.numeroExibicao,
      signupUrl: result.signupUrl,
    });

    logAudit({
      user: session.user,
      ip,
      action: "license.pair.start",
      target: stackId,
      result: "ok",
      meta: { pairing_id: row.id }, // nunca session_id/fingerprint/código
    });

    return NextResponse.json({
      pairingId: row.id,
      status: "aberto",
      codigo: result.codigo,
      codigoExibicao: result.codigoExibicao,
      numeroExibicao: result.numeroExibicao,
      waLink: result.waLink,
      waQrSvg: result.waQrSvg,
      expiraEm: result.expiraEm,
      signupUrl: result.signupUrl,
      numeroOficialExibicao: result.numeroOficialExibicao,
      waLinkOficial: result.waLinkOficial,
    });
  } catch (e) {
    const meta: Record<string, unknown> = { error: e instanceof Error ? e.message : "Erro desconhecido" };
    let httpStatus = 502;
    if (e instanceof PairingError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      if (e.serverDetail !== undefined) meta.serverDetail = e.serverDetail;
      httpStatus = e.reason === "rate_limited" ? 429 : e.reason === "recusado" ? 409 : 502;
    } else if (e instanceof ReleaseInfoError) {
      meta.reason = e.reason;
    }
    logAudit({ user: session.user, ip, action: "license.pair.start.fail", target: stackId, result: "error", meta });
    return NextResponse.json(
      { error: e instanceof PairingError ? e.message : "Não foi possível iniciar o pareamento", reason: e instanceof PairingError ? e.reason : undefined },
      { status: httpStatus }
    );
  }
}
