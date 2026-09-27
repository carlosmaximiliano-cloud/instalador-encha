import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DONO_SEGREDOS, enchat } from "./enchat";
import type { SwarmContext } from "./types";

const valuesValidos = {
  url_enchat: "crm.exemplo.com",
  chave_licenca: "CHAVE-DE-TESTE-123",
};

const secrets = {
  enchat_master_key: "master-key-fake",
  postgres_password: "postgres-pw-fake",
  pinfy_master_key: "pinfy-master-fake",
  pinfy_webhook_token: "pinfy-webhook-fake",
  pinfy_panel_password: "pinfy-panel-fake",
  pinfy_db_password: "pinfy-db-pw-fake",
  pinfy_session_key: "pinfy-session-key-fake",
  updater_token: "updater-token-fake",
  enchat_setup_token: "setup-token-fake-0123456789abcdef",
};

const ctxBase: SwarmContext = {
  networkName: "rede_traefik",
  serverName: "vps-teste",
  email: "operador@exemplo.com",
  release: { version: "0.3.2", imageRepo: "ghcr.io/enchainterno/enchat-free", imageTag: "0.3.2", obrigatoria: false },
  machineId: "0123456789abcdef0123456789abcdef",
  fingerprint: "58132042721689d3e6fb25654444e5b7",
};

// Recorta o bloco de UM serviço do YAML gerado (do "  <nome>:" até o
// próximo serviço/bloco no mesmo nível) — assim um teste afirma "esta env
// está NESTE serviço", não só "aparece em algum lugar do arquivo".
function blocoDoServico(yaml: string, servico: string): string {
  const linhas = yaml.split("\n");
  const inicio = linhas.findIndex((l) => l === `  ${servico}:`);
  if (inicio === -1) throw new Error(`serviço ${servico} não encontrado no YAML`);
  let fim = linhas.length;
  for (let i = inicio + 1; i < linhas.length; i++) {
    if (/^ {0,2}\S/.test(linhas[i])) {
      fim = i;
      break;
    }
  }
  return linhas.slice(inicio, fim).join("\n");
}

describe("enchat — token de primeiro acesso (ENCHAT_SETUP_TOKEN)", () => {
  it("generateSecrets gera enchat_setup_token em base64url com pelo menos 20 caracteres (mínimo do app)", () => {
    const gerados = enchat.generateSecrets!(valuesValidos);
    const token = gerados.find((g) => g.name === "enchat_setup_token");
    expect(token).toBeDefined();
    expect(token!.value).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token!.value.length).toBeGreaterThanOrEqual(20);
  });

  it("dois sorteios dão tokens diferentes (não é constante)", () => {
    const a = enchat.generateSecrets!(valuesValidos).find((g) => g.name === "enchat_setup_token")!.value;
    const b = enchat.generateSecrets!(valuesValidos).find((g) => g.name === "enchat_setup_token")!.value;
    expect(a).not.toBe(b);
  });

  it("não é `reveal` — o operador recebe o link pronto (setupUrl), não o token cru num card de segredo", () => {
    const token = enchat.generateSecrets!(valuesValidos).find((g) => g.name === "enchat_setup_token");
    expect(token!.reveal).toBeFalsy();
  });

  it("o serviço enchat_app recebe ENCHAT_SETUP_TOKEN com o valor do segredo", () => {
    const yaml = enchat.generateYaml(valuesValidos, secrets, ctxBase);
    expect(blocoDoServico(yaml, "enchat_app")).toContain(`ENCHAT_SETUP_TOKEN: "${secrets.enchat_setup_token}"`);
  });

  it("o token não vaza para outros serviços (updater/pinfy/postgres)", () => {
    const yaml = enchat.generateYaml(valuesValidos, secrets, ctxBase);
    for (const s of ["enchat_updater", "enchat_pinfy", "enchat_postgres"]) {
      expect(blocoDoServico(yaml, s)).not.toContain(secrets.enchat_setup_token);
    }
  });
});

