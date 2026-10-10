import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { enchat } from "./stacks/enchat";

// Núcleo da sincronização (modo auto/manual) com Portainer, gravador e leitura
// do estado.json simulados; SQLite real num diretório temporário.

const D = (c: string) => `@sha256:${c.repeat(64)}`;
const APP = `ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7${D("a")}`;
const PINFY = `ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7${D("b")}`;
const UPD = `ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7${D("c")}`;

const m = vi.hoisted(() => ({
  getServiceExact: vi.fn(),
  listServiceTasks: vi.fn(),
  listStacks: vi.fn(),
  getStackFile: vi.fn(),
  gravar: vi.fn(),
  estado: vi.fn(),
}));

vi.mock("./portainer", () => ({
  discoverContext: async () => ({ endpointId: 7, swarmId: "s" }),
  getServiceExact: m.getServiceExact,
  listServiceTasks: m.listServiceTasks,
  listStacks: m.listStacks,
  getStackFile: m.getStackFile,
  PortainerError: class PortainerError extends Error {
    constructor(public status: number, msg: string) {
      super(msg);
    }
  },
}));
vi.mock("./stack-disco", async () => {
  const real = await vi.importActual<typeof import("./stack-disco")>("./stack-disco");
  return { ...real, gravarComposeEmDisco: m.gravar };
});
vi.mock("./estado-sidecar", async () => {
  const real = await vi.importActual<typeof import("./estado-sidecar")>("./estado-sidecar");
  return { ...real, lerEstadoDoSidecar: m.estado };
});
vi.mock("./audit", () => ({ logAudit: vi.fn() }));

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

type Svc = { image: string; index?: number; upd?: string; taskState?: string; taskImage?: string };
let svcs: Record<string, Svc>;
let tmp: string;

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
    return [{ ID: "t", ServiceID: id, DesiredState: "running", Status: { State: s.taskState ?? "running" }, Spec: { ContainerSpec: { Image: s.taskImage ?? s.image } } }];
  });
}

const estadoOk = { estado: { em_andamento: false, versao_atual: "0.4.7", app_imagem_aplicada: "ghcr.io/carlosmaximiliano-cloud/enchat" } };

beforeEach(() => {
  vi.resetModules();
  tmp = mkdtempSync(path.join(tmpdir(), "encha-sync-core-"));
  process.env.DB_PATH = path.join(tmp, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmp, "master.key");
  Object.values(m).forEach((f) => f.mockReset());
  svcs = {
    enchat_enchat_app: { image: APP },
    enchat_enchat_pinfy: { image: PINFY },
    enchat_enchat_updater: { image: UPD, upd: "completed" },
  };
  instala();
  m.listStacks.mockResolvedValue([
    { Id: 42, Name: "enchat", EndpointId: 7, Status: 1, CreationDate: 0, Env: [], ProjectPath: "/data/compose/42", EntryPoint: "docker-compose.yml" },
  ]);
  m.getStackFile.mockResolvedValue(composeVelho);
  m.gravar.mockResolvedValue(undefined);
  m.estado.mockResolvedValue(estadoOk);
});
afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
  delete process.env.DB_PATH;
  delete process.env.MASTER_KEY_PATH;
});

const entrada = (modo: "auto" | "manual") => ({ token: "t", modo, user: "admin", ip: "1.2.3.4" });
const nucleo = async () => await import("./sincronizar-stack");
const store = async () => await import("./stack-sync-store");

