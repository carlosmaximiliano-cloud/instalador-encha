import { describe, expect, it } from "vitest";
import { criarResolvedorDoSistema } from "./dns-resolvedor";

// Classe falsa no lugar de node:dns Resolver: guarda as opções do construtor
// e conta as chamadas a resolve4/resolve6.
function classeFalsa() {
  const estado = { opts: [] as { timeout: number; tries: number }[], resolve4: [] as string[], resolve6: [] as string[] };
  class Falsa {
    constructor(opts: { timeout: number; tries: number }) {
      estado.opts.push(opts);
    }
    async resolve4(nome: string) {
      estado.resolve4.push(nome);
      return ["203.0.113.10"];
    }
    async resolve6(nome: string) {
      estado.resolve6.push(nome);
      return ["2001:db8::10"];
    }
  }
  return { Falsa, estado };
}

describe("criarResolvedorDoSistema", () => {
  it("A1 família 4 consulta A com resolve4 e família 6 consulta AAAA com resolve6", async () => {
    const { Falsa, estado } = classeFalsa();
    const resolver = criarResolvedorDoSistema(Falsa);

    expect(await resolver("tracker.exemplo.com", 4)).toEqual(["203.0.113.10"]);
    expect(estado.resolve4).toEqual(["tracker.exemplo.com"]);
    expect(estado.resolve6).toEqual([]);

    expect(await resolver("tracker.exemplo.com", 6)).toEqual(["2001:db8::10"]);
    expect(estado.resolve4).toEqual(["tracker.exemplo.com"]);
    expect(estado.resolve6).toEqual(["tracker.exemplo.com"]);
  });

  it("A2 timeout curto e uma tentativa só", () => {
    const { Falsa, estado } = classeFalsa();
    criarResolvedorDoSistema(Falsa);

    expect(estado.opts).toHaveLength(1);
    const [opts] = estado.opts;
    expect(opts.timeout).toBeLessThanOrEqual(2000);
    expect(opts.timeout).toBeGreaterThan(0);
    expect(opts.tries).toBe(1);
  });

  it("A3 cancelar chama cancel() do Resolver criado (painel-higiene)", () => {
    const estado = { instancias: 0, cancelamentos: 0 };
    class ComCancel {
      constructor() {
        estado.instancias += 1;
      }
      async resolve4() {
        return [];
      }
      async resolve6() {
        return [];
      }
      cancel() {
        estado.cancelamentos += 1;
      }
    }
    const resolver = criarResolvedorDoSistema(ComCancel);
    expect(estado.cancelamentos).toBe(0);

    resolver.cancelar();

    expect(estado.instancias).toBe(1);
    expect(estado.cancelamentos).toBe(1);
  });
});
