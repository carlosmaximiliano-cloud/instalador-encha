import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLatestRelease, imageRepoPermitido, ReleaseInfoError } from "./release-info";
import { ALL_STACKS } from "./stacks/registry";

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
      vi.fn(async () => respostaFalsa(200, { latest_version: "0.2.9", image_repo: "ghcr.io/cheiodecoisa/encha-tracker", image_tag: "0.2.9" }))
    );
    const r = await fetchLatestRelease("https://console.exemplo.com", "tracker", "full", "beta");
    expect(r).toEqual({ version: "0.2.9", imageRepo: "ghcr.io/cheiodecoisa/encha-tracker", imageTag: "0.2.9", obrigatoria: false });
  });

  it("a URL montada carrega o canal pedido", async () => {
    let urlChamada = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urlChamada = url;
        return respostaFalsa(200, { latest_version: "0.2.9", image_repo: "ghcr.io/cheiodecoisa/encha-tracker", image_tag: "0.2.9" });
      })
    );
    await fetchLatestRelease("https://console.exemplo.com", "tracker", "full", "beta");
    expect(urlChamada).toContain("canal=beta");
  });

  // Mutação (canal pelo plano) — o Console troca o `canal` pedido pelo canal
  // do plano da licença quando a consulta leva a chave. Ela vai no header
  // X-License-Key e NUNCA na URL (URL vaza em log de proxy). Mandar na query,
  // ou omitir, deixa esta asserção vermelha.
  it("com chave: vai no header X-License-Key e nunca na URL", async () => {
    let urlChamada = "";
    let headers: Record<string, string> | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: { headers?: Record<string, string> }) => {
        urlChamada = url;
        headers = init?.headers;
        return respostaFalsa(200, { latest_version: "1.2.0", image_repo: "ghcr.io/cheiodecoisa/encha-tracker", image_tag: "1.2.0" });
      })
    );
    await fetchLatestRelease("https://console.exemplo.com", "tracker", "full", "stable", "CHAVE-SECRETA-123");
    expect(headers).toEqual({ "X-License-Key": "CHAVE-SECRETA-123" });
    expect(urlChamada).not.toContain("CHAVE-SECRETA-123");
    expect(urlChamada).not.toContain("chave=");
  });

  it("sem chave: nenhum header de licença é enviado", async () => {
    let headers: Record<string, string> | undefined = { "X-License-Key": "sentinela" };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: { headers?: Record<string, string> }) => {
        headers = init?.headers;
        return respostaFalsa(200, { latest_version: "1.2.0", image_repo: "ghcr.io/cheiodecoisa/encha-tracker", image_tag: "1.2.0" });
      })
    );
    await fetchLatestRelease("https://console.exemplo.com", "tracker", "full", "stable");
    expect(headers).toBeUndefined();
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
      vi.fn(async () => respostaFalsa(200, { latest_version: "0.2.9", image_repo: "ghcr.io/cheiodecoisa/encha-tracker", image_tag: "latest" }))
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

