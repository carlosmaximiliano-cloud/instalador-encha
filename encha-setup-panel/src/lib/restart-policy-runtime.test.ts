import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { enchat } from "./stacks/enchat";
import { enchaTracker } from "./stacks/encha-tracker";

// Reconciliador da restart_policy com o Portainer inteiramente simulado (um
// "cluster" em memória que registra a ordem das chamadas) e SQLite real num
// diretório temporário. Nenhuma rede.

const NA_JANELA = Date.UTC(2026, 9, 17, 6, 0); // 03:00 em São Paulo
const FORA_DA_JANELA = Date.UTC(2026, 9, 17, 17, 0); // 14:00

const PG = "pgvector/pgvector:pg16";
const IMG = {
  enchat_enchat_postgres: PG,
  enchat_enchat_app: "ghcr.io/enchainterno/enchat-free:0.4.7",
  enchat_enchat_pinfy: "ghcr.io/enchainterno/pinfy:0.4.7",
  enchat_enchat_updater: "ghcr.io/enchainterno/enchat-updater:0.4.7",
  encha_tracker_postgres: "postgres:16-alpine",
  encha_tracker_app: "ghcr.io/cheiodecoisa/encha-tracker:1.2.3",
  encha_tracker_updater: "ghcr.io/cheiodecoisa/tracker-updater:1.2.3",
} as Record<string, string>;
const ON_FAILURE = { Condition: "on-failure", Delay: 5e9, MaxAttempts: 0 };

type Rp = { Condition: string; Delay?: number; MaxAttempts?: number } | undefined;
type Estado = { image: string; rp: Rp; taskRp: Rp; upd?: string; naoConverge?: boolean; mode?: unknown };

const m = vi.hoisted(() => ({
  getServiceExact: vi.fn(),
  listServiceTasks: vi.fn(),
  listStacks: vi.fn(),
  getStackFile: vi.fn(),
  updateServiceRestartPolicy: vi.fn(),
  discoverContext: vi.fn(),
  withServiceToken: vi.fn(),
  gravar: vi.fn(),
  estado: vi.fn(),
  estadoTracker: vi.fn(),
  flag: vi.fn(),
  audit: vi.fn(),
}));

vi.mock("./portainer", () => ({
  discoverContext: m.discoverContext,
  withServiceToken: m.withServiceToken,
  getServiceExact: m.getServiceExact,
  listServiceTasks: m.listServiceTasks,
  listStacks: m.listStacks,
  getStackFile: m.getStackFile,
  updateServiceRestartPolicy: m.updateServiceRestartPolicy,
  PortainerError: class PortainerError extends Error {
    constructor(public status: number, msg: string) {
      super(msg);
    }
  },
}));
vi.mock("./auth/local-admin", () => ({ hasServiceCredentials: () => true }));
vi.mock("./flag-sincronizacao", () => ({ reconciliacaoRestartLigada: m.flag }));
vi.mock("./stack-disco", async () => {
  const real = await vi.importActual<typeof import("./stack-disco")>("./stack-disco");
  return { ...real, gravarComposeEmDisco: m.gravar };
});
vi.mock("./estado-sidecar", async () => {
  const real = await vi.importActual<typeof import("./estado-sidecar")>("./estado-sidecar");
  return { ...real, lerEstadoDoSidecar: m.estado };
});
vi.mock("./estado-updater-tracker", () => ({ lerEstadoDoUpdaterTracker: m.estadoTracker }));
vi.mock("./audit", () => ({ logAudit: m.audit }));

const secretsEnchat = {
  enchat_master_key: "m", postgres_password: "p", pinfy_master_key: "pm", pinfy_webhook_token: "pw",
  pinfy_panel_password: "pp", pinfy_db_password: "pd", pinfy_session_key: "ps", updater_token: "u", enchat_setup_token: "st",
};
const ctx = (imageRepo: string, tag: string) => ({
  networkName: "rede", serverName: "x", email: "e@x.com",
  release: { version: tag, imageRepo, imageTag: tag, obrigatoria: false },
  machineId: "0123456789abcdef0123456789abcdef", fingerprint: "f", versaoSegredos: "1758900000",
});
const antigo = (y: string) => y.replace(/condition: any/g, "condition: on-failure");
const enchatNovo = enchat.generateYaml({ url_enchat: "crm.exemplo.com", chave_licenca: "K" }, secretsEnchat, ctx("ghcr.io/enchainterno/enchat-free", "0.4.7"));
const enchatAntigo = antigo(enchatNovo);
const trackerNovo = enchaTracker.generateYaml(
  { dominio_tracker: "t.exemplo.com", email_ativacao: "c@exemplo.com", senha_admin: "SenhaForte#123" },
  { tracker_master_key: "m", postgres_password: "p", updater_token: "u" },
  ctx("ghcr.io/cheiodecoisa/encha-tracker", "1.2.3")
);
const trackerAntigo = antigo(trackerNovo);

let cluster: Record<string, Estado>;
let arquivos: Record<string, string>; // nome da stack -> compose guardado
let ordem: string[]; // ordem das chamadas que ESCREVEM
let tmp: string;

function instalaEnchat(rp: Rp = ON_FAILURE) {
  for (const n of ["enchat_enchat_postgres", "enchat_enchat_app", "enchat_enchat_pinfy", "enchat_enchat_updater"]) {
    cluster[n] = { image: IMG[n], rp, taskRp: rp };
  }
  arquivos.enchat = rp === ON_FAILURE ? enchatAntigo : enchatNovo;
}
function instalaTracker(rp: Rp = ON_FAILURE) {
  for (const n of ["encha_tracker_postgres", "encha_tracker_app", "encha_tracker_updater"]) {
    cluster[n] = { image: IMG[n], rp, taskRp: rp };
  }
  arquivos.encha_tracker = rp === ON_FAILURE ? trackerAntigo : trackerNovo;
}

