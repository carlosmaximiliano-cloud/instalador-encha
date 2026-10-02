import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { SwarmContext } from "./types";
import { supabase } from "./supabase";

// Ciclo painel-kong. O template da Supabase escrevia `\$$(cat ...)` (uma barra
// a mais que o menu) no entrypoint do kong e no comando do supavisor. Depois
// que o deploy troca `$$` por `$`, sobrava `\$(cat ...)`: no kong o `cat` rodava
// dentro do `eval` e o kong.yml saía com $SUPABASE_ANON_KEY e companhia
// literais; no supavisor o `eval` recebia o texto `$(cat ...)` em vez do
// conteúdo do pooler.exs. Estes testes executam o comando gerado num shell de
// verdade e comparam a linha com a que o menu (secondary.sh) renderiza.

const VALORES = {
  url_supabase: "supabase.exemplo.com",
  user_supabase: "admin_dash",
  pass_supabase: 'Aa1-_.+!@#%&*()"`\\x', // aceita pela regra; tem " ` \ para o shell
  url_s3: "s3.exemplo.com",
  s3_access_key: "acesso-s3",
  s3_secret_key: "segredo-s3",
};

const SEGREDOS = {
  jwt_secret: "jwt-secret-fake",
  anon_key: "anon.key.fake",
  service_key: "service.key.fake",
  senha_postgres: "senhapg",
  logflare_key: "logflare",
  logflare_key_public: "logflarepub",
  secret_key_base: "skb",
  vault_enc_key: "vault",
};

const CTX: SwarmContext = { networkName: "rede", serverName: "vps", email: "" };

// Emula a interpolação do deploy: `$$` vira `$`; qualquer outro `$` é erro de
// geração (o deploy o interpolaria).
function interpolar(s: string): string {
  return s.replace(/\$\$|\$/g, (m) => {
    if (m === "$$") return "$";
    throw new Error(`"$" solto (o deploy interpolaria): ${s}`);
  });
}

function blocoDoServico(yaml: string, nome: string): string {
  const m = yaml.match(new RegExp(`^  ${nome}:\\n([\\s\\S]*?)(?=^  \\S|^\\S)`, "m"));
  if (!m) throw new Error(`serviço ${nome} não encontrado`);
  return m[1];
}

function ambienteDoServico(bloco: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const m of bloco.matchAll(/^ {6}- ([A-Z_]+)=(.*)$/gm)) env[m[1]] = interpolar(m[2]);
  return env;
}

const yaml = () => supabase.generateYaml(VALORES, SEGREDOS, CTX);

function ambiente(extra: Record<string, string>): NodeJS.ProcessEnv {
  return { NODE_ENV: "test", PATH: process.env.PATH ?? "/usr/bin:/bin", ...extra };
}

function linhaEntrypointKong(): string {
  const linhas = blocoDoServico(yaml(), "kong")
    .split("\n")
    .filter((l) => l.startsWith("    entrypoint: "));
  expect(linhas).toHaveLength(1);
  return linhas[0];
}

function linhaComandoSupavisor(): string {
  const linhas = blocoDoServico(yaml(), "supavisor")
    .split("\n")
    .filter((l) => l.includes("/app/bin/supavisor eval"));
  expect(linhas).toHaveLength(1);
  return linhas[0];
}

