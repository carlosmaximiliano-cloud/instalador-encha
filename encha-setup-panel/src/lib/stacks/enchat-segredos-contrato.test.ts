import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { enchat } from "./enchat";
import { ENCHAT_VERSAO_MINIMA_SEGREDOS } from "./enchat-segredos";
import { semverMaiorOuIgual } from "../semver";
import type { SwarmContext } from "./types";

// Auditoria S4: o teste que liga as DUAS pontas de cada segredo do Docker da
// stack do EnchaT a uma tabela única (__fixtures__/enchat-segredos-contrato.tsv,
// a mesma que tests/test-enchat-segredos-contrato.sh confere na opção 84 e que
// o E5 do ENCHAT copia). Os testes de enchat.test.ts conferiam cada peça solta
// — e deixavam passar, por exemplo, o Pinfy recebendo SESSION_KEY_FILE
// apontando para o arquivo da pinfy_master_key (e vice-versa): nenhuma
// sentinela vaza, os dois arquivos existem, e toda sessão do WhatsApp vira
// indecifrável na primeira reinstalação.
//
// Aqui, para CADA linha (serviço, variável, segredo):
//   1. o serviço tem `<variavel>_FILE: "/run/secrets/enchat_<segredo>"` e nada
//      mais de *_FILE;
//   2. o arquivo está montado NESSE serviço (source == target == enchat_<segredo>),
//      com o uid/gid da tabela e mode 0400, e nenhum segredo extra montado;
//   3. o segredo é externo com nome versionado enchat_<segredo>_<época>;
//   4. o valor que o installer cria para o segredo é BYTE A BYTE o valor que a
//      MESMA variável tinha no formato antigo (texto), para os mesmos valores
//      de entrada — é o que faz a reinstalação ser uma migração sem perda.
// E, como o portão olha uma tag só: todas as imagens do EnchaT (app, updater,
// Pinfy) usam a tag da release, então segredo ligado => as três >= mínimo.

type Linha = { servico: string; variavel: string; segredo: string; uid: string; gid: string; opcao84: boolean };

const TABELA: Linha[] = readFileSync(path.join(__dirname, "__fixtures__", "enchat-segredos-contrato.tsv"), "utf8")
  .split("\n")
  .filter((l) => l.trim() !== "" && !l.startsWith("#"))
  .slice(1) // cabeçalho
  .map((l) => {
    const c = l.split("\t");
    if (c.length !== 6) throw new Error(`linha malformada no contrato: ${JSON.stringify(l)}`);
    return { servico: c[0], variavel: c[1], segredo: c[2], uid: c[3], gid: c[4], opcao84: c[5] === "sim" };
  });

const SERVICOS = ["app", "updater", "pinfy", "postgres"];

const entradas = {
  enchat_master_key: "k+/Base64==MK",
  postgres_password: "pg0123456789abcdef",
  pinfy_master_key: "pmk0123456789",
  pinfy_webhook_token: "pwt0123456789",
  pinfy_panel_password: "ppp0123456789",
  pinfy_db_password: "pdb0123456789",
  pinfy_session_key: "psk0123456789",
  updater_token: "upd0123456789",
  enchat_setup_token: "st-_0123456789",
};
const valores = { url_enchat: "crm.exemplo.com", chave_licenca: "CHAVE-0123456789" };
const EPOCA = "1758900000";

function ctx(tag: string, versaoSegredos?: string): SwarmContext {
  return {
    networkName: "rede_traefik",
    serverName: "vps",
    email: "",
    machineId: "m",
    release: { version: tag, imageRepo: "ghcr.io/enchainterno/enchat-free", imageTag: tag, obrigatoria: false },
    imagensSuportamSegredos: true, // S4c: labels das 3 imagens já lidos e OK — este arquivo testa o contrato de conteúdo
    ...(versaoSegredos ? { versaoSegredos } : {}),
  };
}

// Bloco de um serviço do YAML gerado (indentação fixa do generateYaml).
function blocoDoServico(yaml: string, servico: string): string {
  const antesDoTopo = yaml.split(/^secrets:$/m)[0];
  const inicio = antesDoTopo.indexOf(`\n  enchat_${servico}:\n`);
  if (inicio === -1) throw new Error(`serviço enchat_${servico} não encontrado`);
  const resto = antesDoTopo.slice(inicio + 1);
  const fim = resto.slice(1).search(/^ {2}\S|^\S/m);
  return fim === -1 ? resto : resto.slice(0, fim + 1);
}

