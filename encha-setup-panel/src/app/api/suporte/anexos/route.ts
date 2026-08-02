import { NextRequest, NextResponse } from "next/server";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { suporteAnexar, SuporteError } from "@/lib/suporte";
import { suporteAcessoToken } from "@/lib/suporte-store";
import { logAudit } from "@/lib/audit";

// Imagem 10MB / vídeo 50MB — mesmo teto do Console (tickets-storage.ts) e
// do proxy Go (maxAnexoSuporteBytes em internal/http/suporte_handlers.go).
// +margem pequena pro overhead do multipart não estourar um vídeo de
// exatos 50MB antes da hora — quem sniffa e recusa por TIPO de verdade é o
// Console.
const MAX_ANEXO_BYTES = 51 * 1024 * 1024;

// Anexa um arquivo a um ticket JÁ ABERTO (ver suporte/abrir/route.ts) — só
// depois de ver a confirmação "ticket aberto", nunca antes. `scope` prova
// que o ticket pertence a ESTA instalação (suporteAcessoToken só resolve o
// token quando ticketId+scope batem, ver suporte-store.ts) — sem essa
// checagem, um ticketId adivinhado de outra instalação nesta mesma máquina
// bateria a rota.
export async function POST(req: NextRequest) {
  if (!verifyOrigin(req)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "CSRF inválido" }, { status: 403 });

  const auth = await requireSessionToken();
  if (!auth) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { session } = auth;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`suporte.anexo:${ip}`, 10, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: `Muitas tentativas — aguarde ${Math.ceil(rl.resetMs / 1000)}s` }, { status: 429 });
  }

  // Content-Length ANTES de req.formData() — achado em revisão: essa rota
  // não tem `serverActions.bodySizeLimit` (só vale pra Server Actions, não
  // Route Handlers) nem middleware de tamanho no Traefik, então sem isto um
  // corpo de vários GB seria bufferizado por inteiro em memória antes do
  // MAX_ANEXO_BYTES abaixo sequer rodar. Content-Length é declarado pelo
  // cliente (não uma garantia contra quem mente), mas cobre o caso comum —
  // um payload realmente gigante — sem custo nenhum de leitura.
  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_ANEXO_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "Anexo maior que o limite permitido" }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Upload inválido" }, { status: 400 });
  }

  const scope = form.get("scope");
  const ticketIdRaw = form.get("ticketId");
  const file = form.get("file");
  if (typeof scope !== "string" || !scope || typeof ticketIdRaw !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }
  const ticketId = Number(ticketIdRaw);
  if (!Number.isFinite(ticketId) || ticketId <= 0) {
    return NextResponse.json({ error: "ticketId inválido" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
  }
  if (file.size > MAX_ANEXO_BYTES) {
    return NextResponse.json({ error: "Anexo maior que o limite permitido" }, { status: 413 });
  }

  const acessoToken = suporteAcessoToken(ticketId, scope);
  if (!acessoToken) {
    // Mesmo 404 pra "não existe" e "não é seu" — ver o comentário de
    // suporteAcessoToken em suporte-store.ts.
    return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 });
  }

  try {
    const data = Buffer.from(await file.arrayBuffer());
    await suporteAnexar({
      ticketId,
      acessoToken,
      filename: file.name.slice(0, 200),
      mime: file.type,
      data,
    });
    logAudit({ user: session.user, ip, action: "suporte.anexo", target: scope, result: "ok", meta: { ticket_id: ticketId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const meta: Record<string, unknown> = { ticket_id: ticketId, error: e instanceof Error ? e.message : "Erro desconhecido" };
    let httpStatus = 502;
    if (e instanceof SuporteError) {
      meta.reason = e.reason;
      if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
      httpStatus = e.reason === "rate_limited" ? 429 : e.reason === "recusado" ? 409 : 502;
    }
    logAudit({ user: session.user, ip, action: "suporte.anexo.fail", target: scope, result: "error", meta });
    return NextResponse.json(
      { error: e instanceof SuporteError ? e.message : "Não foi possível anexar o arquivo agora" },
      { status: httpStatus }
    );
  }
}
