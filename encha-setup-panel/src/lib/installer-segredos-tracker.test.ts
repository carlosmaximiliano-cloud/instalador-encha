import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { SwarmContext } from "./stacks/types";

// Ciclo 100, F2.5 — installStack e a stack encha-tracker REAIS contra um Swarm
// falso, no molde de installer-banco-existente.test.ts (preparar do Tracker) +
// installer-segredos.test.ts (Swarm falso com segredos). Desde o Ciclo 100 o
// Tracker não cria segredo do Docker (a senha do admin é a env
// TRACKER_ADMIN_SENHA), mas as instalações antigas deixaram
// `encha_tracker_senha_admin_<época>` na VPS: o installer varre esse segredo
// DEPOIS do deploy (basesDeSegredoObsoletas), também com a lista de segredos
// novos vazia, e nunca o que um serviço ainda referencia (Spec ou
// PreviousSpec). Nenhuma imagem é inspecionada (sem dockerSecretsGate).

vi.setConfig({ testTimeout: 30_000 });

let tmpDir: string;

beforeEach(() => {
  vi.resetModules();
  tmpDir = mkdtempSync(path.join(tmpdir(), "encha-setup-installer-segredos-tracker-"));
  process.env.DB_PATH = path.join(tmpDir, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmpDir, "master.key");
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.DB_PATH;
  delete process.env.MASTER_KEY_PATH;
  vi.useRealTimers();
  vi.doUnmock("./portainer");
  vi.doUnmock("./release-info");
  vi.doUnmock("./registry-pull");
  vi.doUnmock("./host-dirs");
  vi.doUnmock("./host-dados-existentes");
  vi.doUnmock("./tracker-ativacao");
});

type SegredoSwarm = { ID: string; nome: string; valor: string; labels: Record<string, string> };
type ServicoSwarm = { nome: string; atuais: string[]; anteriores: string[] };

function novoSwarm() {
  return {
    segredos: new Map<string, SegredoSwarm>(),
    servicos: new Map<string, ServicoSwarm>(),
    yamls: [] as string[],
    ordem: [] as string[],
    filtros: [] as (string[] | undefined)[],
    tentativasDeRemocao: [] as string[],
    inspecoes: 0,
  };
}
type Swarm = ReturnType<typeof novoSwarm>;

// Lê o YAML como o Docker: segredos `external` do topo (alias → nome real) e,
// por serviço (app/updater/postgres), os `source:` montados. O nome do
// serviço no Swarm é `encha_tracker_<chave>`. Falha se um external não
// existir — mesma armadilha real do `docker stack deploy`.
function aplicarDeploy(swarm: Swarm, yaml: string) {
  const [servicos, topo = ""] = yaml.split(/^secrets:$/m);
  const externos = new Map<string, string>();
  for (const m of topo.matchAll(/^ {2}(\S+):\n {4}external: true\n {4}name: (\S+)$/gm)) externos.set(m[1], m[2]);
  for (const nome of externos.values()) {
    if (!swarm.segredos.has(nome)) throw new Error(`secret not found: ${nome}`);
  }
  const partes = servicos.split(/^ {2}(app|updater|postgres):$/m);
  for (let i = 1; i < partes.length; i += 2) {
    const chave = partes[i];
    const corpo = partes[i + 1];
    const atuais = [...corpo.matchAll(/- source: (\S+)/g)].map((m) => externos.get(m[1]) ?? `SEM-EXTERNAL:${m[1]}`);
    const nome = `encha_tracker_${chave}`;
    const antigo = swarm.servicos.get(nome);
    swarm.servicos.set(nome, { nome, atuais, anteriores: antigo ? antigo.atuais : [] });
  }
}