describe("enchat — estado persistente do sidecar enchat_updater", () => {
  it("o enchat_updater monta /var/enchat/updater em /data e aponta STATE_FILE para lá", () => {
    const bloco = blocoDoServico(enchat.generateYaml(valuesValidos, secrets, ctxBase), "enchat_updater");
    expect(bloco).toContain("- /var/enchat/updater:/data");
    expect(bloco).toContain('STATE_FILE: "/data/estado.json"');
  });

  it("o updater também atualiza o Pinfy bundled (PINFY_* apontam para os serviços DESTA stack)", () => {
    const yaml = enchat.generateYaml(valuesValidos, secrets, ctxBase);
    const updater = blocoDoServico(yaml, "enchat_updater");
    // Os serviços referenciados existem no próprio YAML, com as portas certas.
    expect(blocoDoServico(yaml, "enchat_pinfy")).toBeTruthy();
    expect(updater).toContain('PINFY_SERVICE: "enchat_pinfy"');
    // Swarm nomeia <stack>_<serviço>; a stack do painel se chama "enchat"
    // (installer.ts: stackId sem hífens) — mesmo padrão do SWARM_SERVICE do app.
    expect(updater).toContain('SWARM_SERVICE: "enchat_enchat_app"');
    expect(updater).toContain('PINFY_SWARM_SERVICE: "enchat_enchat_pinfy"');
    expect(updater).toContain('PINFY_HEALTHZ_URL: "http://enchat_pinfy:3000/api/health"');
    expect(updater).toContain('HEALTHZ_URL: "http://enchat_app:8080/api/healthz"');
    // Em Swarm, PINFY_SERVICE sem PINFY_SWARM_SERVICE derruba o boot do sidecar.
    expect(updater).toMatch(/PINFY_SERVICE:[\s\S]*PINFY_SWARM_SERVICE:/);
  });

  it("o diretório do bind mount está em hostDirs (o Swarm não cria bind mount sozinho)", () => {
    const caminhos = (enchat.hostDirs ?? []).map((d) => (typeof d === "string" ? d : d.path));
    expect(caminhos).toContain("/var/enchat/updater");
  });
});

describe("enchat — S12: papel restrito \"pinfy\" no Postgres + sessão cifrada", () => {
  it("generateSecrets gera pinfy_db_password e pinfy_session_key", () => {
    const gerados = enchat.generateSecrets!(valuesValidos);
    const dbPassword = gerados.find((g) => g.name === "pinfy_db_password");
    const sessionKey = gerados.find((g) => g.name === "pinfy_session_key");
    expect(dbPassword).toBeDefined();
    expect(sessionKey).toBeDefined();
    // [A-Za-z0-9_-] só (contrato do app, internal/appcore), 32-128 chars —
    // hex de 24 bytes = 48 chars, dentro da janela.
    expect(dbPassword!.value).toMatch(/^[A-Za-z0-9_-]{32,128}$/);
    // 32 bytes aleatórios em hex = 64 chars (contrato da cifra AES-256-GCM).
    expect(sessionKey!.value).toMatch(/^[0-9a-f]{64}$/);
    expect(dbPassword!.value).not.toBe(sessionKey!.value);
  });

  it("dois sorteios dão valores diferentes para as duas (não é constante)", () => {
    const a = enchat.generateSecrets!(valuesValidos);
    const b = enchat.generateSecrets!(valuesValidos);
    expect(a.find((g) => g.name === "pinfy_db_password")!.value).not.toBe(
      b.find((g) => g.name === "pinfy_db_password")!.value
    );
    expect(a.find((g) => g.name === "pinfy_session_key")!.value).not.toBe(
      b.find((g) => g.name === "pinfy_session_key")!.value
    );
  });

  it("pinfy_session_key é `reveal` (perda é irrecuperável, como enchat_master_key); pinfy_db_password não é (segredo interno entre containers)", () => {
    const gerados = enchat.generateSecrets!(valuesValidos);
    expect(gerados.find((g) => g.name === "pinfy_session_key")!.reveal).toBe(true);
    expect(gerados.find((g) => g.name === "pinfy_db_password")!.reveal).toBeFalsy();
  });

  it("o enchat_app recebe PINFY_DB_PASSWORD", () => {
    const bloco = blocoDoServico(enchat.generateYaml(valuesValidos, secrets, ctxBase), "enchat_app");
    expect(bloco).toContain(`PINFY_DB_PASSWORD: "${secrets.pinfy_db_password}"`);
    expect(bloco).not.toContain(secrets.pinfy_session_key);
  });

  it("o enchat_pinfy conecta no Postgres como o usuário restrito \"pinfy\" (nunca mais \"enchat\") com a PINFY_DB_PASSWORD", () => {
    const bloco = blocoDoServico(enchat.generateYaml(valuesValidos, secrets, ctxBase), "enchat_pinfy");
    expect(bloco).toContain(`DATABASE_URL: "postgresql://pinfy:${secrets.pinfy_db_password}@enchat_postgres:5432/enchat?schema=pinfy&sslmode=disable"`);
    expect(bloco).not.toMatch(/postgresql:\/\/enchat:/);
  });

  it("o enchat_pinfy recebe SESSION_KEY (cifra a sessão do WhatsApp) e SÓ ele", () => {
    const yaml = enchat.generateYaml(valuesValidos, secrets, ctxBase);
    expect(blocoDoServico(yaml, "enchat_pinfy")).toContain(`SESSION_KEY: "${secrets.pinfy_session_key}"`);
    for (const s of ["enchat_app", "enchat_updater", "enchat_postgres"]) {
      expect(blocoDoServico(yaml, s)).not.toContain(secrets.pinfy_session_key);
    }
  });

  it("as notas avisam para guardar a PINFY_SESSION_KEY", () => {
    const notas = enchat.postInstall!.notes as (v: Record<string, unknown>) => string[];
    expect(notas(valuesValidos).some((n) => n.includes("PINFY_SESSION_KEY"))).toBe(true);
  });
});

