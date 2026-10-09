import { describe, expect, it } from "vitest";
import { enchat } from "./stacks/enchat";
import type { SwarmContext } from "./stacks/types";
import {
  FixarVersoesError,
  analisarImagens,
  aplicarPatchCompose,
  sidecarTemVigilia,
} from "./fixar-versoes";

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

// Instalação ANTIGA: 0.3.2 (abaixo do mínimo de segredos Docker => variáveis em
// texto, formato de sempre).
const ctxAntigo: SwarmContext = {
  networkName: "rede_traefik",
  serverName: "vps-teste",
  email: "operador@exemplo.com",
  release: { version: "0.3.2", imageRepo: "ghcr.io/enchainterno/enchat-free", imageTag: "0.3.2", obrigatoria: false },
  machineId: "0123456789abcdef0123456789abcdef",
  fingerprint: "58132042721689d3e6fb25654444e5b7",
};
const values = { url_enchat: "crm.exemplo.com", chave_licenca: "CHAVE-DE-TESTE-123" };

const yamlAntigo = enchat.generateYaml(values, secrets, ctxAntigo);
// O YAML de uma instalação anterior ao reset de senha não tinha as duas vars.
const yamlSemAdmin = yamlAntigo
  .split("\n")
  .filter((l) => !/^\s+(ENCHAT_ADMIN_EMAIL|ENCHAT_ADMIN_SENHA):/.test(l) && !/Reset de senha do Super Admin|preencher as DUAS|^\s+# depois de entrar|senha muda \(internal/.test(l))
  .join("\n");

const ALVO_FULL = {
  app: "ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7",
  pinfy: "ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7",
  updater: "ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7",
};

describe("analisarImagens", () => {
  it("full coerente", () => {
    const r = analisarImagens({
      app: "ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7",
      pinfy: "ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7",
      updater: "ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7",
    });
    expect(r.edicao).toBe("full");
    expect(r.tag).toBe("0.4.7");
  });

  it("free coerente, com sidecar de outra versão (≤0.3.0 não se autoatualiza)", () => {
    const r = analisarImagens({
      app: "ghcr.io/enchainterno/enchat-free:0.4.6",
      pinfy: "ghcr.io/enchainterno/pinfy:0.4.6",
      updater: "ghcr.io/enchainterno/enchat-updater:0.3.0",
    });
    expect(r.edicao).toBe("free");
    expect(r.tagUpdater).toBe("0.3.0");
    expect(sidecarTemVigilia(r.tagUpdater)).toBe(false);
  });

  it("aceita beta-<sha12>", () => {
    const r = analisarImagens({
      app: "ghcr.io/carlosmaximiliano-cloud/enchat:beta-0123456789ab",
      pinfy: "ghcr.io/carlosmaximiliano-cloud/pinfy:beta-0123456789ab",
      updater: "ghcr.io/carlosmaximiliano-cloud/enchat-updater:beta-0123456789ab",
    });
    expect(sidecarTemVigilia(r.tagUpdater)).toBe(true);
  });

  it("aceita o digest exato do spec e o preserva", () => {
    const d = "@sha256:" + "c".repeat(64);
    const r = analisarImagens({
      app: `ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7${d}`,
      pinfy: `ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7${d}`,
      updater: "ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7",
    });
    expect(r.app).toBe(`ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7${d}`);
    expect(r.tag).toBe("0.4.7");
  });

  it("recusa digest malformado", () => {
    expect(() =>
      analisarImagens({
        app: "ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7@sha256:abc",
        pinfy: "ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7",
        updater: "ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7",
      })
    ).toThrowError(expect.objectContaining({ codigo: "imagens_invalidas" }));
  });

  it("recusa app e Pinfy em versões diferentes", () => {
    expect(() =>
      analisarImagens({
        app: "ghcr.io/enchainterno/enchat-free:0.4.7",
        pinfy: "ghcr.io/enchainterno/pinfy:0.4.6",
        updater: "ghcr.io/enchainterno/enchat-updater:0.4.7",
      })
    ).toThrowError(expect.objectContaining({ codigo: "versoes_divergentes" }));
  });

  it.each([
    ["repo fora da gramática", { app: "ghcr.io/evil/enchat:0.4.7" }],
    ["tag latest", { app: "ghcr.io/enchainterno/enchat-free:latest" }],
    ["dono trocado no app (free repo no dono full)", { app: "ghcr.io/carlosmaximiliano-cloud/enchat-free:0.4.7" }],
    ["pinfy de outro dono", { pinfy: "ghcr.io/enchainterno/pinfy:0.4.7" }],
    ["updater ausente", { updater: undefined }],
  ])("recusa: %s", (_n, over) => {
    const base = {
      app: "ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7",
      pinfy: "ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7",
      updater: "ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7",
    };
    expect(() => analisarImagens({ ...base, ...over })).toThrowError(
      expect.objectContaining({ codigo: "imagens_invalidas" })
    );
  });
});

describe("sidecarTemVigilia", () => {
  it.each([
    ["0.4.7", true],
    ["0.4.8", true],
    ["0.5.0", true],
    ["0.4.6", false],
    ["0.3.9", false],
  ])("%s -> %s", (v, esperado) => expect(sidecarTemVigilia(v)).toBe(esperado));
});

describe("aplicarPatchCompose", () => {
  it("troca só as três linhas image: e acrescenta as vars de admin faltantes", () => {
    const r = aplicarPatchCompose(yamlSemAdmin, ALVO_FULL);
    expect(r.mudancas.map((m) => m.servico)).toEqual(["enchat_app", "enchat_pinfy", "enchat_updater"]);
    expect(r.varsAdmin).toEqual(["ENCHAT_ADMIN_EMAIL", "ENCHAT_ADMIN_SENHA"]);
    expect(r.compose).toContain(`    image: ${ALVO_FULL.app}`);
    expect(r.compose).toContain('      ENCHAT_ADMIN_EMAIL: ""');
    expect(r.compose).toContain('      ENCHAT_ADMIN_SENHA: ""');

    // Fora essas linhas, o compose é byte a byte o anterior.
    const velhas = yamlSemAdmin.split("\n");
    const novas = r.compose.split("\n");
    const imagensVelhas = velhas.filter((l) => /^ {4}image:/.test(l));
    const semMudanca = (ls: string[]) =>
      ls.filter((l) => !/^ {4}image:/.test(l) && !/ENCHAT_ADMIN_|Reset de senha|preencher as DUAS|depois de entrar|senha muda/.test(l));
    expect(semMudanca(novas)).toEqual(semMudanca(velhas));
    expect(imagensVelhas).toHaveLength(4); // app, updater, pinfy e postgres (este nunca é tocado)
    expect(novas.filter((l) => /^ {4}image:/.test(l))).toContain("    image: pgvector/pgvector:pg16");
  });

  it("preserva variáveis editadas pelo cliente (WhatsApp, Instagram, senha de admin já preenchida)", () => {
    const editado = yamlAntigo
      .replace('WHATSAPP_APP_SECRET: ""', 'WHATSAPP_APP_SECRET: "segredo-do-cliente"')
      .replace('INSTAGRAM_APP_ID: ""', 'INSTAGRAM_APP_ID: "123456"')
      .replace('ENCHAT_ADMIN_SENHA: ""', 'ENCHAT_ADMIN_SENHA: "nova-senha-12345"');
    const r = aplicarPatchCompose(editado, ALVO_FULL);
    expect(r.varsAdmin).toEqual([]);
    expect(r.compose).toContain('WHATSAPP_APP_SECRET: "segredo-do-cliente"');
    expect(r.compose).toContain('INSTAGRAM_APP_ID: "123456"');
    expect(r.compose).toContain('ENCHAT_ADMIN_SENHA: "nova-senha-12345"');
  });

  it("é idempotente: aplicar de novo não muda nada", () => {
    const um = aplicarPatchCompose(yamlSemAdmin, ALVO_FULL);
    const dois = aplicarPatchCompose(um.compose, ALVO_FULL);
    expect(dois.nadaAFazer).toBe(true);
    expect(dois.compose).toBe(um.compose);
  });

  it("acrescenta só a var que falta", () => {
    const semSenha = yamlAntigo.replace(/^\s+ENCHAT_ADMIN_SENHA:.*\n/m, "");
    const r = aplicarPatchCompose(semSenha, ALVO_FULL);
    expect(r.varsAdmin).toEqual(["ENCHAT_ADMIN_SENHA"]);
    expect(r.compose.match(/ENCHAT_ADMIN_EMAIL:/g)).toHaveLength(1);
  });

  it("segredos, rede e labels não são tocados", () => {
    const r = aplicarPatchCompose(yamlSemAdmin, ALVO_FULL);
    for (const trecho of [
      'ENCHAT_MASTER_KEY: "master-key-fake"',
      'POSTGRES_PASSWORD: "postgres-pw-fake"',
      "traefik.http.routers.enchat-free.rule",
      "- /var/run/docker.sock:/var/run/docker.sock",
    ]) {
      expect(r.compose).toContain(trecho);
    }
  });

  it("serviço ausente aborta", () => {
    expect(() => aplicarPatchCompose(yamlAntigo.replace("  enchat_pinfy:", "  outro:"), ALVO_FULL)).toThrowError(
      expect.objectContaining({ codigo: "compose_inesperado" })
    );
  });

  it("duas linhas image: no mesmo serviço aborta", () => {
    const dup = yamlAntigo.replace("    hostname: enchat-app", "    image: x/y:1\n    hostname: enchat-app");
    expect(() => aplicarPatchCompose(dup, ALVO_FULL)).toThrowError(expect.objectContaining({ codigo: "compose_inesperado" }));
  });

  it("image interpolada (${VAR}) aborta", () => {
    const interp = yamlAntigo.replace(/^ {4}image: .*enchat-free.*$/m, "    image: ${IMG}");
    expect(() => aplicarPatchCompose(interp, ALVO_FULL)).toThrowError(expect.objectContaining({ codigo: "compose_inesperado" }));
  });

  it("environment em formato lista aborta", () => {
    const lista = yamlAntigo.replace(/(  enchat_app:[\s\S]*?    environment:\n)(      )/, "$1      - ");
    expect(() => aplicarPatchCompose(lista, ALVO_FULL)).toThrowError(expect.objectContaining({ codigo: "compose_inesperado" }));
  });

  it("CRLF aborta", () => {
    expect(() => aplicarPatchCompose(yamlAntigo.replace(/\n/g, "\r\n"), ALVO_FULL)).toThrowError(FixarVersoesError);
  });

  it("com segredos Docker (0.4.3): continua casando e só troca image:", () => {
    const novo = enchat.generateYaml(values, secrets, {
      ...ctxAntigo,
      release: { version: "0.4.3", imageRepo: "ghcr.io/enchainterno/enchat-free", imageTag: "0.4.3", obrigatoria: false },
      versaoSegredos: "1700000000",
      imagensSuportamSegredos: true,
    });
    const r = aplicarPatchCompose(novo, ALVO_FULL);
    expect(r.mudancas).toHaveLength(3);
    expect(r.varsAdmin).toEqual([]);
    expect(r.compose).toContain("secrets:");
  });
});
