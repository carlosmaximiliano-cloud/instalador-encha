import { PANEL_IMAGE_REPO, SETUPTESTE_REPO } from "./release-repos";
import type { Locale } from "./locale-shared";

// Confere se uma versão já terminou de ser publicada ANTES de o painel
// tentar atualizar para ela. O Monitor anuncia a versão e o release.yml ainda
// leva ~2 min criando a imagem e a tag: quem clicava Atualizar nessa janela
// tomava 404 no tarball (scripts do host) e trocava PANEL_IMAGE_TAG para uma
// imagem que ainda não existia (achado em 2026-10-08, VPS de teste).
//
// Falha ABERTA de propósito: só um 404 definitivo conta como "em publicação".
// Rede fora, timeout, rate limit ou qualquer outro status viram
// "indeterminado" e NÃO bloqueiam — um erro daqui nunca pode deixar um painel
// sem forma de se atualizar (mesma regra do CLAUDE.md do painel para /api/update).

export type ReleasePronta = "pronta" | "em_publicacao" | "indeterminado";

type Existe = "existe" | "nao_existe" | "indeterminado";

const TIMEOUT_MS = 5_000;
const VERSION_RE = /^\d+\.\d+\.\d+$/;
const IMAGE_PATH = PANEL_IMAGE_REPO.replace(/^ghcr\.io\//, "");
const MANIFEST_ACCEPT = [
  "application/vnd.oci.image.index.v1+json",
  "application/vnd.oci.image.manifest.v1+json",
  "application/vnd.docker.distribution.manifest.v2+json",
  "application/vnd.docker.distribution.manifest.list.v2+json",
].join(", ");

async function comTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

function porStatus(status: number): Existe {
  if (status === 200) return "existe";
  if (status === 404) return "nao_existe";
  return "indeterminado";
}

// Mesma URL que o UPDATE_SCRIPT de host-updater.ts baixa — se ela responde
// 404 aqui, o passo de scripts vai falhar do mesmo jeito.
async function tagExiste(version: string): Promise<Existe> {
  try {
    const res = await comTimeout(
      `https://codeload.github.com/${SETUPTESTE_REPO}/tar.gz/refs/tags/v${version}`,
      { method: "HEAD" }
    );
    return porStatus(res.status);
  } catch {
    return "indeterminado";
  }
}

async function imagemExiste(version: string): Promise<Existe> {
  try {
    const tok = await comTimeout(`https://ghcr.io/token?scope=repository:${IMAGE_PATH}:pull`);
    if (!tok.ok) return "indeterminado";
    const token = ((await tok.json()) as { token?: string }).token;
    if (!token) return "indeterminado";
    const res = await comTimeout(`https://ghcr.io/v2/${IMAGE_PATH}/manifests/${version}`, {
      method: "HEAD",
      headers: { Authorization: `Bearer ${token}`, Accept: MANIFEST_ACCEPT },
    });
    return porStatus(res.status);
  } catch {
    return "indeterminado";
  }
}

export async function releasePronta(version: string): Promise<ReleasePronta> {
  if (!VERSION_RE.test(version)) return "indeterminado";
  const [tag, imagem] = await Promise.all([tagExiste(version), imagemExiste(version)]);
  if (tag === "nao_existe" || imagem === "nao_existe") return "em_publicacao";
  if (tag === "existe" && imagem === "existe") return "pronta";
  return "indeterminado";
}

// Mensagem das rotas /api/update e /api/update/scripts quando a versão ainda
// está sendo publicada. Compartilhada aqui para as duas rotas não divergirem.
export function msgVersaoEmPublicacao(version: string, locale: Locale): string {
  const t = {
    pt: `A versão ${version} ainda está sendo publicada. Tente de novo em alguns minutos.`,
    en: `Version ${version} is still being published. Try again in a few minutes.`,
    es: `La versión ${version} aún se está publicando. Intente de nuevo en unos minutos.`,
  };
  return t[locale] ?? t.pt;
}
