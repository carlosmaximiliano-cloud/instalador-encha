import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// Autoatualização do painel (triggerSelfUpdate): além da imagem, o ARQUIVO da
// stack `encha-panel` (e o spec no fallback) ganham a restart_policy `any` sem
// max_attempts — sem tocar em nomes e sem reiniciar o painel por causa disso.
// Só com a chave remota `reconciliar_restart` ligada (a mesma do reconciliador);
// desligada ou com a consulta falhando, o update segue sem tocar na política.

const m = vi.hoisted(() => ({
  discoverContext: vi.fn(),
  listStacks: vi.fn(),
  getStackFile: vi.fn(),
  getStackById: vi.fn(),
  updateSwarmStack: vi.fn(),
  getServiceByName: vi.fn(),
  updateServiceImage: vi.fn(),
  reconciliacaoRestartLigada: vi.fn(),
}));

vi.mock("./flag-sincronizacao", () => ({
  reconciliacaoRestartLigada: m.reconciliacaoRestartLigada,
}));

vi.mock("./portainer", () => ({
  discoverContext: m.discoverContext,
  listStacks: m.listStacks,
  getStackFile: m.getStackFile,
  getStackById: m.getStackById,
  updateSwarmStack: m.updateSwarmStack,
  getServiceByName: m.getServiceByName,
  updateServiceImage: m.updateServiceImage,
  PortainerError: class PortainerError extends Error {
    constructor(public status: number, msg: string) {
      super(msg);
    }
  },
}));

const atual = readFileSync(path.join(__dirname, "..", "..", "docker-stack.yaml"), "utf8");
const velho = atual.replace("condition: any\n", "condition: on-failure\n        max_attempts: 5\n");

beforeEach(() => {
  vi.resetModules();
  Object.values(m).forEach((f) => f.mockReset());
  m.reconciliacaoRestartLigada.mockResolvedValue(true);
  m.discoverContext.mockResolvedValue({ endpointId: 7, swarmId: "s" });
  m.listStacks.mockResolvedValue([{ Id: 5, Name: "encha-panel" }]);
  m.getStackFile.mockResolvedValue(velho);
  m.getStackById.mockResolvedValue({ Id: 5, Env: [{ name: "PANEL_IMAGE_TAG", value: "0.3.15" }] });
  m.updateSwarmStack.mockResolvedValue(undefined);
});
afterEach(() => {
  vi.clearAllMocks();
});

describe("triggerSelfUpdate — arquivo da stack encha-panel", () => {
  it("o PUT leva o compose com restart_policy any, sem max_attempts, e a tag nova", async () => {
    const { triggerSelfUpdate } = await import("./updater");
    expect(await triggerSelfUpdate("t", "0.3.17")).toEqual({ ok: true });
    expect(m.updateSwarmStack).toHaveBeenCalledOnce();
    const [, stackId, endpointId, corpo] = m.updateSwarmStack.mock.calls[0];
    expect([stackId, endpointId]).toEqual([5, 7]);
    expect(corpo.stackFileContent).toBe(atual);
    expect(corpo.stackFileContent).not.toContain("max_attempts");
    expect(corpo.env).toEqual([{ name: "PANEL_IMAGE_TAG", value: "0.3.17" }]);
    expect(corpo.pullImage).toBe(true);
  });

  it("compose já conforme: vai como está", async () => {
    m.getStackFile.mockResolvedValue(atual);
    const { triggerSelfUpdate } = await import("./updater");
    await triggerSelfUpdate("t", "0.3.17");
    expect(m.updateSwarmStack.mock.calls[0][3].stackFileContent).toBe(atual);
  });

  it("compose num formato que não sabemos editar: segue com o original (nunca bloqueia o update)", async () => {
    const estranho = velho.replace(/      restart_policy:\n        condition: on-failure\n        max_attempts: 5\n/, "      restart_policy: {condition: on-failure}\n");
    m.getStackFile.mockResolvedValue(estranho);
    const { triggerSelfUpdate } = await import("./updater");
    expect(await triggerSelfUpdate("t", "0.3.17")).toEqual({ ok: true });
    expect(m.updateSwarmStack.mock.calls[0][3].stackFileContent).toBe(estranho);
  });

  it("chave reconciliar_restart desligada (ou ENCHA_RECONCILIAR_RESTART=off): o compose não é tocado", async () => {
    m.reconciliacaoRestartLigada.mockResolvedValue(false);
    const { triggerSelfUpdate } = await import("./updater");
    expect(await triggerSelfUpdate("t", "0.3.17")).toEqual({ ok: true });
    const corpo = m.updateSwarmStack.mock.calls[0][3];
    expect(corpo.stackFileContent).toBe(velho);
    expect(corpo.env).toEqual([{ name: "PANEL_IMAGE_TAG", value: "0.3.17" }]);
  });

  it("consulta da chave falhou: o update segue, com o compose original", async () => {
    m.reconciliacaoRestartLigada.mockRejectedValue(new Error("console fora"));
    const { triggerSelfUpdate } = await import("./updater");
    expect(await triggerSelfUpdate("t", "0.3.17")).toEqual({ ok: true });
    expect(m.updateSwarmStack.mock.calls[0][3].stackFileContent).toBe(velho);
  });
});

describe("triggerSelfUpdate — fallback (stack externa, sem arquivo)", () => {
  const servico = (rp: unknown) => ({ ID: "svc1", Version: { Index: 4 }, Spec: { Name: "encha-panel_panel", TaskTemplate: { RestartPolicy: rp } } });

  beforeEach(() => {
    m.listStacks.mockResolvedValue([]);
  });

  it("o mesmo updateServiceImage leva a política nova, mantendo o delay", async () => {
    m.getServiceByName.mockResolvedValue(servico({ Condition: "on-failure", Delay: 5e9, MaxAttempts: 5 }));
    const { triggerSelfUpdate } = await import("./updater");
    expect(await triggerSelfUpdate("t", "0.3.17")).toEqual({ ok: true });
    const args = m.updateServiceImage.mock.calls[0];
    expect(args[3]).toBe("ghcr.io/enchaaluno/setup-panel:0.3.17");
    expect(args[4]).toEqual({ Condition: "any", Delay: 5e9, MaxAttempts: 0 });
  });

  it("chave desligada: só a imagem, sem política", async () => {
    m.reconciliacaoRestartLigada.mockResolvedValue(false);
    m.getServiceByName.mockResolvedValue(servico({ Condition: "on-failure", Delay: 5e9, MaxAttempts: 5 }));
    const { triggerSelfUpdate } = await import("./updater");
    expect(await triggerSelfUpdate("t", "0.3.17")).toEqual({ ok: true });
    expect(m.updateServiceImage.mock.calls[0][3]).toBe("ghcr.io/enchaaluno/setup-panel:0.3.17");
    expect(m.updateServiceImage.mock.calls[0][4]).toBeUndefined();
  });

  it("já conforme: nenhuma política extra", async () => {
    m.getServiceByName.mockResolvedValue(servico({ Condition: "any", Delay: 5e9 }));
    const { triggerSelfUpdate } = await import("./updater");
    await triggerSelfUpdate("t", "0.3.17");
    expect(m.updateServiceImage.mock.calls[0][4]).toBeUndefined();
  });

  it("nunca chama updateService direto: o painel não se reinicia só por causa da política", async () => {
    m.getServiceByName.mockResolvedValue(servico({ Condition: "on-failure" }));
    const { triggerSelfUpdate } = await import("./updater");
    await triggerSelfUpdate("t", "0.3.17");
    expect(m.updateServiceImage).toHaveBeenCalledOnce();
  });
});