describe("supabase — entrypoint do kong e comando do supavisor executados de verdade (painel-kong)", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "encha-supabase-entrypoint-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("KG1 kong: o kong.yml sai com a senha, o usuário e as duas chaves reais, sem nenhum $", () => {
    const env = ambienteDoServico(blocoDoServico(yaml(), "kong"));
    expect(env.DASHBOARD_PASSWORD).toBe(VALORES.pass_supabase);
    expect(env.SUPABASE_ANON_KEY).toBe(SEGREDOS.anon_key);

    writeFileSync(
      path.join(dir, "temp.yml"),
      [
        "consumers:",
        "  - username: anon",
        "    keyauth_credentials:",
        "      - key: $SUPABASE_ANON_KEY",
        "  - username: service_role",
        "    keyauth_credentials:",
        "      - key: $SUPABASE_SERVICE_KEY",
        "basicauth_credentials:",
        "  - consumer: DASHBOARD",
        "    username: $DASHBOARD_USERNAME",
        "    password: '$DASHBOARD_PASSWORD'",
      ].join("\n") + "\n"
    );

    const alvo = "/docker-entrypoint.sh kong docker-start";
    const entrypoint = interpolar(linhaEntrypointKong().slice("    entrypoint: ".length));
    expect(entrypoint).toContain(alvo);
    execFileSync("bash", ["-c", entrypoint.replace(alvo, "true")], {
      env: ambiente({
        HOME: dir,
        DASHBOARD_USERNAME: env.DASHBOARD_USERNAME,
        DASHBOARD_PASSWORD: env.DASHBOARD_PASSWORD,
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY: env.SUPABASE_SERVICE_KEY,
      }),
      stdio: ["ignore", "pipe", "pipe"],
    });

    const kong = readFileSync(path.join(dir, "kong.yml"), "utf8");
    expect(kong).toContain("      - key: anon.key.fake\n");
    expect(kong).toContain("      - key: service.key.fake\n");
    expect(kong).toContain("    username: admin_dash\n");
    expect(kong).toContain(`    password: '${VALORES.pass_supabase}'\n`);
    expect(kong).not.toContain("$");
  });

  it("KG2 supavisor: o eval recebe o conteúdo do pooler.exs, e o servidor sobe depois", () => {
    const bin = path.join(dir, "bin");
    mkdirSync(bin);
    const stubs: Record<string, string> = {
      migrate: "exit 0",
      supavisor: `printf '%s' "$2" > "${dir}/eval-recebido"`,
      server: `: > "${dir}/server-subiu"`,
    };
    for (const [nome, corpo] of Object.entries(stubs)) {
      const arquivo = path.join(bin, nome);
      writeFileSync(arquivo, `#!/bin/sh\n${corpo}\n`);
      chmodSync(arquivo, 0o755);
    }
    const pooler = 'params = %{"external_id" => System.get_env("POOLER_TENANT_ID"), "x" => "$HOME \\\\ `y`"}\n{:ok, _} = :ok';
    writeFileSync(path.join(dir, "pooler.exs"), pooler);

    const comando = interpolar(linhaComandoSupavisor().slice("      - ".length))
      .split("/app/bin/")
      .join(`${bin}/`)
      .replace("/etc/pooler/pooler.exs", path.join(dir, "pooler.exs"));
    execFileSync("/bin/sh", ["-c", comando], { env: ambiente({ HOME: dir }), stdio: ["ignore", "pipe", "pipe"] });

    expect(readFileSync(path.join(dir, "eval-recebido"), "utf8")).toBe(pooler);
    expect(readFileSync(path.join(dir, "server-subiu"), "utf8")).toBe("");
  });
});

describe("supabase — paridade do entrypoint com o menu (painel-kong)", () => {
  const SECONDARY = path.join(__dirname, "..", "..", "..", "..", "secondary.sh");

  // Renderiza a linha do menu num heredoc sem aspas, num bash real.
  function linhaDoMenu(trecho: string): string {
    const linhas = readFileSync(SECONDARY, "utf8")
      .split("\n")
      .filter((l) => l.includes(trecho));
    expect(linhas, trecho).toHaveLength(1);
    return execFileSync("bash", ["-c", `cat <<EOL\n${linhas[0]}\nEOL`]).toString().replace(/\n$/, "");
  }

  it("KG3 kong: a linha do entrypoint é byte a byte a do menu (secondary.sh)", () => {
    expect(linhaEntrypointKong().trim()).toBe(linhaDoMenu('eval "echo').trim());
  });

  it("KG4 supavisor: a linha do comando é byte a byte a do menu (secondary.sh)", () => {
    expect(linhaComandoSupavisor().trim()).toBe(linhaDoMenu("/app/bin/supavisor eval").trim());
  });
});
