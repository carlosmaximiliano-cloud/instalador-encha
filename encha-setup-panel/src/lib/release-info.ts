// Resolve qual imagem/versão instalar consultando o Console EnchaT — em vez
// de pedir a versão num campo do formulário (o operador nunca sabe qual
// número está publicado, e um valor digitado errado trava o pré-pull com uma
// mensagem que parece bug do instalador). Ver stacks/types.ts (ReleaseSpec)
// e installer.ts para a orquestração; mesmo padrão de erro estruturado de
// registry-auth.ts, para não inventar uma segunda taxonomia no mesmo fluxo.

const RELEASE_TIMEOUT_MS = 8000;

// Formato aceito para a versão/tag — nunca "latest": um Console comprometido
// ou mal configurado que devolvesse isso faria o instalador puxar sempre a
// build mais recente sem controle nenhum de rollout.
const SEMVER = /^\d+\.\d+\.\d+$/;

export type ReleaseInfo = {
  version: string;
  imageRepo: string;
  imageTag: string;
  obrigatoria: boolean;
};

export type ReleaseInfoReason =
  | "timeout" // AbortController estourou — Console lento/travado
  | "network" // fetch rejeitou por transporte: DNS, TCP recusado, TLS
  | "not_found" // 404 — endpoint mudou ou está errado
  | "server" // 5xx — falha no backend do Console, não no instalador
  | "malformed" // 2xx mas corpo não é JSON
  | "contract"; // JSON válido, mas sem os campos esperados (ou versão fora do formato X.Y.Z)

export class ReleaseInfoError extends Error {
  constructor(
    public reason: ReleaseInfoReason,
    message: string,
    public httpStatus?: number,
    public serverDetail?: string
  ) {
    super(message);
    this.name = "ReleaseInfoError";
  }
}

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

export async function fetchLatestRelease(
  baseUrl: string,
  app: string,
  edicao: string,
  canal: string
): Promise<ReleaseInfo> {
  const url = `${baseUrl.replace(/\/+$/, "")}/api/version?app=${encodeURIComponent(app)}&edicao=${encodeURIComponent(edicao)}&canal=${encodeURIComponent(canal)}`;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), RELEASE_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ReleaseInfoError(
        "timeout",
        `O Console EnchaT não respondeu em ${RELEASE_TIMEOUT_MS / 1000}s ao consultar a versão mais recente. Tente de novo.`
      );
    }
    throw new ReleaseInfoError(
      "network",
      "Não foi possível contatar o Console EnchaT (falha de rede/DNS/TLS) para saber qual versão instalar."
    );
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const detail = await readErrorDetail(res);
    const status = res.status;
    if (status === 404) {
      throw new ReleaseInfoError(
        "not_found",
        "O endpoint de versão do Console EnchaT não foi encontrado (404). Falha do lado do EnchaT.",
        status,
        detail
      );
    }
    if (status >= 500) {
      throw new ReleaseInfoError(
        "server",
        `O Console EnchaT respondeu com erro ${status}` +
          (detail ? ` (${detail})` : "") +
          " ao consultar a versão mais recente. Isso é uma falha no serviço do EnchaT.",
        status,
        detail
      );
    }
    throw new ReleaseInfoError(
      "server",
      `O Console EnchaT recusou a consulta de versão (HTTP ${status}).`,
      status,
      detail
    );
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ReleaseInfoError(
      "malformed",
      "O Console EnchaT respondeu com sucesso, mas o corpo não é um JSON válido — falha do lado do EnchaT."
    );
  }

  const obj = json as {
    latest_version?: unknown;
    image_repo?: unknown;
    image_tag?: unknown;
    obrigatoria?: unknown;
  };
  const version = obj.latest_version;
  const imageRepo = obj.image_repo;
  const imageTag = obj.image_tag ?? version;

  if (typeof version !== "string" || typeof imageRepo !== "string" || typeof imageTag !== "string") {
    throw new ReleaseInfoError(
      "contract",
      "O Console EnchaT respondeu 200 OK, mas sem versão/imagem utilizáveis — formato de resposta inesperado."
    );
  }
  if (!SEMVER.test(imageTag)) {
    throw new ReleaseInfoError(
      "contract",
      `O Console EnchaT devolveu uma tag de imagem fora do formato X.Y.Z ("${imageTag}") — recusado por segurança (nunca "latest").`
    );
  }

  return { version, imageRepo, imageTag, obrigatoria: obj.obrigatoria === true };
}
