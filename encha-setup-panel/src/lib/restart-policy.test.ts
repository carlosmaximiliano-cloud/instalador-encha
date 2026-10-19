import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DockerServiceFull } from "./portainer";
import { enchat } from "./stacks/enchat";
import { enchaTracker } from "./stacks/encha-tracker";
import {
  aplicarPatchRestartCompose,
  dentroDaJanela,
  emUpdateEmCurso,
  planejarServico,
  planejarStack,
  politicaConforme,
  politicaDesejada,
  RestartPolicyError,
  STACK_RESTART_ENCHAT,
  STACK_RESTART_PAINEL,
  STACK_RESTART_TRACKER,
} from "./restart-policy";

const secretsEnchat = {
  enchat_master_key: "m", postgres_password: "p", pinfy_master_key: "pm", pinfy_webhook_token: "pw",
  pinfy_panel_password: "pp", pinfy_db_password: "pd", pinfy_session_key: "ps", updater_token: "u", enchat_setup_token: "st",
};
const ctx = (imageRepo: string, tag: string) => ({
  networkName: "rede", serverName: "x", email: "e@x.com",
  release: { version: tag, imageRepo, imageTag: tag, obrigatoria: false },
  machineId: "0123456789abcdef0123456789abcdef", fingerprint: "f", versaoSegredos: "1758900000",
});

// O que uma instalação ANTIGA tem no Portainer: on-failure e max_attempts: 5 no app
// (a 84 antiga), on-failure sem limite nos demais. Os templates de hoje já saem em `any`.
function antigo(yaml: string): string {
  return yaml.replace(/condition: any/g, "condition: on-failure").replace(/(  enchat_app:[\s\S]*?delay: 5s\n)/, "$1        max_attempts: 5\n");
}

const enchatNovo = enchat.generateYaml({ url_enchat: "crm.exemplo.com", chave_licenca: "K" }, secretsEnchat, ctx("ghcr.io/enchainterno/enchat-free", "0.4.7"));
const enchatAntigo = antigo(enchatNovo);
const trackerNovo = enchaTracker.generateYaml(
  { dominio_tracker: "t.exemplo.com", email_ativacao: "c@exemplo.com", senha_admin: "SenhaForte#123" },
  { tracker_master_key: "m", postgres_password: "p", updater_token: "u" },
  ctx("ghcr.io/cheiodecoisa/encha-tracker", "1.2.3")
);
const trackerAntigo = antigo(trackerNovo);

describe("politicaConforme / politicaDesejada", () => {
  it("só any sem limite é conforme; ausente = default do Swarm", () => {
    expect(politicaConforme(undefined)).toBe(true);
    expect(politicaConforme({ Condition: "any" })).toBe(true);
    expect(politicaConforme({ Condition: "any", MaxAttempts: 0 })).toBe(true);
    expect(politicaConforme({ Condition: "on-failure" })).toBe(false);
    expect(politicaConforme({ Condition: "none" })).toBe(false);
    expect(politicaConforme({ Condition: "any", MaxAttempts: 5 })).toBe(false);
  });

  it("a política nova mantém Delay e Window e zera o resto do que importa", () => {
    expect(politicaDesejada({ Condition: "on-failure", Delay: 5e9, MaxAttempts: 5, Window: 1e9 })).toEqual({
      Condition: "any", Delay: 5e9, MaxAttempts: 0, Window: 1e9,
    });
  });
});

describe("dentroDaJanela (02h–05h America/Sao_Paulo)", () => {
  // São Paulo é UTC-3 o ano todo (sem horário de verão desde 2019).
  const utc = (h: number, min = 0) => Date.UTC(2026, 9, 17, h, min);
  it("02:00 inclusive até 05:00 exclusive", () => {
    expect(dentroDaJanela(utc(4, 59))).toBe(false); // 01:59
    expect(dentroDaJanela(utc(5, 0))).toBe(true); // 02:00
    expect(dentroDaJanela(utc(7, 59))).toBe(true); // 04:59
    expect(dentroDaJanela(utc(8, 0))).toBe(false); // 05:00
    expect(dentroDaJanela(utc(17, 59))).toBe(false); // 14:59 — a hora do incidente
  });
});

function svc(nome: string, over: { image?: string; rp?: unknown; mode?: unknown; upd?: string } = {}): DockerServiceFull {
  return {
    ID: `id-${nome}`,
    Version: { Index: 3 },
    UpdateStatus: over.upd ? { State: over.upd } : undefined,
    Spec: {
      Name: nome,
      Mode: over.mode ?? { Replicated: { Replicas: 1 } },
      TaskTemplate: { ContainerSpec: { Image: over.image ?? "x" }, RestartPolicy: over.rp },
    },
  } as unknown as DockerServiceFull;
}

const PG = "pgvector/pgvector:pg16";
const APP = "ghcr.io/enchainterno/enchat-free:0.4.7";
const OF = { Condition: "on-failure", Delay: 5e9, MaxAttempts: 5 };

