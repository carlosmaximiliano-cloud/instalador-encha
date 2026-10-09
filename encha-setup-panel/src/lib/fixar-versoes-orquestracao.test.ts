import { beforeEach, describe, expect, it, vi } from "vitest";
import { enchat } from "./stacks/enchat";

// Orquestração (aplicarFixacao/preverFixacao) com o Portainer simulado: prova a
// ordem (reconfere antes do PUT), o que vai no PUT (Env preservado, sem pull,
// sem prune) e os caminhos que NÃO podem chamar o PUT.

const APP = "ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7";
const PINFY = "ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7";
const UPD = "ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7";

const m = vi.hoisted(() => ({
  statuses: vi.fn(),
  listStacks: vi.fn(),
  getStackFile: vi.fn(),
  updateSwarmStack: vi.fn(),
  getServiceByName: vi.fn(),
  pull: vi.fn(),
}));

vi.mock("./portainer", () => ({
  discoverContext: async () => ({ endpointId: 7, swarmId: "s" }),
  listSwarmStackStatuses: m.statuses,
  listStacks: m.listStacks,
  getStackFile: m.getStackFile,
  updateSwarmStack: m.updateSwarmStack,
  getServiceByName: m.getServiceByName,
  PortainerError: class PortainerError extends Error {
    constructor(public status: number, msg: string) {
      super(msg);
    }
  },
}));
vi.mock("./registry-pull", () => ({ resolveRegistryAndPullImages: m.pull }));
vi.mock("./pairing-store", () => ({ getOrCreateMachineId: () => ({ machineId: "m", fingerprint: "f" }) }));
vi.mock("./audit", () => ({ logAudit: vi.fn() }));

import { aplicarFixacao, preverFixacao } from "./fixar-versoes";

const composeVelho = enchat
  .generateYaml(
    { url_enchat: "crm.exemplo.com", chave_licenca: "K" },
    {
      enchat_master_key: "a", postgres_password: "b", pinfy_master_key: "c", pinfy_webhook_token: "d",
      pinfy_panel_password: "e", pinfy_db_password: "f", pinfy_session_key: "g", updater_token: "h", enchat_setup_token: "i",
    },
    {
      networkName: "rede", serverName: "x", email: "e@x.com",
      release: { version: "0.3.2", imageRepo: "ghcr.io/enchainterno/enchat-free", imageTag: "0.3.2", obrigatoria: false },
      machineId: "0123456789abcdef0123456789abcdef", fingerprint: "f",
    }
  )
  .replace(/^\s+ENCHAT_ADMIN_(EMAIL|SENHA):.*\n/gm, "");

function status(over: Record<string, unknown> = {}) {
  return {
    name: "enchat", desired: 4, running: 4, ready: true,
    images: { enchat_enchat_app: APP, enchat_enchat_pinfy: PINFY, enchat_enchat_updater: UPD },
    ...over,
  };
}

beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset());
  m.statuses.mockResolvedValue([status()]);
  m.listStacks.mockResolvedValue([{ Id: 42, Name: "enchat", EndpointId: 7, Status: 1, CreationDate: 0, Env: [{ name: "X", value: "1" }] }]);
  m.getStackFile.mockResolvedValue(composeVelho);
  m.getServiceByName.mockResolvedValue({ Spec: { TaskTemplate: { ContainerSpec: { Env: ["LICENSE_KEY=CHAVE"] } } } });
  m.pull.mockResolvedValue(undefined);
  m.updateSwarmStack.mockResolvedValue({});
});

const entrada = { token: "t", user: "admin", ip: "1.2.3.4" };

