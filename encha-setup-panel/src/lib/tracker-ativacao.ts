// Cliente HTTP de POST /api/v1/tracker/ativar (Console EnchaT, Ciclo 7) —
// Ciclo 20b. Diferente de exchangeLicenseForGhcrCredentials
// (registry-auth.ts, que troca uma chave JÁ EMITIDA por credencial de
// registry): esta função ATIVA a licença a partir do e-mail da compra e
// devolve a chave num passo só. O campo `registry` da resposta é
// DESCARTADO de propósito — quem re-obtém a credencial de registry no
// momento certo (pré-pull, não na ativação) é registryAuth.exchangeUrl,
// que já existe desde o Ciclo 18c/20. Cachear a credencial daqui a
// reintroduziria o problema de expiração entre ativação e deploy que essa
// separação já fecha por construção.

export type TrackerAtivacaoReason =
  | "timeout"
  | "network"
  | "ativacao_recusada" // 403 — e-mail desconhecido, licença revogada, ou fingerprint de outra VPS (o Console funde as três de propósito)
  | "rate_limited" // 429
  | "registry_nao_configurado" // 503 — TRACKER_GHCR_PULL_* ausente no Console
  | "server" // 5xx
  | "malformed" // 2xx mas corpo não é JSON
  | "contract"; // JSON válido, mas sem `chave` utilizável

export class TrackerAtivacaoError extends Error {
  constructor(
    public reason: TrackerAtivacaoReason,
    message: string,
    public httpStatus?: number
  ) {
    super(message);
    this.name = "TrackerAtivacaoError";
  }
}

const ATIVACAO_TIMEOUT_MS = 15_000;

/**
 * Ativa a licença do Tracker por e-mail — POST síncrono, sem sessão nem
 * polling. `fingerprint` é resolvido pelo CHAMADOR via
 * getOrCreateMachineId(stackId, appHostname) — esta função nunca calcula
 * fingerprint nem gera machineId.
 */
export async function ativarTrackerPorEmail(
  consoleBaseUrl: string,
  email: string,
  fingerprint: string,
  versaoApp: string
): Promise<{ chave: string }> {
  const url = `${consoleBaseUrl.replace(/\/+$/, "")}/api/v1/tracker/ativar`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ATIVACAO_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fingerprint, versao_app: versaoApp }),
      signal: ctrl.signal,
      cache: "no-store",
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new TrackerAtivacaoError(
        "timeout",
        `O Console EnchaT não respondeu em ${ATIVACAO_TIMEOUT_MS / 1000}s. Tente de novo.`
      );
    }
    throw new TrackerAtivacaoError("network", "Não foi possível contatar o Console EnchaT (rede/DNS/TLS).");
  } finally {
    clearTimeout(t);
  }

  if (res.status === 403) {
    throw new TrackerAtivacaoError(
      "ativacao_recusada",
      "E-mail não reconhecido, licença revogada, ou já vinculada a outra instalação.",
      403
    );
  }
  if (res.status === 429) {
    throw new TrackerAtivacaoError("rate_limited", "Muitas tentativas — aguarde e tente de novo.", 429);
  }
  if (res.status === 503) {
    // "temporariamente" era enganoso: registry_nao_configurado é
    // TRACKER_GHCR_PULL_USERNAME/TOKEN ausentes no Console — não passa
    // sozinho com o tempo, é configuração pendente do lado do EnchaT
    // (achado ao investigar o defeito que motivou esta mensagem: mandava o
    // operador esperar por algo que nunca ia se resolver tentando de novo).
    throw new TrackerAtivacaoError(
      "registry_nao_configurado",
      "O Console EnchaT ainda não está configurado para distribuir a imagem do Tracker (credencial de registry ausente). Isso é configuração do lado do EnchaT — tentar de novo não resolve.",
      503
    );
  }
  if (res.status >= 500) {
    throw new TrackerAtivacaoError("server", `O Console EnchaT respondeu ${res.status}.`, res.status);
  }
  if (!res.ok) {
    throw new TrackerAtivacaoError("server", `O Console EnchaT respondeu ${res.status} de forma inesperada.`, res.status);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new TrackerAtivacaoError("malformed", "O Console EnchaT respondeu 200 OK, mas o corpo não é JSON.");
  }

  const chave = (json as { chave?: unknown })?.chave;
  if (typeof chave !== "string" || !chave) {
    throw new TrackerAtivacaoError("contract", "O Console EnchaT respondeu 200 OK, mas sem uma chave utilizável.");
    // NOTA: o campo `registry` da resposta, se presente, é ignorado aqui de
    // propósito — ver o comentário do módulo.
  }
  return { chave };
}
