// Cliente HTTP do fluxo de pareamento self-service de licença no Console
// EnchaT (console.enchat.pro) — mesmo protocolo que o app Go usa
// (internal/license/pareamento.go) e que o instalador standalone replica
// (ENCHAT GRÁTIS/instalador/painel.py). Ver license-pairing (rotas
// /api/license/pair/*) para quem consome isto, e pairing-store.ts para onde
// o machine_id/fingerprint usados aqui vêm de.
//
// Mesmo esqueleto de registry-auth.ts DE PROPÓSITO (comentário no topo
// daquele arquivo pede pra não inventar uma segunda taxonomia): timeout via
// AbortController, sem retry, erro tipado com reason/httpStatus/serverDetail,
// readErrorDetail truncado, validação de contrato do corpo. Nunca loga a
// chave emitida, o CPF, nome ou celular — só identificadores opacos
// (session_id, pairing_id) e status/motivo.
const PAIRING_TIMEOUT_MS = 8000;

export type PairingReason =
  | "timeout"
  | "network"
  | "rate_limited" // 429 — Console pediu para esperar
  | "not_found" // sessão/código não encontrado ou expirado
  | "server" // 5xx — falha no Console, não do cliente
  | "malformed" // 2xx mas corpo não é JSON
  | "contract" // JSON válido, mas sem os campos essenciais
  | "recusado"; // o PRÓPRIO protocolo recusou (motivo em serverDetail) — não é falha de transporte

export class PairingError extends Error {
  constructor(
    public reason: PairingReason,
    message: string,
    public httpStatus?: number,
    public serverDetail?: string,
    // body: corpo JSON cru da recusa, quando existir — Fase 2 (2ª tentativa
    // de CPF errada) precisa de `tentativas_restantes`, um número que
    // `serverDetail` (só a string de `error`) não carrega.
    public body?: Record<string, unknown>
  ) {
    super(message);
    this.name = "PairingError";
  }
}

async function readErrorInfo(res: Response): Promise<{ detail?: string; body?: Record<string, unknown> }> {
  try {
    const text = (await res.text()).slice(0, 300);
    if (!text) return {};
    try {
      const parsed = JSON.parse(text);
      const detail = parsed?.error ?? parsed?.message ?? parsed?.motivo;
      const body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : undefined;
      if (typeof detail === "string" && detail) return { detail, body };
      return { body };
    } catch {
      // não era JSON — usa o texto cru mesmo
      return { detail: text };
    }
  } catch {
    return {};
  }
}

async function postConsole(baseUrl: string, path: string, body: Record<string, unknown>): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PAIRING_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new PairingError(
        "timeout",
        `O Console EnchaT não respondeu em ${PAIRING_TIMEOUT_MS / 1000}s. Tente de novo.`
      );
    }
    throw new PairingError(
      "network",
      "Não foi possível contatar o Console EnchaT (falha de rede/DNS/TLS)."
    );
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const { detail, body } = await readErrorInfo(res);
    const status = res.status;
    if (status === 429) throw new PairingError("rate_limited", "O Console EnchaT pediu para aguardar antes de tentar de novo.", status, detail, body);
    if (status === 404 || status === 410) throw new PairingError("not_found", "Sessão de pareamento não encontrada ou expirada — gere um novo código.", status, detail, body);
    if (status >= 500) throw new PairingError("server", `O Console EnchaT respondeu com erro ${status}${detail ? ` (${detail})` : ""}.`, status, detail, body);
    // 400/403/409 do protocolo de pareamento (ex.: cpf_obrigatorio,
    // ja_ativada_em_outra_vps, sessao_ja_confirmada) — não é falha de
    // transporte, é uma recusa de negócio. `detail` carrega o motivo real
    // (ver mensagemDeErro em web/src/components/AtivacaoScreen.tsx no repo
    // ENCHAT para a tradução — o painel espelha essas mensagens em
    // license-pairing-messages.ts). `body` carrega campos extras como
    // tentativas_restantes (Fase 2 — CPF errado).
    throw new PairingError("recusado", detail ?? `Console recusou (HTTP ${status}).`, status, detail, body);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new PairingError("malformed", "O Console EnchaT respondeu 200 OK, mas o corpo não é JSON válido.");
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
function bool(o: unknown, key: string): boolean | undefined {
  const v = (o as Record<string, unknown> | null)?.[key];
  return typeof v === "boolean" ? v : undefined;
}

