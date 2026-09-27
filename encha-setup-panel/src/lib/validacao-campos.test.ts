import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CARACTERES_PROIBIDOS_YAML,
  MENSAGENS_VALIDACAO,
  errosDeCampoDoServidor,
  falhasDaRegra,
  falhasDoCampo,
  mensagens,
  type CampoValidavel,
  type CodigoFalha,
} from "./validacao-campos";

// Painel P1 — a regra única de validação de campo, compartilhada entre o
// wizard e o installer. Tudo aqui é função pura: sem zod, sem registro.

const FORTE = "Aa1!aaaaaaaa";

describe("validacao-campos — regras de senha", () => {
  it("aceita senha forte e aponta cada falha isolada, na ordem fixa", () => {
    expect(falhasDaRegra("senha_forte", FORTE)).toEqual([]);
    expect(falhasDaRegra("senha_forte_yaml", FORTE)).toEqual([]);

    // Cada variante perde exatamente uma classe (e mantém 12+ caracteres).
    expect(falhasDaRegra("senha_forte", "aa1!aaaaaaaa")).toEqual(["maiuscula"]);
    expect(falhasDaRegra("senha_forte", "AA1!AAAAAAAA")).toEqual(["minuscula"]);
    expect(falhasDaRegra("senha_forte", "Aa!!aaaaaaaa")).toEqual(["numero"]);
    expect(falhasDaRegra("senha_forte", "Aa1aaaaaaaaa")).toEqual(["simbolo"]);

    // Ordem fixa quando tudo falha: min_12, maiúscula, minúscula, número, símbolo.
    expect(falhasDaRegra("senha_forte", "")).toEqual(["min_12", "maiuscula", "minuscula", "numero", "simbolo"]);
    expect(falhasDaRegra("senha_forte", "abc")).toEqual(["min_12", "maiuscula", "numero", "simbolo"]);
    // caractere_proibido, quando existe, é sempre o último.
    expect(falhasDaRegra("senha_forte_yaml", '"')).toEqual([
      "min_12",
      "maiuscula",
      "minuscula",
      "numero",
      "caractere_proibido",
    ]);

    // Mesmas regras, agora pelo caminho do campo (falhasDoCampo repassa `regra`).
    const campoForte: CampoValidavel = { name: "s", kind: "password", regra: "senha_forte" };
    const campoYaml: CampoValidavel = { name: "y", kind: "password", regra: "senha_forte_yaml" };
    const comAspas = 'Aa1!aaaaaa"a';
    expect(falhasDoCampo(campoForte, FORTE)).toEqual([]);
    expect(falhasDoCampo(campoForte, "aa1!aaaaaaaa")).toEqual(["maiuscula"]);
    expect(falhasDoCampo(campoYaml, FORTE)).toEqual([]);
    expect(falhasDoCampo(campoYaml, comAspas)).toEqual(["caractere_proibido"]);
    // A regra básica não recusa aspas: quem escolhe a regra é o campo.
    expect(falhasDoCampo(campoForte, comAspas)).toEqual([]);
  });

  it("11 caracteres com todo o resto certo falha só por min_12", () => {
    expect(FORTE.slice(1)).toHaveLength(11);
    expect(falhasDaRegra("senha_forte", "Aa1!aaaaaaa")).toEqual(["min_12"]);
    expect(falhasDaRegra("senha_forte", "Aa1!aaaaaaa".padEnd(12, "a"))).toEqual([]);
  });

  it("senha_forte_yaml recusa cada caractere proibido e aceita o resto", () => {
    for (const c of ['"', "`", "\\", "\r", "\n"]) {
      const senha = `SenhaForte#1${c}23`;
      expect(falhasDaRegra("senha_forte_yaml", senha), JSON.stringify(c)).toEqual(["caractere_proibido"]);
      expect(CARACTERES_PROIBIDOS_YAML.test(c)).toBe(true);
      // A regra básica NÃO recusa esses caracteres: só o Tracker os proíbe.
      expect(falhasDaRegra("senha_forte", senha), JSON.stringify(c)).toEqual([]);
    }
    for (const c of ["'", "#", "$", "@", "!", " ", "\t", "ç", "€", "😀", "{", "}"]) {
      expect(falhasDaRegra("senha_forte_yaml", `SenhaForte#1${c}23`), JSON.stringify(c)).toEqual([]);
    }
  });
});

