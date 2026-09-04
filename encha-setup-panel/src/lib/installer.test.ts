import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { z } from "zod";
import type { StackDefinition, SwarmContext } from "./stacks/types";

// Ciclo D (fechamento da instalação) — installer.ts ganhou uma orquestração
// nova (ativação por e-mail ANTES de resolver release/registry). Nenhum
// teste deste repositório exercitava installStack() de ponta a ponta antes
// deste ciclo; construído com uma stack SINTÉTICA (mockando
// ./stacks/registry) para isolar a ORDEM e o ABORTO do resto da
// complexidade real da Tracker (registryAuth, pré-pull, etc. — cobertos
// por outros arquivos).
//
// getDb()/getMasterKey() guardam singletons em memória de módulo — precisam
// de DB_PATH/MASTER_KEY_PATH isolados por teste, definidos ANTES do
// primeiro import que os toca, com vi.resetModules() pra não vazar entre
// testes (mesmo padrão de pairing-store.test.ts).

let tmpDir: string;

beforeEach(() => {
  vi.resetModules();
  tmpDir = mkdtempSync(path.join(tmpdir(), "encha-setup-installer-test-"));
  process.env.DB_PATH = path.join(tmpDir, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmpDir, "master.key");
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.DB_PATH;
  delete process.env.MASTER_KEY_PATH;
  vi.doUnmock("./portainer");
  vi.doUnmock("./release-info");
  vi.doUnmock("./tracker-ativacao");
  vi.doUnmock("./host-dirs");
  vi.doUnmock("./stacks/registry");
});

const FAKE_STACK_ID = "fake-tracker-ciclo-d";

function fakeStack(overrides: Partial<StackDefinition> = {}): StackDefinition {
  return {
    id: FAKE_STACK_ID,
    name: "Fake Tracker",
    description: "Stack sintética só para testar a orquestração de installStack.",
    category: "analytics",
    icon: "bar-chart-3",
    dependsOn: [],
    optionNumber: 998,
    appHostname: "fake-app-hostname",
    transientFields: ["chave_licenca", "email_ativacao"],
    fields: [{ name: "email_ativacao", label: "E-mail da compra", kind: "email", group: "Licença" }],
    schema: z.object({
      email_ativacao: z.string().email(),
      chave_licenca: z.string().optional(),
    }),
    release: { baseUrl: "https://console.exemplo.com", app: "fake", edicao: "full", canal: "beta" },
    emailActivation: {
      consoleBaseUrl: "https://console.exemplo.com",
      sourceField: "email_ativacao",
      targetField: "chave_licenca",
    },
    generateYaml: () => 'version: "3.7"\nservices:\n  app:\n    image: fake:1\n',
    ...overrides,
  };
}

/** `ordem` acumula, na ordem real de chamada, qual das duas dependências (ativação/release) rodou primeiro — é a prova da mutação M3. */
async function setupMocks(opts: {
  ativarImpl?: () => Promise<{ chave: string }>;
  releaseImpl?: () => Promise<{ version: string; imageRepo: string; imageTag: string; obrigatoria: boolean }>;
  stack?: StackDefinition;
}) {
  const ordem: string[] = [];
  const stack = opts.stack ?? fakeStack();

  vi.doMock("./stacks/registry", () => ({
    getStack: (id: string) => (id === stack.id ? stack : undefined),
  }));

  vi.doMock("./portainer", () => ({
    deploySwarmStack: vi.fn(async () => ({ Id: "swarm-stack-1" })),
    discoverContext: vi.fn(async () => ({ endpointId: 1, swarmId: "swarm-1" })),
    ensurePostgresDatabase: vi.fn(async () => undefined),
    ensurePostgresExtension: vi.fn(async () => undefined),
    ensureSwarmVolume: vi.fn(async () => undefined),
    listStacks: vi.fn(async () => []),
    pullImageWithRegistry: vi.fn(async () => undefined),
  }));

  vi.doMock("./release-info", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./release-info")>();
    return {
      ...actual,
      fetchLatestRelease: vi.fn(async () => {
        ordem.push("release");
        if (opts.releaseImpl) return opts.releaseImpl();
        return { version: "1.0.0", imageRepo: "ghcr.io/x/fake", imageTag: "1.0.0", obrigatoria: false };
      }),
    };
  });

  vi.doMock("./tracker-ativacao", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./tracker-ativacao")>();
    return {
      ...actual,
      ativarTrackerPorEmail: vi.fn(async () => {
        ordem.push("ativar");
        if (opts.ativarImpl) return opts.ativarImpl();
        return { chave: "CHAVE-DE-TESTE-123" };
      }),
    };
  });

  vi.doMock("./host-dirs", () => ({ ensureHostDirs: vi.fn(async () => undefined) }));

  return { ordem, stack };
}

function swarmCtx(): SwarmContext {
  return { networkName: "rede", serverName: "vps-teste", email: "operador@exemplo.com" };
}