export type PairStartResult = {
  sessionId: string;
  codigo: string;
  codigoExibicao?: string;
  numeroWhatsapp?: string;
  numeroExibicao?: string;
  waLink?: string;
  waQrSvg?: string;
  expiraEm: number;
  signupUrl?: string;
  numeroOficialExibicao?: string;
  waLinkOficial?: string;
};

// Abre uma sessão de pareamento SEM CPF (protocolo "WhatsApp antes do CPF" —
// ver internal/license/pareamento.go IniciarPareamentoSemCPF no repo
// ENCHAT). `nomeInstalacao`/`emailInstalacao` são aditivos: preenchem o
// customer se o telefone acabar sendo desconhecido, mas nunca são exigidos.
export async function pairStart(
  consoleBaseUrl: string,
  params: { fingerprint: string; versaoApp: string; edicao: string; nomeInstalacao?: string; emailInstalacao?: string }
): Promise<PairStartResult> {
  const body: Record<string, unknown> = {
    fingerprint: params.fingerprint,
    versao_app: params.versaoApp,
    edicao: params.edicao,
    suporta_selecao: true,
    cpf_depois: true,
  };
  if (params.nomeInstalacao) body.nome_instalacao = params.nomeInstalacao;
  if (params.emailInstalacao) body.email_instalacao = params.emailInstalacao;

  const json = await postConsole(consoleBaseUrl, "/api/v1/licenses/pair/start", body);
  const sessionId = str(json, "session_id");
  const codigo = str(json, "codigo");
  const expiraEm = num(json, "expira_em");
  if (!sessionId || !codigo || expiraEm === undefined) {
    throw new PairingError("contract", "Console respondeu 200 OK, mas sem session_id/codigo/expira_em utilizáveis.");
  }
  return {
    sessionId,
    codigo,
    codigoExibicao: str(json, "codigo_exibicao"),
    numeroWhatsapp: str(json, "numero_whatsapp"),
    numeroExibicao: str(json, "numero_exibicao"),
    waLink: str(json, "wa_link"),
    waQrSvg: str(json, "wa_qr_svg"),
    expiraEm,
    signupUrl: str(json, "signup_url"),
    numeroOficialExibicao: str(json, "numero_oficial_exibicao"),
    waLinkOficial: str(json, "wa_link_oficial"),
  };
}

export type LicencaOfertada = {
  id: number;
  apelido?: string;
  plano?: string;
  vitalicia?: boolean;
  expiraEm?: number;
  updatesAte?: number;
  jaAtivadaAqui?: boolean;
};

export type InstalacaoAtual = { ultimoCheck?: number; apelido?: string };

export type PairPollResult =
  | { status: "aguardando"; expiraEm?: number; aviso?: string; avisoRemetente?: string }
  | { status: "aguardando_cpf"; remetenteMascarado?: string }
  | { status: "escolha_pendente"; licencas: LicencaOfertada[]; escolhaExpiraEm?: number }
  | { status: "expirado" }
  | { status: "recusado"; motivo?: string; instalacaoAtual?: InstalacaoAtual }
  | { status: "consumido" }
  | { status: "confirmado"; chave: string; cliente?: string; plano?: string };

export async function pairPoll(
  consoleBaseUrl: string,
  params: { sessionId: string; fingerprint: string; edicao: string }
): Promise<PairPollResult> {
  const json = await postConsole(consoleBaseUrl, "/api/v1/licenses/pair/poll", {
    session_id: params.sessionId,
    fingerprint: params.fingerprint,
    edicao: params.edicao,
  });
  const status = str(json, "status");
  switch (status) {
    case "aguardando":
      return { status, expiraEm: num(json, "expira_em"), aviso: str(json, "aviso"), avisoRemetente: str(json, "aviso_remetente") };
    case "aguardando_cpf":
      return { status, remetenteMascarado: str(json, "remetente_mascarado") };
    case "escolha_pendente": {
      const raw = (json as { licencas?: unknown[] })?.licencas;
      const licencas: LicencaOfertada[] = Array.isArray(raw)
        ? raw.map((l) => ({
            id: num(l, "id") ?? 0,
            apelido: str(l, "apelido"),
            plano: str(l, "plano"),
            vitalicia: bool(l, "vitalicia"),
            expiraEm: num(l, "expira_em"),
            updatesAte: num(l, "updates_ate"),
            jaAtivadaAqui: bool(l, "ja_ativada_aqui"),
          }))
        : [];
      return { status, licencas, escolhaExpiraEm: num(json, "escolha_expira_em") };
    }
    case "expirado":
      return { status };
    case "recusado": {
      const inst = (json as { instalacao_atual?: unknown })?.instalacao_atual;
      const instalacaoAtual = inst
        ? { ultimoCheck: num(inst, "ultimo_check"), apelido: str(inst, "apelido") }
        : undefined;
      return { status, motivo: str(json, "motivo"), instalacaoAtual };
    }
    case "consumido":
      return { status };
    case "confirmado": {
      const chave = str(json, "chave");
      if (!chave) throw new PairingError("contract", "Console confirmou o pareamento, mas não devolveu a chave de licença.");
      return { status, chave, cliente: str(json, "cliente") ?? str(json, "customer_name"), plano: str(json, "plano") };
    }
    default:
      throw new PairingError("contract", `Console devolveu um status de poll desconhecido: "${status ?? "(vazio)"}".`);
  }
}

