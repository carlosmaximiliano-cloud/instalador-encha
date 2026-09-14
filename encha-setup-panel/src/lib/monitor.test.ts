import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function respostaFalsa(status: number, corpo?: unknown): Response {
  return new Response(corpo === undefined ? undefined : JSON.stringify(corpo), {
    status,
    headers: corpo === undefined ? {} : { "Content-Type": "application/json" },
  });
}

// monitor.ts lê MONITOR_BASE_URL no top-level (module scope) — precisa
// resetar o registro de módulos entre casos pra cada teste poder controlar
// o env antes do import, e reimportar depois de cada mock de fetch (o cache
// de termos é module-level e vazaria entre testes senão).
async function importMonitor() {
  vi.resetModules();
  process.env.MONITOR_BASE_URL = "https://monitor.exemplo.com";
  return import("./monitor");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLatestVersion — dimensão de idioma", () => {
  it("sem locale não manda ?lang (retrocompat — Monitor default pt)", async () => {
    let urlChamada = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urlChamada = url;
        return respostaFalsa(200, { latest_version: "0.3.0" });
      })
    );
    const { fetchLatestVersion } = await importMonitor();
    await fetchLatestVersion();
    expect(urlChamada).not.toContain("lang=");
  });

  it("com locale='en' manda ?lang=en", async () => {
    let urlChamada = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urlChamada = url;
        return respostaFalsa(200, { latest_version: "0.3.0" });
      })
    );
    const { fetchLatestVersion } = await importMonitor();
    await fetchLatestVersion("en");
    expect(urlChamada).toContain("lang=en");
  });
});

describe("fetchBanner — dimensão de idioma", () => {
  it("locale='es' vira &lang=es preservando o position", async () => {
    let urlChamada = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urlChamada = url;
        return respostaFalsa(204);
      })
    );
    const { fetchBanner } = await importMonitor();
    await fetchBanner("sidebar", "es");
    expect(urlChamada).toContain("position=sidebar");
    expect(urlChamada).toContain("lang=es");
  });
});

describe("fetchTerms — dimensão de idioma e cache por locale", () => {
  it("locale='en' manda ?lang=en", async () => {
    let urlChamada = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urlChamada = url;
        return respostaFalsa(200, { version: "3", content_md: "# Terms" });
      })
    );
    const { fetchTerms } = await importMonitor();
    await fetchTerms("en");
    expect(urlChamada).toContain("lang=en");
  });

  // Mutação óbvia se o cache não for indexado por locale: a primeira
  // chamada (pt) esconderia o conteúdo de 'en' pelos próximos 60s.
  it("cache é por locale — pt em cache não esconde en", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("lang=en")) {
        return respostaFalsa(200, { version: "3", content_md: "# Terms EN" });
      }
      return respostaFalsa(200, { version: "3", content_md: "# Termos PT" });
    });
    vi.stubGlobal("fetch", fetchMock);
    const { fetchTerms } = await importMonitor();

    const pt = await fetchTerms();
    const en = await fetchTerms("en");

    expect(pt?.content_md).toBe("# Termos PT");
    expect(en?.content_md).toBe("# Terms EN");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("segunda chamada com o MESMO locale usa o cache (não refaz o fetch)", async () => {
    const fetchMock = vi.fn(async () =>
      respostaFalsa(200, { version: "3", content_md: "# Terms EN" })
    );
    vi.stubGlobal("fetch", fetchMock);
    const { fetchTerms } = await importMonitor();

    await fetchTerms("en");
    await fetchTerms("en");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
