import { describe, expect, it, vi } from "vitest";
import { ALL_STACKS } from "./registry";
import type { SwarmContext } from "./types";
import { MENSAGENS_VALIDACAO, errosDeCampoDoServidor } from "../validacao-campos";

// Import a frio do registry (todas as stacks) pode passar do timeout padrão.
vi.setConfig({ testTimeout: 30_000 });

// Ciclo painel-kong. Seis apps escrevem a senha digitada em texto no YAML
// (`- CHAVE=valor`), onde `$` é interpolado pelo deploy, aspas simples fecham o
// '...' do kong.yml e espaço/tab/quebra de linha cortam ou partem o escalar. Os
// seis usam senha_forte_texto, e só eles: o Portainer (installVia "bash") não
// põe a senha no YAML do painel, e o Tracker a entrega por Docker secret.

const SEIS = [
  "clickhouse.pass_clickhouse",
  "directus.senha_admin",
  "minio.senha_minio",
  "mongodb.senha_mongo",
  "pgadmin.senha_pgadmin",
  "supabase.pass_supabase",
];

const CTX: SwarmContext = { networkName: "rede", serverName: "vps", email: "" };
const MARCA = "Marca-Senha_1.2+3!@#%";

function stackDe(id: string) {
  const stack = ALL_STACKS.find((s) => s.id === id);
  if (!stack) throw new Error(`stack ${id} não encontrada`);
  return stack;
}

describe("senha_forte_texto — os seis apps que escrevem a senha digitada em texto no YAML (painel-kong)", () => {
  it("ST1 os seis campos declaram senha_forte_texto, e só eles", () => {
    const declarados = ALL_STACKS.flatMap((stack) =>
      stack.fields.filter((campo) => campo.regra === "senha_forte_texto").map((campo) => `${stack.id}.${campo.name}`)
    ).sort();
    expect(declarados).toEqual(SEIS);
  });

  it("ST2 o servidor de cada um recusa $, aspas simples e espaço no campo, com a mensagem própria traduzida", () => {
    for (const alvo of SEIS) {
      const [id, campo] = alvo.split(".");
      const stack = stackDe(id);
      const issuesDe = (senha: string) =>
        stack.schema.safeParse({ [campo]: senha }).error?.issues.filter((i) => i.path[0] === campo) ?? [];

      expect(issuesDe("SenhaForte#123"), alvo).toEqual([]);

      for (const c of ["$", "'", " "]) {
        const senha = `SenhaForte#1${c}23`;
        const issues = issuesDe(senha);
        expect(
          issues.map((i) => i.message),
          `${alvo} ${JSON.stringify(c)}`
        ).toEqual([MENSAGENS_VALIDACAO.pt.caractere_proibido_texto]);
        expect(errosDeCampoDoServidor(stack.fields, { [campo]: senha }, issues, "en"), `${alvo} ${JSON.stringify(c)}`).toEqual([
          { campo, mensagens: [MENSAGENS_VALIDACAO.en.caractere_proibido_texto] },
        ]);
      }
    }
  });

  it("ST3 cada um dos seis escreve a senha digitada em texto no YAML; o Portainer do painel não", () => {
    for (const alvo of SEIS) {
      const [id, campo] = alvo.split(".");
      expect(stackDe(id).generateYaml({ [campo]: MARCA }, {}, CTX), alvo).toContain(`=${MARCA}`);
    }
    const portainer = stackDe("traefik-portainer");
    expect(portainer.installVia).toBe("bash");
    expect(portainer.generateYaml({ pass_portainer: MARCA }, {}, CTX)).not.toContain(MARCA);
  });
});
