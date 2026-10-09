import { beforeEach, describe, expect, it, vi } from "vitest";
import { enchat } from "./stacks/enchat";

// Orquestração (aplicarFixacao/preverFixacao) com o Portainer simulado: prova o
// que vai no PUT (digest exato, Env preservado, sem pull/prune), o portão
// "assentado" e os caminhos que NÃO podem chamar o PUT.

const D = (c: string) => `@sha256:${c.repeat(64)}`;
const APP = `ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7${D("a")}`;
const PINFY = `ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7${D("b")}`;
const UPD = `ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7`; // o sidecar pode estar só por tag

const m = vi.hoisted(() => ({
  getServiceExact: vi.fn(),
  listServiceTasks: vi.fn(),
  listStacks: vi.fn(),
  getStackFile: vi.fn(),
  updateSwarmStack: vi.fn(),
}));

vi.mock("./portainer", () => ({
  discoverContext: async () => ({ endpointId: 7, swarmId: "s" }),
  getServiceExact: m.getServiceExact,
  listServiceTasks: m.listServiceTasks,
  listStacks: m.listStacks,
  getStackFile: m.getStackFile,
  updateSwarmStack: m.updateSwarmStack,
  PortainerError: class PortainerError extends Error {
    constructor(public status: number, msg: string) {
      super(msg);
    }
  },
}));
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

type Svc = { image: string; index?: number; upd?: string | undefined; taskState?: string; taskImage?: string; tasks?: number };
let svcs: Record<string, Svc>;

function instala() {
  m.getServiceExact.mockImplementation(async (_t: string, _e: number, nome: string) => {
    const s = svcs[nome];
    if (!s) return null;
    return {
      ID: nome,
      Version: { Index: s.index ?? 10 },
      UpdateStatus: s.upd === undefined ? undefined : { State: s.upd },
      Spec: { TaskTemplate: { ContainerSpec: { Image: s.image } } },
    };
  });
  m.listServiceTasks.mockImplementation(async (_t: string, _e: number, id: string) => {
    const s = svcs[id];
    return Array.from({ length: s.tasks ?? 1 }, () => ({
      ID: "t", ServiceID: id, DesiredState: "running",
      Status: { State: s.taskState ?? "running" },
      Spec: { ContainerSpec: { Image: s.taskImage ?? s.image } },
    }));
  });
}

beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset());
  svcs = {
    enchat_enchat_app: { image: APP },
    enchat_enchat_pinfy: { image: PINFY },
    enchat_enchat_updater: { image: UPD, upd: "completed" },
  };
  instala();
  m.listStacks.mockResolvedValue([{ Id: 42, Name: "enchat", EndpointId: 7, Status: 1, CreationDate: 0, Env: [{ name: "X", value: "1" }] }]);
  m.getStackFile.mockResolvedValue(composeVelho);
  m.updateSwarmStack.mockResolvedValue({});
});

const entrada = { token: "t", user: "admin", ip: "1.2.3.4" };