const STACKS = [
  { nome: "enchat", id: 42 },
  { nome: "encha_tracker", id: 43 },
];

beforeEach(() => {
  vi.resetModules();
  tmp = mkdtempSync(path.join(tmpdir(), "encha-restart-"));
  process.env.DB_PATH = path.join(tmp, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmp, "master.key");
  Object.values(m).forEach((f) => f.mockReset());
  cluster = {};
  arquivos = {};
  ordem = [];

  m.discoverContext.mockResolvedValue({ endpointId: 7, swarmId: "s" });
  m.withServiceToken.mockImplementation(async (fn: (t: string) => Promise<unknown>) => fn("tok"));
  m.flag.mockResolvedValue(true);
  m.estado.mockResolvedValue({ estado: { em_andamento: false } });
  m.estadoTracker.mockResolvedValue({ estado: {} }); // legível, em_andamento ausente
  m.getServiceExact.mockImplementation(async (_t: string, _e: number, nome: string) => {
    const s = cluster[nome];
    if (!s) return null;
    return {
      ID: nome,
      Version: { Index: 10 },
      UpdateStatus: s.upd ? { State: s.upd } : undefined,
      Spec: {
        Name: nome,
        Mode: s.mode ?? { Replicated: { Replicas: 1 } },
        TaskTemplate: { ContainerSpec: { Image: s.image }, RestartPolicy: s.rp },
      },
    };
  });
  m.listServiceTasks.mockImplementation(async (_t: string, _e: number, id: string) => [
    { ID: "t-" + id, ServiceID: id, DesiredState: "running", Status: { State: "running" }, Spec: { ContainerSpec: { Image: cluster[id].image }, RestartPolicy: cluster[id].taskRp } },
  ]);
  m.updateServiceRestartPolicy.mockImplementation(async (_t: string, _e: number, svc: { ID: string }, politica: Rp) => {
    ordem.push(`svc:${svc.ID}`);
    const s = cluster[svc.ID];
    s.rp = politica;
    if (!s.naoConverge) s.taskRp = politica;
  });
  m.listStacks.mockImplementation(async () =>
    STACKS.filter((s) => arquivos[s.nome] !== undefined).map((s) => ({
      Id: s.id, Name: s.nome, EndpointId: 7, Status: 1, CreationDate: 0, Env: [], ProjectPath: `/data/compose/${s.id}`, EntryPoint: "docker-compose.yml",
    }))
  );
  m.getStackFile.mockImplementation(async (_t: string, id: number) => arquivos[STACKS.find((s) => s.id === id)!.nome]);
  m.gravar.mockImplementation(async (_t: string, _e: number, stack: { Id: number }, atual: string, novo: string) => {
    ordem.push(`arquivo:${stack.Id}`);
    const nome = STACKS.find((s) => s.id === stack.Id)!.nome;
    if (arquivos[nome] !== atual) throw new Error("CAS");
    arquivos[nome] = novo;
  });
});
afterEach(() => {
  vi.doUnmock("./stack-sync-store");
  rmSync(tmp, { recursive: true, force: true });
  delete process.env.DB_PATH;
  delete process.env.MASTER_KEY_PATH;
});

const runtime = async () => await import("./restart-policy-runtime");
const defs = async () => await import("./restart-policy");
const store = async () => await import("./stack-sync-store");
const op = (agora = NA_JANELA) => ({ token: "tok", endpointId: 7, agora, esperar: async () => {}, convergenciaMs: 20_000 });
const escritas = () => ordem.slice();

describe("ordem: arquivo antes do serviço, banco antes dos dependentes", () => {
  it("enchat: arquivo → postgres → app → pinfy → updater", async () => {
    instalaEnchat();
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    const r = await reconciliarStack(STACK_RESTART_ENCHAT, op());
    expect(r.etapa).toBe("aplicado");
    expect(escritas()).toEqual(["arquivo:42", "svc:enchat_enchat_postgres", "svc:enchat_enchat_app", "svc:enchat_enchat_pinfy", "svc:enchat_enchat_updater"]);
    // O serviço foi atualizado com a política nova (delay preservado, sem limite).
    expect(m.updateServiceRestartPolicy.mock.calls[0][3]).toEqual({ Condition: "any", Delay: 5e9, MaxAttempts: 0 });
    // E o arquivo guardado ficou igual ao template de hoje.
    expect(arquivos.enchat).toBe(enchatNovo);
  });

  it("tracker: arquivo → postgres → app → updater", async () => {
    instalaTracker();
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_TRACKER } = await defs();
    const r = await reconciliarStack(STACK_RESTART_TRACKER, op());
    expect(r.etapa).toBe("aplicado");
    expect(escritas()).toEqual(["arquivo:43", "svc:encha_tracker_postgres", "svc:encha_tracker_app", "svc:encha_tracker_updater"]);
    expect(m.estado).not.toHaveBeenCalled(); // o estado do sidecar enchat nunca é usado para o tracker
    expect(m.estadoTracker).toHaveBeenCalled(); // o do tracker-updater é
  });

  it("cada mudança vira um registro de auditoria com de→para e etapa", async () => {
    instalaEnchat();
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    await reconciliarStack(STACK_RESTART_ENCHAT, op());
    const metas = m.audit.mock.calls.map((c) => c[0]).filter((a) => a.action === "stack.restart_policy");
    expect(metas.filter((a) => a.meta.etapa === "arquivo")).toHaveLength(4);
    const pg = metas.find((a) => a.meta.etapa === "servico" && a.target === "enchat_enchat_postgres");
    expect(pg.meta).toMatchObject({ stack: "enchat", de: "on-failure", para: "any" });
  });
});

