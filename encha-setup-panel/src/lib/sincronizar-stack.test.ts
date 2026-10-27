import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { enchat } from "./stacks/enchat";
import { enchaTracker } from "./stacks/encha-tracker";
import { MARCA_AUSENTE, MARCA_FIM, MARCA_INICIO } from "./estado-sidecar";

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
  audit: vi.fn(),
  getVolumeMountpoint: vi.fn(),
  imageExistsLocally: vi.fn(),
  pullImage: vi.fn(),
  runOneShotJob: vi.fn(),
}));

vi.mock("./portainer", () => ({
  discoverContext: async () => ({ endpointId: 7, swarmId: "s" }),
  getServiceExact: m.getServiceExact,
  listServiceTasks: m.listServiceTasks,
  listStacks: m.listStacks,
  getStackFile: m.getStackFile,
  getVolumeMountpoint: m.getVolumeMountpoint,
  imageExistsLocally: m.imageExistsLocally,
  pullImage: m.pullImage,
  runOneShotJob: m.runOneShotJob,
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
vi.mock("./audit", () => ({ logAudit: m.audit }));

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
    return [{ ID: "t", ServiceID: id, DesiredState: "running", NodeID: "no1", Status: { State: s.taskState ?? "running" }, Spec: { ContainerSpec: { Image: s.taskImage ?? s.image } } }];
  });
}

const estadoOk = { estado: { em_andamento: false, versao_atual: "0.4.7", app_imagem_aplicada: "ghcr.io/carlosmaximiliano-cloud/enchat" } };