describe("validacao-campos — mensagens", () => {
  it("pt é byte a byte o texto que o servidor já devolvia", () => {
    // Literais escritos à mão, de propósito: não comparam com a própria tabela.
    expect(MENSAGENS_VALIDACAO.pt.min_12).toBe("Mínimo 12 caracteres");
    expect(MENSAGENS_VALIDACAO.pt.maiuscula).toBe("Inclua uma letra maiúscula");
    expect(MENSAGENS_VALIDACAO.pt.minuscula).toBe("Inclua uma letra minúscula");
    expect(MENSAGENS_VALIDACAO.pt.numero).toBe("Inclua um número");
    expect(MENSAGENS_VALIDACAO.pt.simbolo).toBe("Inclua um símbolo");
    expect(MENSAGENS_VALIDACAO.pt.caractere_proibido).toBe(
      "A senha não pode conter aspas duplas, crase, barra invertida (\\) nem quebra de linha."
    );
    expect(MENSAGENS_VALIDACAO.pt.obrigatorio).toBe("Campo obrigatório");
  });

  it("en e es existem para todo código e diferem do pt", () => {
    const codigos = Object.keys(MENSAGENS_VALIDACAO.pt) as CodigoFalha[];
    expect(codigos).toHaveLength(7);
    for (const locale of ["en", "es"] as const) {
      expect(Object.keys(MENSAGENS_VALIDACAO[locale]).sort()).toEqual([...codigos].sort());
      for (const c of codigos) {
        const texto = MENSAGENS_VALIDACAO[locale][c];
        expect(texto, `${locale}.${c}`).toBeTruthy();
        expect(texto, `${locale}.${c}`).not.toBe(MENSAGENS_VALIDACAO.pt[c]);
      }
    }
    expect(mensagens(["min_12", "numero"], "en")).toEqual(["At least 12 characters", "Include a number"]);
    expect(mensagens(["min_12", "numero"], "es")).toEqual(["Al menos 12 caracteres", "Incluya un número"]);
  });
});

describe("validacao-campos — falhasDoCampo", () => {
  const obrigatorio: CampoValidavel = { name: "a", kind: "text" };
  const opcional: CampoValidavel = { name: "b", kind: "text", optional: true };
  const senha: CampoValidavel = { name: "c", kind: "password", regra: "senha_forte" };
  const senhaOpcional: CampoValidavel = { name: "d", kind: "password", optional: true, regra: "senha_forte" };
  const caixa: CampoValidavel = { name: "e", kind: "checkbox", regra: "senha_forte" };

  it("obrigatório vazio falha, opcional vazio passa, checkbox nunca falha", () => {
    for (const vazio of [undefined, null, ""]) {
      expect(falhasDoCampo(obrigatorio, vazio)).toEqual(["obrigatorio"]);
      expect(falhasDoCampo(opcional, vazio)).toEqual([]);
      // vazio curto-circuita: não roda a regra em cima do vazio.
      expect(falhasDoCampo(senha, vazio)).toEqual(["obrigatorio"]);
      expect(falhasDoCampo(senhaOpcional, vazio)).toEqual([]);
      expect(falhasDoCampo(caixa, vazio)).toEqual([]);
    }
    // Sem trim: espaço é valor, o servidor também o aceita.
    expect(falhasDoCampo(obrigatorio, " ")).toEqual([]);
    // Sem regra e preenchido: nada a dizer (formato é do servidor).
    expect(falhasDoCampo(obrigatorio, "qualquer coisa")).toEqual([]);
    // Com regra e preenchido: roda a regra; opcional preenchido também.
    expect(falhasDoCampo(senha, "abc")).toEqual(["min_12", "maiuscula", "numero", "simbolo"]);
    expect(falhasDoCampo(senhaOpcional, "abc")).toEqual(["min_12", "maiuscula", "numero", "simbolo"]);
    expect(falhasDoCampo(senha, FORTE)).toEqual([]);
    // Checkbox marcado ou não, mesmo com regra: nunca falha.
    expect(falhasDoCampo(caixa, false)).toEqual([]);
    expect(falhasDoCampo(caixa, true)).toEqual([]);
  });
});