describe("nada a fazer = nenhuma chamada de escrita", () => {
  it("tudo conforme: sem arquivo, sem serviço, sem ler o sidecar", async () => {
    instalaEnchat(ON_FAILURE);
    // conforme ao vivo e no arquivo
    for (const s of Object.values(cluster)) { s.rp = { Condition: "any", Delay: 5e9 }; s.taskRp = s.rp; }
    arquivos.enchat = enchatNovo;
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    const r = await reconciliarStack(STACK_RESTART_ENCHAT, op());
    expect(r.etapa).toBe("conforme");
    expect(m.gravar).not.toHaveBeenCalled();
    expect(m.updateServiceRestartPolicy).not.toHaveBeenCalled();
    expect(m.estado).not.toHaveBeenCalled();
    expect((await store()).lerEstadoSync("restart:enchat").lastResult).toBe("sincronizada");
  });

  it("stack não instalada: sai sem escrever", async () => {
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_TRACKER } = await defs();
    expect((await reconciliarStack(STACK_RESTART_TRACKER, op())).etapa).toBe("stack_nao_instalada");
    expect(escritas()).toEqual([]);
  });

  it("segunda rodada depois de aplicar não faz mais nada (idempotente)", async () => {
    instalaEnchat();
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    await reconciliarStack(STACK_RESTART_ENCHAT, op());
    const antes = escritas().length;
    const r = await reconciliarStack(STACK_RESTART_ENCHAT, op());
    expect(r.etapa).toBe("conforme");
    expect(escritas()).toHaveLength(antes);
  });
});

describe("não convergiu: para e registra", () => {
  it("o banco não troca a política nas tasks → nenhum dependente é tocado", async () => {
    instalaEnchat();
    cluster.enchat_enchat_postgres.naoConverge = true;
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    const r = await reconciliarStack(STACK_RESTART_ENCHAT, op());
    expect(r).toMatchObject({ etapa: "nao_convergiu", detalhe: "enchat_enchat_postgres" });
    expect(escritas()).toEqual(["arquivo:42", "svc:enchat_enchat_postgres"]);
    const e = (await store()).lerEstadoSync("restart:enchat");
    expect(e.lastResult).toBe("falhou");
    expect(e.lastDetail).toBe("nao_convergiu:enchat_enchat_postgres");
    const fail = m.audit.mock.calls.map((c) => c[0]).find((a) => a.action === "stack.restart_policy.fail");
    expect(fail.meta.motivo).toBe("nao_convergiu");
  });

  it("três falhas seguidas desligam o reconciliador dessa stack (backoff/desligamento do stack-sync-store)", async () => {
    instalaEnchat();
    cluster.enchat_enchat_postgres.naoConverge = true;
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    const dia = 24 * 3600_000;
    // Cada falha agenda a próxima tentativa; espaça as rodadas além do backoff.
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, op(NA_JANELA))).etapa).toBe("nao_convergiu");
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, op(NA_JANELA))).etapa).toBe("backoff");
    cluster.enchat_enchat_postgres.rp = ON_FAILURE; // o spec voltou (rollback) para a segunda tentativa
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, op(NA_JANELA + dia))).etapa).toBe("nao_convergiu");
    cluster.enchat_enchat_postgres.rp = ON_FAILURE;
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, op(NA_JANELA + 2 * dia))).etapa).toBe("nao_convergiu");
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, op(NA_JANELA + 3 * dia))).etapa).toBe("backoff");
    expect((await store()).lerEstadoSync("restart:enchat").autoDisabledReason).toBe("falhas_consecutivas");
  });

  it("arquivo que falha ao gravar conta como falha e NENHUM serviço é tocado", async () => {
    instalaEnchat();
    m.gravar.mockRejectedValue(new Error("job_falhou"));
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    const r = await reconciliarStack(STACK_RESTART_ENCHAT, op());
    expect(r).toMatchObject({ etapa: "falhou", detalhe: "job_falhou" });
    expect(m.updateServiceRestartPolicy).not.toHaveBeenCalled();
  });
});

describe("fora da allowlist fica intacto", () => {
  it("imagem fora do padrão é pulada e registrada; os demais seguem", async () => {
    instalaEnchat();
    cluster.enchat_enchat_pinfy.image = "registro.exemplo.com/meu-pinfy:9";
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    await reconciliarStack(STACK_RESTART_ENCHAT, op());
    expect(escritas()).toEqual(["arquivo:42", "svc:enchat_enchat_postgres", "svc:enchat_enchat_app", "svc:enchat_enchat_updater"]);
    expect(cluster.enchat_enchat_pinfy.rp).toEqual(ON_FAILURE);
    const pulo = m.audit.mock.calls.map((c) => c[0]).find((a) => a.meta?.etapa === "pulo");
    expect(pulo).toMatchObject({ target: "enchat_enchat_pinfy", meta: { motivo: "imagem_fora_do_padrao" } });
  });

  it("job (replicated-job) com nome da allowlist não é tocado", async () => {
    instalaEnchat();
    cluster.enchat_enchat_updater.mode = { ReplicatedJob: { MaxConcurrent: 1, TotalCompletions: 1 } };
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    await reconciliarStack(STACK_RESTART_ENCHAT, op());
    expect(escritas()).not.toContain("svc:enchat_enchat_updater");
  });

  it("a rodada completa só consulta os serviços da allowlist (n8n, encha-guard etc. nunca são lidos)", async () => {
    instalaEnchat();
    instalaTracker();
    const { tentarReconciliarRestart } = await runtime();
    await tentarReconciliarRestart(NA_JANELA, { esperar: async () => {}, convergenciaMs: 20_000 });
    const nomes = new Set(m.getServiceExact.mock.calls.map((c) => c[2]));
    expect([...nomes].sort()).toEqual(Object.keys(IMG).sort());
  });
});

