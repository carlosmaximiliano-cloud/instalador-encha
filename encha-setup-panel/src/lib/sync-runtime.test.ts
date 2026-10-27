import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Agendador da sincronização automática (sync-runtime.ts): o do Tracker usa o
// portão próprio (chave consultada pelo fingerprint do Tracker); o do enchat
// segue com sincronizacaoAutomaticaLigada. Ciclo 101 F5b.

async function montar(opts: { enchatLigado?: boolean; trackerLigado?: boolean; pode?: boolean } = {}) {
  const enchatLigada = vi.fn(async () => opts.enchatLigado ?? false);
  const trackerLigada = vi.fn(async () => opts.trackerLigado ?? false);
  const podeTentarAuto = vi.fn((_id: string) => ({ pode: opts.pode ?? true }));
  const sincronizarStackTracker = vi.fn(async () => ({}));
  const sincronizarStackEnchat = vi.fn(async () => ({}));
  vi.doMock("./flag-sincronizacao", () => ({
    sincronizacaoAutomaticaLigada: enchatLigada,
    sincronizacaoAutomaticaTrackerLigada: trackerLigada,
  }));
  vi.doMock("./stack-sync-store", () => ({ podeTentarAuto }));
  vi.doMock("./sincronizar-stack", () => ({ STACK_TRACKER: "encha-tracker", sincronizarStackEnchat, sincronizarStackTracker }));
  vi.doMock("./portainer", () => ({
    discoverContext: vi.fn(async () => ({ endpointId: 1, swarmId: "s" })),
    withServiceToken: async (fn: (t: string) => Promise<unknown>) => fn("tok"),
  }));
  vi.doMock("./auth/local-admin", () => ({ hasServiceCredentials: () => true }));
  return { enchatLigada, trackerLigada, podeTentarAuto, sincronizarStackTracker, sincronizarStackEnchat };
}

beforeEach(() => vi.resetModules());
afterEach(() => {
  for (const m of ["./flag-sincronizacao", "./stack-sync-store", "./sincronizar-stack", "./portainer", "./auth/local-admin"]) vi.doUnmock(m);
});

describe("sync-runtime", () => {
  it("agendador do Tracker consulta a chave pelo fingerprint do Tracker", async () => {
    const m = await montar({ trackerLigado: true, enchatLigado: false });
    const { tentarSincronizarStackTracker } = await import("./sync-runtime");
    await tentarSincronizarStackTracker();
    expect(m.trackerLigada).toHaveBeenCalled();
    expect(m.enchatLigada).not.toHaveBeenCalled();
    expect(m.sincronizarStackTracker).toHaveBeenCalledTimes(1);
  });

  it("agendador do Tracker respeita o automático da stack desligado ou em backoff", async () => {
    const m = await montar({ trackerLigado: true, pode: false });
    const { tentarSincronizarStackTracker } = await import("./sync-runtime");
    await tentarSincronizarStackTracker();
    expect(m.podeTentarAuto).toHaveBeenCalledWith("encha-tracker");
    expect(m.sincronizarStackTracker).not.toHaveBeenCalled();
  });

  it("agendador do enchat segue com o predicado do enchat", async () => {
    const m = await montar({ enchatLigado: true, trackerLigado: false });
    const { tentarSincronizarStack } = await import("./sync-runtime");
    await tentarSincronizarStack();
    expect(m.enchatLigada).toHaveBeenCalled();
    expect(m.trackerLigada).not.toHaveBeenCalled();
    expect(m.sincronizarStackEnchat).toHaveBeenCalledTimes(1);
  });
});