async function preparar(opts: { swarm: Swarm; tagRef: { atual: string } }) {
  const { swarm, tagRef } = opts;

  vi.doMock("./portainer", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./portainer")>();
    return {
      ...actual,
      discoverContext: vi.fn(async () => ({ endpointId: 1, swarmId: "swarm-1" })),
      ensurePostgresDatabase: vi.fn(async () => undefined),
      ensurePostgresExtension: vi.fn(async () => undefined),
      ensureSwarmVolume: vi.fn(async () => undefined),
      listStacks: vi.fn(async () => []),
      inspectImage: vi.fn(async () => {
        swarm.inspecoes++;
        return { Config: { Labels: {} } };
      }),
      createDockerSecret: vi.fn(async (_t: string, _e: number, a: { name: string; value: string; labels?: Record<string, string> }) => {
        if (swarm.segredos.has(a.name)) throw new actual.PortainerError(409, "name conflicts with an existing object");
        swarm.ordem.push(`criar:${a.name}`);
        swarm.segredos.set(a.name, { ID: `id-${a.name}`, nome: a.name, valor: a.value, labels: a.labels ?? {} });
        return { ID: `id-${a.name}` };
      }),
      deploySwarmStack: vi.fn(async (a: { yaml: string }) => {
        swarm.ordem.push("deploy");
        swarm.yamls.push(a.yaml);
        aplicarDeploy(swarm, a.yaml);
        return { Id: 7 };
      }),
      listStackServices: vi.fn(async (_t: string, _e: number, stack: string) =>
        [...swarm.servicos.values()]
          .filter((s) => s.nome.startsWith(`${stack}_`))
          .map((s) => ({
            ID: s.nome,
            Version: { Index: 1 },
            Spec: { Name: s.nome, TaskTemplate: { ContainerSpec: { Secrets: s.atuais.map((n) => ({ SecretName: n })) } } },
            PreviousSpec: { TaskTemplate: { ContainerSpec: { Secrets: s.anteriores.map((n) => ({ SecretName: n })) } } },
          }))
      ),
      listDockerSecrets: vi.fn(async (_t: string, _e: number, labels?: string[]) => {
        swarm.filtros.push(labels);
        return [...swarm.segredos.values()]
          .filter((s) => (labels ?? []).every((l) => Object.entries(s.labels).some(([k, v]) => `${k}=${v}` === l)))
          .map((s) => ({ ID: s.ID, Spec: { Name: s.nome, Labels: s.labels } }));
      }),
      removeDockerSecret: vi.fn(async (_t: string, _e: number, id: string) => {
        const s = [...swarm.segredos.values()].find((x) => x.ID === id);
        if (!s) return;
        swarm.tentativasDeRemocao.push(s.nome);
        if ([...swarm.servicos.values()].some((sv) => sv.atuais.includes(s.nome))) {
          throw new actual.PortainerError(400, "secret is in use by service");
        }
        swarm.ordem.push(`remover:${s.nome}`);
        swarm.segredos.delete(s.nome);
      }),
    };
  });
  vi.doMock("./release-info", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./release-info")>();
    return {
      ...actual,
      fetchLatestRelease: vi.fn(async () => ({
        version: tagRef.atual,
        imageRepo: "ghcr.io/cheiodecoisa/encha-tracker",
        imageTag: tagRef.atual,
        obrigatoria: false,
      })),
    };
  });
  vi.doMock("./registry-pull", () => ({
    resolveRegistryAndPullImages: vi.fn(async () => undefined),
  }));
  vi.doMock("./host-dirs", () => ({ ensureHostDirs: vi.fn(async () => undefined) }));
  vi.doMock("./host-dados-existentes", () => ({ hostTemArquivo: vi.fn(async () => false) }));
  vi.doMock("./tracker-ativacao", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./tracker-ativacao")>();
    return { ...actual, ativarTrackerPorEmail: vi.fn(async () => ({ chave: "CHAVE-TRACKER-123456" })) };
  });

  const { installStack } = await import("./installer");
  const ctx: SwarmContext = { networkName: "rede", serverName: "vps", email: "" };
  const instalar = (senha: string) =>
    installStack({
      stackId: "encha-tracker",
      values: { dominio_tracker: "tracker.exemplo.com", email_ativacao: "dono@exemplo.com", senha_admin: senha },
      swarmCtx: ctx,
      token: "tok",
      user: "tester",
      ip: "127.0.0.1",
    });
  const auditoria = async (acao: string): Promise<{ result: string; meta: Record<string, unknown> }[]> => {
    const { getDb } = await import("./db");
    return (
      getDb().prepare("SELECT result, meta FROM audit_log WHERE action = ? ORDER BY id").all(acao) as {
        result: string;
        meta: string | null;
      }[]
    ).map((r) => ({ result: r.result, meta: r.meta ? (JSON.parse(r.meta) as Record<string, unknown>) : {} }));
  };
  return { instalar, auditoria };
}

const N = (epoca: number) => `encha_tracker_senha_admin_${epoca}`;
const S1 = "Senha-Forte-123!abc";
const S2 = "Outra-Senha-456#xyz";
const ROTULOS_TRACKER = {
  "com.encha.segredo-stack": "encha_tracker",
  "com.encha.segredo-base": "encha_tracker_senha_admin",
};

