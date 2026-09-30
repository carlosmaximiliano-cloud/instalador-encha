import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { FamiliaIp } from "@/lib/dns-check";

// GET /api/dns/verificar (ciclo painel-dns). Sessão, locale, rate limit e o
// resolvedor de sistema são mockados; dns-check é o REAL. O fetch é stubado
// com uma função ASSÍNCRONA que lança: um `.catch` na rota engoliria a
// rejeição, e só a contagem de chamadas denuncia.

type Entrada = { 4?: string[] | Error; 6?: string[] | Error };
type Tabela = Record<string, Entrada>;

const PAINEL = "painel.exemplo.com";
const DOMINIO = "tracker.exemplo.com";
const IP_PAINEL = "203.0.113.10";
const IP_FORA = "198.51.100.7";

const fetchProibido = vi.fn(async () => {
  throw new Error("rede proibida");
});

beforeEach(() => {
  vi.resetModules();
  fetchProibido.mockClear();
  vi.stubGlobal("fetch", fetchProibido);
});

afterEach(() => {
  vi.doUnmock("@/lib/session");
  vi.doUnmock("@/lib/locale");
  vi.doUnmock("@/lib/security/rate-limit");
  vi.doUnmock("@/lib/dns-resolvedor");
  vi.unstubAllGlobals();
});

function preparar(opts: { logado?: boolean; locale?: string; tabela?: Tabela; rate?: unknown[] } = {}) {
  const tabela: Tabela = opts.tabela ?? { [PAINEL]: { 4: [IP_PAINEL] } };
  const resolvedor = vi.fn(async (nome: string, familia: FamiliaIp) => {
    const v = tabela[nome]?.[familia];
    if (v === undefined) throw Object.assign(new Error("ENOTFOUND"), { code: "ENOTFOUND" });
    if (v instanceof Error) throw v;
    return v;
  });
  const criarResolvedorDoSistema = vi.fn(() => resolvedor);
  const checkRateLimit = vi.fn();
  for (const r of opts.rate ?? [{ allowed: true, remaining: 29, resetMs: 60000 }]) {
    checkRateLimit.mockReturnValueOnce(r);
  }
  vi.doMock("@/lib/session", () => ({
    readSession: vi.fn(async () => (opts.logado === false ? null : { user: "tester" })),
  }));
  vi.doMock("@/lib/locale", () => ({ resolveLocale: vi.fn(async () => opts.locale ?? "pt") }));
  vi.doMock("@/lib/security/rate-limit", () => ({ checkRateLimit }));
  vi.doMock("@/lib/dns-resolvedor", () => ({ criarResolvedorDoSistema }));
  return { resolvedor, criarResolvedorDoSistema, checkRateLimit };
}

function pedido(dominio: string | null, headers: Record<string, string> = { host: PAINEL }) {
  const url =
    dominio === null
      ? "http://localhost:3000/api/dns/verificar"
      : `http://localhost:3000/api/dns/verificar?dominio=${encodeURIComponent(dominio)}`;
  return new NextRequest(url, { headers });
}

async function chamar(dominio: string | null, headers?: Record<string, string>) {
  const { GET } = await import("./route");
  return GET(pedido(dominio, headers));
}

