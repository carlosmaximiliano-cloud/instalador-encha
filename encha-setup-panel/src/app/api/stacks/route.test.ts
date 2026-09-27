import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { StackDefinition } from "@/lib/stacks/types";
import { enchat } from "@/lib/stacks/enchat";
import { enchaTracker } from "@/lib/stacks/encha-tracker";

// Ciclo 29 — GET /api/stacks soma computeReleaseBasedPendingUpdates (em vez
// de computePendingUpdates) para stacks com updateViaRelease — as duas
// nunca coexistem na mesma stack. Isolado com um catálogo sintético de UMA
// stack fake (evita depender do catálogo real, dezenas de stacks).

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.doUnmock("@/lib/auth/require-token");
  vi.doUnmock("@/lib/installer");
  vi.doUnmock("@/lib/portainer");
  vi.doUnmock("@/lib/stacks/registry");
  vi.doUnmock("@/lib/stacks/updates");
  vi.doUnmock("@/lib/locale");
  vi.doUnmock("@/lib/csrf");
});

const FAKE_ID = "fake-catalog-stack";

function fakeDef(overrides: Partial<StackDefinition> = {}): StackDefinition {
  return {
    id: FAKE_ID,
    name: "Fake Catalog Stack",
    description: "Stack sintética só para testar o payload de GET /api/stacks.",
    category: "analytics",
    icon: "bar-chart-3",
    dependsOn: [],
    optionNumber: 994,
    fields: [],
    schema: z.object({}),
    generateYaml: () => "",
    updateViaRelease: () => [{ service: "app", image: "ghcr.io/x/fake:1.1.0" }],
    ...overrides,
  };
}

async function setupCommonMocks(def: StackDefinition) {
  // resolveLocale() usa cookies()/headers() de next/headers, que só
  // funcionam dentro do request-scope real do Next.js — os testes chamam
  // GET/POST direto, fora desse escopo, então precisa mockar aqui (mesmo
  // problema do better-sqlite3 ABI: infra de teste, não lógica da rota).
  vi.doMock("@/lib/auth/require-token", () => ({
    requireSessionToken: vi.fn(async () => ({ session: { user: "tester" }, token: "tok" })),
  }));
  vi.doMock("@/lib/locale", () => ({ resolveLocale: vi.fn(async () => "pt") }));
  vi.doMock("@/lib/installer", () => ({
    listInstalledStacks: vi.fn(async () => [
      { Id: 1, Name: FAKE_ID.replace(/-/g, "_"), EndpointId: 1, Status: 1, CreationDate: 0 },
    ]),
  }));
  vi.doMock("@/lib/portainer", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/portainer")>();
    return {
      ...actual,
      discoverContext: vi.fn(async () => ({ endpointId: 1, swarmId: "s1" })),
      listSwarmStackStatuses: vi.fn(async () => [
        {
          name: FAKE_ID.replace(/-/g, "_"),
          desired: 1,
          running: 1,
          ready: true,
          images: { [`${FAKE_ID.replace(/-/g, "_")}_app`]: "ghcr.io/x/fake:1.0.0" },
        },
      ]),
    };
  });
  vi.doMock("@/lib/stacks/registry", () => ({
    getPublicCatalog: () => [def],
    getStack: (id: string) => (id === FAKE_ID ? def : undefined),
  }));
}

describe("GET /api/stacks — computeReleaseBasedPendingUpdates para stacks com updateViaRelease (Ciclo 29)", () => {
  it("stack com updateViaRelease usa computeReleaseBasedPendingUpdates (nunca computePendingUpdates) e reflete no payload", async () => {
    const def = fakeDef();
    await setupCommonMocks(def);
    const computeReleaseBasedMock = vi.fn(async () => [{ serviceName: "x", current: "a", target: "b" }]);
    const computePendingMock = vi.fn(() => []);
    vi.doMock("@/lib/stacks/updates", () => ({
      computePendingUpdates: computePendingMock,
      computeReleaseBasedPendingUpdates: computeReleaseBasedMock,
    }));

    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    const entry = body.catalog.find((c: { id: string }) => c.id === FAKE_ID);
    expect(entry).toBeTruthy();
    expect(entry.updateAvailable).toBe(true);
    expect(entry.pendingUpdates).toEqual([{ serviceName: "x", current: "a", target: "b" }]);
    expect(computeReleaseBasedMock).toHaveBeenCalledTimes(1);
    expect(computePendingMock).not.toHaveBeenCalled();
  });

  it("stack SEM updateViaRelease continua usando computePendingUpdates (síncrono) — comportamento inalterado", async () => {
    const def = fakeDef({ updateViaRelease: undefined, updatableImages: [{ service: "app", image: "ghcr.io/x/fake:1.1.0" }] });
    await setupCommonMocks(def);
    const computeReleaseBasedMock = vi.fn(async () => []);
    const computePendingMock = vi.fn(() => [{ serviceName: "y", current: "a", target: "b" }]);
    vi.doMock("@/lib/stacks/updates", () => ({
      computePendingUpdates: computePendingMock,
      computeReleaseBasedPendingUpdates: computeReleaseBasedMock,
    }));

    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();

    const entry = body.catalog.find((c: { id: string }) => c.id === FAKE_ID);
    expect(entry.updateAvailable).toBe(true);
    expect(computePendingMock).toHaveBeenCalledTimes(1);
    expect(computeReleaseBasedMock).not.toHaveBeenCalled();
  });
});