describe("chave desligada = nenhuma chamada", () => {
  it("flag desligada: nem o token, nem o Portainer são tocados", async () => {
    instalaEnchat();
    m.flag.mockResolvedValue(false);
    const { tentarReconciliarRestart } = await runtime();
    expect(await tentarReconciliarRestart(NA_JANELA)).toEqual([]);
    expect(m.withServiceToken).not.toHaveBeenCalled();
    expect(m.getServiceExact).not.toHaveBeenCalled();
    expect(m.listStacks).not.toHaveBeenCalled();
    expect(m.gravar).not.toHaveBeenCalled();
    expect(m.updateServiceRestartPolicy).not.toHaveBeenCalled();
  });

  it("flag ligada: a rodada percorre enchat e tracker", async () => {
    instalaEnchat();
    instalaTracker();
    const { tentarReconciliarRestart } = await runtime();
    const r = await tentarReconciliarRestart(NA_JANELA, { esperar: async () => {}, convergenciaMs: 20_000 });
    expect(r.map((x) => [x.stack, x.etapa])).toEqual([["enchat", "aplicado"], ["encha_tracker", "aplicado"]]);
  });
});

describe("janela 02h–05h e portões", () => {
  it("fora da janela só o ARQUIVO é gravado; o serviço espera a janela", async () => {
    instalaEnchat();
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    const r = await reconciliarStack(STACK_RESTART_ENCHAT, op(FORA_DA_JANELA));
    expect(r.etapa).toBe("fora_da_janela");
    expect(escritas()).toEqual(["arquivo:42"]);
    expect(arquivos.enchat).toBe(enchatNovo);
    // Na janela, já com o arquivo conforme, só o serviço.
    const r2 = await reconciliarStack(STACK_RESTART_ENCHAT, op(NA_JANELA + 3600_000));
    expect(r2.etapa).toBe("aplicado");
    expect(escritas().slice(1)).toEqual(["svc:enchat_enchat_postgres", "svc:enchat_enchat_app", "svc:enchat_enchat_pinfy", "svc:enchat_enchat_updater"]);
  });

  it("arquivo já conforme e fora da janela: nenhuma escrita e nem lê o sidecar", async () => {
    instalaEnchat();
    arquivos.enchat = enchatNovo;
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    const r = await reconciliarStack(STACK_RESTART_ENCHAT, op(FORA_DA_JANELA));
    expect(r.etapa).toBe("fora_da_janela");
    expect(escritas()).toEqual([]);
    expect(m.estado).not.toHaveBeenCalled();
  });

  it("update em curso em algum serviço: espera, sem escrever", async () => {
    instalaEnchat();
    cluster.enchat_enchat_app.upd = "updating";
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, op())).etapa).toBe("update_em_curso");
    expect(escritas()).toEqual([]);
  });

  it("sidecar ocupado (estado.json em_andamento): espera, sem escrever", async () => {
    instalaEnchat();
    m.estado.mockResolvedValue({ estado: { em_andamento: true } });
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, op())).etapa).toBe("sidecar_ocupado");
    expect(escritas()).toEqual([]);
  });

  it("lease do enchat com outro dono (sincronizarStackEnchat): não age", async () => {
    instalaEnchat();
    const { tentarLease } = await store();
    expect(tentarLease("enchat", "sincronizador", 600_000, NA_JANELA)).toBe(true);
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    // A tomada usa o relógio injetado: sem ele valeria Date.now() real e o lease de NA_JANELA já teria vencido.
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, { ...op(), relogio: () => NA_JANELA })).etapa).toBe("ocupado");
    expect(escritas()).toEqual([]);
  });

  it("libera o lease no fim (o sincronizador volta a poder rodar)", async () => {
    instalaEnchat();
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    await reconciliarStack(STACK_RESTART_ENCHAT, op());
    const { tentarLease } = await store();
    expect(tentarLease("enchat", "sincronizador", 600_000, NA_JANELA)).toBe(true);
  });

  it("CAS do arquivo divergiu: aguarda a próxima rodada, não mexe nos serviços", async () => {
    instalaEnchat();
    const { StackDiscoError } = await import("./stack-disco");
    m.gravar.mockRejectedValue(new StackDiscoError("divergiu"));
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, op())).etapa).toBe("arquivo_mudou");
    expect(m.updateServiceRestartPolicy).not.toHaveBeenCalled();
  });
});