describe("validacao-campos — errosDeCampoDoServidor", () => {
  const campos: CampoValidavel[] = [
    { name: "senha", kind: "password", regra: "senha_forte" },
    { name: "dominio", kind: "domain" },
    { name: "nome", kind: "text" },
    { name: "opcional", kind: "text", optional: true },
  ];

  it("servidor: agrupa por campo, traduz regra e obrigatório no locale, cai no texto do zod no resto", () => {
    const issues = [
      { path: ["senha"], message: "Mínimo 12 caracteres" },
      { path: ["dominio"], message: "Domínio inválido (use formato: ex.dominio.com)" },
      { path: ["senha"], message: "Inclua um símbolo" },
      { path: ["nome"], message: "Required" },
      { path: ["dominio"], message: "Domínio inválido (use formato: ex.dominio.com)" },
      { path: ["opcional"], message: "Invalid email" },
    ];
    const valores = { senha: "abc", dominio: "x", nome: undefined, opcional: "não é e-mail" };

    // Ordem da primeira aparição: senha, dominio, nome, opcional.
    expect(errosDeCampoDoServidor(campos, valores, issues, "en")).toEqual([
      // Regra: recalculada pela função pura (todas as falhas, não só as das issues).
      { campo: "senha", mensagens: mensagens(falhasDaRegra("senha_forte", "abc"), "en") },
      // Sem regra e preenchido: texto do zod, sem duplicata.
      { campo: "dominio", mensagens: ["Domínio inválido (use formato: ex.dominio.com)"] },
      // Obrigatório vazio: traduzido no locale.
      { campo: "nome", mensagens: ["Required field"] },
      // Opcional com erro de formato: texto do zod.
      { campo: "opcional", mensagens: ["Invalid email"] },
    ]);
    expect(errosDeCampoDoServidor(campos, valores, issues, "es")[2]).toEqual({
      campo: "nome",
      mensagens: ["Campo obligatorio"],
    });
    expect(errosDeCampoDoServidor(campos, valores, issues, "pt")[0].mensagens).toEqual([
      "Mínimo 12 caracteres",
      "Inclua uma letra maiúscula",
      "Inclua um número",
      "Inclua um símbolo",
    ]);
  });

  it("servidor: campo fora do formulário continua na lista, com o texto do zod", () => {
    const issues = [
      { path: ["chave_licenca"], message: "Chave de licença inválida" },
      { path: [], message: "Invalid input" },
    ];
    expect(errosDeCampoDoServidor(campos, {}, issues, "en")).toEqual([
      { campo: "chave_licenca", mensagens: ["Chave de licença inválida"] },
      { campo: "", mensagens: ["Invalid input"] },
    ]);
  });

  it("servidor: nunca inclui o valor recebido", () => {
    const segredo = "abc-VALOR-SECRETO-999";
    const issues = [
      { path: ["senha"], message: "Mínimo 12 caracteres" },
      { path: ["dominio"], message: "Domínio inválido" },
    ];
    for (const locale of ["pt", "en", "es"] as const) {
      const r = errosDeCampoDoServidor(campos, { senha: segredo, dominio: segredo }, issues, locale);
      expect(JSON.stringify(r)).not.toContain(segredo);
      expect(JSON.stringify(r)).not.toContain("SECRETO");
    }
  });
});

describe("validacao-campos — pureza", () => {
  it("módulo puro: só importa locale-shared", () => {
    const fonte = readFileSync(join(__dirname, "validacao-campos.ts"), "utf8");
    const origens = [...fonte.matchAll(/^\s*import\b[^;]*?\bfrom\s*["']([^"']+)["']/gm)].map((m) => m[1]);
    // Import de efeito (import "x") também não pode existir.
    expect(fonte).not.toMatch(/^\s*import\s*["']/m);
    expect(origens.length).toBeGreaterThan(0);
    for (const origem of origens) {
      expect(["./locale-shared", "@/lib/locale-shared"], `import de "${origem}"`).toContain(origem);
    }
    expect(fonte).not.toMatch(/\brequire\s*\(/);
    expect(fonte).not.toMatch(/\bimport\s*\(/);
  });
});