// C7 (S10 do plano de segurança do EnchaT) — o link de primeiro acesso
// (setupUrl) vem pronto do installer e a rota só o repassa; accessUrl
// continua sendo o da stack, sem token.
describe("POST /api/stacks — setupUrl no pós-instalação", () => {
  it("repassa result.setupUrl sem mexer no accessUrl", async () => {
    const def = fakeDef({
      updateViaRelease: undefined,
      postInstall: { accessUrl: () => "https://crm.exemplo.com", setupUrl: () => "nao-deve-ser-usado-pela-rota" },
    });
    await setupCommonMocks(def);
    vi.doMock("@/lib/csrf", () => ({
      verifyOrigin: () => true,
      verifyCsrf: async () => true,
      getClientIp: () => "10.0.0.9",
    }));
    const installStack = vi.fn(async () => ({
      ok: true,
      stack: { Id: 42 },
      generatedSecrets: [],
      setupUrl: "https://crm.exemplo.com/?setup=TOKEN-DO-INSTALLER-0123456789",
    }));
    vi.doMock("@/lib/installer", () => ({ installStack, listInstalledStacks: vi.fn(async () => []) }));
    vi.doMock("@/lib/portainer", async (importOriginal) => {
      const actual = await importOriginal<typeof import("@/lib/portainer")>();
      return {
        ...actual,
        discoverContext: vi.fn(async () => ({ endpointId: 1, swarmId: "s1" })),
        listSwarmStackStatuses: vi.fn(async () => []),
      };
    });

    const { POST } = await import("./route");
    const req = new Request("http://painel.local/api/stacks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stackId: FAKE_ID,
        values: {},
        swarmCtx: { networkName: "rede", serverName: "vps", email: "" },
      }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.setupUrl).toBe("https://crm.exemplo.com/?setup=TOKEN-DO-INSTALLER-0123456789");
    expect(body.accessUrl).toBe("https://crm.exemplo.com");
  });
});

// S5-A — a recusa "banco do EnchaT existe e o painel não tem as chaves" chega
// ao usuário traduzida (PT/EN/ES), com 409 e o reason estável.
describe("POST /api/stacks — banco existente sem chaves (S5-A)", () => {
  // A mensagem sai de def.protegeDadosExistentes da PRÓPRIA stack: a do
  // EnchaT cita dados_enchat e /var/enchat/postgres; a do Tracker cita só o
  // diretório dele — nunca o do EnchaT (seria mandar apagar o banco errado).
  const casos = [
    { stack: "enchat", protecao: enchat.protegeDadosExistentes!, tem: ["/root/dados_vps/dados_enchat", "/var/enchat/postgres"], nao: [] as string[] },
    { stack: "encha-tracker", protecao: enchaTracker.protegeDadosExistentes!, tem: ["/var/enchat/tracker-postgres"], nao: ["dados_enchat", "/var/enchat/postgres"] },
  ];
  for (const caso of casos) {
    for (const [locale, trecho] of [
      ["pt", "tornaria os dados ilegíveis"],
      ["en", "make the data unreadable"],
      ["es", "dejaría los datos ilegibles"],
    ] as const) {
      it(`${caso.stack}: 409 com a mensagem em ${locale}, citando ${caso.tem.join(" e ")}`, async () => {
        const def = fakeDef({ updateViaRelease: undefined, protegeDadosExistentes: caso.protecao });
        await setupCommonMocks(def);
        vi.doMock("@/lib/locale", () => ({ resolveLocale: vi.fn(async () => locale) }));
        vi.doMock("@/lib/csrf", () => ({ verifyOrigin: () => true, verifyCsrf: async () => true, getClientIp: () => `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` }));
        vi.doMock("@/lib/installer", () => ({
          installStack: vi.fn(async () => ({
            ok: false,
            error: "texto em pt do installer",
            reason: "banco_existente_sem_chaves",
            httpStatus: 409,
          })),
          listInstalledStacks: vi.fn(async () => []),
        }));
        vi.doMock("@/lib/portainer", async (importOriginal) => {
          const actual = await importOriginal<typeof import("@/lib/portainer")>();
          return {
            ...actual,
            discoverContext: vi.fn(async () => ({ endpointId: 1, swarmId: "s1" })),
            listSwarmStackStatuses: vi.fn(async () => []),
          };
        });

        const { POST } = await import("./route");
        const req = new Request("http://painel.local/api/stacks", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            stackId: FAKE_ID,
            values: {},
            swarmCtx: { networkName: "rede", serverName: "vps", email: "" },
          }),
        });
        const res = await POST(req as unknown as import("next/server").NextRequest);
        const body = await res.json();

        expect(res.status).toBe(409);
        expect(body.error).toBe("banco_existente_sem_chaves");
        expect(body.reason).toBe("banco_existente_sem_chaves");
        expect(body.message).toContain(trecho);
        expect(body.message).toContain(def.name);
        for (const t of caso.tem) expect(body.message).toContain(t);
        for (const t of caso.nao) expect(body.message).not.toContain(t);
        expect(body.message).not.toContain("texto em pt do installer");
      });
    }
  }
});