describe("enchat — pós-instalação", () => {
  it("setupUrl monta https://<domínio>/?setup=<enchat_setup_token>", () => {
    expect(enchat.postInstall!.setupUrl!(valuesValidos, secrets)).toBe(
      `https://crm.exemplo.com/?setup=${secrets.enchat_setup_token}`
    );
  });

  it("accessUrl continua limpo (sem token) — installer.ts o usa para bater em /api/license", () => {
    expect(enchat.postInstall!.accessUrl!(valuesValidos)).toBe("https://crm.exemplo.com");
  });

  it("as notas citam o link de primeiro acesso, com e sem pareamento", () => {
    const notas = enchat.postInstall!.notes as (v: Record<string, unknown>) => string[];
    for (const v of [valuesValidos, { ...valuesValidos, licenca_pareamento_id: "0".repeat(32) }]) {
      expect(notas(v).some((n) => n.includes("administrador"))).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────
// S4 (achado 2): segredos do Docker no EnchaT, com portão por versão.
// ─────────────────────────────────────────────────────────────────────────

// Valores-sentinela DISTINTOS e reconhecíveis (os MESMOS com que os YAMLs de
// __fixtures__ foram capturados, antes do S4): o teste procura cada um no
// YAML gerado — se um único aparecer, o segredo vazou em texto.
const sentinelas = {
  enchat_master_key: "SENT-master-key",
  postgres_password: "SENT-postgres-pw",
  pinfy_master_key: "SENT-pinfy-master",
  pinfy_webhook_token: "SENT-pinfy-webhook",
  pinfy_panel_password: "SENT-pinfy-panel",
  pinfy_db_password: "SENT-pinfy-dbpw",
  pinfy_session_key: "SENT-pinfy-session",
  updater_token: "SENT-updater-token",
  enchat_setup_token: "SENT-setup-token",
};
const CHAVE_SENTINELA = "SENT-chave-licenca";
const todasSentinelas = [...Object.values(sentinelas), CHAVE_SENTINELA];
const valoresComChave = { url_enchat: "crm.exemplo.com", chave_licenca: CHAVE_SENTINELA };
const valoresSemChave = { url_enchat: "crm.exemplo.com", licenca_pareamento_id: "0".repeat(32) };

function ctxCom(tag: string, extra: Partial<SwarmContext> = {}): SwarmContext {
  return {
    ...ctxBase,
    release: { version: tag, imageRepo: "ghcr.io/enchainterno/enchat-free", imageTag: tag, obrigatoria: false },
    ...extra,
  };
}
const ctxAberto = ctxCom("0.4.1", { versaoSegredos: "1758900000" });

const fixture = (nome: string): string => readFileSync(path.join(__dirname, "__fixtures__", nome), "utf8");

// Trecho `    deploy:` até o fim do bloco do serviço — restart_policy/update_config/
// placement/labels (regra stack-enchat-espelhada: têm que ser idênticos nos dois formatos).
function blocoDeploy(yaml: string, servico: string): string {
  const b = blocoDoServico(yaml, servico);
  return b.slice(b.indexOf("    deploy:"));
}

describe("enchat — portão por versão: abaixo de 0.4.1 o YAML é o de sempre, byte a byte", () => {
  it("0.3.2 com chave: idêntico ao YAML capturado antes do S4", () => {
    expect(enchat.generateYaml(valoresComChave, sentinelas, ctxCom("0.3.2"))).toBe(
      fixture("enchat-formato-antigo-com-chave-0.3.2.yaml")
    );
  });

  it("0.4.0 sem chave (pareamento): idêntico ao YAML capturado antes do S4", () => {
    expect(enchat.generateYaml(valoresSemChave, sentinelas, ctxCom("0.4.0"))).toBe(
      fixture("enchat-formato-antigo-sem-chave-0.4.0.yaml")
    );
  });

  it("tag ilegível ou indefinida também cai no formato antigo (nunca quebra)", () => {
    const antigo = fixture("enchat-formato-antigo-com-chave-0.3.2.yaml");
    // A imagem muda com a tag; comparamos só o resto — nenhum `_FILE`, nenhum bloco de secrets.
    for (const tag of ["latest", "0.4.1-rc1", "beta"]) {
      const yaml = enchat.generateYaml(valoresComChave, sentinelas, ctxCom(tag, { versaoSegredos: "1" }));
      expect(yaml).not.toContain("/run/secrets/");
      expect(yaml).not.toMatch(/^secrets:/m);
      expect(yaml.replaceAll(`:${tag}`, ":0.3.2")).toBe(antigo);
    }
  });

  it("dockerSecrets devolve lista vazia com o portão fechado (o installer não cria nenhum segredo)", () => {
    expect(enchat.dockerSecrets!(valoresComChave, sentinelas, ctxCom("0.3.2"))).toEqual([]);
    expect(enchat.dockerSecrets!(valoresComChave, sentinelas, ctxCom("0.4.0", { versaoSegredos: "1" }))).toEqual([]);
  });

  it("o formato antigo continua com os valores em texto (o que as imagens < 0.4.1 exigem)", () => {
    const yaml = enchat.generateYaml(valoresComChave, sentinelas, ctxCom("0.3.2"));
    for (const v of todasSentinelas) expect(yaml).toContain(v);
  });
});

describe("enchat — com segredos (>= 0.4.1): nenhum valor sensível no YAML", () => {
  for (const [rotulo, valores] of [
    ["com chave de licença", valoresComChave],
    ["sem chave (pareamento)", valoresSemChave],
  ] as const) {
    it(`nenhuma sentinela aparece em texto no YAML (${rotulo})`, () => {
      const yaml = enchat.generateYaml(valores, sentinelas, ctxAberto);
      for (const v of todasSentinelas) expect(yaml, `vazou ${v}`).not.toContain(v);
    });
  }

  it("as URLs de conexão (que carregam a senha) também não aparecem: nem 'postgresql://' com credencial", () => {
    const yaml = enchat.generateYaml(valoresComChave, sentinelas, ctxAberto);
    expect(yaml).not.toMatch(/postgresql:\/\//);
    expect(yaml).not.toMatch(/@enchat_postgres/);
  });

  it("nenhuma das variáveis sensíveis fica como env em texto; todas viram *_FILE", () => {
    const yaml = enchat.generateYaml(valoresComChave, sentinelas, ctxAberto);
    const sensiveis = [
      "DATABASE_URL", "PINFY_MASTER_KEY", "PINFY_WEBHOOK_TOKEN", "PINFY_DB_PASSWORD", "ENCHAT_MASTER_KEY",
      "ENCHAT_SETUP_TOKEN", "LICENSE_KEY", "UPDATER_TOKEN", "MASTER_KEY", "PANEL_PASSWORD", "SESSION_KEY", "POSTGRES_PASSWORD",
    ];
    for (const nome of sensiveis) {
      expect(yaml, `${nome} em texto`).not.toMatch(new RegExp(`^\\s+${nome}:`, "m"));
      expect(yaml, `${nome}_FILE ausente`).toMatch(new RegExp(`^\\s+${nome}_FILE: "/run/secrets/enchat_[a-z_]+"$`, "m"));
    }
  });

  it("cada serviço recebe os *_FILE dos SEUS segredos (e só deles)", () => {
    const yaml = enchat.generateYaml(valoresComChave, sentinelas, ctxAberto);
    const app = blocoDoServico(yaml, "enchat_app");
    for (const f of [
      "DATABASE_URL_FILE: \"/run/secrets/enchat_database_url\"",
      "ENCHAT_MASTER_KEY_FILE: \"/run/secrets/enchat_master_key\"",
      "ENCHAT_SETUP_TOKEN_FILE: \"/run/secrets/enchat_setup_token\"",
      "LICENSE_KEY_FILE: \"/run/secrets/enchat_license_key\"",
      "UPDATER_TOKEN_FILE: \"/run/secrets/enchat_updater_token\"",
      "PINFY_MASTER_KEY_FILE: \"/run/secrets/enchat_pinfy_master_key\"",
      "PINFY_WEBHOOK_TOKEN_FILE: \"/run/secrets/enchat_pinfy_webhook_token\"",
      "PINFY_DB_PASSWORD_FILE: \"/run/secrets/enchat_pinfy_db_password\"",
    ]) expect(app).toContain(f);
    const pinfy = blocoDoServico(yaml, "enchat_pinfy");
    // O Pinfy conecta com a URL DELE (usuário pinfy, ?schema=pinfy), num segredo à parte.
    expect(pinfy).toContain('DATABASE_URL_FILE: "/run/secrets/enchat_pinfy_database_url"');
    for (const f of ["MASTER_KEY_FILE", "PANEL_PASSWORD_FILE", "SESSION_KEY_FILE"]) expect(pinfy).toContain(`${f}: "/run/secrets/enchat_`);
    expect(pinfy).not.toContain("enchat_database_url");
    expect(pinfy).not.toContain("enchat_master_key");
    expect(blocoDoServico(yaml, "enchat_updater")).toContain('UPDATER_TOKEN_FILE: "/run/secrets/enchat_updater_token"');
    expect(blocoDoServico(yaml, "enchat_postgres")).toContain('POSTGRES_PASSWORD_FILE: "/run/secrets/enchat_postgres_password"');
    // O app não recebe nada exclusivo do Pinfy/Postgres.
    for (const f of ["SESSION_KEY", "PANEL_PASSWORD", "enchat_postgres_password", "enchat_pinfy_session_key", "enchat_pinfy_database_url"]) {
      expect(app).not.toContain(f);
    }
  });

  it("segredos externos com nome versionado <base>_<época>, e o alias == o alvo montado", () => {
    const yaml = enchat.generateYaml(valoresComChave, sentinelas, ctxAberto);
    const topo = yaml.slice(yaml.search(/^secrets:$/m));
    const nomes = [...topo.matchAll(/^  (enchat_[a-z_]+):\n    external: true\n    name: (\S+)$/gm)];
    expect(nomes.length).toBe(12);
    for (const [, alias, name] of nomes) expect(name).toBe(`${alias}_1758900000`);
    // Todo `source:` montado num serviço existe no bloco de topo.
    const declarados = new Set(nomes.map((n) => n[1]));
    for (const m of yaml.matchAll(/- source: (\S+)\n {8}target: (\S+)/g)) {
      expect(declarados.has(m[1])).toBe(true);
      expect(m[2]).toBe(m[1]);
    }
  });

  it("sem chave de licença: sem segredo de licença, LICENSE_KEY fica vazio como hoje", () => {
    const yaml = enchat.generateYaml(valoresSemChave, sentinelas, ctxAberto);
    expect(yaml).toContain('LICENSE_KEY: ""');
    expect(yaml).not.toContain("license_key");
    expect(enchat.dockerSecrets!(valoresSemChave, sentinelas, ctxAberto).map((s) => s.base)).not.toContain("enchat_license_key");
  });

  it("mounts: uid/gid/mode do usuário que roda o processo em cada imagem, mode 0400 sempre", () => {
    const yaml = enchat.generateYaml(valoresComChave, sentinelas, ctxAberto);
    const esperado = {
      enchat_app: DONO_SEGREDOS.app,
      enchat_pinfy: DONO_SEGREDOS.pinfy,
      enchat_updater: DONO_SEGREDOS.updater,
      enchat_postgres: DONO_SEGREDOS.postgres,
    };
    expect(DONO_SEGREDOS).toEqual({
      app: { uid: "1000", gid: "1000" }, // USER enchat, adduser -u 1000 (ENCHAT GRÁTIS/Dockerfile)
      pinfy: { uid: "1000", gid: "1000" }, // USER node (node:alpine)
      updater: { uid: "0", gid: "0" }, // sem USER (root, docker.sock)
      postgres: { uid: "0", gid: "0" }, // entrypoint lê *_FILE como root
    });
    for (const [servico, dono] of Object.entries(esperado)) {
      const b = blocoDoServico(yaml, servico);
      const montagens = [...b.matchAll(/- source: (\S+)\n {8}target: \S+\n {8}uid: "(\d+)"\n {8}gid: "(\d+)"\n {8}mode: (\d+)/g)];
      expect(montagens.length, `${servico} sem montagens`).toBeGreaterThan(0);
      // Nenhuma montagem sem uid/gid/mode: contagem de "source:" == contagem de montagens completas.
      expect((b.match(/- source:/g) ?? []).length).toBe(montagens.length);
      for (const [, , uid, gid, mode] of montagens) {
        expect({ uid, gid }, servico).toEqual(dono);
        expect(mode).toBe("0400");
      }
    }
  });

  it("restart_policy/update_config/placement/labels IDÊNTICOS nos dois formatos (regra stack-enchat-espelhada)", () => {
    const antigo = enchat.generateYaml(valoresComChave, sentinelas, ctxCom("0.4.0", { versaoSegredos: "1758900000" }));
    const novo = enchat.generateYaml(valoresComChave, sentinelas, ctxAberto);
    for (const s of ["enchat_app", "enchat_updater", "enchat_pinfy", "enchat_postgres"]) {
      expect(blocoDeploy(novo, s), s).toBe(blocoDeploy(antigo, s));
    }
    // E tudo que NÃO é segredo é igual: tirando as linhas de env sensível
    // (texto ou _FILE), os mounts e o bloco `secrets:` de topo, os dois YAMLs
    // coincidem (a tag da imagem é a única diferença que sobra).
    const normalizar = (y: string, tag: string) =>
      y
        .split(/^secrets:$/m)[0]
        .replace(/^ {4}secrets:\n(?: {6,}.*\n)+/gm, "")
        .split("\n")
        .filter(
          (l) =>
            !/^ {6}(DATABASE_URL|PINFY_MASTER_KEY|PINFY_WEBHOOK_TOKEN|PINFY_DB_PASSWORD|ENCHAT_MASTER_KEY|ENCHAT_SETUP_TOKEN|LICENSE_KEY|UPDATER_TOKEN|MASTER_KEY|PANEL_PASSWORD|SESSION_KEY|POSTGRES_PASSWORD)(_FILE)?:/.test(l)
        )
        .join("\n")
        .replaceAll(`:${tag}`, ":TAG")
        .trimEnd();
    expect(normalizar(novo, "0.4.1")).toBe(normalizar(antigo, "0.4.0"));
  });

  it("sem versaoSegredos com o portão aberto: erro alto (bug do installer), nunca nome sem versão", () => {
    expect(() => enchat.generateYaml(valoresComChave, sentinelas, ctxCom("0.4.1"))).toThrow(/versaoSegredos/);
    expect(() => enchat.dockerSecrets!(valoresComChave, sentinelas, ctxCom("0.4.1"))).toThrow(/versaoSegredos/);
    expect(() => enchat.generateYaml(valoresComChave, sentinelas, ctxCom("0.4.1", { versaoSegredos: "abc" }))).toThrow(/versaoSegredos/);
  });
});

describe("enchat — dockerSecrets (o que o installer cria no Swarm)", () => {
  const specs = () => enchat.dockerSecrets!(valoresComChave, sentinelas, ctxAberto);
  const valorDe = (base: string) => specs().find((s) => s.base === base)?.value;

  it("12 segredos, nomes <base>_<época>, sem repetição", () => {
    const l = specs();
    expect(l.length).toBe(12);
    expect(new Set(l.map((s) => s.name)).size).toBe(12);
    for (const s of l) expect(s.name).toBe(`${s.base}_1758900000`);
  });

  it("valores: cada segredo carrega o valor EFETIVO recebido (o reaproveitado numa reinstalação)", () => {
    expect(valorDe("enchat_master_key")).toBe(sentinelas.enchat_master_key);
    expect(valorDe("enchat_postgres_password")).toBe(sentinelas.postgres_password);
    expect(valorDe("enchat_pinfy_db_password")).toBe(sentinelas.pinfy_db_password);
    expect(valorDe("enchat_pinfy_master_key")).toBe(sentinelas.pinfy_master_key);
    expect(valorDe("enchat_pinfy_webhook_token")).toBe(sentinelas.pinfy_webhook_token);
    expect(valorDe("enchat_pinfy_panel_password")).toBe(sentinelas.pinfy_panel_password);
    expect(valorDe("enchat_pinfy_session_key")).toBe(sentinelas.pinfy_session_key);
    expect(valorDe("enchat_updater_token")).toBe(sentinelas.updater_token);
    expect(valorDe("enchat_setup_token")).toBe(sentinelas.enchat_setup_token);
    expect(valorDe("enchat_license_key")).toBe(CHAVE_SENTINELA);
  });

  it("as URLs seguem o formato de sempre: app com o superusuário enchat; Pinfy como pinfy com ?schema=pinfy", () => {
    expect(valorDe("enchat_database_url")).toBe(
      `postgresql://enchat:${sentinelas.postgres_password}@enchat_postgres:5432/enchat?sslmode=disable`
    );
    expect(valorDe("enchat_pinfy_database_url")).toBe(
      `postgresql://pinfy:${sentinelas.pinfy_db_password}@enchat_postgres:5432/enchat?schema=pinfy&sslmode=disable`
    );
  });

  it("a senha do Postgres do segredo é a MESMA embutida na URL do app (volume existente mantém a senha antiga)", () => {
    const senha = valorDe("enchat_postgres_password")!;
    expect(valorDe("enchat_database_url")).toContain(`:${senha}@`);
  });

  it("nenhum valor de segredo é vazio (o Docker recusa)", () => {
    for (const s of specs()) expect(s.value.length).toBeGreaterThan(0);
  });

  it("a mesma chave de licença sanitizada que o formato antigo mandaria (sem aspas/crase/quebra de linha)", () => {
    const l = enchat.dockerSecrets!({ ...valoresComChave, chave_licenca: 'AB"C`D\nE' }, sentinelas, ctxAberto);
    expect(l.find((s) => s.base === "enchat_license_key")!.value).toBe("ABCDE");
  });
});