export async function pairCpf(
  consoleBaseUrl: string,
  params: { sessionId: string; fingerprint: string; cpf: string }
): Promise<void> {
  await postConsole(consoleBaseUrl, "/api/v1/licenses/pair/cpf", {
    session_id: params.sessionId,
    fingerprint: params.fingerprint,
    cpf: params.cpf,
  });
}

export type PairCredencialResult = { escolhaPendente: boolean };

// Segundo fator de posse (Fase 2 do plano): destrava a sessão depois do CPF
// errar 2x — email+senha do Super Admin do app, sincronizados via
// credencial-proprietario.ts no Console. Autentica o customerId de forma
// INDEPENDENTE do CPF pinado na sessão (que pode estar errado).
export async function pairCredencial(
  consoleBaseUrl: string,
  params: { sessionId: string; fingerprint: string; email: string; senha: string }
): Promise<PairCredencialResult> {
  const json = await postConsole(consoleBaseUrl, "/api/v1/licenses/pair/credencial", {
    session_id: params.sessionId,
    fingerprint: params.fingerprint,
    email: params.email,
    senha: params.senha,
  });
  return { escolhaPendente: bool(json, "escolha_pendente") === true };
}

// Fase 2.2 — "celular novo, CPF que já tem cadastro" (motivo
// cpf_ja_cadastrado): mesma credencial de pairCredencial, mas troca o
// telefone cadastrado pelo número JÁ CONFIRMADO nesta sessão em vez de só
// confirmar o pareamento.
export async function pairTrocarTelefone(
  consoleBaseUrl: string,
  params: { sessionId: string; fingerprint: string; email: string; senha: string }
): Promise<void> {
  await postConsole(consoleBaseUrl, "/api/v1/licenses/pair/trocar-telefone", {
    session_id: params.sessionId,
    fingerprint: params.fingerprint,
    email: params.email,
    senha: params.senha,
  });
}

export type PairMigrarResult = { sessaoReutilizavel: boolean };

// Migração self-service de VPS (reformatou/reinstalou → licença presa a um
// fingerprint antigo) — ver .../licenses/pair/migrar/route.ts no repo
// Console pro porquê disto ser um REBIND, nunca um unbind. Só funciona
// depois do CPF já conferido nesta sessão (o Console reautentica pela
// mesma prova de posse).
export async function pairMigrar(
  consoleBaseUrl: string,
  params: { sessionId: string; fingerprint: string }
): Promise<PairMigrarResult> {
  const json = await postConsole(consoleBaseUrl, "/api/v1/licenses/pair/migrar", {
    session_id: params.sessionId,
    fingerprint: params.fingerprint,
  });
  return { sessaoReutilizavel: bool(json, "sessao_reutilizavel") === true };
}

export async function pairChoose(
  consoleBaseUrl: string,
  params: { sessionId: string; fingerprint: string; licenseId: number }
): Promise<void> {
  await postConsole(consoleBaseUrl, "/api/v1/licenses/pair/choose", {
    session_id: params.sessionId,
    fingerprint: params.fingerprint,
    license_id: params.licenseId,
  });
}

// Anexa a INTENÇÃO de signup a uma sessão de pareamento JÁ ABERTA — não gera
// código novo (ver src/app/api/signup/start/route.ts no repo Console: essa
// rota só faz UPDATE em `pareamento`, nunca INSERT). `codigo` é o mesmo
// código de pareamento exibido na tela — funciona como credencial bearer
// dessa chamada, então nunca deve ir para audit/log.
export async function signupStart(
  consoleBaseUrl: string,
  params: { codigo: string; nome: string; cpf: string; celular: string; email?: string }
): Promise<void> {
  await postConsole(consoleBaseUrl, "/api/signup/start", {
    codigo: params.codigo,
    nome: params.nome,
    cpf: params.cpf,
    celular: params.celular,
    email: params.email ?? "",
  });
}