// O segredo que uma instalação antiga (painel-secret) deixou na VPS.
function semearSegredoAntigo(swarm: Swarm, epoca: number, valor = "senha-antiga") {
  swarm.segredos.set(N(epoca), { ID: `id-${N(epoca)}`, nome: N(epoca), valor, labels: { ...ROTULOS_TRACKER } });
}

describe("installStack (Encha Tracker) — a senha do admin é env e o segredo antigo é varrido (Ciclo 100, F2.5)", () => {
  it("IT1: 1.2.1: nenhum segredo criado, ordem só deploy, YAML com a env; a limpeza é auditada com 0 removidos", async () => {
    const swarm = novoSwarm();
    const tagRef = { atual: "1.2.1" };
    const { instalar, auditoria } = await preparar({ swarm, tagRef });

    const r = await instalar(S1);
    expect(r.ok, r.error).toBe(true);

    expect(swarm.ordem).toEqual(["deploy"]);
    expect(swarm.segredos.size).toBe(0);
    expect(swarm.yamls[0]).toContain(`      TRACKER_ADMIN_SENHA: "${S1}"\n`);
    expect(swarm.yamls[0]).not.toContain("TRACKER_ADMIN_SENHA_FILE");
    expect(swarm.yamls[0]).not.toMatch(/^\s*secrets:/m);
    expect(swarm.servicos.get("encha_tracker_app")!.atuais).toEqual([]);
    expect(swarm.inspecoes).toBe(0);

    expect(await auditoria("stack.secrets.gate")).toHaveLength(0);
    expect(await auditoria("stack.secrets.create")).toHaveLength(0);
    const limpeza = await auditoria("stack.secrets.cleanup");
    expect(limpeza).toHaveLength(1);
    expect(limpeza[0].meta).toEqual({ removidos: 0 });
  });

  it("IT2: 1.2.0 igual: a tag não decide o formato", async () => {
    const swarm = novoSwarm();
    const tagRef = { atual: "1.2.0" };
    const { instalar, auditoria } = await preparar({ swarm, tagRef });

    const r = await instalar(S1);
    expect(r.ok, r.error).toBe(true);
    expect(swarm.ordem).toEqual(["deploy"]);
    expect(swarm.segredos.size).toBe(0);
    expect(swarm.yamls[0]).toContain(`TRACKER_ADMIN_SENHA: "${S1}"`);
    expect(swarm.yamls[0]).not.toContain("/run/secrets/");
    expect(await auditoria("stack.secrets.create")).toHaveLength(0);
    const limpeza = await auditoria("stack.secrets.cleanup");
    expect(limpeza).toHaveLength(1);
    expect(limpeza[0].meta).toEqual({ removidos: 0 });
  });

  it("IT3: segredo órfão da frota (nenhum serviço o referencia): a lista vazia NÃO pula a limpeza; sai DEPOIS do deploy", async () => {
    const swarm = novoSwarm();
    semearSegredoAntigo(swarm, 1758900000);
    const tagRef = { atual: "1.2.1" };
    const { instalar, auditoria } = await preparar({ swarm, tagRef });

    const r = await instalar(S2);
    expect(r.ok, r.error).toBe(true);

    expect(swarm.ordem).toEqual(["deploy", `remover:${N(1758900000)}`]);
    expect(swarm.segredos.size).toBe(0);
    expect(swarm.yamls[0]).toContain(`TRACKER_ADMIN_SENHA: "${S2}"`);
    const limpeza = await auditoria("stack.secrets.cleanup");
    expect(limpeza).toHaveLength(1);
    expect(limpeza[0].meta).toEqual({ removidos: 1 });
    expect(JSON.stringify(limpeza)).not.toContain(N(1758900000));
  });

  it("IT4: segredo referenciado no Spec ou no PreviousSpec fica; sai quando ninguém o referencia", async () => {
    const swarm = novoSwarm();
    const noSpec = N(1758900000);
    const noPrevio = N(1758800000);
    semearSegredoAntigo(swarm, 1758900000);
    semearSegredoAntigo(swarm, 1758800000);
    // Serviço que o YAML novo não redeclara: continua referenciando no Spec atual.
    swarm.servicos.set("encha_tracker_extra", { nome: "encha_tracker_extra", atuais: [noSpec], anteriores: [] });
    // O app antigo ainda aponta para o segredo: após o deploy ele vira PreviousSpec.
    swarm.servicos.set("encha_tracker_app", { nome: "encha_tracker_app", atuais: [noPrevio], anteriores: [] });
    const tagRef = { atual: "1.2.1" };
    const { instalar } = await preparar({ swarm, tagRef });

    expect((await instalar(S1)).ok).toBe(true);
    expect([...swarm.segredos.keys()].sort()).toEqual([noPrevio, noSpec].sort());
    expect(swarm.tentativasDeRemocao).toEqual([]);

    // O PreviousSpec do app já não cita o segredo; o serviço extra ainda cita o outro.
    expect((await instalar(S1)).ok).toBe(true);
    expect([...swarm.segredos.keys()]).toEqual([noSpec]);
    expect(swarm.ordem.filter((o) => o.startsWith("remover:"))).toEqual([`remover:${noPrevio}`]);
    expect(swarm.tentativasDeRemocao).toEqual([noPrevio]);

    swarm.servicos.delete("encha_tracker_extra");
    expect((await instalar(S1)).ok).toBe(true);
    expect(swarm.segredos.size).toBe(0);
  });

  it("IT5: segredos de outra stack no mesmo Swarm nunca são tocados; o filtro é só da stack e da base do Tracker", async () => {
    const swarm = novoSwarm();
    swarm.segredos.set("enchat_master_key_1758900000", {
      ID: "id-enchat-master",
      nome: "enchat_master_key_1758900000",
      valor: "valor-enchat-master",
      labels: { "com.encha.segredo-stack": "enchat", "com.encha.segredo-base": "enchat_master_key" },
    });
    swarm.segredos.set("enchat_senha_admin_1758800000", {
      ID: "id-enchat-senha",
      nome: "enchat_senha_admin_1758800000",
      valor: "valor-enchat-senha",
      // Mesma base do Tracker, rótulo de OUTRA stack: o filtro da stack a poupa.
      labels: { "com.encha.segredo-stack": "enchat", "com.encha.segredo-base": "encha_tracker_senha_admin" },
    });
    swarm.servicos.set("enchat_app", { nome: "enchat_app", atuais: ["enchat_master_key_1758900000"], anteriores: [] });
    semearSegredoAntigo(swarm, 1758700000);

    const tagRef = { atual: "1.2.1" };
    const { instalar } = await preparar({ swarm, tagRef });
    expect((await instalar(S1)).ok).toBe(true);

    expect(swarm.segredos.has("enchat_master_key_1758900000")).toBe(true);
    expect(swarm.segredos.has("enchat_senha_admin_1758800000")).toBe(true);
    expect(swarm.segredos.has(N(1758700000))).toBe(false);
    expect(swarm.ordem.some((o) => o.startsWith("remover:enchat_"))).toBe(false);
    expect(swarm.filtros.length).toBeGreaterThan(0);
    for (const f of swarm.filtros) {
      expect(f).toEqual(["com.encha.segredo-stack=encha_tracker", "com.encha.segredo-base=encha_tracker_senha_admin"]);
    }
  });

  it("IT6: stack antiga (segredo e _FILE) reinstalada: o 1º deploy troca para env e o segredo fica; o 2º o remove", async () => {
    const swarm = novoSwarm();
    semearSegredoAntigo(swarm, 1758900000, S1);
    swarm.servicos.set("encha_tracker_app", { nome: "encha_tracker_app", atuais: [N(1758900000)], anteriores: [] });
    const tagRef = { atual: "1.2.1" };
    const { instalar } = await preparar({ swarm, tagRef });

    const r = await instalar(S1);
    expect(r.ok, r.error).toBe(true);
    expect(swarm.ordem).toEqual(["deploy"]);
    expect(swarm.yamls[0]).toContain(`TRACKER_ADMIN_SENHA: "${S1}"`);
    expect(swarm.yamls[0]).not.toContain("TRACKER_ADMIN_SENHA_FILE");
    expect(swarm.servicos.get("encha_tracker_app")!.atuais).toEqual([]);
    expect(swarm.servicos.get("encha_tracker_app")!.anteriores).toEqual([N(1758900000)]);
    expect([...swarm.segredos.keys()]).toEqual([N(1758900000)]);
    expect(swarm.tentativasDeRemocao).toEqual([]);

    swarm.ordem.length = 0;
    expect((await instalar(S1)).ok).toBe(true);
    expect(swarm.ordem).toEqual(["deploy", `remover:${N(1758900000)}`]);
    expect(swarm.segredos.size).toBe(0);
  });
});
