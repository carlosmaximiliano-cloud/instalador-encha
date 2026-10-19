import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

let tmp: string;
beforeEach(() => {
  vi.resetModules();
  tmp = mkdtempSync(path.join(tmpdir(), "encha-flag-"));
  process.env.DB_PATH = path.join(tmp, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmp, "master.key");
  delete process.env.ENCHA_SYNC_STACK;
  delete process.env.ENCHA_RECONCILIAR_RESTART;
});
afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
  delete process.env.DB_PATH;
  delete process.env.MASTER_KEY_PATH;
  delete process.env.ENCHA_SYNC_STACK;
});

const resp = (corpo: unknown, ok = true) => (async () => ({ ok, json: async () => corpo }) as unknown as Response) as unknown as typeof fetch;

describe("decidirFlag (fail-safe: só liga com sinal explícito)", () => {
  it.each([
    ["ligado", { sincronizar_stack_enchat: "ligado" }, null, true],
    ["desligado", { sincronizar_stack_enchat: "desligado" }, "fp1", false],
    ["canário com o fingerprint na lista", { sincronizar_stack_enchat: "canario", canario: ["fp1"] }, "fp1", true],
    ["canário sem estar na lista", { sincronizar_stack_enchat: "canario", canario: ["fp2"] }, "fp1", false],
    ["canário sem fingerprint local", { sincronizar_stack_enchat: "canario", canario: ["fp1"] }, null, false],
    ["valor desconhecido", { sincronizar_stack_enchat: "talvez" }, "fp1", false],
    ["campo ausente", {}, "fp1", false],
    ["não é objeto", "ligado", "fp1", false],
    ["null", null, "fp1", false],
  ])("%s", async (_n, corpo, fp, esperado) => {
    const { decidirFlag } = await import("./flag-sincronizacao");
    expect(decidirFlag(corpo, fp)).toBe(esperado);
  });
});

describe("sincronizacaoAutomaticaLigada", () => {
  it("liga quando o Console diz ligado", async () => {
    const { sincronizacaoAutomaticaLigada } = await import("./flag-sincronizacao");
    expect(await sincronizacaoAutomaticaLigada(1, resp({ sincronizar_stack_enchat: "ligado" }))).toBe(true);
  });
  it("Console com erro HTTP, rede caída ou timeout = desligado", async () => {
    const { sincronizacaoAutomaticaLigada, limparCacheFlag } = await import("./flag-sincronizacao");
    expect(await sincronizacaoAutomaticaLigada(1, resp({ sincronizar_stack_enchat: "ligado" }, false))).toBe(false);
    limparCacheFlag();
    expect(await sincronizacaoAutomaticaLigada(1, (async () => { throw new Error("rede"); }) as unknown as typeof fetch)).toBe(false);
  });
  it("kill switch local vence o Console", async () => {
    process.env.ENCHA_SYNC_STACK = "off";
    const { sincronizacaoAutomaticaLigada } = await import("./flag-sincronizacao");
    const f = vi.fn(resp({ sincronizar_stack_enchat: "ligado" }));
    expect(await sincronizacaoAutomaticaLigada(1, f as unknown as typeof fetch)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });
  it("cacheia por 10 min (não consulta o Console a cada tick)", async () => {
    const { sincronizacaoAutomaticaLigada } = await import("./flag-sincronizacao");
    const f = vi.fn(resp({ sincronizar_stack_enchat: "ligado" }));
    await sincronizacaoAutomaticaLigada(0, f as unknown as typeof fetch);
    await sincronizacaoAutomaticaLigada(5 * 60_000, f as unknown as typeof fetch);
    expect(f).toHaveBeenCalledOnce();
    await sincronizacaoAutomaticaLigada(11 * 60_000, f as unknown as typeof fetch);
    expect(f).toHaveBeenCalledTimes(2);
  });
});

describe("decidirFlag — chave reconciliar_restart (independente da outra)", () => {
  it.each([
    ["ligado", { reconciliar_restart: "ligado" }, null, true],
    ["desligado", { reconciliar_restart: "desligado" }, "fp1", false],
    ["ausente (Console antigo) = desligado, mesmo com a outra ligada", { sincronizar_stack_enchat: "ligado" }, "fp1", false],
    ["reconciliar_restart: canario nunca liga (o Console já resolve o canário)", { reconciliar_restart: "canario", canario: ["fp1"] }, "fp1", false],
    ["valor desconhecido", { reconciliar_restart: "sim" }, "fp1", false],
  ])("%s", async (_n, corpo, fp, esperado) => {
    const { decidirFlag } = await import("./flag-sincronizacao");
    expect(decidirFlag(corpo, fp, "reconciliar_restart")).toBe(esperado);
  });

  it("a chave nova não liga a antiga", async () => {
    const { decidirFlag } = await import("./flag-sincronizacao");
    expect(decidirFlag({ reconciliar_restart: "ligado" }, "fp1")).toBe(false);
  });
});

describe("reconciliacaoRestartLigada", () => {
  it("liga só com reconciliar_restart explícito", async () => {
    const { reconciliacaoRestartLigada } = await import("./flag-sincronizacao");
    expect(await reconciliacaoRestartLigada(1, resp({ reconciliar_restart: "ligado" }))).toBe(true);
  });
  it("desligada por padrão: chave ausente, erro HTTP ou rede caída", async () => {
    const { reconciliacaoRestartLigada, limparCacheFlag } = await import("./flag-sincronizacao");
    expect(await reconciliacaoRestartLigada(1, resp({ sincronizar_stack_enchat: "ligado" }))).toBe(false);
    limparCacheFlag();
    expect(await reconciliacaoRestartLigada(1, resp({ reconciliar_restart: "ligado" }, false))).toBe(false);
    limparCacheFlag();
    expect(await reconciliacaoRestartLigada(1, (async () => { throw new Error("rede"); }) as unknown as typeof fetch)).toBe(false);
  });
  it("kill switch local vence o Console e nem o consulta", async () => {
    process.env.ENCHA_RECONCILIAR_RESTART = "off";
    const { reconciliacaoRestartLigada } = await import("./flag-sincronizacao");
    const f = vi.fn(resp({ reconciliar_restart: "ligado" }));
    expect(await reconciliacaoRestartLigada(1, f as unknown as typeof fetch)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });
  it("cada chave tem o seu cache: ligar uma não herda a resposta da outra", async () => {
    const { reconciliacaoRestartLigada, sincronizacaoAutomaticaLigada } = await import("./flag-sincronizacao");
    const f = vi.fn(resp({ sincronizar_stack_enchat: "ligado", reconciliar_restart: "desligado" }));
    expect(await sincronizacaoAutomaticaLigada(0, f as unknown as typeof fetch)).toBe(true);
    expect(await reconciliacaoRestartLigada(1, f as unknown as typeof fetch)).toBe(false);
  });
});