describe("lease renovado durante o passo ao vivo", () => {
  const MIN = 60_000;
  // Os ganchos só REGISTRAM o retorno de tentarLease; as asserções rodam depois do tick
  // (um expect dentro do gancho viraria etapa "falhou" pelo catch externo).
  const OUTRO_DONO_EM = NA_JANELA + 11 * MIN; // acima do prazo de um lease tomado em NA_JANELA
  let retornos: boolean[];
  let relogioMs: number;
  const relogio = () => relogioMs;
  const tomarComoSincronizador = async (t: number) => {
    const { tentarLease } = await store();
    retornos.push(tentarLease("enchat", "sincronizador", 10 * MIN, t));
  };
  const opLease = (extra: Record<string, unknown> = {}) => ({ ...op(), relogio, ...extra });
  const tickEnchat = async (o: ReturnType<typeof opLease>) => {
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    return reconciliarStack(STACK_RESTART_ENCHAT, o);
  };
  const perdeDepoisDoBanco = () => {
    const base = m.updateServiceRestartPolicy.getMockImplementation()!;
    m.updateServiceRestartPolicy.mockImplementation(async (...a: unknown[]) => {
      await (base as (...x: unknown[]) => Promise<void>)(...a);
      if ((a[2] as { ID: string }).ID === "enchat_enchat_postgres") await tomarComoSincronizador(OUTRO_DONO_EM);
    });
  };

  beforeEach(() => {
    retornos = [];
    relogioMs = NA_JANELA;
  });

  it("lease perdido entre o banco e o app: nenhum dependente é tocado", async () => {
    instalaEnchat();
    perdeDepoisDoBanco();
    const r = await tickEnchat(opLease());
    expect(retornos).toEqual([true]);
    expect(r).toMatchObject({ etapa: "lease_perdido", detalhe: "servico" });
    expect(escritas()).toEqual(["arquivo:42", "svc:enchat_enchat_postgres"]);
  });

  it("lease perdido durante a espera de convergência: aborta como lease_perdido", async () => {
    instalaEnchat();
    cluster.enchat_enchat_postgres.naoConverge = true;
    const r = await tickEnchat(
      opLease({
        esperar: async () => {
          if (retornos.length === 0) await tomarComoSincronizador(OUTRO_DONO_EM);
        },
      })
    );
    expect(retornos).toEqual([true]);
    expect(r).toMatchObject({ etapa: "lease_perdido", detalhe: "convergencia" });
    expect(escritas()).toEqual(["arquivo:42", "svc:enchat_enchat_postgres"]);
  });

  it("lease perdido antes de gravar o arquivo: nada é escrito", async () => {
    instalaEnchat();
    m.estado.mockImplementation(async () => {
      await tomarComoSincronizador(OUTRO_DONO_EM); // durante a leitura do sidecar
      return { estado: { em_andamento: false } };
    });
    const r = await tickEnchat(opLease());
    expect(retornos).toEqual([true]);
    expect(r).toMatchObject({ etapa: "lease_perdido", detalhe: "arquivo" });
    expect(m.gravar).not.toHaveBeenCalled();
    expect(escritas()).toEqual([]);
  });

  it("lease perdido registra stack.restart_policy.fail com etapa lease_perdido", async () => {
    instalaEnchat();
    perdeDepoisDoBanco();
    await tickEnchat(opLease());
    const fail = m.audit.mock.calls.map((c) => c[0]).filter((a) => a.action === "stack.restart_policy.fail");
    expect(fail).toHaveLength(1);
    expect(fail[0]).toMatchObject({ result: "error", meta: { stack: "enchat", etapa: "lease_perdido", motivo: "servico" } });
  });

  it("lease perdido não conta falha: aguardando, sem backoff e sem desligar", async () => {
    instalaEnchat();
    perdeDepoisDoBanco();
    await tickEnchat(opLease());
    const { lerEstadoSync, podeTentarAuto } = await store();
    const e = lerEstadoSync("restart:enchat");
    expect(e).toMatchObject({ lastResult: "aguardando", lastDetail: "lease_perdido:servico", attempts: 0, nextAttemptAt: 0, autoDisabledReason: null });
    expect(podeTentarAuto("restart:enchat", NA_JANELA).pode).toBe(true);
    // O tick seguinte (outro agora, sem backoff) volta a tentar e conclui o que faltava.
    const depois = NA_JANELA + 30 * MIN;
    relogioMs = depois;
    const r = await tickEnchat(opLease({ agora: depois }));
    expect(r.etapa).toBe("aplicado");
    expect(escritas()).toEqual([
      "arquivo:42",
      "svc:enchat_enchat_postgres",
      "svc:enchat_enchat_app",
      "svc:enchat_enchat_pinfy",
      "svc:enchat_enchat_updater",
    ]);
  });

  it("lease perdido: o finally não solta o lease do novo dono (o sincronizador segue dono)", async () => {
    instalaEnchat();
    perdeDepoisDoBanco();
    await tickEnchat(opLease());
    const { tentarLease } = await store();
    // Um terceiro, ainda dentro do prazo do sincronizador (tomado em +11 min por 10 min), não consegue.
    expect(tentarLease("enchat", "terceiro", 10 * MIN, NA_JANELA + 12 * MIN)).toBe(false);
  });

  it("o prazo do lease acompanha o relógio: outro dono não assume em 4 passos de 4 min", async () => {
    instalaEnchat();
    const base = m.updateServiceRestartPolicy.getMockImplementation()!;
    m.updateServiceRestartPolicy.mockImplementation(async (...a: unknown[]) => {
      await (base as (...x: unknown[]) => Promise<void>)(...a);
      relogioMs += 4 * MIN; // 16 min no total: passa dos 10 min do TTL
      await tomarComoSincronizador(relogioMs);
    });
    const r = await tickEnchat(opLease());
    expect(retornos.some((x) => x)).toBe(false);
    expect(retornos).toHaveLength(4);
    expect(r.etapa).toBe("aplicado");
  });
});