describe("modo auto", () => {
  it("grava as 3 imagens com o DIGEST exato, SEM variáveis de admin", async () => {
    const { sincronizarStackEnchat } = await nucleo();
    const r = await sincronizarStackEnchat(entrada("auto"));
    expect(r.aplicada).toBe(true);
    expect(m.gravar).toHaveBeenCalledOnce();
    const [, endpoint, stack, atual, novo] = m.gravar.mock.calls[0];
    expect(endpoint).toBe(7);
    expect(stack.Id).toBe(42);
    expect(atual).toBe(composeVelho);
    expect(novo).toContain(`    image: ${APP}`);
    expect(novo).toContain(`    image: ${PINFY}`);
    expect(novo).toContain(`    image: ${UPD}`);
    expect(novo).not.toContain("ENCHAT_ADMIN_EMAIL");
    const e = (await store()).lerEstadoSync("enchat");
    expect(e.lastResult).toBe("aplicada");
    expect(e.highWater).toEqual({ app: APP, pinfy: PINFY, updater: UPD });
  });

  it("diferença SÓ de digest não dispara (mesmo repo:tag)", async () => {
    const soDigest = composeVelho
      .replace(/^ {4}image: ghcr\.io\/enchainterno\/enchat-free:.*$/m, `    image: ghcr.io/carlosmaximiliano-cloud/enchat:0.4.7`)
      .replace(/^ {4}image: ghcr\.io\/enchainterno\/pinfy:.*$/m, `    image: ghcr.io/carlosmaximiliano-cloud/pinfy:0.4.7`)
      .replace(/^ {4}image: ghcr\.io\/enchainterno\/enchat-updater:.*$/m, `    image: ghcr.io/carlosmaximiliano-cloud/enchat-updater:0.4.7`);
    m.getStackFile.mockResolvedValue(soDigest);
    const { sincronizarStackEnchat } = await nucleo();
    const r = await sincronizarStackEnchat(entrada("auto"));
    expect(r.aplicada).toBe(false);
    expect(m.gravar).not.toHaveBeenCalled();
    expect(m.estado).not.toHaveBeenCalled(); // nem lê o estado quando não há o que fazer
  });

  it("estado ausente/ilegível: aguarda, não grava", async () => {
    m.estado.mockResolvedValue({ estado: null, motivo: "ilegivel" });
    const { sincronizarStackEnchat } = await nucleo();
    const r = await sincronizarStackEnchat(entrada("auto"));
    expect(r.aplicada).toBe(false);
    expect(m.gravar).not.toHaveBeenCalled();
    expect((await store()).lerEstadoSync("enchat").lastResult).toBe("aguardando");
  });

  it("sidecar discorda do que roda (estado 0.4.7, app 0.4.6): NÃO fixa o estado regredido", async () => {
    const regredido = "ghcr.io/enchainterno/enchat-free:0.4.6" + D("1");
    svcs.enchat_enchat_app.image = regredido;
    svcs.enchat_enchat_pinfy.image = "ghcr.io/enchainterno/pinfy:0.4.6" + D("2");
    svcs.enchat_enchat_updater.image = "ghcr.io/enchainterno/enchat-updater:0.4.6" + D("3");
    const { sincronizarStackEnchat } = await nucleo();
    const r = await sincronizarStackEnchat(entrada("auto"));
    expect(r.aplicada).toBe(false);
    expect(r.motivo).toContain("0.4.7");
    expect(m.gravar).not.toHaveBeenCalled();
  });

  it("update em andamento: aguarda (transitório não conta como falha)", async () => {
    svcs.enchat_enchat_updater.upd = "updating";
    const { sincronizarStackEnchat } = await nucleo();
    await expect(sincronizarStackEnchat(entrada("auto"))).rejects.toMatchObject({ codigo: "nao_convergida" });
    const e = (await store()).lerEstadoSync("enchat");
    expect(e.lastResult).toBe("aguardando");
    expect(e.attempts).toBe(0);
    expect(m.gravar).not.toHaveBeenCalled();
  });

  it("imagem ou Version.Index mudou entre a leitura e a gravação: aborta sem gravar", async () => {
    let chamadas = 0;
    m.getServiceExact.mockImplementation(async (_t: string, _e: number, nome: string) => {
      const s = svcs[nome];
      const mudou = ++chamadas > 3 && nome === "enchat_enchat_app";
      return { ID: nome, Version: { Index: mudou ? 11 : 10 }, UpdateStatus: { State: "completed" }, Spec: { TaskTemplate: { ContainerSpec: { Image: s.image } } } };
    });
    const { sincronizarStackEnchat } = await nucleo();
    await expect(sincronizarStackEnchat(entrada("auto"))).rejects.toMatchObject({ codigo: "mudou_durante" });
    expect(m.gravar).not.toHaveBeenCalled();
  });

  it("falha de gravação conta para o backoff e desliga o auto na 3ª", async () => {
    const { StackDiscoError } = await import("./stack-disco");
    m.gravar.mockRejectedValue(new StackDiscoError("divergiu"));
    const { sincronizarStackEnchat } = await nucleo();
    const s = await store();
    for (let i = 0; i < 3; i++) {
      await expect(sincronizarStackEnchat(entrada("auto"))).rejects.toMatchObject({ codigo: "gravacao_falhou" });
    }
    expect(s.lerEstadoSync("enchat").autoDisabledReason).toBe("falhas_consecutivas");
    expect(s.podeTentarAuto("enchat", Date.now() + 10 ** 10).pode).toBe(false);
  });

  it("já sincronizada: nada a gravar", async () => {
    const { sincronizarStackEnchat } = await nucleo();
    await sincronizarStackEnchat(entrada("auto"));
    m.getStackFile.mockResolvedValue(m.gravar.mock.calls[0][4]);
    m.gravar.mockClear();
    const r = await sincronizarStackEnchat(entrada("auto"));
    expect(r.aplicada).toBe(false);
    expect(m.gravar).not.toHaveBeenCalled();
  });
});