beforeEach(() => {
  vi.resetModules();
  tmp = mkdtempSync(path.join(tmpdir(), "encha-sync-core-"));
  process.env.DB_PATH = path.join(tmp, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmp, "master.key");
  Object.values(m).forEach((f) => typeof f === "function" && (f as ReturnType<typeof vi.fn>).mockReset());
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
  vi.doUnmock("./stack-sync-store");
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

describe("lease renovado pelo sincronizador", () => {
  const MIN = 60_000;
  const T0 = Date.UTC(2026, 9, 17, 6, 0);
  let relogioMs: number;
  const entradaRelogio = (modo: "auto" | "manual" = "auto") => ({ ...entrada(modo), relogio: () => relogioMs });
  // Os ganchos só mexem no relógio e no lease; as asserções ficam fora deles.
  const outroDonoAssume = async () => {
    relogioMs = T0 + 11 * MIN;
    const s = await store();
    s.tentarLease("enchat", "outro-dono", 10 * MIN, relogioMs);
  };
  beforeEach(() => {
    relogioMs = T0;
  });
  // Simula SQLITE_BUSY na renovação (a tomada inicial, booleana, segue real): `sequencia` diz o que cada
  // chamada do detalhado devolve a partir do momento em que `armar()` roda; depois disso, o primitivo real.
  const comBusy = (sequencia: Array<"ocupado" | "real">) => {
    let armado = false;
    vi.doMock("./stack-sync-store", async () => {
      const real = await vi.importActual<typeof import("./stack-sync-store")>("./stack-sync-store");
      return {
        ...real,
        tentarLeaseDetalhado: (...a: Parameters<typeof real.tentarLeaseDetalhado>) => {
          const prox = armado ? sequencia.shift() : "real";
          return prox === "ocupado" ? "ocupado" : real.tentarLeaseDetalhado(...a);
        },
      };
    });
    return () => {
      armado = true;
    };
  };

  it("sincronizador: lease perdido antes de gravar, nada é escrito", async () => {
    m.estado.mockImplementation(async () => {
      await outroDonoAssume(); // durante a leitura do sidecar
      return estadoOk;
    });
    const { sincronizarStackEnchat } = await nucleo();
    await expect(sincronizarStackEnchat(entradaRelogio("manual"))).rejects.toMatchObject({ codigo: "lease_perdido", detalhe: "outro_dono" });
    expect(m.gravar).not.toHaveBeenCalled();
  });

  it("sincronizador: lease perdido antes de ler o sidecar não cria job", async () => {
    m.getStackFile.mockImplementation(async () => {
      await outroDonoAssume(); // durante a leitura inicial
      return composeVelho;
    });
    const { sincronizarStackEnchat } = await nucleo();
    await expect(sincronizarStackEnchat(entradaRelogio("manual"))).rejects.toMatchObject({ codigo: "lease_perdido" });
    expect(m.estado).not.toHaveBeenCalled();
    expect(m.gravar).not.toHaveBeenCalled();
  });

  it("sincronizador: lease perdido é aguardando, sem backoff nem desligar", async () => {
    m.estado.mockImplementation(async () => {
      await outroDonoAssume();
      return estadoOk;
    });
    const { sincronizarStackEnchat } = await nucleo();
    await expect(sincronizarStackEnchat(entradaRelogio("auto"))).rejects.toMatchObject({ codigo: "lease_perdido" });
    const e = (await store()).lerEstadoSync("enchat");
    expect(e).toMatchObject({ lastResult: "aguardando", lastDetail: "lease_perdido", attempts: 0, nextAttemptAt: 0, autoDisabledReason: null });
    const fail = m.audit.mock.calls.map((c) => c[0]).filter((a) => a.action === "stack.sincronizar.fail");
    expect(fail).toHaveLength(1);
    expect(fail[0].meta).toMatchObject({ modo: "auto", error: "lease_perdido", detalhe: "outro_dono" });
  });

  it("sincronizador: banco ocupado persistente vira lease_perdido com detalhe ocupado", async () => {
    const armar = comBusy(["ocupado", "ocupado"]);
    m.getStackFile.mockImplementation(async () => {
      armar();
      return composeVelho;
    });
    const { sincronizarStackEnchat } = await nucleo();
    await expect(sincronizarStackEnchat(entradaRelogio("manual"))).rejects.toMatchObject({ codigo: "lease_perdido", detalhe: "ocupado" });
    expect(m.estado).not.toHaveBeenCalled();
    expect(m.gravar).not.toHaveBeenCalled();
  });

  it("sincronizador: banco ocupado uma vez é tentado de novo e grava", async () => {
    const armar = comBusy(["ocupado"]);
    m.getStackFile.mockImplementation(async () => {
      armar();
      return composeVelho;
    });
    const { sincronizarStackEnchat } = await nucleo();
    const r = await sincronizarStackEnchat(entradaRelogio("manual"));
    expect(r.aplicada).toBe(true);
    expect(m.gravar).toHaveBeenCalledOnce();
  });

  it("sincronizador: tomada e renovação usam o relógio injetado (grava com mais de 10 min de relógio)", async () => {
    m.estado.mockImplementation(async () => {
      relogioMs = T0 + 11 * MIN; // passou do TTL com o processo vivo; ninguém assumiu
      return estadoOk;
    });
    const { sincronizarStackEnchat } = await nucleo();
    const r = await sincronizarStackEnchat(entradaRelogio("auto"));
    expect(r.aplicada).toBe(true);
    expect(m.gravar).toHaveBeenCalledOnce();
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

// ── Stack do Encha Tracker (Ciclo 101 F5.2) ─────────────────────────────

const REPO_APP = "ghcr.io/cheiodecoisa/encha-tracker";
const REPO_UPD = "ghcr.io/cheiodecoisa/tracker-updater";
const APP_NOVO = `${REPO_APP}:1.5.65`;
const APP_NOVO_D = `${APP_NOVO}${D("a")}`;
const UPD_NOVO = `${REPO_UPD}:1.5.65`;
const UPD_NOVO_D = `${UPD_NOVO}${D("d")}`;

const composeTrackerVelho = enchaTracker.generateYaml(
  { dominio_tracker: "tracker.exemplo.com", email_ativacao: "c@exemplo.com", senha_admin: "SenhaForte#123" },
  { tracker_master_key: "m", postgres_password: "p", updater_token: "u" },
  {
    networkName: "rede",
    serverName: "x",
    email: "e@x.com",
    release: { version: "1.4.34", imageRepo: REPO_APP, imageTag: "1.4.34", obrigatoria: false },
    machineId: "0123456789abcdef0123456789abcdef",
    fingerprint: "f",
    versaoSegredos: "1",
  }
);

const logsEstado = (j: unknown) => `${MARCA_INICIO}\r\n${JSON.stringify(j)}\r\n${MARCA_FIM}\r\n`;
const jobEstado = (j: unknown) => m.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: logsEstado(j), timedOut: false });

describe("stack do Tracker", () => {
  beforeEach(() => {
    svcs = {
      encha_tracker_app: { image: APP_NOVO, upd: "completed" },
      encha_tracker_updater: { image: UPD_NOVO_D, upd: "completed" },
    };
    instala();
    m.listStacks.mockResolvedValue([
      { Id: 77, Name: "encha_tracker", EndpointId: 7, Status: 1, CreationDate: 0, Env: [], ProjectPath: "/data/compose/77", EntryPoint: "docker-compose.yml" },
    ]);
    m.getStackFile.mockResolvedValue(composeTrackerVelho);
    m.getVolumeMountpoint.mockResolvedValue("/var/lib/docker/volumes/encha_tracker_updater_data/_data");
    m.imageExistsLocally.mockResolvedValue(true);
    jobEstado({ em_andamento: false, versao_atual: "1.5.65", imagem_atual: APP_NOVO_D });
  });

  const gravado = (): string => m.gravar.mock.calls[0][4] as string;

  it("grava a imagem do Tracker no arquivo da stack", async () => {
    const { sincronizarStackTracker } = await nucleo();
    const r = await sincronizarStackTracker(entrada("auto"));
    expect(r.aplicada).toBe(true);
    expect(m.gravar).toHaveBeenCalledOnce();
    const [, endpoint, stack, atual] = m.gravar.mock.calls[0];
    expect(endpoint).toBe(7);
    expect(stack.Id).toBe(77);
    expect(atual).toBe(composeTrackerVelho);
    expect(gravado()).toContain(`    image: ${REPO_APP}:1.5.65`);
    expect(gravado()).toContain(`    image: ${UPD_NOVO_D}`);
    expect(gravado()).not.toContain(":1.4.34");
    // só as duas linhas image: do Tracker mudam; o resto (postgres incluso) fica byte a byte.
    expect(gravado().replace(APP_NOVO_D, `${REPO_APP}:1.4.34`).replace(UPD_NOVO_D, `${REPO_UPD}:1.4.34`)).toBe(composeTrackerVelho);
    expect((await store()).lerEstadoSync("encha_tracker").lastResult).toBe("aplicada");
  });

  it("grava o digest da imagem_atual", async () => {
    const { sincronizarStackTracker } = await nucleo();
    await sincronizarStackTracker(entrada("auto"));
    expect(gravado()).toContain(`    image: ${APP_NOVO_D}`);
  });

  it("imagem_atual de outro repo:tag não vence o spec ao vivo", async () => {
    jobEstado({ em_andamento: false, imagem_atual: `${REPO_APP}:1.4.99${D("a")}` });
    const { sincronizarStackTracker } = await nucleo();
    await sincronizarStackTracker(entrada("auto"));
    expect(gravado()).toContain(`    image: ${APP_NOVO}\n`);
    expect(gravado()).not.toContain("1.4.99");
  });

  it("spec que já tem digest ignora a imagem_atual", async () => {
    svcs.encha_tracker_app.image = APP_NOVO + D("b");
    jobEstado({ em_andamento: false, imagem_atual: APP_NOVO_D });
    const { sincronizarStackTracker } = await nucleo();
    await sincronizarStackTracker(entrada("auto"));
    expect(gravado()).toContain(`    image: ${APP_NOVO}${D("b")}`);
    expect(gravado()).not.toContain(D("a"));
  });

  it("não grava com o updater ocupado", async () => {
    // O cache do leitor é aquecido com "livre"; a leitura nova traz "ocupado": o portão tem de forçar a leitura.
    jobEstado({ em_andamento: false });
    const leitor = await import("./estado-updater-tracker");
    await leitor.lerEstadoDoUpdaterTracker("t", 7);
    jobEstado({ em_andamento: true });
    const { sincronizarStackTracker } = await nucleo();
    const r = await sincronizarStackTracker(entrada("auto"));
    expect(r.aplicada).toBe(false);
    expect(r.motivo).toContain("updater");
    expect(m.gravar).not.toHaveBeenCalled();
    expect((await store()).lerEstadoSync("encha_tracker").lastResult).toBe("aguardando");
  });

  it("estado do updater ausente libera a sincronização", async () => {
    m.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: MARCA_AUSENTE, timedOut: false });
    const { sincronizarStackTracker } = await nucleo();
    const r = await sincronizarStackTracker(entrada("auto"));
    expect(r.aplicada).toBe(true);
    expect(r.estado).toBe("ausente");
    expect(gravado()).toContain(`    image: ${APP_NOVO}\n`); // sem imagem_atual: o spec ao vivo
  });

  it("estado do updater ilegível espera no automático", async () => {
    m.runOneShotJob.mockResolvedValue({ exitCode: 1, logs: "", timedOut: false });
    const { sincronizarStackTracker } = await nucleo();
    const r = await sincronizarStackTracker(entrada("auto"));
    expect(r.aplicada).toBe(false);
    expect(m.gravar).not.toHaveBeenCalled();
    expect((await store()).lerEstadoSync("encha_tracker").lastResult).toBe("aguardando");
  });

  it("erro antigo não trava a sincronização", async () => {
    jobEstado({ em_andamento: false, erro: "falha de uma atualização anterior", operacao: "atualizar" });
    const { sincronizarStackTracker } = await nucleo();
    const r = await sincronizarStackTracker(entrada("auto"));
    expect(r.aplicada).toBe(true);
    expect(m.gravar).toHaveBeenCalledOnce();
  });

  it("lease do Tracker independente do enchat", async () => {
    const s = await store();
    expect(s.tentarLease("enchat", "outro-processo", 60_000)).toBe(true); // o enchat está sincronizando
    const { sincronizarStackTracker } = await nucleo();
    const r = await sincronizarStackTracker(entrada("auto"));
    expect(r.aplicada).toBe(true);
    // e o inverso: lease do Tracker em mãos de outro dono bloqueia só o Tracker.
    s.liberarLease("enchat", "outro-processo");
    expect(s.tentarLease("encha_tracker", "outro-processo", 60_000)).toBe(true);
    await expect(sincronizarStackTracker(entrada("auto"))).rejects.toMatchObject({ codigo: "em_andamento" });
  });

  it("duas chamadas simultâneas: a segunda recusa (trava local própria) e a primeira conclui", async () => {
    const { sincronizarStackTracker } = await nucleo();
    const [a, b] = await Promise.allSettled([sincronizarStackTracker(entrada("auto")), sincronizarStackTracker(entrada("auto"))]);
    expect(a.status).toBe("fulfilled");
    expect(b.status).toBe("rejected");
    expect(m.gravar).toHaveBeenCalledOnce();
  });

  it("serviço mudou entre a leitura e a gravação: aborta sem gravar (mudou_durante)", async () => {
    let chamadas = 0;
    m.getServiceExact.mockImplementation(async (_t: string, _e: number, nome: string) => {
      const s = svcs[nome];
      // leituras: app, updater (1ª passada), updater do leitor de estado (3ª), reconferência: app, updater
      const mudou = ++chamadas > 3 && nome === "encha_tracker_updater";
      return { ID: nome, Version: { Index: mudou ? 11 : 10 }, UpdateStatus: { State: "completed" }, Spec: { Name: nome, TaskTemplate: { ContainerSpec: { Image: s.image } } } };
    });
    const { sincronizarStackTracker } = await nucleo();
    await expect(sincronizarStackTracker(entrada("auto"))).rejects.toMatchObject({ codigo: "mudou_durante" });
    expect(m.gravar).not.toHaveBeenCalled();
  });

  it("arquivo só com diferença de digest no automático: não lê o estado nem grava", async () => {
    const igual = composeTrackerVelho.replace(`${REPO_APP}:1.4.34`, APP_NOVO).replace(`${REPO_UPD}:1.4.34`, UPD_NOVO);
    m.getStackFile.mockResolvedValue(igual);
    const { sincronizarStackTracker } = await nucleo();
    const r = await sincronizarStackTracker(entrada("auto"));
    expect(r.aplicada).toBe(false);
    expect(m.runOneShotJob).not.toHaveBeenCalled();
    expect(m.gravar).not.toHaveBeenCalled();
    expect((await store()).lerEstadoSync("encha_tracker").lastResult).toBe("sincronizada");
  });

  it("arquivo sem as duas linhas image: do Tracker: compose_inesperado; stack fora do Portainer: desliga o automático", async () => {
    m.getStackFile.mockResolvedValue(composeTrackerVelho.replace(`${REPO_UPD}:1.4.34`, "exemplo/outra:1"));
    const { sincronizarStackTracker } = await nucleo();
    await expect(sincronizarStackTracker(entrada("auto"))).rejects.toMatchObject({ codigo: "compose_inesperado" });
    m.listStacks.mockResolvedValue([]);
    await expect(sincronizarStackTracker(entrada("auto"))).rejects.toMatchObject({ codigo: "stack_externa" });
    expect((await store()).lerEstadoSync("encha_tracker").autoDisabledReason).toBe("stack_externa");
  });
});

describe("ehImgTracker", () => {
  it("aceita só as imagens do Tracker na conta do produto, com tag de versão e digest opcional", async () => {
    const { ehImgTracker } = await nucleo();
    expect(ehImgTracker(APP_NOVO)).toBe(true);
    expect(ehImgTracker(UPD_NOVO_D)).toBe(true);
    expect(ehImgTracker(`${REPO_APP}:beta-0123456789ab`)).toBe(true);
    for (const ruim of [
      "postgres:16-alpine",
      "ghcr.io/outra-conta/encha-tracker:1.5.65",
      `${REPO_APP}:latest`,
      `${REPO_APP}:1.5.65@sha256:curto`,
      "ghcr.io/cheiodecoisa/enchat:1.5.65",
      "docker.io/cheiodecoisa/encha-tracker:1.5.65",
    ]) {
      expect(ehImgTracker(ruim)).toBe(false);
    }
  });
});
