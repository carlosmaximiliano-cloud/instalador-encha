import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  dominioValido,
  hostDoPainel,
  verificarDns,
  type ResolvedorDns,
} from "./dns-check";
import { fqdn } from "./stacks/types";

// Ciclo painel-dns: a regra de estado do aviso de DNS. Resolvedor falso por
// tabela; nada de rede. Endereços de documentação: 203.0.113.0/24,
// 198.51.100.0/24 e 2001:db8::/32.

type Entrada = { 4?: string[] | Error; 6?: string[] | Error };

const erroCom = (code: string) => Object.assign(new Error(code), { code });

/** Nome ou família ausente rejeita com ENOTFOUND. */
function resolvedorDe(tabela: Record<string, Entrada>) {
  return vi.fn<ResolvedorDns>(async (nome, familia) => {
    const v = tabela[nome]?.[familia];
    if (v === undefined) throw erroCom("ENOTFOUND");
    if (v instanceof Error) throw v;
    return v;
  });
}

const PAINEL = "painel.exemplo.com";
const DOMINIO = "tracker.exemplo.com";
const IP_PAINEL = "203.0.113.10";
const IP_FORA = "198.51.100.7";

const estado = (tabela: Record<string, Entrada>, dominio = DOMINIO, host: string | null = PAINEL) =>
  verificarDns({ dominio, hostPainel: host, resolvedor: resolvedorDe(tabela) });