describe("GET /api/dns/verificar", () => {
  it("R1 sem sessão: 401, sem rate limit e sem resolver nada", async () => {
    const { resolvedor, criarResolvedorDoSistema, checkRateLimit } = preparar({ logado: false });
    const res = await chamar(DOMINIO);
    expect(res.status).toBe(401);
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(criarResolvedorDoSistema).not.toHaveBeenCalled();
    expect(resolvedor).not.toHaveBeenCalled();
  });

  it("R2 rate limit: chave por usuário, 30 por minuto; estourado dá 429 sem resolver nada", async () => {
    const { resolvedor, checkRateLimit } = preparar({
      tabela: { [PAINEL]: { 4: [IP_PAINEL] }, [DOMINIO]: { 4: [IP_PAINEL] } },
      rate: [
        { allowed: true, remaining: 29, resetMs: 60000 },
        { allowed: false, remaining: 0, resetMs: 1000 },
      ],
    });

    const primeira = await chamar(DOMINIO);
    expect(primeira.status).toBe(200);
    expect(checkRateLimit).toHaveBeenNthCalledWith(1, "dns.verificar:tester", 30, 60000);

    resolvedor.mockClear();
    const segunda = await chamar(DOMINIO);
    expect(segunda.status).toBe(429);
    expect((await segunda.json()).error).toBe("muitas_tentativas");
    expect(resolvedor).not.toHaveBeenCalled();
  });

  it.each([
    ["vazio", ""],
    ["exemplo", "exemplo"],
    ["1.2.3.4", "1.2.3.4"],
    ["a..b.com", "a..b.com"],
    ["http://x.com", "http://x.com"],
    ["x.com/caminho", "x.com/caminho"],
    ["x.com:443", "x.com:443"],
    ["localhost", "localhost"],
    ["-a.exemplo.com", "-a.exemplo.com"],
    ["sem o parâmetro", null],
  ] as [string, string | null][])(
    "R3 domínio malformado (%s): 400 dominio_invalido no idioma da requisição, sem resolver",
    async (_nome, dominio) => {
      const { resolvedor } = preparar({ locale: "en" });
      const res = await chamar(dominio);
      expect(res.status).toBe(400);
      const corpo = await res.json();
      expect(corpo.error).toBe("dominio_invalido");
      expect(corpo.message).toBe("Invalid domain");
      expect(resolvedor).not.toHaveBeenCalled();
    }
  );

  it("R4 responde só o estado, sem cache e sem nenhum IP", async () => {
    preparar({ tabela: { [PAINEL]: { 4: [IP_PAINEL] }, [DOMINIO]: { 4: [IP_FORA] } } });
    const res = await chamar(DOMINIO);
    const texto = await res.clone().text();
    expect(await res.json()).toEqual({ estado: "nao_aponta" });
    expect(texto).not.toContain(IP_PAINEL);
    expect(texto).not.toContain(IP_FORA);
    expect(res.headers.get("Cache-Control")).toBe("no-store");

    vi.resetModules();
    preparar({ tabela: { [PAINEL]: { 4: [IP_PAINEL] }, [DOMINIO]: { 4: [IP_PAINEL] } } });
    const res2 = await chamar(DOMINIO);
    expect(await res2.json()).toEqual({ estado: "aponta" });
  });

  it("R5 host do painel vem do cabeçalho Host: X-Forwarded-Host e a URL são ignorados", async () => {
    const { resolvedor } = preparar({
      tabela: {
        [PAINEL]: { 4: [IP_PAINEL] },
        "outro.exemplo.com": { 4: [IP_FORA] },
        [DOMINIO]: { 4: [IP_PAINEL] },
      },
    });
    const res = await chamar(DOMINIO, { host: PAINEL, "x-forwarded-host": "outro.exemplo.com" });
    expect(await res.json()).toEqual({ estado: "aponta" });
    const nomes = resolvedor.mock.calls.map((c) => c[0]);
    expect(nomes).not.toContain("outro.exemplo.com");
    expect(nomes).not.toContain("localhost");
  });

  it("R6 host do painel é IP: indeterminado, sem resolver nada", async () => {
    const { resolvedor } = preparar({ tabela: { [DOMINIO]: { 4: [IP_PAINEL] } } });
    const res = await chamar(DOMINIO, { host: "31.97.144.25" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ estado: "indeterminado" });
    expect(resolvedor).not.toHaveBeenCalled();
  });

  it("R7 nunca abre conexão: fetch não é chamado e o resolvedor só vê o domínio e o host do painel", async () => {
    const { resolvedor } = preparar({
      tabela: { [PAINEL]: { 4: [IP_PAINEL] }, [DOMINIO]: { 4: [IP_PAINEL] } },
    });
    const res = await chamar(DOMINIO);
    expect(res.status).toBe(200);
    expect(new Set(resolvedor.mock.calls.map((c) => c[0]))).toEqual(new Set([DOMINIO, PAINEL]));
    expect(fetchProibido).toHaveBeenCalledTimes(0);
  });

  it("R8 cancela as consultas em voo do resolvedor depois de responder (painel-higiene)", async () => {
    const { resolvedor } = preparar({
      tabela: { [PAINEL]: { 4: [IP_PAINEL] }, [DOMINIO]: { 4: [IP_PAINEL] } },
    });
    const cancelar = vi.fn();
    Object.assign(resolvedor, { cancelar });

    const res = await chamar(DOMINIO);

    expect(await res.json()).toEqual({ estado: "aponta" });
    expect(cancelar).toHaveBeenCalledTimes(1);
  });
});