describe("preverFixacao", () => {
  it("devolve o diff e NÃO chama o PUT", async () => {
    const p = await preverFixacao("t");
    expect(p.mudancas).toHaveLength(3);
    expect(p.varsAdmin).toEqual(["ENCHAT_ADMIN_EMAIL", "ENCHAT_ADMIN_SENHA"]);
    expect(p.protegida).toBe(true);
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("sidecar < 0.4.7: protegida=false, mas ainda prevê a fixação", async () => {
    m.statuses.mockResolvedValue([
      status({ images: { enchat_enchat_app: APP, enchat_enchat_pinfy: PINFY, enchat_enchat_updater: "ghcr.io/enchainterno/enchat-updater:0.3.0" } }),
    ]);
    const p = await preverFixacao("t");
    expect(p.protegida).toBe(false);
    expect(p.versaoSidecar).toBe("0.3.0");
    expect(p.mudancas).toHaveLength(3);
  });
});

describe("aplicarFixacao", () => {
  it("faz o PUT com o compose patchado, Env preservado, sem pull e sem prune; renova a credencial antes", async () => {
    const r = await aplicarFixacao(entrada);
    expect(r.aplicada).toBe(true);
    expect(m.pull).toHaveBeenCalledOnce();
    expect(m.updateSwarmStack).toHaveBeenCalledOnce();
    const [, id, endpoint, args] = m.updateSwarmStack.mock.calls[0];
    expect(id).toBe(42);
    expect(endpoint).toBe(7);
    expect(args.env).toEqual([{ name: "X", value: "1" }]);
    expect(args.pullImage).toBe(false);
    expect(args.prune).toBe(false);
    expect(args.stackFileContent).toContain(`image: ${APP}`);
    expect(m.pull.mock.invocationCallOrder[0]).toBeLessThan(m.updateSwarmStack.mock.invocationCallOrder[0]);
  });

  it("já fixada: não faz PUT nem pull", async () => {
    const um = await aplicarFixacao(entrada);
    expect(um.aplicada).toBe(true);
    m.getStackFile.mockResolvedValue(m.updateSwarmStack.mock.calls[0][3].stackFileContent);
    m.updateSwarmStack.mockClear();
    m.pull.mockClear();
    const dois = await aplicarFixacao(entrada);
    expect(dois.aplicada).toBe(false);
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
    expect(m.pull).not.toHaveBeenCalled();
  });

  it("imagem mudou entre a leitura e o PUT: aborta sem PUT", async () => {
    m.statuses
      .mockResolvedValueOnce([status()])
      .mockResolvedValueOnce([
        status({ images: { enchat_enchat_app: "ghcr.io/carlosmaximiliano-cloud/enchat:0.4.8", enchat_enchat_pinfy: PINFY, enchat_enchat_updater: UPD } }),
      ]);
    await expect(aplicarFixacao(entrada)).rejects.toMatchObject({ codigo: "mudou_durante" });
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("serviços ainda subindo: aborta sem PUT", async () => {
    m.statuses.mockResolvedValue([status({ ready: false, running: 2 })]);
    await expect(aplicarFixacao(entrada)).rejects.toMatchObject({ codigo: "nao_convergida" });
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("registro recusa a credencial: aborta sem PUT", async () => {
    m.pull.mockRejectedValue(new Error("unauthorized"));
    await expect(aplicarFixacao(entrada)).rejects.toMatchObject({ codigo: "registro_recusou" });
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("chave ilegível (segredos Docker): segue sem renovar e avisa", async () => {
    m.getServiceByName.mockResolvedValue({ Spec: { TaskTemplate: { ContainerSpec: { Env: ["LICENSE_KEY_FILE=/run/secrets/x"] } } } });
    const r = await aplicarFixacao(entrada);
    expect(r.aplicada).toBe(true);
    expect(r.avisoCredencial).toBe(true);
    expect(m.pull).not.toHaveBeenCalled();
  });

  it("stack sem arquivo (externa): aborta sem PUT", async () => {
    const { PortainerError } = await import("./portainer");
    m.getStackFile.mockRejectedValue(new (PortainerError as new (s: number, m: string) => Error)(404, "nf"));
    await expect(aplicarFixacao(entrada)).rejects.toMatchObject({ codigo: "stack_externa" });
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("falha do PUT propaga e libera o lock (nova tentativa não vira em_andamento)", async () => {
    m.updateSwarmStack.mockRejectedValueOnce(new Error("boom"));
    await expect(aplicarFixacao(entrada)).rejects.toThrow("boom");
    await expect(aplicarFixacao(entrada)).resolves.toMatchObject({ aplicada: true });
  });
});
