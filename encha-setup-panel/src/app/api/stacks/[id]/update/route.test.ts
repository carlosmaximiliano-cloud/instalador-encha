import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { NextRequest } from "next/server";
import type { StackDefinition } from "@/lib/stacks/types";

// Ciclo 29 — a rota ganhou um ramo novo (updateViaRelease -> applyReleaseUpdate),
// inserido ANTES do caminho de updatableImages mas DEPOIS do rate
// limit/CSRF/Origin já existentes (nunca pula esses guards de entrada — ver
// mutação M6). checkRateLimit é a implementação REAL (toca um SQLite
// temporário, mesmo padrão de installer.test.ts) — é a única forma de
// provar que o guard de entrada continua rodando antes do ramo novo.

let tmpDir: string;

beforeEach(() => {
  vi.resetModules();
  tmpDir = mkdtempSync(path.join(tmpdir(), "encha-setup-update-route-test-"));
  process.env.DB_PATH = path.join(tmpDir, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmpDir, "master.key");
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.DB_PATH;
  delete process.env.MASTER_KEY_PATH;
  vi.doUnmock("@/lib/auth/require-token");
  vi.doUnmock("@/lib/csrf");
  vi.doUnmock("@/lib/stacks/registry");
  vi.doUnmock("@/lib/stack-update-release");
  vi.doUnmock("@/lib/portainer");
  vi.doUnmock("@/lib/stacks/updates");
});

const FAKE_ID = "fake-update-route-stack";

function fakeDef(overrides: Partial<StackDefinition> = {}): StackDefinition {
  return {
    id: FAKE_ID,
    name: "Fake Update Route Stack",
    description: "Stack sintética só para testar a rota de update.",
    category: "analytics",
    icon: "bar-chart-3",
    dependsOn: [],
    optionNumber: 995,
    fields: [],
    schema: z.object({}),
    generateYaml: () => "",
    updateViaRelease: () => [{ service: "app", image: "ghcr.io/x/fake:1.1.0" }],
    ...overrides,
  };
}

function makeReq(): NextRequest {
  return new NextRequest("https://painel.exemplo.com/api/stacks/fake/update", {
    method: "POST",
    headers: { origin: "https://painel.exemplo.com", host: "painel.exemplo.com" },
  });
}

async function setupAuthAndCsrfMocks() {
  vi.doMock("@/lib/auth/require-token", () => ({
    requireSessionToken: vi.fn(async () => ({ session: { user: "tester" }, token: "tok" })),
  }));
  vi.doMock("@/lib/csrf", () => ({
    verifyCsrf: vi.fn(async () => true),
    verifyOrigin: vi.fn(() => true),
    getClientIp: vi.fn(() => "127.0.0.1"),
  }));
}

