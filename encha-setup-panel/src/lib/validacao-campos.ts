// Validação de campo compartilhada entre o wizard (cliente) e o installer
// (servidor). MÓDULO PURO: só importa tipos de ./locale-shared — nada de zod,
// node:* nem ./stacks/*, porque roda no browser e não pode arrastar o registro
// de stacks junto. O `strongPassword` do servidor (stacks/types.ts) é
// CONSTRUÍDO a partir daqui, então há uma regra só para "senha forte".
//
// A recusa de caracteres proibidos do Tracker (SENHA_CARACTERES_PROIBIDOS em
// stacks/encha-tracker.ts) continua lá — esta é uma CÓPIA espelhada, amarrada
// por regras-campos.test.ts (equivalência sobre o registro inteiro).
import type { Locale } from "./locale-shared";

export type RegraCampo = "senha_forte" | "senha_forte_yaml";

export type CodigoFalha =
  | "obrigatorio"
  | "min_12"
  | "maiuscula"
  | "minuscula"
  | "numero"
  | "simbolo"
  | "caractere_proibido";

// Aspas duplas, crase, barra invertida e quebra de linha — o que generateYaml
// do Tracker não consegue carregar sem alterar a senha em silêncio.
export const CARACTERES_PROIBIDOS_YAML: RegExp = /["`\\\r\n]/;

export const MENSAGENS_VALIDACAO: Record<Locale, Record<CodigoFalha, string>> = {
  pt: {
    obrigatorio: "Campo obrigatório",
    min_12: "Mínimo 12 caracteres",
    maiuscula: "Inclua uma letra maiúscula",
    minuscula: "Inclua uma letra minúscula",
    numero: "Inclua um número",
    simbolo: "Inclua um símbolo",
    caractere_proibido: "A senha não pode conter aspas duplas, crase, barra invertida (\\) nem quebra de linha.",
  },
  en: {
    obrigatorio: "Required field",
    min_12: "At least 12 characters",
    maiuscula: "Include an uppercase letter",
    minuscula: "Include a lowercase letter",
    numero: "Include a number",
    simbolo: "Include a symbol",
    caractere_proibido: "The password cannot contain double quotes, backticks, backslashes (\\) or line breaks.",
  },
  es: {
    obrigatorio: "Campo obligatorio",
    min_12: "Al menos 12 caracteres",
    maiuscula: "Incluya una letra mayúscula",
    minuscula: "Incluya una letra minúscula",
    numero: "Incluya un número",
    simbolo: "Incluya un símbolo",
    caractere_proibido:
      "La contraseña no puede contener comillas dobles, acentos graves, barras invertidas (\\) ni saltos de línea.",
  },
};

export type CampoValidavel = { name: string; kind: string; optional?: boolean; regra?: RegraCampo };

// Ordem dos códigos é fixa: é a ordem em que o servidor sempre devolveu.
export function falhasDaRegra(regra: RegraCampo, valor: string): CodigoFalha[] {
  const falhas: CodigoFalha[] = [];
  if (valor.length < 12) falhas.push("min_12");
  if (!/[A-Z]/.test(valor)) falhas.push("maiuscula");
  if (!/[a-z]/.test(valor)) falhas.push("minuscula");
  if (!/[0-9]/.test(valor)) falhas.push("numero");
  if (!/[^A-Za-z0-9]/.test(valor)) falhas.push("simbolo");
  if (regra === "senha_forte_yaml" && CARACTERES_PROIBIDOS_YAML.test(valor)) falhas.push("caractere_proibido");
  return falhas;
}

// Vazio = undefined, null ou "" — sem trim: o cliente nunca recusa o que o
// servidor aceita.
function estaVazio(valor: unknown): boolean {
  return valor === undefined || valor === null || valor === "";
}

export function falhasDoCampo(campo: CampoValidavel, valor: unknown): CodigoFalha[] {
  if (campo.kind === "checkbox") return [];
  if (estaVazio(valor)) return campo.optional ? [] : ["obrigatorio"];
  if (campo.regra) return falhasDaRegra(campo.regra, String(valor));
  return [];
}

export function mensagens(codigos: CodigoFalha[], locale: Locale): string[] {
  return codigos.map((c) => MENSAGENS_VALIDACAO[locale][c]);
}

export type ErroDeCampo = { campo: string; mensagens: string[] };
export type IssueLike = { path: (string | number)[]; message: string };

// Monta a lista de erros por campo da resposta do servidor a partir das issues
// do zod. Campo do formulário com falha conhecida sai traduzido no locale; o
// resto (formato, campo fora do formulário, path vazio) sai com o texto do
// zod, sem duplicatas. NUNCA inclui o valor recebido.
export function errosDeCampoDoServidor(
  campos: CampoValidavel[],
  valores: Record<string, unknown>,
  issues: IssueLike[],
  locale: Locale
): ErroDeCampo[] {
  const grupos = new Map<string, string[]>();
  for (const issue of issues) {
    const chave = String(issue.path[0] ?? "");
    const lista = grupos.get(chave);
    if (lista) lista.push(issue.message);
    else grupos.set(chave, [issue.message]);
  }

  const erros: ErroDeCampo[] = [];
  for (const [campoNome, textosZod] of grupos) {
    const def = campos.find((c) => c.name === campoNome);
    const falhas = def ? falhasDoCampo(def, valores[def.name]) : [];
    const lista = falhas.length > 0 ? mensagens(falhas, locale) : Array.from(new Set(textosZod));
    erros.push({ campo: campoNome, mensagens: lista });
  }
  return erros;
}
