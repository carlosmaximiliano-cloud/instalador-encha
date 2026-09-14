import { NextRequest, NextResponse } from "next/server";
import { requireSessionToken } from "@/lib/auth/require-token";
import { verifyCsrf, verifyOrigin, getClientIp } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { suporteAnexar, SuporteError } from "@/lib/suporte";
import { suporteAcessoToken } from "@/lib/suporte-store";
import { logAudit } from "@/lib/audit";
import { resolveLocale } from "@/lib/locale";
import { apiError, unauthenticatedResponse } from "@/lib/api-error";

// "muitas_tentativas_anexo" carrega um placeholder "{s}" (segundos até
// liberar de novo) — apiError() não faz interpolação, então essa mensagem é
// montada à mão no POST, sem passar por apiError().
const ERROS = {
  origem_invalida: { pt: "Origem inválida", en: "Invalid origin", es: "Origen inválido" },
  csrf_invalido: { pt: "CSRF inválido", en: "Invalid CSRF token", es: "Token CSRF inválido" },
  muitas_tentativas_anexo: {
    pt: "Muitas tentativas — aguarde {s}s",
    en: "Too many attempts — wait {s}s",
    es: "Demasiados intentos — espere {s}s",
  },
  anexo_maior_que_limite: {
    pt: "Anexo maior que o limite permitido",
    en: "Attachment larger than the allowed limit",
    es: "Archivo adjunto mayor que el límite permitido",
  },
  upload_invalido: { pt: "Upload inválido", en: "Invalid upload", es: "Carga inválida" },
  campos_obrigatorios_ausentes: {
    pt: "Campos obrigatórios ausentes",
    en: "Required fields missing",
    es: "Faltan campos obligatorios",
  },
  ticket_id_invalido: { pt: "ticketId inválido", en: "Invalid ticketId", es: "ticketId inválido" },
  arquivo_vazio: { pt: "Arquivo vazio", en: "Empty file", es: "Archivo vacío" },
  ticket_nao_encontrado: { pt: "Ticket não encontrado", en: "Ticket not found", es: "Ticket no encontrado" },
  anexo_falhou: {
    pt: "Não foi possível anexar o arquivo agora",
    en: "Could not attach the file right now",
    es: "No se pudo adjuntar el archivo en este momento",
  },
} satisfies Record<string, Record<import("@/lib/locale-shared").Locale, string>>;

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
  const locale = await resolveLocale();

  if (!verifyOrigin(req)) return apiError(ERROS, "origem_invalida", locale, 403);
  if (!(await verifyCsrf(req))) return apiError(ERROS, "csrf_invalido", locale, 403);

  const auth = await requireSessionToken();
  if (!auth) return unauthenticatedResponse(locale);
  const { session } = auth;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`suporte.anexo:${ip}`, 10, 15 * 60_000);
  if (!rl.allowed) {
    const segundos = Math.ceil(rl.resetMs / 1000);
    const template = ERROS.muitas_tentativas_anexo[locale] ?? ERROS.muitas_tentativas_anexo.pt;
    return NextResponse.json(
      { error: "muitas_tentativas_anexo", message: template.replace("{s}", String(segundos)) },
      { status: 429 }
    );
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
    return apiError(ERROS, "anexo_maior_que_limite", locale, 413);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return apiError(ERROS, "upload_invalido", locale, 400);
  }

  const scope = form.get("scope");
  const ticketIdRaw = form.get("ticketId");
  const file = form.get("file");
  if (typeof scope !== "string" || !scope || typeof ticketIdRaw !== "string" || !(file instanceof File)) {
    return apiError(ERROS, "campos_obrigatorios_ausentes", locale, 400);
  }
  const ticketId = Number(ticketIdRaw);
  if (!Number.isFinite(ticketId) || ticketId <= 0) {
    return apiError(ERROS, "ticket_id_invalido", locale, 400);
  }
  if (file.size === 0) {
    return apiError(ERROS, "arquivo_vazio", locale, 400);
  }
  if (file.size > MAX_ANEXO_BYTES) {
    return apiError(ERROS, "anexo_maior_que_limite", locale, 413);
  }

  const acessoToken = suporteAcessoToken(ticketId, scope);
  if (!acessoToken) {
    // Mesmo 404 pra "não existe" e "não é seu" — ver o comentário de
    // suporteAcessoToken em suporte-store.ts.
    return apiError(ERROS, "ticket_nao_encontrado", locale, 404);
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
    if (e instanceof SuporteError) {
      return NextResponse.json({ error: e.message }, { status: httpStatus });
    }
    return apiError(ERROS, "anexo_falhou", locale, httpStatus);
  }
}
