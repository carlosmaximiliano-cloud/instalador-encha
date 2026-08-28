import { describe, expect, it } from "vitest";
import { ALL_STACKS, STACKS_BY_ID, getStack } from "./registry";

// Ciclo 20 (mutação M6): antes deste teste, NENHUMA checagem de unicidade
// existia — um `id` duplicado sobrescreveria silenciosamente a entrada
// anterior em STACKS_BY_ID (Object.fromEntries), e um `optionNumber`
// duplicado não tinha checagem nenhuma em lugar algum. Protege as stacks
// já em produção, não só a encha-tracker deste ciclo.
describe("ALL_STACKS — unicidade", () => {
  it("todo id é único", () => {
    const ids = ALL_STACKS.map((s) => s.id);
    const vistos = new Set<string>();
    const duplicados: string[] = [];
    for (const id of ids) {
      if (vistos.has(id)) duplicados.push(id);
      vistos.add(id);
    }
    expect(duplicados).toEqual([]);
  });

  it("todo optionNumber é único", () => {
    const numeros = ALL_STACKS.map((s) => s.optionNumber);
    const vistos = new Set<number>();
    const duplicados: number[] = [];
    for (const n of numeros) {
      if (vistos.has(n)) duplicados.push(n);
      vistos.add(n);
    }
    expect(duplicados).toEqual([]);
  });

  it("STACKS_BY_ID tem exatamente uma entrada por id declarado", () => {
    expect(Object.keys(STACKS_BY_ID).length).toBe(ALL_STACKS.length);
  });
});

describe("encha-tracker está registrada", () => {
  it("getStack('encha-tracker') devolve a definição", () => {
    const def = getStack("encha-tracker");
    expect(def).toBeDefined();
    expect(def?.name).toBe("Encha Tracker");
  });

  it("optionNumber é 86 (84 e 85 já usados por outras stacks — ver a checagem de unicidade acima)", () => {
    expect(getStack("encha-tracker")?.optionNumber).toBe(86);
  });
});