describe("POST /api/stacks/[id]/update — ramo updateViaRelease (Ciclo 29)", () => {
  it("delega para applyReleaseUpdate quando a stack declara updateViaRelease, e devolve ok/updated", async () => {
    await setupAuthAndCsrfMocks();
    const def = fakeDef();
    vi.doMock("@/lib/stacks/registry", () => ({ getStack: (id: string) => (id === FAKE_ID ? def : undefined) }));
    const applyReleaseUpdateMock = vi.fn(async () => ({ atualizados: ["app: 1.0.0 → 1.1.0"] }));
    vi.doMock("@/lib/stack-update-release", () => ({ applyReleaseUpdate: applyReleaseUpdateMock }));

    const { POST } = await import("./route");
    const res = await POST(makeReq(), { params: Promise.resolve({ id: FAKE_ID }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.updated).toEqual(["app: 1.0.0 → 1.1.0"]);
    expect(applyReleaseUpdateMock).toHaveBeenCalledTimes(1);
  });

  it("já na versão mais recente (atualizados:[]) devolve message informativa", async () => {
    await setupAuthAndCsrfMocks();
    const def = fakeDef();
    vi.doMock("@/lib/stacks/registry", () => ({ getStack: (id: string) => (id === FAKE_ID ? def : undefined) }));
    vi.doMock("@/lib/stack-update-release", () => ({ applyReleaseUpdate: vi.fn(async () => ({ atualizados: [] })) }));

    const { POST } = await import("./route");
    const res = await POST(makeReq(), { params: Promise.resolve({ id: FAKE_ID }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.updated).toEqual([]);
    expect(body.message).toBe("Já está na versão mais recente");
  });

  it("falha em applyReleaseUpdate vira 500 com a mensagem, sem derrubar a rota", async () => {
    await setupAuthAndCsrfMocks();
    const def = fakeDef();
    vi.doMock("@/lib/stacks/registry", () => ({ getStack: (id: string) => (id === FAKE_ID ? def : undefined) }));
    vi.doMock("@/lib/stack-update-release", () => ({
      applyReleaseUpdate: vi.fn(async () => {
        throw new Error("falha simulada no update");
      }),
    }));

    const { POST } = await import("./route");
    const res = await POST(makeReq(), { params: Promise.resolve({ id: FAKE_ID }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/falha simulada no update/);
  });

  // M6 — a mais importante desta suíte: o guard de entrada (rate limit)
  // NÃO pode ser movido pra depois do ramo novo. Se o código passar a
  // checar rate limit só dentro do ramo `updatableImages` (ou depois dele),
  // a 4ª tentativa em 60s chamaria applyReleaseUpdate em vez de devolver
  // 429 — exatamente o que este teste falsifica.
  it("M6: rate limit (3/60s) continua sendo checado ANTES do ramo updateViaRelease — a 4ª tentativa devolve 429 sem chamar applyReleaseUpdate", async () => {
    await setupAuthAndCsrfMocks();
    const def = fakeDef();
    vi.doMock("@/lib/stacks/registry", () => ({ getStack: (id: string) => (id === FAKE_ID ? def : undefined) }));
    const applyReleaseUpdateMock = vi.fn(async () => ({ atualizados: [] }));
    vi.doMock("@/lib/stack-update-release", () => ({ applyReleaseUpdate: applyReleaseUpdateMock }));

    const { POST } = await import("./route");
    const ctx = { params: Promise.resolve({ id: FAKE_ID }) };

    for (let i = 0; i < 3; i++) {
      const res = await POST(makeReq(), ctx);
      expect(res.status).not.toBe(429);
    }
    expect(applyReleaseUpdateMock).toHaveBeenCalledTimes(3);

    const res4 = await POST(makeReq(), ctx);
    expect(res4.status).toBe(429);
    // A 4ª tentativa NUNCA chega em applyReleaseUpdate — continua em 3.
    expect(applyReleaseUpdateMock).toHaveBeenCalledTimes(3);
  });
});

describe("GET /api/stacks/[id]/update — troca condicional pra computeReleaseBasedPendingUpdates (Ciclo 29)", () => {
  it("usa computeReleaseBasedPendingUpdates (não computePendingUpdates) quando a stack declara updateViaRelease", async () => {
    vi.doMock("@/lib/auth/require-token", () => ({
      requireSessionToken: vi.fn(async () => ({ session: { user: "tester" }, token: "tok" })),
    }));
    const def = fakeDef();
    vi.doMock("@/lib/stacks/registry", () => ({ getStack: (id: string) => (id === FAKE_ID ? def : undefined) }));
    vi.doMock("@/lib/portainer", async (importOriginal) => {
      const actual = await importOriginal<typeof import("@/lib/portainer")>();
      return {
        ...actual,
        discoverContext: vi.fn(async () => ({ endpointId: 1, swarmId: "s1" })),
        listSwarmStackStatuses: vi.fn(async () => []),
      };
    });
    const computeReleaseBasedMock = vi.fn(async () => [{ serviceName: "x", current: "a", target: "b" }]);
    const computePendingMock = vi.fn(() => []);
    vi.doMock("@/lib/stacks/updates", () => ({
      computePendingUpdates: computePendingMock,
      computeReleaseBasedPendingUpdates: computeReleaseBasedMock,
    }));

    const { GET } = await import("./route");
    const res = await GET(new NextRequest("https://painel.exemplo.com/api/stacks/fake/update"), {
      params: Promise.resolve({ id: FAKE_ID }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.updateAvailable).toBe(true);
    expect(computeReleaseBasedMock).toHaveBeenCalledTimes(1);
    expect(computePendingMock).not.toHaveBeenCalled();
  });
});