const envDoServico = (bloco: string): Map<string, string> =>
  new Map([...bloco.matchAll(/^ {6}([A-Z0-9_]+): "(.*)"$/gm)].map((m) => [m[1], m[2]]));

type Montagem = { source: string; target: string; uid: string; gid: string; mode: string };
function montagensDoServico(bloco: string): Montagem[] {
  return [...bloco.matchAll(/^ {6}- source: (\S+)\n {8}target: (\S+)\n {8}uid: "(\d+)"\n {8}gid: "(\d+)"\n {8}mode: (\d+)$/gm)].map(
    (m) => ({ source: m[1], target: m[2], uid: m[3], gid: m[4], mode: m[5] })
  );
}

describe("contrato dos segredos do EnchaT — a tabela", () => {
  it("12 segredos distintos, 14 pares (serviço, variável), só serviços conhecidos", () => {
    expect(TABELA.length).toBe(14);
    expect(new Set(TABELA.map((l) => l.segredo)).size).toBe(12);
    expect(new Set(TABELA.map((l) => `${l.servico}/${l.variavel}`)).size).toBe(14);
    for (const l of TABELA) expect(SERVICOS).toContain(l.servico);
  });
});

describe("contrato dos segredos do EnchaT — YAML do painel com o portão aberto", () => {
  const novo = enchat.generateYaml(valores, entradas, ctx("0.4.2", EPOCA));
  const antigo = enchat.generateYaml(valores, entradas, ctx("0.4.0"));
  const specs = enchat.dockerSecrets!(valores, entradas, ctx("0.4.2", EPOCA));

  for (const servico of SERVICOS) {
    const linhas = TABELA.filter((l) => l.servico === servico);

    it(`enchat_${servico}: cada *_FILE aponta para o arquivo do segredo da tabela, e só esses`, () => {
      const env = envDoServico(blocoDoServico(novo, servico));
      // Tudo que aponta para /run/secrets/ (STATE_FILE do updater é um caminho
      // comum de dados, não segredo) + qualquer <variavel>_FILE da tabela.
      const nomesDaTabela = new Set(linhas.map((l) => `${l.variavel}_FILE`));
      const arquivos = [...env].filter(([k, v]) => v.startsWith("/run/secrets/") || nomesDaTabela.has(k));
      expect(new Map(arquivos)).toEqual(
        new Map(linhas.map((l) => [`${l.variavel}_FILE`, `/run/secrets/enchat_${l.segredo}`]))
      );
      // E nenhuma das variáveis da tabela sobrou em texto ao lado do _FILE
      // (no E5, a variável direta não vazia VENCE o arquivo).
      for (const l of linhas) expect(env.has(l.variavel), `${l.variavel} em texto`).toBe(false);
    });

    it(`enchat_${servico}: monta exatamente os arquivos que lê, com o uid/gid da tabela e mode 0400`, () => {
      const montagens = montagensDoServico(blocoDoServico(novo, servico));
      const esperado = [...new Map(linhas.map((l) => [l.segredo, l])).values()]
        .map((l) => ({ source: `enchat_${l.segredo}`, target: `enchat_${l.segredo}`, uid: l.uid, gid: l.gid, mode: "0400" }))
        .sort((a, b) => a.source.localeCompare(b.source));
      expect([...montagens].sort((a, b) => a.source.localeCompare(b.source))).toEqual(esperado);
      // Nenhuma linha "- source:" fora do formato completo (sem uid/gid/mode).
      expect((blocoDoServico(novo, servico).match(/- source:/g) ?? []).length).toBe(montagens.length);
    });

    it(`enchat_${servico}: o valor de cada segredo é, byte a byte, o da variável no formato antigo`, () => {
      const envAntigo = envDoServico(blocoDoServico(antigo, servico));
      for (const l of linhas) {
        const spec = specs.find((s) => s.base === `enchat_${l.segredo}`);
        expect(spec, `segredo enchat_${l.segredo} não criado`).toBeDefined();
        expect(envAntigo.get(l.variavel), `${servico}/${l.variavel} no formato antigo`).toBeDefined();
        expect(spec!.value, `${servico}/${l.variavel}`).toBe(envAntigo.get(l.variavel));
      }
    });
  }

  it("segredos externos no topo: exatamente os da tabela, com nome enchat_<segredo>_<época>", () => {
    const topo = novo.slice(novo.search(/^secrets:$/m));
    const declarados = new Map([...topo.matchAll(/^ {2}(\S+):\n {4}external: true\n {4}name: (\S+)$/gm)].map((m) => [m[1], m[2]]));
    const segredos = [...new Set(TABELA.map((l) => l.segredo))];
    expect(declarados).toEqual(new Map(segredos.map((s) => [`enchat_${s}`, `enchat_${s}_${EPOCA}`])));
    // O installer cria exatamente esses nomes.
    expect(new Map(specs.map((s) => [s.base, s.name]))).toEqual(declarados);
  });

  it("o portão cobre as TRÊS imagens do EnchaT: app, updater e Pinfy usam a tag da release (>= mínimo)", () => {
    const imagens = [...novo.matchAll(/^ {4}image: (\S+)$/gm)].map((m) => m[1]);
    const doEnchat = imagens.filter((i) => i.startsWith("ghcr.io/enchainterno/"));
    expect(doEnchat.map((i) => i.replace(/:[^:]+$/, "")).sort()).toEqual(
      ["ghcr.io/enchainterno/enchat-free", "ghcr.io/enchainterno/enchat-updater", "ghcr.io/enchainterno/pinfy"].sort()
    );
    for (const i of doEnchat) {
      const tag = i.slice(i.lastIndexOf(":") + 1);
      expect(tag, i).toBe("0.4.2");
      expect(semverMaiorOuIgual(tag, ENCHAT_VERSAO_MINIMA_SEGREDOS), i).toBe(true);
    }
    // A única imagem de fora é o Postgres oficial, que lê POSTGRES_PASSWORD_FILE desde sempre.
    expect(imagens.filter((i) => !doEnchat.includes(i))).toEqual(["pgvector/pgvector:pg16"]);
  });
});