describe("installStack — ativação por e-mail (Ciclo D)", () => {
  it("caminho feliz: ativa, resolve release NA ORDEM CERTA (ativação antes de release), e faz deploy", async () => {
    const { ordem } = await setupMocks({});
    const { installStack } = await import("./installer");
    const { deploySwarmStack } = await import("./portainer");

    const result = await installStack({
      stackId: FAKE_STACK_ID,
      values: { email_ativacao: "cliente@exemplo.com" },
      swarmCtx: swarmCtx(),
      token: "tok",
      user: "tester",
      ip: "127.0.0.1",
    });

    expect(result.ok).toBe(true);
    expect(deploySwarmStack).toHaveBeenCalledTimes(1);
    // Mutação M3 (Ciclo D) — se a ordem no installer.ts inverter
    // (resolver release antes de ativar por e-mail), "release" viria
    // primeiro aqui. A chave só existe DEPOIS da ativação; resolver a
    // versão antes não quebra nada sozinho, mas é o defeito que o ciclo
    // fecha: ativação tem que vir primeiro por contrato, não por acaso.
    expect(ordem).toEqual(["ativar", "release"]);
  });

  it("a chave devolvida pela ativação chega ao generateYaml (injetada em chave_licenca)", async () => {
    const generateYamlSpy = vi.fn(
      (_values: Record<string, unknown>, _secrets: Record<string, string>, _ctx: SwarmContext) =>
        'version: "3.7"\nservices: {}\n'
    );
    const stack = fakeStack({ generateYaml: generateYamlSpy });
    await setupMocks({ ativarImpl: async () => ({ chave: "CHAVE-INJETADA-XYZ" }), stack });

    const { installStack } = await import("./installer");
    const result = await installStack({
      stackId: FAKE_STACK_ID,
      values: { email_ativacao: "cliente@exemplo.com" },
      swarmCtx: swarmCtx(),
      token: "tok",
      user: "tester",
      ip: "127.0.0.1",
    });

    expect(result.ok).toBe(true);
    expect(generateYamlSpy).toHaveBeenCalledTimes(1);
    const valoresRecebidos = generateYamlSpy.mock.calls[0][0];
    expect(valoresRecebidos.chave_licenca).toBe("CHAVE-INJETADA-XYZ");
  });

  // Mutação M2 (a mais importante do ciclo) — se a ativação falhar (e-mail
  // não reconhecido, licença revogada), a instalação TEM que abortar antes
  // de tocar em qualquer coisa na VPS. Nunca deployar uma stack sem
  // licença válida.
  it("M2: ativação recusada aborta ANTES de discoverContext/deploySwarmStack — nada toca a VPS", async () => {
    const { TrackerAtivacaoError } = await import("./tracker-ativacao");
    await setupMocks({
      ativarImpl: async () => {
        throw new TrackerAtivacaoError("ativacao_recusada", "E-mail não reconhecido.", 403);
      },
    });
    const { installStack } = await import("./installer");
    const { deploySwarmStack, discoverContext } = await import("./portainer");

    const result = await installStack({
      stackId: FAKE_STACK_ID,
      values: { email_ativacao: "desconhecido@exemplo.com" },
      swarmCtx: swarmCtx(),
      token: "tok",
      user: "tester",
      ip: "127.0.0.1",
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("ativacao_recusada");
    expect(result.httpStatus).toBe(400);
    expect(discoverContext).not.toHaveBeenCalled();
    expect(deploySwarmStack).not.toHaveBeenCalled();
  });

  // email_ativacao ausente/vazio já é recusado pelo schema.safeParse ANTES
  // de installStack chegar no bloco de ativação (kind:"email", obrigatório)
  // — cobre o mesmo objetivo (nunca ativar/deployar sem e-mail) por uma via
  // mais cedo. Confirma que esse gate continua de pé.
  it("email_ativacao ausente é recusado pela validação do schema, sem chamar ativarTrackerPorEmail", async () => {
    await setupMocks({});
    const { installStack } = await import("./installer");
    const { ativarTrackerPorEmail } = await import("./tracker-ativacao");

    const result = await installStack({
      stackId: FAKE_STACK_ID,
      values: {},
      swarmCtx: swarmCtx(),
      token: "tok",
      user: "tester",
      ip: "127.0.0.1",
    });

    expect(result.ok).toBe(false);
    expect(ativarTrackerPorEmail).not.toHaveBeenCalled();
  });

  // Mutação M4 — o instalador normaliza o e-mail (minúsculas, e trim se
  // houver espaço) ANTES de mandar pro Console, em vez de depender da
  // normalização do lado de lá: é o instalador quem precisa decidir se o
  // e-mail digitado bateu. z.string().email() já recusa espaço ao redor
  // (confirmado: "  x@x.com  " falha o schema antes de chegar aqui) — o
  // caso que sobra pra testar é maiúscula/minúscula, que o schema aceita.
  it("M4: o e-mail chega normalizado (minúsculas) em ativarTrackerPorEmail", async () => {
    await setupMocks({});
    const { installStack } = await import("./installer");
    const { ativarTrackerPorEmail } = await import("./tracker-ativacao");

    await installStack({
      stackId: FAKE_STACK_ID,
      values: { email_ativacao: "Cliente@Exemplo.COM" },
      swarmCtx: swarmCtx(),
      token: "tok",
      user: "tester",
      ip: "127.0.0.1",
    });

    expect(ativarTrackerPorEmail).toHaveBeenCalledWith(
      "https://console.exemplo.com",
      "cliente@exemplo.com",
      expect.any(String),
      expect.any(String)
    );
  });
});