describe("dns-check — estado por endereços", () => {
  it("D1 nao_resolve: NXDOMAIN ou sem registro nas duas famílias", async () => {
    const painel = { [PAINEL]: { 4: [IP_PAINEL] } };
    // ENOTFOUND nas duas (nome ausente da tabela).
    expect(await estado(painel)).toBe("nao_resolve");
    // ENODATA no A e ENOTFOUND no AAAA.
    expect(await estado({ ...painel, [DOMINIO]: { 4: erroCom("ENODATA"), 6: erroCom("ENOTFOUND") } })).toBe(
      "nao_resolve"
    );
  });

  it("D2 aponta: todo endereço do domínio está no conjunto do painel", async () => {
    // A igual.
    expect(await estado({ [PAINEL]: { 4: [IP_PAINEL] }, [DOMINIO]: { 4: [IP_PAINEL] } })).toBe("aponta");
    // O domínio só com A, o painel com A + AAAA (caso comum e correto).
    expect(
      await estado({ [PAINEL]: { 4: [IP_PAINEL], 6: ["2001:db8::10"] }, [DOMINIO]: { 4: [IP_PAINEL] } })
    ).toBe("aponta");
    // O domínio com dois A, ambos do painel.
    expect(
      await estado({
        [PAINEL]: { 4: [IP_PAINEL, "203.0.113.11"] },
        [DOMINIO]: { 4: ["203.0.113.11", IP_PAINEL] },
      })
    ).toBe("aponta");
  });

  it("D3 nao_aponta: um endereço do domínio fora do painel", async () => {
    expect(await estado({ [PAINEL]: { 4: [IP_PAINEL] }, [DOMINIO]: { 4: [IP_PAINEL, IP_FORA] } })).toBe(
      "nao_aponta"
    );
  });

  it("D4 IPv6: AAAA do domínio fora do painel dá nao_aponta mesmo com o A certo", async () => {
    expect(
      await estado({
        [PAINEL]: { 4: [IP_PAINEL], 6: ["2001:db8::10"] },
        [DOMINIO]: { 4: [IP_PAINEL], 6: ["2001:db8::99"] },
      })
    ).toBe("nao_aponta");
  });

  it("D5 IPv6: só AAAA, igual ao do painel em outra grafia, dá aponta", async () => {
    expect(
      await estado({
        [PAINEL]: { 6: ["2001:db8::10"] },
        [DOMINIO]: { 4: erroCom("ENODATA"), 6: ["2001:DB8:0:0:0:0:0:10"] },
      })
    ).toBe("aponta");
  });

  it("D6 indeterminado sem resolver nada: host do painel é IP, IPv6 literal, localhost, vazio ou nulo", async () => {
    const hosts: (string | null)[] = [
      "31.97.144.25",
      "31.97.144.25:443",
      "[2001:db8::1]:443",
      "2001:db8::1",
      "localhost",
      "localhost:3000",
      "",
      null,
    ];
    for (const host of hosts) {
      const resolvedor = vi.fn<ResolvedorDns>(async () => [IP_PAINEL]);
      const r = await verificarDns({ dominio: DOMINIO, hostPainel: host, resolvedor });
      expect(r, `host ${JSON.stringify(host)}`).toBe("indeterminado");
      expect(resolvedor, `host ${JSON.stringify(host)}`).not.toHaveBeenCalled();
    }
  });

  it("D7 indeterminado: host do painel não resolve ou falha", async () => {
    // O host com ENOTFOUND nas duas famílias (nome ausente).
    expect(await estado({ [DOMINIO]: { 4: [IP_PAINEL] } })).toBe("indeterminado");
    // O host com A certo e AAAA ETIMEOUT.
    expect(
      await estado({ [PAINEL]: { 4: [IP_PAINEL], 6: erroCom("ETIMEOUT") }, [DOMINIO]: { 4: [IP_PAINEL] } })
    ).toBe("indeterminado");
  });

  it("D8 indeterminado: falha não definitiva no domínio", async () => {
    const painel = { [PAINEL]: { 4: [IP_PAINEL] } };
    const casos: Record<string, Entrada> = {
      "A ETIMEOUT e AAAA ENODATA": { 4: erroCom("ETIMEOUT"), 6: erroCom("ENODATA") },
      "A ESERVFAIL e AAAA ESERVFAIL": { 4: erroCom("ESERVFAIL"), 6: erroCom("ESERVFAIL") },
      "A certo e AAAA ETIMEOUT": { 4: [IP_PAINEL], 6: erroCom("ETIMEOUT") },
      "erro sem code": { 4: new Error("boom"), 6: new Error("boom") },
    };
    for (const [nome, entrada] of Object.entries(casos)) {
      expect(await estado({ ...painel, [DOMINIO]: entrada }), nome).toBe("indeterminado");
    }
  });

  it("D9 limite de tempo: resolvedor que nunca responde dá indeterminado", async () => {
    const t0 = Date.now();
    const r = await verificarDns({
      dominio: DOMINIO,
      hostPainel: PAINEL,
      resolvedor: () => new Promise(() => {}),
      limiteMs: 50,
    });
    expect(r).toBe("indeterminado");
    expect(Date.now() - t0).toBeLessThan(1000);
  });

  it("D10 hostDoPainel tira porta e ponto final e recusa IP", () => {
    expect(hostDoPainel("Painel.Exemplo.com:443")).toBe("painel.exemplo.com");
    expect(hostDoPainel("painel.exemplo.com.")).toBe("painel.exemplo.com");
    expect(hostDoPainel("31.97.144.25")).toBeNull();
    expect(hostDoPainel("[::1]:3000")).toBeNull();
  });

  it("D11 dominioValido é o fqdn do servidor, sonda por sonda", () => {
    const de254 = ("a".repeat(61) + ".").repeat(4) + "abcdef";
    expect(de254).toHaveLength(254);
    const sondas: unknown[] = [
      "tracker.exemplo.com",
      "TRACKER.Exemplo.COM",
      "a.bc",
      "exemplo",
      "1.2.3.4",
      "localhost",
      "a..b.com",
      "-a.exemplo.com",
      "tracker.exemplo.com.",
      " tracker.exemplo.com",
      "http://x.com",
      "x.com/p",
      "x.com:443",
      "",
      "a".repeat(63) + ".com",
      "a".repeat(64) + ".com",
      de254,
      123,
      null,
      undefined,
    ];
    for (const s of sondas) {
      expect(dominioValido(s), `sonda ${JSON.stringify(s)}`).toBe(fqdn.safeParse(s).success);
    }
    expect(dominioValido("tracker.exemplo.com")).toBe(true);
    expect(dominioValido("1.2.3.4")).toBe(false);
  });

  it("D12 domínio malformado nunca chega ao resolvedor", async () => {
    for (const dominio of ["a..b.com", "1.2.3.4", ""]) {
      const resolvedor = vi.fn<ResolvedorDns>(async () => [IP_PAINEL]);
      const r = await verificarDns({ dominio, hostPainel: PAINEL, resolvedor });
      expect(r, dominio).toBe("indeterminado");
      expect(resolvedor, dominio).not.toHaveBeenCalled();
    }
  });
});

