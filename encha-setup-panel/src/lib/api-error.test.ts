import { describe, expect, it } from "vitest";
import { apiError } from "./api-error";

const ERROS = {
  campo_obrigatorio: {
    pt: "Campo obrigatório.",
    en: "Required field.",
    es: "Campo obligatorio.",
  },
} satisfies Record<string, Record<"pt" | "en" | "es", string>>;

describe("apiError", () => {
  it("resolve a mensagem no idioma pedido", async () => {
    const res = apiError(ERROS, "campo_obrigatorio", "en", 400);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "campo_obrigatorio", message: "Required field." });
  });

  it("es usa a variante espanhola", async () => {
    const res = apiError(ERROS, "campo_obrigatorio", "es", 400);
    const body = await res.json();
    expect(body.message).toBe("Campo obligatorio.");
  });

  it("aceita extra (campos adicionais no payload)", async () => {
    const res = apiError(ERROS, "campo_obrigatorio", "pt", 422, { campo: "assunto" });
    const body = await res.json();
    expect(body).toEqual({
      error: "campo_obrigatorio",
      message: "Campo obrigatório.",
      campo: "assunto",
    });
  });

  it("o código do erro é sempre o `error` — estável entre idiomas", async () => {
    const emEn = await apiError(ERROS, "campo_obrigatorio", "en", 400).json();
    const emPt = await apiError(ERROS, "campo_obrigatorio", "pt", 400).json();
    expect(emEn.error).toBe(emPt.error);
    expect(emEn.message).not.toBe(emPt.message);
  });
});