// S4b: a premissa "a 0.4.1 terá *_FILE" estava errada — o Console já tinha
// publicado a 0.4.1 (build anterior ao E5, sem *_FILE). O contrato (tabela .tsv)
// só vale para uma imagem que contenha o E5; então o valor do portão é fixado
// AQUI, ao lado da tabela. Mudar a constante exige mudar este teste de propósito,
// conferindo antes contra a release PUBLICADA (não contra o plano).
describe("contrato dos segredos do EnchaT — o portão só abre numa versão que contenha o E5", () => {
  it("a tabela .tsv existe e a constante do portão é exatamente 0.4.2 (E5 sai na 0.4.2; a 0.4.1 publicada não lê *_FILE)", () => {
    const tsv = readFileSync(path.join(__dirname, "__fixtures__", "enchat-segredos-contrato.tsv"), "utf8");
    expect(tsv.split("\n").filter((l) => l.trim() !== "" && !l.startsWith("#")).length).toBeGreaterThan(1);
    expect(
      ENCHAT_VERSAO_MINIMA_SEGREDOS,
      "o portão só pode abrir numa versão que contenha o E5 (suporte a *_FILE): 0.4.1 foi publicada sem ele, o E5 sai na 0.4.2"
    ).toBe("0.4.2");
    // 0.4.1 (publicada, sem *_FILE) tem que ficar de fora; 0.4.2 (E5) tem que entrar.
    expect(semverMaiorOuIgual("0.4.1", ENCHAT_VERSAO_MINIMA_SEGREDOS)).toBe(false);
    expect(semverMaiorOuIgual("0.4.2", ENCHAT_VERSAO_MINIMA_SEGREDOS)).toBe(true);
  });
});

// S4c: o portão por label é decidido FORA do generateYaml (o installer lê os
// labels depois do pull e passa o booleano no ctx). O gerador de YAML e o
// módulo do portão continuam puros: nenhuma importação de I/O.
describe("generateYaml continua puro (S4c)", () => {
  it("nenhum import de portainer/imagens-recursos/fetch em enchat.ts nem em enchat-segredos.ts", () => {
    for (const arq of ["enchat.ts", "enchat-segredos.ts"]) {
      const src = readFileSync(path.join(__dirname, arq), "utf8");
      const imports = src.split("\n").filter((l) => /^\s*import\b/.test(l)).join("\n");
      expect(imports, arq).not.toMatch(/portainer|imagens-recursos|undici|node:(fs|http|https|net|child_process)/);
      expect(src, arq).not.toMatch(/\bfetch\s*\(|inspectImage|readFileSync|execSync/);
    }
  });

  it("gerar o YAML e a lista de segredos não faz chamada de rede", () => {
    const spy = vi.spyOn(globalThis, "fetch");
    try {
      const c = ctx("0.4.2", EPOCA);
      enchat.generateYaml(valores, entradas, c);
      enchat.dockerSecrets!(valores, entradas, c);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});