describe("planejarServico — allowlist fechada", () => {
  const [pg, app] = STACK_RESTART_ENCHAT.servicos;
  it("ajusta quem está em on-failure/max_attempts", () => {
    const p = planejarServico(pg, svc(pg.swarm, { image: PG, rp: { Condition: "on-failure" } }));
    expect(p).toMatchObject({ acao: "ajustar", para: { Condition: "any", MaxAttempts: 0 } });
    expect(planejarServico(app, svc(app.swarm, { image: APP, rp: OF }))).toMatchObject({ acao: "ajustar" });
  });

  it("já conforme: nada a fazer (idempotente)", () => {
    expect(planejarServico(pg, svc(pg.swarm, { image: PG, rp: { Condition: "any", Delay: 5e9 } })).acao).toBe("conforme");
    expect(planejarServico(pg, svc(pg.swarm, { image: PG })).acao).toBe("conforme");
  });

  it("ausente, nome fora da allowlist, imagem fora do padrão e job são PULADOS", () => {
    expect(planejarServico(pg, null)).toMatchObject({ acao: "pular", motivo: "ausente" });
    expect(planejarServico(pg, svc("enchat_n8n", { image: PG, rp: OF }))).toMatchObject({ acao: "pular", motivo: "nome_fora_da_allowlist" });
    expect(planejarServico(app, svc(app.swarm, { image: "ghcr.io/outro/enchat:1.0.0", rp: OF }))).toMatchObject({ acao: "pular", motivo: "imagem_fora_do_padrao" });
    expect(planejarServico(app, svc(app.swarm, { image: PG, rp: OF }))).toMatchObject({ acao: "pular", motivo: "imagem_fora_do_padrao" });
    expect(planejarServico(pg, svc(pg.swarm, { image: PG, rp: { Condition: "none" }, mode: { ReplicatedJob: {} } }))).toMatchObject({ acao: "pular", motivo: "modo_nao_replicado" });
  });

  it("planejarStack devolve na ordem segura: banco primeiro", () => {
    const vivos = Object.fromEntries(
      STACK_RESTART_ENCHAT.servicos.map((s) => [s.swarm, svc(s.swarm, { image: s.papel === "banco" ? PG : s.papel === "pinfy" ? "ghcr.io/enchainterno/pinfy:0.4.7" : s.papel === "updater" ? "ghcr.io/enchainterno/enchat-updater:0.4.7" : APP, rp: OF })])
    );
    expect(planejarStack(STACK_RESTART_ENCHAT, vivos).map((p) => p.servico.papel)).toEqual(["banco", "app", "pinfy", "updater"]);
  });
});

describe("emUpdateEmCurso", () => {
  it("ausente ou terminal = assentado; updating/rollback_started = em curso", () => {
    expect(emUpdateEmCurso(svc("a"))).toBe(false);
    expect(emUpdateEmCurso(svc("a", { upd: "completed" }))).toBe(false);
    expect(emUpdateEmCurso(svc("a", { upd: "rollback_completed" }))).toBe(false);
    expect(emUpdateEmCurso(svc("a", { upd: "updating" }))).toBe(true);
    expect(emUpdateEmCurso(svc("a", { upd: "rollback_started" }))).toBe(true);
  });
});

