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
