import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";

// checkRateLimit é a implementação REAL (SQLite temporário), como em update/route.test.ts.
let tmpDir: string;
beforeEach(() => {
  vi.resetModules();
  tmpDir = mkdtempSync(path.join(tmpdir(), "encha-setup-fixar-route-test-"));
  process.env.DB_PATH = path.join(tmpDir, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmpDir, "master.key");
});
afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.DB_PATH;
  delete process.env.MASTER_KEY_PATH;
  for (const m of ["@/lib/auth/require-token", "@/lib/csrf", "@/lib/fixar-versoes", "@/lib/locale"]) vi.doUnmock(m);
});

function req(body?: unknown): NextRequest {
  return new NextRequest("https://painel.exemplo.com/api/stacks/enchat/fixar-versoes", {
    method: "POST",
    headers: { origin: "https://painel.exemplo.com", host: "painel.exemplo.com", "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function mocks(over: { origem?: boolean; csrf?: boolean; auth?: boolean } = {}) {
  vi.doMock("@/lib/auth/require-token", () => ({
    requireSessionToken: vi.fn(async () => (over.auth === false ? null : { session: { user: "tester" }, token: "tok" })),
  }));
  vi.doMock("@/lib/csrf", () => ({
    verifyCsrf: vi.fn(async () => over.csrf !== false),
    verifyOrigin: vi.fn(() => over.origem !== false),
    getClientIp: vi.fn(() => "127.0.0.1"),
  }));
  vi.doMock("@/lib/locale", () => ({ resolveLocale: vi.fn(async () => "pt") }));
  const aplicar = vi.fn(async () => ({ aplicada: true }));
  const prever = vi.fn(async () => ({ nadaAFazer: false }));
  vi.doMock("@/lib/fixar-versoes", async () => {
    const real = await vi.importActual<typeof import("@/lib/fixar-versoes")>("@/lib/fixar-versoes");
    return { ...real, aplicarFixacao: aplicar, preverFixacao: prever };
  });
  return { aplicar, prever };
}

const ctx = (id = "enchat") => ({ params: Promise.resolve({ id }) });

describe("POST /api/stacks/[id]/fixar-versoes", () => {
  it("aplica com confirmar:true", async () => {
    const { aplicar } = await mocks();
    const { POST } = await import("./route");
    const res = await POST(req({ confirmar: true }), ctx());
    expect(res.status).toBe(200);
    expect(aplicar).toHaveBeenCalledOnce();
  });

  it("sem confirmar:true -> 400 e nada aplicado", async () => {
    const { aplicar } = await mocks();
    const { POST } = await import("./route");
    for (const b of [undefined, { confirmar: "true" }, { confirmar: false }]) {
      const res = await POST(req(b), ctx());
      expect(res.status).toBe(400);
    }
    expect(aplicar).not.toHaveBeenCalled();
  });

  it("origem inválida, CSRF inválido e sem sessão são recusados ANTES de aplicar", async () => {
    for (const [over, status] of [
      [{ origem: false }, 403],
      [{ csrf: false }, 403],
      [{ auth: false }, 401],
    ] as const) {
      vi.resetModules();
      const { aplicar } = await mocks(over);
      const { POST } = await import("./route");
      const res = await POST(req({ confirmar: true }), ctx());
      expect(res.status).toBe(status);
      expect(aplicar).not.toHaveBeenCalled();
    }
  });

  it("outra stack -> 404", async () => {
    const { aplicar } = await mocks();
    const { POST } = await import("./route");
    const res = await POST(req({ confirmar: true }), ctx("n8n"));
    expect(res.status).toBe(404);
    expect(aplicar).not.toHaveBeenCalled();
  });

  it("rate limit: a 4ª tentativa no minuto -> 429", async () => {
    await mocks();
    const { POST } = await import("./route");
    const codigos: number[] = [];
    for (let i = 0; i < 4; i++) codigos.push((await POST(req({ confirmar: true }), ctx())).status);
    expect(codigos).toEqual([200, 200, 200, 429]);
  });

  it("erro de domínio vira o status e a mensagem traduzida", async () => {
    await mocks();
    vi.doMock("@/lib/fixar-versoes", async () => {
      const real = await vi.importActual<typeof import("@/lib/fixar-versoes")>("@/lib/fixar-versoes");
      return {
        ...real,
        aplicarFixacao: vi.fn(async () => {
          throw new real.FixarVersoesError("versoes_divergentes");
        }),
      };
    });
    const { POST } = await import("./route");
    const res = await POST(req({ confirmar: true }), ctx());
    const j = await res.json();
    expect(res.status).toBe(409);
    expect(j.error).toBe("versoes_divergentes");
    expect(j.message).toContain("Nada foi alterado");
  });
});

describe("GET /api/stacks/[id]/fixar-versoes (prévia)", () => {
  it("devolve a prévia sem exigir CSRF e não aplica", async () => {
    const { aplicar, prever } = await mocks({ csrf: false });
    const { GET } = await import("./route");
    const res = await GET(new NextRequest("https://painel.exemplo.com/x"), ctx());
    expect(res.status).toBe(200);
    expect(prever).toHaveBeenCalledOnce();
    expect(aplicar).not.toHaveBeenCalled();
  });
});
