import { afterEach, describe, expect, it, vi } from "vitest";
import { msgVersaoEmPublicacao, releasePronta } from "./release-pronta";

// fetch mockado por URL: o módulo faz 3 chamadas (HEAD do tarball da tag,
// token do ghcr e HEAD do manifesto da imagem) e cada teste decide o status
// de cada uma.
type Respostas = { tag?: number | "erro"; token?: number | "erro"; manifesto?: number | "erro" };

function mockFetch(r: Respostas) {
  const fn = vi.fn(async (url: string | URL) => {
    const u = String(url);
    const quando = u.includes("codeload.github.com") ? r.tag : u.includes("/token") ? r.token : r.manifesto;
    if (quando === "erro") throw new Error("rede fora");
    const status = quando ?? 200;
    return new Response(status === 200 && u.includes("/token") ? JSON.stringify({ token: "t" }) : null, { status });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("releasePronta", () => {
  it("tag e imagem existem → pronta", async () => {
    mockFetch({ tag: 200, token: 200, manifesto: 200 });
    expect(await releasePronta("0.3.13")).toBe("pronta");
  });

  it("tag ainda não existe (404) → em_publicacao", async () => {
    mockFetch({ tag: 404, token: 200, manifesto: 200 });
    expect(await releasePronta("0.3.13")).toBe("em_publicacao");
  });

  it("imagem ainda não existe (404 no manifesto) → em_publicacao", async () => {
    mockFetch({ tag: 200, token: 200, manifesto: 404 });
    expect(await releasePronta("0.3.13")).toBe("em_publicacao");
  });

  it("rede fora → indeterminado (nunca bloqueia)", async () => {
    mockFetch({ tag: "erro", token: "erro", manifesto: "erro" });
    expect(await releasePronta("0.3.13")).toBe("indeterminado");
  });

  it("erro de servidor (5xx/403) → indeterminado, não em_publicacao", async () => {
    mockFetch({ tag: 503, token: 200, manifesto: 403 });
    expect(await releasePronta("0.3.13")).toBe("indeterminado");
  });

  it("um lado 404 vence a dúvida do outro (rede fora na imagem, tag 404)", async () => {
    mockFetch({ tag: 404, token: "erro" });
    expect(await releasePronta("0.3.13")).toBe("em_publicacao");
  });

  it("token do ghcr sem corpo utilizável → indeterminado", async () => {
    mockFetch({ tag: 200, token: 500 });
    expect(await releasePronta("0.3.13")).toBe("indeterminado");
  });

  it("versão malformada nem chega a consultar a rede", async () => {
    const fn = mockFetch({});
    expect(await releasePronta("0.3")).toBe("indeterminado");
    expect(await releasePronta("../x")).toBe("indeterminado");
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("msgVersaoEmPublicacao", () => {
  it("traduz nos 3 idiomas e inclui a versão", () => {
    for (const l of ["pt", "en", "es"] as const) {
      expect(msgVersaoEmPublicacao("0.3.14", l)).toContain("0.3.14");
    }
    expect(msgVersaoEmPublicacao("0.3.14", "en")).toMatch(/still being published/);
  });
});