describe("banco ocupado na renovação do lease", () => {
  // A tomada inicial (booleana) segue real; só a renovação (tentarLeaseDetalhado) recebe a sequência.
  const comBusy = (sequencia: Array<"ocupado" | "real">) => {
    vi.doMock("./stack-sync-store", async () => {
      const real = await vi.importActual<typeof import("./stack-sync-store")>("./stack-sync-store");
      return {
        ...real,
        tentarLeaseDetalhado: (...a: Parameters<typeof real.tentarLeaseDetalhado>) =>
          sequencia.shift() === "ocupado" ? "ocupado" : real.tentarLeaseDetalhado(...a),
      };
    });
  };
  const tick = async (o: Record<string, unknown>) => {
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    return reconciliarStack(STACK_RESTART_ENCHAT, { ...op(), ...o });
  };

  it("renovação com banco ocupado persistente aborta como lease_indisponivel, não lease_perdido", async () => {
    instalaEnchat();
    comBusy(["real", "ocupado", "ocupado"]); // a primeira renovação (portão do estado) passa; a do arquivo trava
    const esperar = vi.fn(async () => {});
    const r = await tick({ esperar });
    expect(r).toMatchObject({ etapa: "lease_indisponivel", detalhe: "arquivo" });
    expect(esperar).toHaveBeenCalledWith(250);
    expect(m.gravar).not.toHaveBeenCalled();
    expect(escritas()).toEqual([]);
    const fail = m.audit.mock.calls.map((c) => c[0]).filter((a) => a.action === "stack.restart_policy.fail");
    expect(fail).toHaveLength(1);
    expect(fail[0].meta).toMatchObject({ stack: "enchat", etapa: "lease_indisponivel", motivo: "arquivo" });
    const { lerEstadoSync } = await store();
    expect(lerEstadoSync("restart:enchat")).toMatchObject({ lastResult: "aguardando", lastDetail: "lease_indisponivel:arquivo", attempts: 0, nextAttemptAt: 0, autoDisabledReason: null });
  });

  it("renovação com banco ocupado uma vez: tenta de novo e o tick segue", async () => {
    instalaEnchat();
    comBusy(["ocupado"]);
    const esperar = vi.fn(async () => {});
    const r = await tick({ esperar });
    expect(r.etapa).toBe("aplicado");
    expect(esperar).toHaveBeenCalledWith(250);
    expect(escritas()).toEqual(["arquivo:42", "svc:enchat_enchat_postgres", "svc:enchat_enchat_app", "svc:enchat_enchat_pinfy", "svc:enchat_enchat_updater"]);
  });
});

describe("timeout das chamadas ao Portainer", () => {
  const MIN = 60_000;
  const nunca = (): Promise<never> => new Promise(() => {});
  const travaPostgresNoUpdate = (fim: () => Promise<void>) => {
    const base = m.updateServiceRestartPolicy.getMockImplementation()!;
    m.updateServiceRestartPolicy.mockImplementation(async (...a: unknown[]) => {
      if ((a[2] as { ID: string }).ID === "enchat_enchat_postgres") {
        ordem.push("svc:enchat_enchat_postgres");
        return fim();
      }
      return (base as (...x: unknown[]) => Promise<void>)(...a);
    });
  };
  const tick = async (o: Record<string, unknown> = {}) => {
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    return reconciliarStack(STACK_RESTART_ENCHAT, { ...op(), relogio: () => NA_JANELA, chamadaMs: 40, ...o });
  };

  it("chamada travada ao Portainer: aborta como portainer_travado sem tocar o próximo serviço", async () => {
    instalaEnchat();
    travaPostgresNoUpdate(nunca);
    const r = await tick();
    expect(r).toMatchObject({ etapa: "portainer_travado", detalhe: "updateServiceRestartPolicy:enchat_enchat_postgres" });
    expect(escritas()).toEqual(["arquivo:42", "svc:enchat_enchat_postgres"]);
    const fail = m.audit.mock.calls.map((c) => c[0]).filter((a) => a.action === "stack.restart_policy.fail");
    expect(fail).toHaveLength(1);
    expect(fail[0].meta).toMatchObject({ stack: "enchat", etapa: "portainer_travado" });
    const { lerEstadoSync, podeTentarAuto } = await store();
    expect(lerEstadoSync("restart:enchat")).toMatchObject({ lastResult: "aguardando", attempts: 0, nextAttemptAt: 0, autoDisabledReason: null });
    expect(podeTentarAuto("restart:enchat", NA_JANELA).pode).toBe(true);
  });

  it("leitura travada e gravação travada também abortam como portainer_travado", async () => {
    instalaEnchat();
    m.gravar.mockImplementation(() => nunca());
    expect(await tick()).toMatchObject({ etapa: "portainer_travado", detalhe: "gravarComposeEmDisco" });
    expect(m.updateServiceRestartPolicy).not.toHaveBeenCalled();
    m.getServiceExact.mockImplementation(() => nunca());
    expect(await tick({ agora: NA_JANELA + 30 * MIN })).toMatchObject({ etapa: "portainer_travado" });
  });

  it("chamada travada: o lease não é solto no aborto (escrita tardia não encontra outro dono)", async () => {
    instalaEnchat();
    travaPostgresNoUpdate(nunca);
    expect((await tick()).etapa).toBe("portainer_travado");
    const { tentarLease } = await store();
    expect(tentarLease("enchat", "sincronizador", 10 * MIN, NA_JANELA + 1000)).toBe(false);
    expect(tentarLease("enchat", "sincronizador", 10 * MIN, NA_JANELA + 11 * MIN)).toBe(true); // venceu pelo TTL
  });

  it("chamada travada que rejeita depois do aborto não vira Unhandled Rejection", async () => {
    instalaEnchat();
    travaPostgresNoUpdate(() => new Promise<void>((_ok, ko) => setTimeout(() => ko(new Error("tarde")), 120)));
    expect((await tick()).etapa).toBe("portainer_travado");
    await new Promise((r) => setTimeout(r, 300)); // espera a rejeição tardia acontecer
  });
});

