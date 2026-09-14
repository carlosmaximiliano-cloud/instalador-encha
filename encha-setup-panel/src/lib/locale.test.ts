import { describe, expect, it } from "vitest";
import { parseAcceptLanguage, readInstallLocale, htmlLang } from "./locale";
import { isLocale, toBcp47 } from "./locale-shared";

// Cobre a resolução de idioma da Fase 1 (i18n/GLOSSARY.md) — as partes puras
// de locale.ts. resolveLocale() em si (que usa cookies()/headers() do Next)
// não é testada aqui: precisa de um request context de verdade, coberto por
// build/smoke test manual em VPS, não por unit test.

describe("isLocale / toBcp47 / htmlLang", () => {
  it("aceita só pt/en/es", () => {
    expect(isLocale("pt")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale("")).toBe(false);
  });

  it("pt-BR (não pt genérico) e es-419 (neutro/LatAm, não es-ES)", () => {
    expect(toBcp47("pt")).toBe("pt-BR");
    expect(toBcp47("en")).toBe("en-US");
    expect(toBcp47("es")).toBe("es-419");
  });

  it("htmlLang delega para toBcp47", () => {
    expect(htmlLang("pt")).toBe("pt-BR");
    expect(htmlLang("es")).toBe("es-419");
  });
});

describe("parseAcceptLanguage", () => {
  it("pega o primeiro idioma suportado, ignorando q-values", () => {
    expect(parseAcceptLanguage("en-US,en;q=0.9,pt-BR;q=0.8")).toBe("en");
  });

  it("pt-BR no header vira 'pt' (primeiros 2 chars)", () => {
    expect(parseAcceptLanguage("pt-BR,pt;q=0.9")).toBe("pt");
  });

  it("es-ES vira 'es' (neutro — não distinguimos variante no Accept-Language)", () => {
    expect(parseAcceptLanguage("es-ES,es;q=0.9")).toBe("es");
  });

  it("idioma não suportado (ex.: francês) devolve null, não quebra", () => {
    expect(parseAcceptLanguage("fr-FR,fr;q=0.9,de;q=0.8")).toBe(null);
  });

  it("header ausente devolve null", () => {
    expect(parseAcceptLanguage(null)).toBe(null);
    expect(parseAcceptLanguage("")).toBe(null);
  });

  it("pula idiomas não suportados até achar um suportado", () => {
    expect(parseAcceptLanguage("fr-FR,de;q=0.9,en;q=0.8")).toBe("en");
  });
});

describe("readInstallLocale", () => {
  it("sem VPS_CONTEXT_DIR configurado (ou arquivo ausente) devolve null, não lança", () => {
    // CTX_DIR default é /app/vps-context, que não existe neste ambiente de
    // teste — cobre exatamente o caminho "instalação anterior à Fase 1".
    expect(readInstallLocale()).toBe(null);
  });
});