describe("modo manual", () => {
  it("acrescenta ENCHAT_ADMIN_* além das imagens", async () => {
    const { sincronizarStackEnchat } = await nucleo();
    const r = await sincronizarStackEnchat(entrada("manual"));
    expect(r.aplicada).toBe(true);
    expect(m.gravar.mock.calls[0][4]).toContain('ENCHAT_ADMIN_SENHA: ""');
  });

  it("sem estado legível: segue (o admin viu a prévia) e informa", async () => {
    m.estado.mockResolvedValue({ estado: null, motivo: "ausente" });
    const { sincronizarStackEnchat } = await nucleo();
    const r = await sincronizarStackEnchat(entrada("manual"));
    expect(r.aplicada).toBe(true);
    expect(r.estado).toBe("ausente");
  });

  it("sidecar discordando do que roda: RECUSA (estado_diverge)", async () => {
    m.estado.mockResolvedValue({ estado: { em_andamento: false, versao_atual: "0.4.9" } });
    const { sincronizarStackEnchat } = await nucleo();
    await expect(sincronizarStackEnchat(entrada("manual"))).rejects.toMatchObject({ codigo: "estado_diverge" });
    expect(m.gravar).not.toHaveBeenCalled();
  });

  it("falha manual NÃO conta para o backoff do auto", async () => {
    m.estado.mockResolvedValue({ estado: { em_andamento: false, versao_atual: "0.4.9" } });
    const { sincronizarStackEnchat } = await nucleo();
    for (let i = 0; i < 4; i++) await sincronizarStackEnchat(entrada("manual")).catch(() => {});
    expect((await store()).lerEstadoSync("enchat").attempts).toBe(0);
  });
});

describe("edição regredida e diagnóstico", () => {
  it("manual: sidecar lembra edição CRM/Tráfego e o app voltou a Grátis -> edicao_regredida (não manda clicar Atualizar)", async () => {
    // rodando Grátis 0.4.7; o sidecar aplicou a edição completa
    const D2 = (c: string) => `@sha256:${c.repeat(64)}`;
    svcs.enchat_enchat_app.image = "ghcr.io/enchainterno/enchat-free:0.4.7" + D2("1");
    svcs.enchat_enchat_pinfy.image = "ghcr.io/enchainterno/pinfy:0.4.7" + D2("2");
    svcs.enchat_enchat_updater.image = "ghcr.io/enchainterno/enchat-updater:0.4.7" + D2("3");
    m.estado.mockResolvedValue({ estado: { em_andamento: false, versao_atual: "0.4.7", app_imagem_aplicada: "ghcr.io/carlosmaximiliano-cloud/enchat" } });
    const { sincronizarStackEnchat } = await nucleo();
    await expect(sincronizarStackEnchat(entrada("manual"))).rejects.toMatchObject({ codigo: "edicao_regredida" });
    expect(m.gravar).not.toHaveBeenCalled();
  });

  it("diagnóstico: prévia + estado do sidecar, sem gravar nada", async () => {
    const { diagnosticarSincronizacao } = await nucleo();
    const ok = await diagnosticarSincronizacao("t");
    expect(ok.sidecar).toEqual({ ok: true, motivo: undefined, tipo: undefined });
    expect(ok.previa.mudancas).toHaveLength(3);
    m.estado.mockResolvedValue({ estado: { em_andamento: false, versao_atual: "0.4.9" } });
    const ruim = await diagnosticarSincronizacao("t");
    expect(ruim.sidecar).toMatchObject({ ok: false, tipo: "versao" });
    m.estado.mockResolvedValue({ estado: null, motivo: "ilegivel" });
    expect((await diagnosticarSincronizacao("t")).sidecar).toBeNull();
    expect(m.gravar).not.toHaveBeenCalled();
  });
});

describe("concorrência", () => {
  it("duas chamadas simultâneas no mesmo processo: a 2ª recebe em_andamento", async () => {
    let solta!: () => void;
    m.gravar.mockImplementation(() => new Promise<void>((r) => (solta = r)));
    const { sincronizarStackEnchat } = await nucleo();
    const primeira = sincronizarStackEnchat(entrada("auto"));
    await vi.waitFor(() => expect(m.gravar).toHaveBeenCalled());
    await expect(sincronizarStackEnchat(entrada("manual"))).rejects.toMatchObject({ codigo: "em_andamento" });
    solta();
    await expect(primeira).resolves.toMatchObject({ aplicada: true });
  });

  it("lease de outro processo vigente: em_andamento sem tocar em nada", async () => {
    const s = await store();
    expect(s.tentarLease("enchat", "outro-processo", 60_000)).toBe(true);
    const { sincronizarStackEnchat } = await nucleo();
    await expect(sincronizarStackEnchat(entrada("auto"))).rejects.toMatchObject({ codigo: "em_andamento" });
    expect(m.getServiceExact).not.toHaveBeenCalled();
    expect(m.gravar).not.toHaveBeenCalled();
  });
});

describe("diferemRepoTag", () => {
  it("separa troca de versão de troca só de digest", async () => {
    const { diferemRepoTag } = await nucleo();
    expect(diferemRepoTag([{ servico: "enchat_app", de: "r/a:1", para: "r/a:1@sha256:x" }])).toBe(false);
    expect(diferemRepoTag([{ servico: "enchat_app", de: "r/a:1", para: "r/a:2@sha256:x" }])).toBe(true);
    expect(diferemRepoTag([{ servico: "enchat_app", de: "r/a:1", para: "r/b:1" }])).toBe(true);
  });
});