describe("portão do tracker-updater (encha_tracker)", () => {
  const tickTracker = async () => {
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_TRACKER } = await defs();
    return reconciliarStack(STACK_RESTART_TRACKER, op());
  };

  it("tracker: updater ocupado (estado.json em_andamento) espera sem escrever", async () => {
    instalaTracker();
    m.estadoTracker.mockResolvedValue({ estado: { em_andamento: true } });
    const r = await tickTracker();
    expect(r.etapa).toBe("sidecar_ocupado");
    expect(escritas()).toEqual([]);
    expect(m.gravar).not.toHaveBeenCalled();
    expect(m.estado).not.toHaveBeenCalled();
    const { lerEstadoSync } = await store();
    expect(lerEstadoSync("restart:encha_tracker")).toMatchObject({ lastResult: "aguardando", lastDetail: "sidecar_ocupado", attempts: 0 });
  });

  it("tracker: estado legível com em_andamento falso segue", async () => {
    instalaTracker();
    m.estadoTracker.mockResolvedValue({ estado: { em_andamento: false } });
    expect((await tickTracker()).etapa).toBe("aplicado");
    expect(escritas()).toEqual(["arquivo:43", "svc:encha_tracker_postgres", "svc:encha_tracker_app", "svc:encha_tracker_updater"]);
  });

  it("tracker: estado ilegível ou ausente segue (fail-open, como o enchat)", async () => {
    instalaTracker();
    m.estadoTracker.mockResolvedValue({ estado: null, motivo: "ilegivel" });
    expect((await tickTracker()).etapa).toBe("aplicado");
  });

  it("enchat não lê o estado do tracker-updater", async () => {
    instalaEnchat();
    const { reconciliarStack } = await runtime();
    const { STACK_RESTART_ENCHAT } = await defs();
    expect((await reconciliarStack(STACK_RESTART_ENCHAT, op())).etapa).toBe("aplicado");
    expect(m.estadoTracker).not.toHaveBeenCalled();
    expect(m.estado).toHaveBeenCalled();
  });
});