describe("preverFixacao", () => {
  it("devolve o diff com o DIGEST exato e NÃO chama o PUT", async () => {
    const p = await preverFixacao("t");
    expect(p.mudancas).toHaveLength(3);
    expect(p.mudancas[0].para).toBe(APP);
    expect(p.varsAdmin).toEqual(["ENCHAT_ADMIN_EMAIL", "ENCHAT_ADMIN_SENHA"]);
    expect(p.protegida).toBe(true);
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("sidecar < 0.4.7: protegida=false, mas ainda prevê a fixação", async () => {
    svcs.enchat_enchat_updater.image = "ghcr.io/enchainterno/enchat-updater:0.3.0";
    const p = await preverFixacao("t");
    expect(p.protegida).toBe(false);
    expect(p.versaoSidecar).toBe("0.3.0");
    expect(p.mudancas).toHaveLength(3);
  });
});

describe("portão assentado", () => {
  it.each([
    ["update em andamento (updating)", () => (svcs.enchat_enchat_updater.upd = "updating")],
    ["rollback em andamento", () => (svcs.enchat_enchat_app.upd = "rollback_started")],
    ["duas tasks rodando (meio de um start-first)", () => {
      svcs.enchat_enchat_app.tasks = 1;
      svcs.enchat_enchat_app.taskImage = "ghcr.io/carlosmaximiliano-cloud/enchat:0.4.6";
    }],
    ["task ainda subindo", () => (svcs.enchat_enchat_pinfy.taskState = "starting")],
  ])("recusa: %s", async (_n, quebra) => {
    quebra();
    await expect(aplicarFixacao(entrada)).rejects.toMatchObject({ codigo: "nao_convergida" });
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("rollback_completed e completed são assentados", async () => {
    svcs.enchat_enchat_app.upd = "rollback_completed";
    svcs.enchat_enchat_pinfy.upd = "completed";
    await expect(aplicarFixacao(entrada)).resolves.toMatchObject({ aplicada: true });
  });
});

describe("aplicarFixacao", () => {
  it("PUT com compose fixado por digest, Env preservado, sem pull e sem prune", async () => {
    const r = await aplicarFixacao(entrada);
    expect(r.aplicada).toBe(true);
    expect(m.updateSwarmStack).toHaveBeenCalledOnce();
    const [, id, endpoint, args] = m.updateSwarmStack.mock.calls[0];
    expect(id).toBe(42);
    expect(endpoint).toBe(7);
    expect(args.env).toEqual([{ name: "X", value: "1" }]);
    expect(args.pullImage).toBe(false);
    expect(args.prune).toBe(false);
    expect(args.stackFileContent).toContain(`    image: ${APP}`);
    expect(args.stackFileContent).toContain(`    image: ${PINFY}`);
    expect(args.stackFileContent).toContain(`    image: ${UPD}`);
  });

  it("já fixada (idempotente): não faz PUT", async () => {
    await aplicarFixacao(entrada);
    m.getStackFile.mockResolvedValue(m.updateSwarmStack.mock.calls[0][3].stackFileContent);
    m.updateSwarmStack.mockClear();
    const dois = await aplicarFixacao(entrada);
    expect(dois.aplicada).toBe(false);
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("imagem ou Version.Index mudou entre a leitura e o PUT: aborta sem PUT", async () => {
    let chamadas = 0;
    m.getServiceExact.mockImplementation(async (_t: string, _e: number, nome: string) => {
      const s = svcs[nome];
      // A partir da 4ª leitura (a reconferência), o app já subiu de versão.
      const mudou = ++chamadas > 3 && nome === "enchat_enchat_app";
      return {
        ID: nome,
        Version: { Index: mudou ? 11 : 10 },
        Spec: { TaskTemplate: { ContainerSpec: { Image: s.image } } },
      };
    });
    await expect(aplicarFixacao(entrada)).rejects.toMatchObject({ codigo: "mudou_durante" });
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("stack sem arquivo (externa): aborta sem PUT", async () => {
    const { PortainerError } = await import("./portainer");
    m.getStackFile.mockRejectedValue(new (PortainerError as new (s: number, m: string) => Error)(404, "nf"));
    await expect(aplicarFixacao(entrada)).rejects.toMatchObject({ codigo: "stack_externa" });
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("serviço ausente: stack não instalada, sem PUT", async () => {
    delete svcs.enchat_enchat_pinfy;
    await expect(aplicarFixacao(entrada)).rejects.toMatchObject({ codigo: "stack_nao_instalada" });
    expect(m.updateSwarmStack).not.toHaveBeenCalled();
  });

  it("falha do PUT propaga e libera o lock", async () => {
    m.updateSwarmStack.mockRejectedValueOnce(new Error("boom"));
    await expect(aplicarFixacao(entrada)).rejects.toThrow("boom");
    await expect(aplicarFixacao(entrada)).resolves.toMatchObject({ aplicada: true });
  });
});
