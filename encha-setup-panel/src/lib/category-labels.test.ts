import { describe, expect, it } from "vitest";
import { CATEGORY_LABELS, CATEGORY_ORDER, getCategoryLabel } from "./category-labels";

describe("getCategoryLabel", () => {
  it("resolve pt/en/es para uma categoria conhecida", () => {
    expect(getCategoryLabel("database", "pt")).toBe("Banco de dados");
    expect(getCategoryLabel("database", "en")).toBe("Database");
    expect(getCategoryLabel("database", "es")).toBe("Base de datos");
  });

  it("categoria desconhecida devolve o próprio slug (fallback, não 'undefined')", () => {
    expect(getCategoryLabel("categoria-inexistente", "en")).toBe("categoria-inexistente");
  });

  // Achado ao vivo no teste end-to-end: os 3 idiomas precisam existir pra
  // toda categoria em CATEGORY_ORDER, senão a sidebar mostra o slug cru
  // pro locale faltando.
  it("toda categoria de CATEGORY_ORDER tem os 3 idiomas preenchidos", () => {
    for (const cat of CATEGORY_ORDER) {
      const labels = CATEGORY_LABELS[cat];
      expect(labels, `categoria ${cat}`).toBeDefined();
      for (const locale of ["pt", "en", "es"] as const) {
        expect(labels[locale], `categoria ${cat} / ${locale}`).toBeTruthy();
      }
    }
  });
});
