import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { enchat } from "./enchat";
import { enchaTracker } from "./encha-tracker";
import type { SwarmContext } from "./types";

// Incidente de 16/10/2026: `restart_policy: on-failure` + Postgres que sai com
// exit 0 no shutdown da VPS = task "Complete", nunca religada; e um
// `max_attempts` no app esgotava as tentativas. Regra única de TODO serviço de
// vida longa que o painel instala (ou que ele mesmo roda):
//   - restart_policy.condition: any
//   - sem max_attempts
//   - banco (volume em /var/lib/postgresql/data) nunca usa order: start-first
//     (dois postmasters sobre o mesmo PGDATA).
// Jobs de uma execução (replicated-job/global-job, condition: none) ficam de fora.

const RAIZ = path.join(__dirname, "..", "..", "..");
const ler = (...p: string[]) => readFileSync(path.join(RAIZ, ...p), "utf8");

type Servico = { nome: string; bloco: string };

// Serviços do nível `services:` (2 espaços), cada um com o seu bloco de texto.
export function servicosDoYaml(yaml: string): Servico[] {
  const linhas = yaml.split("\n");
  const ini = linhas.findIndex((l) => l === "services:");
  if (ini === -1) throw new Error("YAML sem bloco services:");
  const out: Servico[] = [];
  let atual: { nome: string; linhas: string[] } | null = null;
  for (let i = ini + 1; i < linhas.length; i++) {
    const l = linhas[i];
    if (/^\S/.test(l)) break; // fim de services:
    const m = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(l);
    if (m) {
      if (atual) out.push({ nome: atual.nome, bloco: atual.linhas.join("\n") });
      atual = { nome: m[1], linhas: [] };
    } else if (atual) atual.linhas.push(l);
  }
  if (atual) out.push({ nome: atual.nome, bloco: atual.linhas.join("\n") });
  return out;
}

