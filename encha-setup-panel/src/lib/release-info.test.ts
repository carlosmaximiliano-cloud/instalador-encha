import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLatestRelease, ReleaseInfoError } from "./release-info";

function respostaFalsa(status: number, corpo?: unknown, contentType = "application/json"): Response {
  return new Response(corpo === undefined ? undefined : JSON.stringify(corpo), {
    status,
    headers: corpo === undefined ? {} : { "Content-Type": contentType },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLatestRelease", () => {
  it("200 com campos válidos devolve a release", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respostaFalsa(200, { latest_version: "0.2.9", image_repo: "ghcr.io/x/encha-tracker", image_tag: "0.2.9" }))
    );
    const r = await fetchLatestRelease("https://console.exemplo.com", "tracker", "full", "beta");
    expect(r).toEqual({ version: "0.2.9", imageRepo: "ghcr.io/x/encha-tracker", imageTag: "0.2.9", obrigatoria: false });
  });

  it("a URL montada carrega o canal pedido", async () => {
    let urlChamada = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urlChamada = url;
        return respostaFalsa(200, { latest_version: "0.2.9", image_repo: "ghcr.io/x/encha-tracker", image_tag: "0.2.9" });
      })
    );
    await fetchLatestRelease("https://console.exemplo.com", "tracker", "full", "beta");
    expect(urlChamada).toContain("canal=beta");
  });

  // Mutação M2 (Ciclo C, fechamento da instalação) — o Console distingue
  // "rota não existe" de "rota existe, ninguém publicou release ainda"
  // pelo CORPO do 404 ({error:"no_release_published"}). Sem essa
  // distinção, os dois casos produzem a mesma mensagem enganosa
  // ("endpoint não encontrado"), quando só o segundo é real.
  it("404 com {error:'no_release_published'} vira reason nao_publicada, mensagem honesta", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(404, { error: "no_release_published" })));
    await expect(fetchLatestRelease("https://c.x", "tracker", "full", "beta")).rejects.toMatchObject({
      reason: "nao_publicada",
    } satisfies Partial<ReleaseInfoError>);

    try {
      await fetchLatestRelease("https://c.x", "tracker", "full", "beta");
      expect.unreachable("deveria ter lançado ReleaseInfoError");
    } catch (e) {
      const msg = (e as Error).message.toLowerCase();
      expect(msg).not.toMatch(/não foi encontrado/);
      expect(msg).toMatch(/beta/);
    }
  });

  it("404 SEM o corpo no_release_published continua not_found (endpoint errado de verdade)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(404, undefined, "text/plain")));
    await expect(fetchLatestRelease("https://c.x", "tracker", "full", "beta")).rejects.toMatchObject({
      reason: "not_found",
    });
  });

  it("500 vira server", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(500)));
    await expect(fetchLatestRelease("https://c.x", "tracker", "full", "beta")).rejects.toMatchObject({ reason: "server" });
  });

  it("200 com tag fora de X.Y.Z vira contract (nunca aceita 'latest')", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respostaFalsa(200, { latest_version: "0.2.9", image_repo: "ghcr.io/x/encha-tracker", image_tag: "latest" }))
    );
    await expect(fetchLatestRelease("https://c.x", "tracker", "full", "beta")).rejects.toMatchObject({ reason: "contract" });
  });

  it("200 com corpo não-JSON vira malformed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html/>", { status: 200, headers: { "Content-Type": "text/html" } }))
    );
    await expect(fetchLatestRelease("https://c.x", "tracker", "full", "beta")).rejects.toMatchObject({ reason: "malformed" });
  });

  it("erro de rede vira network", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("fetch failed"); }));
    await expect(fetchLatestRelease("https://c.x", "tracker", "full", "beta")).rejects.toMatchObject({ reason: "network" });
  });
});
