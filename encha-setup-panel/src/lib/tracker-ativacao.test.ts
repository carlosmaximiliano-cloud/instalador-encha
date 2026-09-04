import { afterEach, describe, expect, it, vi } from "vitest";
import { ativarTrackerPorEmail, TrackerAtivacaoError } from "./tracker-ativacao";

function respostaFalsa(status: number, corpo?: unknown): Response {
  return new Response(corpo === undefined ? undefined : JSON.stringify(corpo), {
    status,
    headers: corpo === undefined ? {} : { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ativarTrackerPorEmail", () => {
  it("devolve a chave em caso de sucesso, e IGNORA o campo registry da resposta", async () => {
    let corpoEnviado: unknown;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, opts: RequestInit) => {
        corpoEnviado = JSON.parse(opts.body as string);
        return respostaFalsa(200, { chave: "TRACKER-ABC-123", registry: { username: "x", token: "y" } });
      })
    );

    const r = await ativarTrackerPorEmail("https://console.exemplo.com", "cliente@exemplo.com", "fingerprint-fake", "0.2.7");

    expect(r).toEqual({ chave: "TRACKER-ABC-123" });
    expect(r).not.toHaveProperty("registry");
    expect(corpoEnviado).toEqual({ email: "cliente@exemplo.com", fingerprint: "fingerprint-fake", versao_app: "0.2.7" });
  });

  it("403 vira ativacao_recusada", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(403, { error: "ativacao_recusada" })));
    await expect(ativarTrackerPorEmail("https://c.x", "a@b.com", "fp", "1")).rejects.toMatchObject({
      reason: "ativacao_recusada",
    } satisfies Partial<TrackerAtivacaoError>);
  });

  it("429 vira rate_limited", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(429)));
    await expect(ativarTrackerPorEmail("https://c.x", "a@b.com", "fp", "1")).rejects.toMatchObject({ reason: "rate_limited" });
  });

  it("503 vira registry_nao_configurado", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(503)));
    await expect(ativarTrackerPorEmail("https://c.x", "a@b.com", "fp", "1")).rejects.toMatchObject({
      reason: "registry_nao_configurado",
    });
  });

  // Ciclo C (fechamento da instalação) — a mensagem antiga dizia
  // "temporariamente indisponível", que manda o operador esperar por algo
  // que nunca se resolve sozinho: registry_nao_configurado é config
  // ausente no Console, não uma falha passageira.
  it("503: a mensagem NUNCA sugere que é passageiro (nem 'temporariamente' nem 'tente de novo')", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(503)));
    try {
      await ativarTrackerPorEmail("https://c.x", "a@b.com", "fp", "1");
      expect.unreachable("deveria ter lançado TrackerAtivacaoError");
    } catch (e) {
      const msg = (e as Error).message.toLowerCase();
      expect(msg).not.toMatch(/temporariamente/);
      expect(msg).not.toMatch(/tente de novo/);
    }
  });

  it("500 vira server", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(500)));
    await expect(ativarTrackerPorEmail("https://c.x", "a@b.com", "fp", "1")).rejects.toMatchObject({ reason: "server" });
  });

  it("200 sem chave utilizável vira contract", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(200, { chave: "" })));
    await expect(ativarTrackerPorEmail("https://c.x", "a@b.com", "fp", "1")).rejects.toMatchObject({ reason: "contract" });
  });

  it("200 com corpo não-JSON vira malformed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>não é json</html>", { status: 200, headers: { "Content-Type": "text/html" } }))
    );
    await expect(ativarTrackerPorEmail("https://c.x", "a@b.com", "fp", "1")).rejects.toMatchObject({ reason: "malformed" });
  });

  it("erro de rede vira network", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("fetch failed"); }));
    await expect(ativarTrackerPorEmail("https://c.x", "a@b.com", "fp", "1")).rejects.toMatchObject({ reason: "network" });
  });
});
