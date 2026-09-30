import { describe, expect, it } from "vitest";
import { supabase } from "./supabase";

// Ciclo painel-higiene. O helpText de pass_supabase dizia "Sem caracteres
// especiais @ ! # $", mas a regra do campo ("senha_forte") EXIGE um símbolo:
// quem seguia a dica esbarrava em "Inclua um símbolo". No caminho do painel o
// que de fato quebra a senha é `$` (o compose interpola), aspas simples (fecham
// o scalar do kong.yml) e espaço; `- _ . +` passam intactos. O texto agora
// recomenda os que passam. A regra em si não mudou (decisão do usuário).

describe("supabase — texto de ajuda da senha do dashboard", () => {
  it("SB1 o helpText pede o símbolo que a regra exige, nos três idiomas", () => {
    const campo = supabase.fields.find((f) => f.name === "pass_supabase");
    expect(campo?.regra).toBe("senha_forte");
    expect(campo?.helpText).toBe(
      "Mínimo 12 caracteres, com maiúscula, minúscula, número e símbolo (use - _ . ou +; evite $, aspas simples e espaços)."
    );
    expect(supabase.i18n?.en?.fields?.pass_supabase?.helpText).toBe(
      "Minimum 12 characters, with uppercase, lowercase, number and symbol (use - _ . or +; avoid $, single quotes and spaces)."
    );
    expect(supabase.i18n?.es?.fields?.pass_supabase?.helpText).toBe(
      "Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo (use - _ . o +; evite $, comillas simples y espacios)."
    );
  });
});
