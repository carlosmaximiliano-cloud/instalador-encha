import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Painel P1 — GET /api/stacks/[id]/schema espalha o StackField inteiro (`...f`),
// e é isso que leva `regra` até o wizard. Este teste impede que a rota deixe
// de levar: sem `regra` no cliente, o botão Instalar volta a aceitar senha
// fraca. O registro é o real.

beforeEach(() => {
  vi.resetModules();
  vi.doMock("@/lib/session", () => ({ readSession: vi.fn(async () => ({ user: "tester" })) }));
  vi.doMock("@/lib/locale", () => ({ resolveLocale: vi.fn(async () => "pt") }));
});

afterEach(() => {
  vi.doUnmock("@/lib/session");
  vi.doUnmock("@/lib/locale");
});

async function campos(id: string) {
  const { GET } = await import("./route");
  const res = await GET(new Request(`http://painel.local/api/stacks/${id}/schema`), {
    params: Promise.resolve({ id }),
  });
  expect(res.status).toBe(200);
  const body = (await res.json()) as { fields: { name: string; regra?: string }[] };
  return new Map(body.fields.map((f) => [f.name, f]));
}

describe("GET /api/stacks/[id]/schema — regra dos campos (Painel P1)", () => {
  it("entrega regra dos campos de senha (encha-tracker: senha_forte_yaml; minio: senha_forte_texto)", async () => {
    const tracker = await campos("encha-tracker");
    expect(tracker.get("senha_admin")?.regra).toBe("senha_forte_yaml");
    // Campo sem regra não ganha regra.
    expect(tracker.get("dominio_tracker")?.regra).toBeUndefined();

    const minio = await campos("minio");
    expect(minio.get("senha_minio")?.regra).toBe("senha_forte_texto");
  });
});
