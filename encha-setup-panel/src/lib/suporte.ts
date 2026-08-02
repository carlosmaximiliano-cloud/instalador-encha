// Cliente HTTP do sistema de tickets de suporte do Console EnchaT
// (console.enchat.pro/api/v1/suporte/*) — mesmo protocolo que
// internal/license/suporte.go usa no repo ENCHAT. Ver suporte-store.ts para
// onde requester_token/acesso_token ficam guardados (cifrados, nunca no
// navegador) e suporte-panel.tsx para quem consome isto.
//
// Mesmo esqueleto de license-pairing.ts DE PROPÓSITO (aquele arquivo pede
// pra não inventar uma segunda taxonomia): timeout via AbortController, sem
// retry, erro tipado com reason/httpStatus/serverDetail. Nunca loga o texto
// do ticket, nome de anexo, nem PII — só ticket_id (opaco pro Console, não
// pro navegador) e status/motivo.
//
// CONSOLE_BASE_URL é constante de compilação, jamais env editável pelo
// operador — uma base URL apontável pelo cliente é vetor de sequestro de
// domínio (mesmo raciocínio do cabeçalho de license-pairing.ts/enchat.ts).
export const CONSOLE_BASE_URL = "https://console.enchat.pro";

const SUPORTE_TIMEOUT_MS = 15000;
// Upload de anexo (até 50MB de vídeo) precisa de mais tempo que uma chamada
// de texto — mesmo raciocínio do timeout duplo em internal/license/suporte.go.
const SUPORTE_UPLOAD_TIMEOUT_MS = 120000;

export type SuporteReason =
  | "timeout"
  | "network"
  | "rate_limited"
  | "not_found"
  | "server"
  | "malformed"
  | "contract"
  | "recusado";

export class SuporteError extends Error {
  constructor(
    public reason: SuporteReason,
    message: string,
    public httpStatus?: number,
    public serverDetail?: string
  ) {
    super(message);
    this.name = "SuporteError";
  }
}

async function readErrorDetail(res: Response): Promise<string | undefined> {
  try {
    const text = (await res.text()).slice(0, 300);
    if (!text) return undefined;
    try {
      const parsed = JSON.parse(text);
      const detail = parsed?.error ?? parsed?.message ?? parsed?.motivo;
      return typeof detail === "string" && detail ? detail : undefined;
    } catch {
      return text;
    }
  } catch {
    return undefined;
  }
}

async function chamarConsole(
  path: string,
  init: { method: "GET" | "POST"; body?: BodyInit; headers?: Record<string, string>; timeoutMs?: number }
): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), init.timeoutMs ?? SUPORTE_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${CONSOLE_BASE_URL}${path}`, {
      method: init.method,
      headers: init.headers,
      body: init.body,
      signal: ctrl.signal,
      cache: "no-store",
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new SuporteError("timeout", `O Console EnchaT não respondeu em ${(init.timeoutMs ?? SUPORTE_TIMEOUT_MS) / 1000}s. Tente de novo.`);
    }
    throw new SuporteError("network", "Não foi possível contatar o Console EnchaT (falha de rede/DNS/TLS).");
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const detail = await readErrorDetail(res);
    const status = res.status;
    if (status === 429) throw new SuporteError("rate_limited", "Muitas tentativas — aguarde um pouco e tente de novo.", status, detail);
    if (status === 404) throw new SuporteError("not_found", "Ticket não encontrado.", status, detail);
    if (status >= 500) throw new SuporteError("server", `O Console EnchaT respondeu com erro ${status}${detail ? ` (${detail})` : ""}.`, status, detail);
    throw new SuporteError("recusado", detail ?? `Console recusou (HTTP ${status}).`, status, detail);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new SuporteError("malformed", "O Console EnchaT respondeu 200 OK, mas o corpo não é JSON válido.");
  }
  return json;
}

function str(o: unknown, key: string): string | undefined {
  const v = (o as Record<string, unknown> | null)?.[key];
  return typeof v === "string" ? v : undefined;
}
function num(o: unknown, key: string): number | undefined {
  const v = (o as Record<string, unknown> | null)?.[key];
  return typeof v === "number" ? v : undefined;
}

export type SuporteAbrirResultado = {
  ticketId: number;
  status: string;
  acessoToken: string;
  requesterToken: string;
};

// Abre um ticket novo. `chave` é deliberadamente OMITIDA — não existe
// licença na hora da instalação (ver header de suporte-panel.tsx), e é por
// isso que a coluna correspondente no Console é nullable.
export async function suporteAbrir(params: {
  assunto: string;
  mensagem: string;
  requesterToken?: string;
  deviceId: string;
  versaoApp: string;
  contatoEmail?: string;
  ipNavegador?: string;
  contexto?: Record<string, unknown>;
}): Promise<SuporteAbrirResultado> {
  const body: Record<string, unknown> = {
    device_id: params.deviceId,
    origem: "instalador",
    versao_app: params.versaoApp,
    assunto: params.assunto,
    mensagem: params.mensagem,
    contato_email: params.contatoEmail,
    ip_navegador: params.ipNavegador,
    contexto: params.contexto,
  };
  if (params.requesterToken) body.requester_token = params.requesterToken;

  const json = await chamarConsole("/api/v1/suporte/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const ticketId = num(json, "ticket_id");
  const acessoToken = str(json, "acesso_token");
  const requesterToken = str(json, "requester_token");
  if (ticketId === undefined || !acessoToken || !requesterToken) {
    throw new SuporteError("contract", "Console respondeu 200 OK, mas sem ticket_id/acesso_token/requester_token utilizáveis.");
  }
  return { ticketId, status: str(json, "status") ?? "aberto", acessoToken, requesterToken };
}

// Anexa um arquivo a um ticket já aberto — usado só logo após suporteAbrir,
// nunca numa conversa em andamento (o wizard não lê a thread de volta, ver
// header de suporte-panel.tsx).
export async function suporteAnexar(params: {
  ticketId: number;
  acessoToken: string;
  filename: string;
  mime: string;
  data: Buffer;
}): Promise<void> {
  const form = new FormData();
  // Uint8Array(buffer-like) copia pra um ArrayBuffer novo, não compartilhado
  // — o tipo de Buffer.buffer inclui SharedArrayBuffer, que BlobPart recusa.
  const bytes = new Uint8Array(params.data);
  form.append("file", new Blob([bytes], { type: params.mime || "application/octet-stream" }), params.filename);

  await chamarConsole(`/api/v1/suporte/tickets/${params.ticketId}/anexos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${params.acessoToken}` },
    body: form,
    timeoutMs: SUPORTE_UPLOAD_TIMEOUT_MS,
  });
}