describe("aplicarPatchRestartCompose — enchat", () => {
  it("troca só o restart_policy dos 4 serviços e mantém delay, comentários e o resto", () => {
    const r = aplicarPatchRestartCompose(enchatAntigo, STACK_RESTART_ENCHAT);
    expect(r.nadaAFazer).toBe(false);
    expect(r.mudancas.map((m) => m.servico).sort()).toEqual(["enchat_app", "enchat_pinfy", "enchat_postgres", "enchat_updater"]);
    expect(r.mudancas.find((m) => m.servico === "enchat_app")).toEqual({ servico: "enchat_app", de: "on-failure/max_attempts=5", para: "any" });
    // Resultado == template de hoje (que já nasce em any), byte a byte.
    expect(r.compose).toBe(enchatNovo);
  });

  it("é idempotente: aplicar de novo não muda nada", () => {
    const uma = aplicarPatchRestartCompose(enchatAntigo, STACK_RESTART_ENCHAT);
    const duas = aplicarPatchRestartCompose(uma.compose, STACK_RESTART_ENCHAT);
    expect(duas.nadaAFazer).toBe(true);
    expect(duas.compose).toBe(uma.compose);
    expect(aplicarPatchRestartCompose(enchatNovo, STACK_RESTART_ENCHAT).nadaAFazer).toBe(true);
  });

  it("edição do cliente fora do restart_policy sobrevive (env, labels, update_config)", () => {
    const editado = enchatAntigo.replace('TZ: "America/Sao_Paulo"', 'TZ: "America/Sao_Paulo"\n      MINHA_VAR: "1"');
    const r = aplicarPatchRestartCompose(editado, STACK_RESTART_ENCHAT);
    expect(r.compose).toContain('MINHA_VAR: "1"');
    expect(r.compose).toContain("order: start-first");
  });

  it("imagem fora do padrão num serviço: pula só esse e relata", () => {
    const editado = enchatAntigo.replace(/image: ghcr\.io\/enchainterno\/pinfy:.*/, "image: meu-registro.com/pinfy:1");
    const r = aplicarPatchRestartCompose(editado, STACK_RESTART_ENCHAT);
    expect(r.pulados).toContainEqual({ servico: "enchat_pinfy", motivo: "imagem_fora_do_padrao" });
    expect(r.mudancas.map((m) => m.servico)).not.toContain("enchat_pinfy");
    expect(r.compose).toContain("image: meu-registro.com/pinfy:1");
  });

  it("serviço fora da allowlist (n8n etc.) fica intacto", () => {
    const comOutro = `${enchatAntigo.replace(/\nnetworks:/, "\n  outro:\n    image: n8nio/n8n:1\n    deploy:\n      restart_policy:\n        condition: on-failure\n        max_attempts: 3\n\nnetworks:")}`;
    const r = aplicarPatchRestartCompose(comOutro, STACK_RESTART_ENCHAT);
    expect(r.compose).toContain("        condition: on-failure\n        max_attempts: 3");
    expect(r.mudancas.map((m) => m.servico)).not.toContain("outro");
  });

  it("serviço ausente (instalação sem ele) é pulado, não falha", () => {
    const semPinfy = enchatAntigo.replace(/  enchat_pinfy:[\s\S]*?(?=  enchat_postgres:)/, "");
    const r = aplicarPatchRestartCompose(semPinfy, STACK_RESTART_ENCHAT);
    expect(r.pulados).toContainEqual({ servico: "enchat_pinfy", motivo: "ausente" });
    expect(r.mudancas).toHaveLength(3);
  });

  it("formatos que não sabemos editar abortam (CRLF, flow style, valor interpolado)", () => {
    expect(() => aplicarPatchRestartCompose(enchatAntigo.replace(/\n/g, "\r\n"), STACK_RESTART_ENCHAT)).toThrow(RestartPolicyError);
    expect(() =>
      aplicarPatchRestartCompose(enchatAntigo.replace(/      restart_policy:\n        condition: on-failure\n        delay: 5s\n/, "      restart_policy: {condition: on-failure}\n"), STACK_RESTART_ENCHAT)
    ).toThrow(RestartPolicyError);
    expect(() => aplicarPatchRestartCompose(enchatAntigo.replace("condition: on-failure", "condition: ${POLITICA}"), STACK_RESTART_ENCHAT)).toThrow(RestartPolicyError);
  });

  it("condition entre aspas e comentário no fim da linha", () => {
    const y = enchatAntigo.replace("condition: on-failure", 'condition: "on-failure" # antigo');
    const r = aplicarPatchRestartCompose(y, STACK_RESTART_ENCHAT);
    expect(r.compose).not.toContain("antigo");
    expect(r.mudancas.length).toBeGreaterThan(0);
  });

  it("max_attempts sem linha de condition vira condition: any (o bloco nunca fica vazio)", () => {
    const y = enchatNovo.replace(/(  enchat_postgres:[\s\S]*?      restart_policy:\n)        condition: any\n/, "$1        max_attempts: 4\n");
    const r = aplicarPatchRestartCompose(y, STACK_RESTART_ENCHAT);
    expect(r.mudancas).toEqual([{ servico: "enchat_postgres", de: "any/max_attempts=4", para: "any" }]);
    expect(r.compose).toBe(enchatNovo);
  });
});

describe("aplicarPatchRestartCompose — tracker e painel", () => {
  it("tracker: app, updater e postgres", () => {
    const r = aplicarPatchRestartCompose(trackerAntigo, STACK_RESTART_TRACKER);
    expect(r.mudancas.map((m) => m.servico).sort()).toEqual(["app", "postgres", "updater"]);
    expect(r.compose).toBe(trackerNovo);
  });

  it("painel: tira on-failure e max_attempts do docker-stack.yaml antigo e mantém o resto", () => {
    const novo = readFileSync(path.join(__dirname, "..", "..", "docker-stack.yaml"), "utf8");
    const velho = novo.replace("condition: any\n", "condition: on-failure\n        max_attempts: 5\n");
    expect(velho).not.toBe(novo);
    const r = aplicarPatchRestartCompose(velho, STACK_RESTART_PAINEL);
    expect(r.mudancas).toEqual([{ servico: "panel", de: "on-failure/max_attempts=5", para: "any" }]);
    expect(r.compose).toBe(novo);
    expect(aplicarPatchRestartCompose(novo, STACK_RESTART_PAINEL).nadaAFazer).toBe(true);
  });
});
