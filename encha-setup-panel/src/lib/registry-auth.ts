// Troca de chave de licença por credencial de registro Docker privado, e
// registro dessa credencial no Portainer — usado por stacks que instalam
// imagens privadas (ex.: EnchaT Grátis, GHCR). Ver installer.ts para a
// orquestração completa e stacks/types.ts para o contrato RegistryAuthSpec.

import { PortainerError, createRegistry, listRegistries, updateRegistry } from "./portainer";

const EXCHANGE_TIMEOUT_MS = 8000;

export type ExchangedCredentials = { username: string; token: string };

// Causa estruturada da falha na troca de licença — permite distinguir "chave
// errada" (culpa do usuário) de "Console EnchaT fora do ar/mal configurado"
// (culpa do EnchaT), em vez de uma única mensagem genérica que mascara qual
// lado precisa agir. Ver installer.ts para onde isso vira audit log.
export type RegistryAuthReason =
  | "timeout" // AbortController estourou (EXCHANGE_TIMEOUT_MS) — Console lento/travado
  | "network" // fetch rejeitou por transporte: DNS, TCP recusado, TLS
  | "unauthorized" // 401/403 — chave inválida, expirada ou revogada
  | "not_found" // 404 — exchangeUrl mudou ou está errado
  | "rate_limited" // 429 — Console pediu para esperar
  | "server" // 5xx — falha no backend do Console EnchaT, não na chave
  | "malformed" // 2xx mas corpo não é JSON (ex.: página de erro de proxy)
  | "contract"; // JSON válido, mas sem username/token utilizáveis

export class RegistryAuthError extends Error {
  constructor(
    public reason: RegistryAuthReason,
    message: string,
    public httpStatus?: number,
    public serverDetail?: string
  ) {
    super(message);
    this.name = "RegistryAuthError";
  }
}

// Lê o corpo da resposta de erro só para diagnóstico (truncado — nunca
// confiar em tamanho/formato de um servidor de terceiros). Nunca inclui a
// chave nem o token, que nem chegam a existir nesse ponto.
async function readErrorDetail(res: Response): Promise<string | undefined> {
  try {
    const text = (await res.text()).slice(0, 300);
    if (!text) return undefined;
    try {
      const parsed = JSON.parse(text);
      const detail = parsed?.error ?? parsed?.message;
      if (typeof detail === "string" && detail) return detail;
    } catch {
      // não era JSON — usa o texto cru mesmo
    }
    return text;
  } catch {
    return undefined;
  }
}

// Lança em vez de best-effort (ao contrário de monitor.ts): uma falha aqui
// deve abortar a instalação, nunca seguir silenciosamente sem credencial.
export async function exchangeLicenseForGhcrCredentials(
  exchangeUrl: string,
  chave: string
): Promise<ExchangedCredentials> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), EXCHANGE_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(exchangeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave }),
      signal: ctrl.signal,
      cache: "no-store",
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new RegistryAuthError(
        "timeout",
        `O Console EnchaT não respondeu em ${EXCHANGE_TIMEOUT_MS / 1000}s. Tente de novo — ` +
          "se persistir, o serviço deles pode estar lento ou fora do ar."
      );
    }
    throw new RegistryAuthError(
      "network",
      "Não foi possível contatar o Console EnchaT (falha de rede/DNS/TLS). " +
        "Verifique a conectividade da VPS e tente de novo."
    );
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const detail = await readErrorDetail(res);
    const status = res.status;
    if (status === 401 || status === 403) {
      throw new RegistryAuthError(
        "unauthorized",
        "Chave de licença inválida, expirada ou revogada.",
        status,
        detail
      );
    }
    if (status === 404) {
      throw new RegistryAuthError(
        "not_found",
        "O endpoint de licenciamento do Console EnchaT não foi encontrado (404). " +
          "Pode ter mudado de endereço — isso é uma falha do lado do EnchaT.",
        status,
        detail
      );
    }
    if (status === 429) {
      throw new RegistryAuthError(
        "rate_limited",
        "O Console EnchaT pediu para aguardar antes de tentar de novo (limite de requisições).",
        status,
        detail
      );
    }
    if (status >= 500) {
      throw new RegistryAuthError(
        "server",
        `O Console EnchaT respondeu com erro ${status}` +
          (detail ? ` (${detail})` : "") +
          ". Isso é uma falha no serviço do EnchaT, não na sua chave — reporte ao suporte deles.",
        status,
        detail
      );
    }
    throw new RegistryAuthError(
      "unauthorized",
      `O Console EnchaT recusou a requisição (HTTP ${status}).`,
      status,
      detail
    );
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new RegistryAuthError(
      "malformed",
      "O Console EnchaT respondeu com sucesso, mas o corpo não é um JSON válido " +
        "(possível proxy/página de erro no meio do caminho) — falha do lado do EnchaT."
    );
  }

  const username = (json as { username?: unknown })?.username;
  const token = (json as { token?: unknown })?.token;
  if (typeof username !== "string" || typeof token !== "string" || !username || !token) {
    throw new RegistryAuthError(
      "contract",
      "O Console EnchaT respondeu 200 OK, mas sem usuário/token utilizáveis — " +
        "formato de resposta inesperado, falha do lado do EnchaT."
    );
  }
  // Nunca logar a chave nem o token — só o host/username são seguros de registrar.
  return { username, token };
}

// Idempotente por URL — a mesma chave que o Portainer usa para casar a
// credencial no deploy (igualdade de string contra o domínio da imagem).
// Sempre atualiza as credenciais quando já existe: o token do exchange é
// de curta duração, e um token obsoleto é pior que nenhum.
export async function ensureRegistry(
  token: string,
  spec: { url: string; name: string; username: string; password: string }
): Promise<number> {
  try {
    const existing = (await listRegistries(token)).find((r) => r.URL === spec.url);
    if (existing) {
      await updateRegistry(token, existing.Id, spec);
      return existing.Id;
    }
    const created = await createRegistry(token, spec);
    return created.Id;
  } catch (e) {
    if (e instanceof PortainerError && e.status === 403) {
      throw new Error(
        "A credencial de serviço do Portainer (variável PORTAINER_USER/PORTAINER_PASSWORD " +
          "da stack encha-panel) precisa ser de um administrador para registrar o GHCR. " +
          "Ajuste-a em Portainer → Stacks → encha-panel → Environment variables e tente de novo."
      );
    }
    throw e;
  }
}
