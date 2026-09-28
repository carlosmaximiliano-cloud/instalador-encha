import { describe, expect, it } from "vitest";
import { ehAtualizacaoPorVersao, RebaixamentoRecusadoError, tagDaImagem } from "./ordem-versao";

describe("tagDaImagem", () => {
  it("última ':' depois da última '/', sem digest", () => {
    expect(tagDaImagem("ghcr.io/cheiodecoisa/encha-tracker:1.2.1")).toBe("1.2.1");
    expect(tagDaImagem("ghcr.io/cheiodecoisa/encha-tracker:1.2.1@sha256:abc123")).toBe("1.2.1");
    expect(tagDaImagem("localhost:5000/encha-tracker:1.2.1")).toBe("1.2.1");
    expect(tagDaImagem("localhost:5000/encha-tracker")).toBeNull();
    expect(tagDaImagem("ghcr.io/cheiodecoisa/encha-tracker")).toBeNull();
    expect(tagDaImagem("ghcr.io/cheiodecoisa/encha-tracker:")).toBeNull();
    expect(tagDaImagem("redis:8-alpine")).toBe("8-alpine");
    expect(tagDaImagem("")).toBeNull();
  });
});

describe("ehAtualizacaoPorVersao", () => {
  const R = "ghcr.io/cheiodecoisa/encha-tracker";

  it.each([
    [`${R}:1.2.0`, `${R}:1.2.1`, true],
    [`${R}:1.9.0`, `${R}:1.10.0`, true], // número, não texto
    [`${R}:1.2.1`, `${R}:1.2.1`, false], // igual
    [`${R}:1.2.1`, `${R}:1.2.0`, false], // menor
    [`${R}:1.3.31`, `${R}:1.2.1`, false], // beta acima da estável: o caso do Ciclo 65
    [`${R}:latest`, `${R}:1.2.1`, false], // instalada ilegível
    [`${R}:1.2.0`, `${R}:latest`, false], // alvo ilegível
    [R, `${R}:1.2.1`, false], // instalada sem tag
    [`${R}:v1.2.0`, `${R}:1.2.1`, false],
    [`${R}:1.2.0-beta.3`, `${R}:1.2.1`, false],
    ["ghcr.io/outro/encha-tracker:1.2.0", `${R}:1.2.1`, true], // o repositório não entra na conta
  ])("só alvo estritamente maior e legível dos dois lados: %s -> %s => %s", (atual, alvo, esperado) => {
    expect(ehAtualizacaoPorVersao(atual, alvo)).toBe(esperado);
  });
});

describe("RebaixamentoRecusadoError", () => {
  it("carrega o código e os serviços", () => {
    const err = new RebaixamentoRecusadoError([
      { servico: "s_app", atual: "a:1.2.0", alvo: "a:1.1.0" },
      { servico: "s_updater", atual: "b:1.2.0", alvo: "b:1.1.0" },
    ]);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("RebaixamentoRecusadoError");
    expect(err.codigo).toBe("rebaixamento_recusado");
    expect(err.recusados.length).toBe(2);
    expect(err.message).toContain("s_app");
    expect(err.message).toContain("s_updater");
  });
});