describe("lease renovado antes do portão de estado do sidecar", () => {
  const MIN = 60_000;
  // As asserções rodam depois do tick (um expect dentro do gancho viraria etapa "falhou" pelo catch externo).
  let retornos: boolean[];
  let relogioMs: number;
  let tempos: number[]; // instante (relógio simulado) de cada renovação via tentarLeaseDetalhado
  const relogio = () => relogioMs;
  const tomarComoSincronizador = async (chave: string, t: number) => {
    const { tentarLease } = await store();
    retornos.push(tentarLease(chave, "sincronizador", 10 * MIN, t));
  };
  const espiaRenovacoes = (sequencia: Array<"ocupado" | "real"> = []) => {
    vi.doMock("./stack-sync-store", async () => {
      const real = await vi.importActual<typeof import("./stack-sync-store")>("./stack-sync-store");
      return {
        ...real,
        tentarLeaseDetalhado: (...a: Parameters<typeof real.tentarLeaseDetalhado>) => {
          tempos.push(a[3] ?? Date.now());
          return sequencia.shift() === "ocupado" ? "ocupado" : real.tentarLeaseDetalhado(...a);
        },
      };
    });
  };
  /** A segunda chamada de getStackFile é a da reconferência sob o lease (a primeira é a leitura barata). */
  const durantePrimeiraReconferencia = (fn: () => Promise<void>) => {
    const base = m.getStackFile.getMockImplementation()!;
    let n = 0;
    m.getStackFile.mockImplementation(async (...a: unknown[]) => {
      const r = await (base as (...x: unknown[]) => Promise<string>)(...a);
      if (++n === 2) await fn();
      return r;
    });
  };
  const tick = async (def: "enchat" | "tracker", o: Record<string, unknown> = {}) => {
    const { reconciliarStack } = await runtime();
    const d = await defs();
    return reconciliarStack(def === "enchat" ? d.STACK_RESTART_ENCHAT : d.STACK_RESTART_TRACKER, { ...op(), relogio, ...o });
  };
  const fails = () => m.audit.mock.calls.map((c) => c[0]).filter((a) => a.action === "stack.restart_policy.fail");

  beforeEach(() => {
    retornos = [];
    tempos = [];
    relogioMs = NA_JANELA;
  });

  it("enchat: lease perdido antes do portão do sidecar aborta sem ler o estado nem escrever", async () => {
    instalaEnchat();
    durantePrimeiraReconferencia(() => tomarComoSincronizador("enchat", NA_JANELA + 11 * MIN));
    const r = await tick("enchat");
    expect(retornos).toEqual([true]);
    expect(r).toMatchObject({ etapa: "lease_perdido", detalhe: "estado" });
    expect(m.estado).not.toHaveBeenCalled();
    expect(m.gravar).not.toHaveBeenCalled();
    expect(escritas()).toEqual([]);
    expect(fails()).toHaveLength(1);
    expect(fails()[0]).toMatchObject({ result: "error", meta: { stack: "enchat", etapa: "lease_perdido", motivo: "estado" } });
  });

  it("tracker: lease perdido antes do portão do updater aborta sem ler o estado nem escrever", async () => {
    instalaTracker();
    durantePrimeiraReconferencia(() => tomarComoSincronizador("restart:encha_tracker", NA_JANELA + 11 * MIN));
    const r = await tick("tracker");
    expect(retornos).toEqual([true]);
    expect(r).toMatchObject({ etapa: "lease_perdido", detalhe: "estado" });
    expect(m.estadoTracker).not.toHaveBeenCalled();
    expect(m.gravar).not.toHaveBeenCalled();
    expect(escritas()).toEqual([]);
    expect(fails()).toHaveLength(1);
    expect(fails()[0]).toMatchObject({ result: "error", meta: { stack: "encha_tracker", etapa: "lease_perdido", motivo: "estado" } });
  });

  it("portão do estado: banco ocupado na renovação aborta como lease_indisponivel sem ler o estado", async () => {
    for (const def of ["enchat", "tracker"] as const) {
      vi.doUnmock("./stack-sync-store");
      vi.resetModules();
      m.audit.mockReset();
      m.estado.mockClear();
      m.estadoTracker.mockClear();
      if (def === "enchat") instalaEnchat();
      else instalaTracker();
      espiaRenovacoes(["ocupado", "ocupado"]);
      const esperar = vi.fn(async () => {});
      const r = await tick(def, { esperar });
      expect(r).toMatchObject({ etapa: "lease_indisponivel", detalhe: "estado" });
      expect(esperar).toHaveBeenCalledWith(250);
      expect(m.estado).not.toHaveBeenCalled();
      expect(m.estadoTracker).not.toHaveBeenCalled();
      expect(m.gravar).not.toHaveBeenCalled();
      expect(escritas()).toEqual([]);
      expect(fails()).toHaveLength(1);
      expect(fails()[0].meta).toMatchObject({ etapa: "lease_indisponivel", motivo: "estado" });
      const { lerEstadoSync, podeTentarAuto } = await store();
      const chave = def === "enchat" ? "restart:enchat" : "restart:encha_tracker";
      expect(lerEstadoSync(chave)).toMatchObject({ lastResult: "aguardando", lastDetail: "lease_indisponivel:estado", attempts: 0, nextAttemptAt: 0, autoDisabledReason: null });
      expect(podeTentarAuto(chave, NA_JANELA).pode).toBe(true);
    }
  });

  it("tomada inicial do lease usa o relógio injetado, não o agora do tick", async () => {
    instalaEnchat();
    relogioMs = NA_JANELA + 30 * MIN; // o relógio de verdade já andou 30 min desde o agora do tick
    durantePrimeiraReconferencia(() => tomarComoSincronizador("enchat", relogioMs + MIN));
    const r = await tick("enchat");
    // Tomado em relogio(): vale até relogio()+10 min, então a tentativa 1 min depois falha.
    // Tomado em agora: já nasceu vencido (agora+10 min < relogio()) e a tentativa passaria.
    expect(retornos).toEqual([false]);
    expect(r.etapa).toBe("aplicado");
  });

  it("pior caso: o maior intervalo entre renovações fica abaixo de 6 min do TTL de 10 min", async () => {
    instalaEnchat();
    espiaRenovacoes();
    // Relógio simulado: cada chamada da reconferência (as 6 do segundo ler) leva 60 s, o sidecar 4 min, a gravação
    // 4 min e cada chamada do passo ao vivo 60 s. A cada passo o sincronizador sonda a chave.
    const passo = async (ms: number) => {
      relogioMs += ms;
      await tomarComoSincronizador("enchat", relogioMs);
    };
    let leituras = 0;
    const embrulha = (f: typeof m.getServiceExact, ms: number, soDepoisDe: number) => {
      const base = f.getMockImplementation()!;
      f.mockImplementation(async (...a: unknown[]) => {
        const r = await (base as (...x: unknown[]) => Promise<unknown>)(...a);
        if (soDepoisDe < 0 || ++leituras > soDepoisDe) await passo(ms);
        return r;
      });
    };
    // As 6 primeiras leituras (4 serviços + listStacks + getStackFile) são a leitura barata, antes do lease: não avançam.
    embrulha(m.getServiceExact, MIN, 6);
    embrulha(m.listStacks, MIN, 6);
    embrulha(m.getStackFile, MIN, 6);
    embrulha(m.listServiceTasks, MIN, -1);
    embrulha(m.updateServiceRestartPolicy, MIN, -1);
    m.estado.mockImplementation(async () => {
      await passo(4 * MIN);
      return { estado: { em_andamento: false } };
    });
    m.gravar.mockImplementation(async (_t: string, _e: number, stack: { Id: number }, atual: string, novo: string) => {
      ordem.push(`arquivo:${stack.Id}`);
      await passo(4 * MIN);
      arquivos.enchat = novo;
      void atual;
    });
    const r = await tick("enchat", { esperar: async () => passo(5_000) });
    const instantes = [NA_JANELA, ...tempos]; // a tomada inicial + cada renovação
    const maior = Math.max(...instantes.slice(1).map((t, i) => t - instantes[i]));
    expect(maior).toBeLessThanOrEqual(6 * MIN);
    expect(maior).toBeGreaterThan(0);
    expect(retornos.length).toBeGreaterThan(10); // a sondagem rodou a cada passo
    expect(retornos.some((x) => x)).toBe(false); // e o lease nunca venceu entre uma chamada e outra
    expect(r.etapa).toBe("aplicado");
  });
});