const semComentario = (bloco: string): string =>
  bloco
    .split("\n")
    .filter((l) => !/^\s*#/.test(l))
    .join("\n");

const ehJob = (b: string): boolean => /mode:\s*(replicated-job|global-job)/.test(b) || /condition:\s*none\b/.test(b);

/** Violações da regra única num YAML de stack. Vazio = conforme. */
export function violacoesRestart(yaml: string): string[] {
  const v: string[] = [];
  const servicos = servicosDoYaml(yaml);
  if (servicos.length === 0) v.push("nenhum serviço encontrado");
  for (const { nome, bloco: bruto } of servicos) {
    const bloco = semComentario(bruto);
    if (ehJob(bloco)) continue;
    const rp = /^ {6}restart_policy:\s*\n((?: {8,}\S.*\n?)+)/m.exec(bloco);
    if (!rp) {
      v.push(`${nome}: sem restart_policy`);
    } else {
      if (!/^ {8}condition:\s*any\s*$/m.test(rp[1])) v.push(`${nome}: condition diferente de any`);
      if (/max_attempts/.test(rp[1])) v.push(`${nome}: max_attempts`);
    }
    if (bloco.includes("/var/lib/postgresql/data") && /order:\s*start-first/.test(bloco)) {
      v.push(`${nome}: banco com order: start-first`);
    }
  }
  return v;
}

const secretsEnchat = {
  enchat_master_key: "m", postgres_password: "p", pinfy_master_key: "pm", pinfy_webhook_token: "pw",
  pinfy_panel_password: "pp", pinfy_db_password: "pd", pinfy_session_key: "ps", updater_token: "u", enchat_setup_token: "st",
};
const secretsTracker = { tracker_master_key: "m", postgres_password: "p", updater_token: "u" };

function ctx(imageRepo: string, tag: string, extra: Partial<SwarmContext> = {}): SwarmContext {
  return {
    networkName: "rede_traefik",
    serverName: "vps-teste",
    email: "operador@exemplo.com",
    release: { version: tag, imageRepo, imageTag: tag, obrigatoria: false },
    machineId: "0123456789abcdef0123456789abcdef",
    fingerprint: "58132042721689d3e6fb25654444e5b7",
    ...extra,
  };
}

const renders: Record<string, string> = {
  "enchat (formato antigo, 0.3.2)": enchat.generateYaml(
    { url_enchat: "crm.exemplo.com", chave_licenca: "K" },
    secretsEnchat,
    ctx("ghcr.io/enchainterno/enchat-free", "0.3.2")
  ),
  "enchat (segredos, 0.4.3)": enchat.generateYaml(
    { url_enchat: "crm.exemplo.com", chave_licenca: "K" },
    secretsEnchat,
    ctx("ghcr.io/enchainterno/enchat-free", "0.4.3", { versaoSegredos: "1758900000", imagensSuportamSegredos: true })
  ),
  "encha-tracker": enchaTracker.generateYaml(
    { dominio_tracker: "tracker.exemplo.com", email_ativacao: "c@exemplo.com", senha_admin: "SenhaForte#123" },
    secretsTracker,
    ctx("ghcr.io/conta-tracker/encha-tracker", "1.2.3", { versaoSegredos: "1758900000" })
  ),
};

const arquivos: Record<string, string> = {
  "encha-setup-panel/docker-stack.yaml": ler("docker-stack.yaml"),
  "golden da opção 84 (tests/golden/enchat-84-formato-antigo.yaml)": readFileSync(
    path.join(RAIZ, "..", "tests", "golden", "enchat-84-formato-antigo.yaml"),
    "utf8"
  ),
};

describe("restart_policy dos templates: any, sem max_attempts, banco sem start-first", () => {
  for (const [nome, yaml] of [...Object.entries(renders), ...Object.entries(arquivos)]) {
    it(`${nome} está conforme`, () => {
      expect(violacoesRestart(yaml)).toEqual([]);
    });
  }

  it("cobre os serviços de vida longa esperados (o gate não passa por não achar nada)", () => {
    expect(servicosDoYaml(renders["enchat (formato antigo, 0.3.2)"]).map((s) => s.nome).sort()).toEqual(
      ["enchat_app", "enchat_pinfy", "enchat_postgres", "enchat_updater"]
    );
    expect(servicosDoYaml(renders["encha-tracker"]).map((s) => s.nome).sort()).toEqual(["app", "postgres", "updater"]);
    expect(servicosDoYaml(arquivos["encha-setup-panel/docker-stack.yaml"]).map((s) => s.nome)).toContain("panel");
  });
});

// O detector precisa FALHAR sob as mutações do plano — senão o teste acima é decorativo.
describe("o detector falha sob as mutações", () => {
  const enchatYaml = renders["enchat (formato antigo, 0.3.2)"];

  it("um `any` volta a on-failure", () => {
    const mutado = enchatYaml.replace("condition: any", "condition: on-failure");
    expect(violacoesRestart(mutado).join("\n")).toMatch(/condition diferente de any/);
  });

  it("max_attempts: 5 reaparece no docker-stack.yaml", () => {
    const mutado = arquivos["encha-setup-panel/docker-stack.yaml"].replace(
      "condition: any\n",
      "condition: any\n        max_attempts: 5\n"
    );
    expect(violacoesRestart(mutado).join("\n")).toMatch(/panel: max_attempts/);
  });

  it("start-first no enchat_postgres", () => {
    const mutado = enchatYaml.replace(
      /(  enchat_postgres:[\s\S]*?    deploy:\n      replicas: 1\n)/,
      "$1      update_config:\n        order: start-first\n"
    );
    expect(mutado).not.toBe(enchatYaml);
    expect(violacoesRestart(mutado).join("\n")).toMatch(/enchat_postgres: banco com order: start-first/);
  });

  it("restart_policy removida de um serviço", () => {
    const mutado = enchatYaml.replace(/      restart_policy:\n        condition: any\n(?= {6}placement:\n {8}constraints:\n {10}- node.role == manager\n\n {2}enchat_postgres)/, "");
    expect(mutado).not.toBe(enchatYaml);
    expect(violacoesRestart(mutado).join("\n")).toMatch(/sem restart_policy/);
  });
});
