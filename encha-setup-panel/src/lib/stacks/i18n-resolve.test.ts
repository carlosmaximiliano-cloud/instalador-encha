import { describe, expect, it } from "vitest";
import { z } from "zod";
import { stackDescription, stackFieldText, stackNotes, secretLabel } from "./i18n-resolve";
import type { StackDefinition } from "./types";

const base: StackDefinition = {
  id: "teste",
  name: "Teste",
  description: "Descrição em português.",
  category: "database",
  icon: "database",
  dependsOn: [],
  optionNumber: 1,
  fields: [
    { name: "dominio", label: "Domínio", kind: "domain", placeholder: "ex.com", helpText: "Ajuda", group: "Domínios" },
    { name: "sem_overlay", label: "Sem tradução", kind: "text" },
  ],
  schema: z.object({}),
  generateYaml: () => "",
  postInstall: { notes: ["Nota 1", "Nota 2"] },
};

const comOverlay: StackDefinition = {
  ...base,
  i18n: {
    en: {
      description: "Description in English.",
      fields: { dominio: { label: "Domain", placeholder: "ex.com", helpText: "Help", group: "Domains" } },
      notes: ["Note 1", "Note 2"],
      secretLabels: { chave: "Key" },
    },
    es: {
      description: "Descripción en español.",
    },
  },
};

describe("stackDescription", () => {
  it("pt sempre devolve o original, mesmo com overlay presente", () => {
    expect(stackDescription(comOverlay, "pt")).toBe("Descrição em português.");
  });
  it("en usa o overlay quando existe", () => {
    expect(stackDescription(comOverlay, "en")).toBe("Description in English.");
  });
  it("es usa o overlay parcial (só description, sem fields/notes)", () => {
    expect(stackDescription(comOverlay, "es")).toBe("Descripción en español.");
  });
  it("sem overlay nenhum, qualquer locale cai no pt-BR", () => {
    expect(stackDescription(base, "en")).toBe("Descrição em português.");
    expect(stackDescription(base, "es")).toBe("Descrição em português.");
  });
});

describe("stackFieldText", () => {
  it("pt sempre usa o field original", () => {
    const r = stackFieldText(comOverlay, comOverlay.fields[0], "pt");
    expect(r).toEqual({ label: "Domínio", placeholder: "ex.com", helpText: "Ajuda", group: "Domínios" });
  });
  it("en usa o overlay do campo pelo name", () => {
    const r = stackFieldText(comOverlay, comOverlay.fields[0], "en");
    expect(r).toEqual({ label: "Domain", placeholder: "ex.com", helpText: "Help", group: "Domains" });
  });
  it("campo sem overlay (mesmo com a stack tendo overlay pra outros campos) cai no pt-BR", () => {
    const r = stackFieldText(comOverlay, comOverlay.fields[1], "en");
    expect(r).toEqual({ label: "Sem tradução", placeholder: undefined, helpText: undefined, group: undefined });
  });
});

describe("stackNotes", () => {
  it("pt sempre resolve as notes originais (estáticas)", () => {
    expect(stackNotes(comOverlay, "pt", {})).toEqual(["Nota 1", "Nota 2"]);
  });
  it("en usa o overlay quando o tamanho bate com o pt-BR resolvido", () => {
    expect(stackNotes(comOverlay, "en", {})).toEqual(["Note 1", "Note 2"]);
  });
  it("es sem overlay de notes cai no pt-BR", () => {
    expect(stackNotes(comOverlay, "es", {})).toEqual(["Nota 1", "Nota 2"]);
  });
  it("notes dinâmica (função) é resolvida com `values` antes de comparar tamanho", () => {
    const dinamica: StackDefinition = {
      ...base,
      postInstall: { notes: (v) => (v.ativo ? ["A", "B", "C"] : ["A"]) },
      i18n: { en: { notes: ["A-en", "B-en", "C-en"] } },
    };
    expect(stackNotes(dinamica, "en", { ativo: true })).toEqual(["A-en", "B-en", "C-en"]);
    // tamanho não bate (1 vs 3) -> cai no pt-BR resolvido pra esses values
    expect(stackNotes(dinamica, "en", { ativo: false })).toEqual(["A"]);
  });
});

describe("secretLabel", () => {
  it("pt sempre devolve o fallback original", () => {
    expect(secretLabel(comOverlay, "chave", "Chave", "pt")).toBe("Chave");
  });
  it("en usa o overlay pelo nome do segredo", () => {
    expect(secretLabel(comOverlay, "chave", "Chave", "en")).toBe("Key");
  });
  it("segredo sem overlay cai no fallback (inclusive undefined)", () => {
    expect(secretLabel(comOverlay, "outro", undefined, "en")).toBe(undefined);
    expect(secretLabel(comOverlay, "outro", "Outro", "en")).toBe("Outro");
  });
});
