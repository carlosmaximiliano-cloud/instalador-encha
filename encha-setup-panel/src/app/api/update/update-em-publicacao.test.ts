import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// As duas rotas de atualização (scripts do host e imagem do painel) precisam
// recusar, SEM efeito colateral, quando a versão anunciada ainda está sendo
// publicada — e continuar funcionando normalmente em qualquer outro caso
// (CLAUDE.md do painel: um erro aqui não pode deixar o painel sem se atualizar).

const rotas = [
  { nome: "/api/update/scripts", caminho: "./scripts/route", efeito: "updateHostScripts", modulo: "@/lib/host-updater" },
  { nome: "/api/update", caminho: "./route", efeito: "triggerSelfUpdate", modulo: "@/lib/updater" },
] as const;

function makeReq(): NextRequest {
  return new NextRequest("https://painel.exemplo.com/api/update", {
    method: "POST",
    headers: { origin: "https://painel.exemplo.com", host: "painel.exemplo.com" },
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.doMock("@/lib/auth/require-token", () => ({
    requireSessionToken: vi.fn(async () => ({ session: { user: "tester" }, token: "tok" })),
  }));
  vi.doMock("@/lib/csrf", () => ({
    verifyCsrf: vi.fn(async () => true),
    verifyOrigin: vi.fn(() => true),
    getClientIp: vi.fn(() => "127.0.0.1"),
  }));
  vi.doMock("@/lib/security/rate-limit", () => ({ checkRateLimit: vi.fn(() => ({ allowed: true, resetMs: 0 })) }));
  vi.doMock("@/lib/locale", () => ({ resolveLocale: vi.fn(async () => "en") }));
  vi.doMock("@/lib/monitor", () => ({ fetchLatestVersion: vi.fn(async () => ({ latest_version: "9.9.9" })) }));
  vi.doMock("@/lib/version", () => ({ APP_VERSION: "0.3.12", compareSemver: (a: string, b: string) => (a === b ? 0 : a > b ? 1 : -1) }));
});

afterEach(() => {
  for (const m of [
    "@/lib/auth/require-token", "@/lib/csrf", "@/lib/security/rate-limit", "@/lib/locale",
    "@/lib/monitor", "@/lib/version", "@/lib/audit", "@/lib/host-updater", "@/lib/updater", "@/lib/release-pronta",
  ]) vi.doUnmock(m);
});

describe.each(rotas)("POST $nome", ({ caminho, efeito, modulo }) => {
  async function carregar(resultado: "em_publicacao" | "pronta" | "indeterminado") {
    const efeitoMock = vi.fn(async () => ({ ok: true, installedVersion: "9.9.9" }));
    const audit = vi.fn();
    vi.doMock(modulo, () => ({ [efeito]: efeitoMock }));
    vi.doMock("@/lib/audit", () => ({ logAudit: audit }));
    vi.doMock("@/lib/release-pronta", async () => ({
      releasePronta: vi.fn(async () => resultado),
      msgVersaoEmPublicacao: (await vi.importActual<typeof import("@/lib/release-pronta")>("@/lib/release-pronta")).msgVersaoEmPublicacao,
    }));
    const { POST } = await import(/* @vite-ignore */ caminho);
    return { POST, efeitoMock, audit };
  }

  it("em_publicacao → 409 com mensagem no idioma, sem executar a atualização", async () => {
    const { POST, efeitoMock, audit } = await carregar("em_publicacao");
    const res = await POST(makeReq());
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body.error).toBe("versao_em_publicacao");
    expect(body.message).toMatch(/still being published/);
    expect(efeitoMock).not.toHaveBeenCalled();
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: "error", meta: expect.objectContaining({ reason: "versao_em_publicacao" }) }));
  });

  it.each(["pronta", "indeterminado"] as const)("%s → segue e executa a atualização", async (r) => {
    const { POST, efeitoMock } = await carregar(r);
    const res = await POST(makeReq());
    expect(res.status).toBe(200);
    expect(efeitoMock).toHaveBeenCalledTimes(1);
  });
});
