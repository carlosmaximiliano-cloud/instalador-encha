import { describe, expect, it } from "vitest";
import { supabase } from "./supabase";

// Ciclo painel-higiene. O helpText de pass_supabase dizia "Sem caracteres
// especiais @ ! # $", mas a regra do campo ("senha_forte") EXIGE um símbolo:
// quem seguia a dica esbarrava em "Inclua um símbolo". No caminho do painel o
// que de fato quebra a senha é `$` (o compose interpola), aspas simples (fecham
// o scalar do kong.yml) e espaço; `- _ . +` passam intactos. O texto agora
// recomenda os que passam. Ciclo painel-kong: a regra agora recusa os três.

describe("supabase — texto de ajuda da senha do dashboard", () => {
  it("SB1 o helpText pede o símbolo que a regra exige, nos três idiomas", () => {
    const campo = supabase.fields.find((f) => f.name === "pass_supabase");
    expect(campo?.regra).toBe("senha_forte_texto");
    expect(campo?.helpText).toBe(
      "Mínimo 12 caracteres, com maiúscula, minúscula, número e símbolo (use - _ . ou +; $, aspas simples e espaços não são aceitos)."
    );
    expect(supabase.i18n?.en?.fields?.pass_supabase?.helpText).toBe(
      "Minimum 12 characters, with uppercase, lowercase, number and symbol (use - _ . or +; $, single quotes and spaces are not accepted)."
    );
    expect(supabase.i18n?.es?.fields?.pass_supabase?.helpText).toBe(
      "Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo (use - _ . o +; no se aceptan $, comillas simples ni espacios)."
    );
  });
});