describe("dns-check — cancela as consultas em voo (painel-higiene)", () => {
  it("D14 prazo estourado: cancelar é chamado uma vez e encerra as quatro consultas pendentes", async () => {
    const pendentes: Array<(e: Error) => void> = [];
    const resolvedor = vi.fn<ResolvedorDns>(
      () => new Promise<string[]>((_resolve, reject) => void pendentes.push(reject))
    );
    const cancelar = vi.fn(() => {
      for (const rejeitar of pendentes) rejeitar(erroCom("ECANCELLED"));
    });

    const r = await verificarDns({ dominio: DOMINIO, hostPainel: PAINEL, resolvedor, cancelar, limiteMs: 50 });

    expect(r).toBe("indeterminado");
    expect(pendentes).toHaveLength(4);
    expect(cancelar).toHaveBeenCalledTimes(1);
  });

  it("D15 consulta que termina antes do prazo: cancelar é chamado uma vez, só depois das quatro respostas, e o estado não muda", async () => {
    const tabela = resolvedorDe({
      [PAINEL]: { 4: [IP_PAINEL] },
      [DOMINIO]: { 4: [IP_PAINEL] },
    });
    let respondidas = 0;
    const resolvedor: ResolvedorDns = async (nome, familia) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      try {
        return await tabela(nome, familia);
      } finally {
        respondidas += 1;
      }
    };
    let respondidasNoCancelar = -1;
    const cancelar = vi.fn(() => {
      respondidasNoCancelar = respondidas;
    });

    const r = await verificarDns({ dominio: DOMINIO, hostPainel: PAINEL, resolvedor, cancelar });

    expect(r).toBe("aponta");
    expect(cancelar).toHaveBeenCalledTimes(1);
    expect(respondidasNoCancelar).toBe(4);
  });

  it("D16 cancelar que lança não muda o estado", async () => {
    const cancelar = vi.fn(() => {
      throw new Error("falha ao cancelar");
    });
    const resolvedor = resolvedorDe({
      [PAINEL]: { 4: [IP_PAINEL] },
      [DOMINIO]: { 4: [IP_PAINEL] },
    });

    const r = await verificarDns({ dominio: DOMINIO, hostPainel: PAINEL, resolvedor, cancelar });

    expect(r).toBe("aponta");
    expect(cancelar).toHaveBeenCalledTimes(1);
  });
});

describe("dns-check — sem rede além de DNS", () => {
  const ARQUIVOS: Record<string, string[]> = {
    "dns-check.ts": ["./stacks/types", "@/lib/stacks/types"],
    "dns-resolvedor.ts": ["node:dns/promises", "./dns-check", "@/lib/dns-check"],
    "../app/api/dns/verificar/route.ts": [
      "next/server",
      "@/lib/session",
      "@/lib/security/rate-limit",
      "@/lib/locale",
      "@/lib/locale-shared",
      "@/lib/api-error",
      "@/lib/dns-check",
      "@/lib/dns-resolvedor",
    ],
  };

  it("D13 sem rede além de DNS: imports permitidos e nenhum fetch nos três arquivos", () => {
    for (const [arquivo, permitidos] of Object.entries(ARQUIVOS)) {
      const fonte = readFileSync(join(__dirname, arquivo), "utf8");
      const codigo = fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "");

      const origens = [...codigo.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']/gm)].map(
        (m) => m[1]
      );
      expect(origens.length, arquivo).toBeGreaterThan(0);
      for (const origem of origens) {
        expect(permitidos, `${arquivo}: import de "${origem}"`).toContain(origem);
      }
      // Import de efeito, require e import dinâmico também não.
      expect(codigo, arquivo).not.toMatch(/^\s*import\s*["']/m);
      expect(codigo, arquivo).not.toMatch(/\brequire\s*\(/);
      expect(codigo, arquivo).not.toMatch(/\bimport\s*\(/);

      expect(codigo, arquivo).not.toMatch(/\bfetch\s*\(/);
      expect(codigo, arquivo).not.toMatch(/https?:\/\//);
      expect(codigo, arquivo).not.toMatch(/XMLHttpRequest|WebSocket|icanhazip|ipify/);
    }
  });
});
