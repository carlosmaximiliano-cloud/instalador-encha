import { describe, expect, it } from "vitest";
import { errosDeCampoDoServidor } from "../validacao-campos";
import { unoapi } from "./unoapi";

// Ciclo painel-higiene. A mensagem padrão do zod para enum ("Invalid enum
// value. Expected 'true' | 'false', received '<valor>'") REPETE o valor
// digitado, e como os campos op_* não têm `regra`, errosDeCampoDoServidor a
// devolvia como está — contra a promessa de nunca incluir o valor recebido.

const VALIDOS: Record<string, unknown> = {
  url_unoapi: "unoapi.exemplo.com",
  url_chatwoot_uno: "chatwoot.exemplo.com",
  token_chatwoot_uno: "token-chatwoot",
  op_1: "true",
  op_2: "false",
  op_3: "true",
  op_4: "false",
  op_5: "true",
  op_6: "false",
  url_s3: "s3.exemplo.com",
  s3_access_key: "acesso",
  s3_secret_key: "segredo",
  user_rabbit_mqs: "rabbit",
  senha_rabbit_mqs: "senha-rabbit",
};
const MARCADOR = "SIM-MARCADOR-7f3a";
const MENSAGEM = 'Use "true" ou "false"';

describe("unoapi — campos booleanos em texto", () => {
  it("UN1 true e false continuam aceitos", () => {
    expect(unoapi.schema.safeParse(VALIDOS).success).toBe(true);
  });

  it("UN2 valor fora de true/false: mensagem própria, sem repetir o valor, também na resposta por campo", () => {
    for (const op of ["op_1", "op_2", "op_3", "op_4", "op_5", "op_6"]) {
      const valores = { ...VALIDOS, [op]: MARCADOR };
      const r = unoapi.schema.safeParse(valores);
      expect(r.success, op).toBe(false);
      if (r.success) continue;

      const doCampo = r.error.issues.filter((i) => i.path[0] === op).map((i) => i.message);
      expect(doCampo, op).toEqual([MENSAGEM]);

      const erros = errosDeCampoDoServidor(unoapi.fields, valores, r.error.issues, "en");
      expect(erros, op).toEqual([{ campo: op, mensagens: [MENSAGEM] }]);
      expect(JSON.stringify(erros), op).not.toContain(MARCADOR);
    }
  });
});