// C7 (S10 do plano de segurança do EnchaT) — lista fixa de image_repo por
// produto/edição. A resposta de /api/version não é assinada; um repo fora da
// lista é recusado como `contract`, igual a uma tag fora de X.Y.Z.
describe("fetchLatestRelease — lista de image_repo aceitos", () => {
  function consoleDevolve(imageRepo: string) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respostaFalsa(200, { latest_version: "0.3.2", image_repo: imageRepo, image_tag: "0.3.2" }))
    );
  }

  it("aceita o repo real do EnchaT Grátis (enchat/free)", async () => {
    consoleDevolve("ghcr.io/enchainterno/enchat-free");
    const r = await fetchLatestRelease("https://c.x", "enchat", "free", "stable");
    expect(r.imageRepo).toBe("ghcr.io/enchainterno/enchat-free");
  });

  it("aceita o repo real do Encha Tracker (tracker/full)", async () => {
    consoleDevolve("ghcr.io/cheiodecoisa/encha-tracker");
    const r = await fetchLatestRelease("https://c.x", "tracker", "full", "beta");
    expect(r.imageRepo).toBe("ghcr.io/cheiodecoisa/encha-tracker");
  });

  it.each([
    ["outro dono, mesmo nome", "enchat", "free", "ghcr.io/atacante/enchat-free"],
    ["outro registro", "enchat", "free", "docker.io/enchainterno/enchat-free"],
    ["prefixo comum no dono", "enchat", "free", "ghcr.io/enchainterno-evil/enchat-free"],
    ["sufixo no nome", "enchat", "free", "ghcr.io/enchainterno/enchat-free-evil"],
    ["caixa diferente", "enchat", "free", "ghcr.io/EnchaInterno/enchat-free"],
    ["barra final", "enchat", "free", "ghcr.io/enchainterno/enchat-free/"],
    ["imagem MAX pedida como Grátis", "enchat", "free", "ghcr.io/carlosmaximiliano-cloud/enchat"],
    ["repo do Tracker pedido como EnchaT", "enchat", "free", "ghcr.io/cheiodecoisa/encha-tracker"],
    ["repo do EnchaT pedido como Tracker", "tracker", "full", "ghcr.io/enchainterno/enchat-free"],
    ["edição que este painel não instala", "enchat", "full", "ghcr.io/carlosmaximiliano-cloud/enchat"],
    ["vazio", "enchat", "free", ""],
    // Formas que um refactor "normalizando o que vem do Console" (trim,
    // cortar em @ ou :) aceitaria — e o valor CRU seguiria para o YAML
    // (`image: ${imageRepo}:${imageTag}`, ENCHAT_IMAGEM_PADRAO), inclusive
    // com quebra de linha: injeção de chave no compose. Auditoria C7.
    ["digest embutido", "enchat", "free", "ghcr.io/enchainterno/enchat-free@sha256:" + "a".repeat(64)],
    ["tag embutida", "enchat", "free", "ghcr.io/enchainterno/enchat-free:9.9.9"],
    ["espaço no fim", "enchat", "free", "ghcr.io/enchainterno/enchat-free "],
    ["espaço no início", "enchat", "free", " ghcr.io/enchainterno/enchat-free"],
    ["quebra de linha (injeção no YAML)", "enchat", "free", "ghcr.io/enchainterno/enchat-free\n    privileged: true"],
    ["@ seguido de quebra de linha", "enchat", "free", "ghcr.io/enchainterno/enchat-free@\n    privileged: true"],
  ])("recusa (%s) como contract, com mensagem citando o repo", async (_caso, app, edicao, repo) => {
    consoleDevolve(repo);
    const erro = await fetchLatestRelease("https://c.x", app, edicao, "stable").catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ReleaseInfoError);
    expect(erro).toMatchObject({ reason: "contract" });
    expect((erro as Error).message).toMatch(/fora da lista aceita/);
    expect((erro as Error).message).toContain(`"${repo}"`);
  });

  // Amarra a lista ao catálogo real: se alguém mudar app/edicao de uma
  // stack, ou criar uma stack nova com `release:`, sem mexer na lista, a
  // instalação quebraria em produção com "fora da lista" — pega aqui antes.
  it("toda stack do catálogo com `release:` tem o repo que ela instala na lista", () => {
    const esperado: Record<string, string> = {
      enchat: "ghcr.io/enchainterno/enchat-free",
      "encha-tracker": "ghcr.io/cheiodecoisa/encha-tracker",
    };
    const comRelease = ALL_STACKS.filter((d) => d.release);
    expect(comRelease.map((d) => d.id).sort()).toEqual(Object.keys(esperado).sort());
    for (const def of comRelease) {
      expect(imageRepoPermitido(def.release!.app, def.release!.edicao, esperado[def.id])).toBe(true);
    }
  });
});

// Mutação: cache global (chave ignorada). O resultado depende do plano da
// licença — uma licença beta nunca pode ler a entrada de outra licença, nem
// uma consulta anônima reaproveitar a de uma licença.
describe("fetchLatestReleaseCached — o cache é por chave", () => {
  it("licenças diferentes e consulta anônima não compartilham entrada", async () => {
    const { fetchLatestReleaseCached } = await import("./release-info");
    const chamadas: (string | undefined)[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: { headers?: Record<string, string> }) => {
        const k = init?.headers?.["X-License-Key"];
        chamadas.push(k);
        const tag = k === "CHAVE-BETA" ? "1.0.22" : "1.2.0";
        return respostaFalsa(200, { latest_version: tag, image_repo: "ghcr.io/cheiodecoisa/encha-tracker", image_tag: tag });
      })
    );
    const spec = { baseUrl: "https://c.x", app: "tracker", edicao: "full", canal: "stable" };
    const beta = await fetchLatestReleaseCached(spec, "cache-test-tracker", "CHAVE-BETA");
    const estavel = await fetchLatestReleaseCached(spec, "cache-test-tracker", "CHAVE-STABLE");
    const anonimo = await fetchLatestReleaseCached(spec, "cache-test-tracker");
    expect(beta.imageTag).toBe("1.0.22");
    expect(estavel.imageTag).toBe("1.2.0");
    expect(anonimo.imageTag).toBe("1.2.0");
    expect(chamadas).toEqual(["CHAVE-BETA", "CHAVE-STABLE", undefined]);

    // e a mesma chave, de novo, é servida do cache (não bate no Console).
    await fetchLatestReleaseCached(spec, "cache-test-tracker", "CHAVE-BETA");
    expect(chamadas).toHaveLength(3);
  });
});
