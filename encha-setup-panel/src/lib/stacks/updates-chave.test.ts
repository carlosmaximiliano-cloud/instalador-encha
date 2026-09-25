// computeReleaseBasedPendingUpdates consulta a release COM a chave da stack
// instalada: é o plano da licença, no Console, que decide o canal (stable ×
// beta). Sem ler a chave, o painel ofereceria a versão do canal padrão — um
// rebaixamento para quem está em outro canal (1.2.0 -> 1.0.22-beta).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DockerServiceFull, SwarmStackStatus } from "../portainer";

// import() a frio de módulos grandes estoura os 5s padrão do vitest com a
// suíte inteira rodando em paralelo (mesma fragilidade do stack-update-release).
vi.setConfig({ testTimeout: 30_000 });

const FAKE_STACK = "encha_tracker";

function servico(env: string[]): DockerServiceFull {
  return {
    ID: "svc-app",
    Version: { Index: 1 },
    Spec: { Name: `${FAKE_STACK}_app`, TaskTemplate: { ContainerSpec: { Image: "x", Env: env } } },
  } as DockerServiceFull;
}

function statuses(imagemApp: string): SwarmStackStatus[] {
  return [
    {
      name: FAKE_STACK,
      running: 3,
      desired: 3,
      images: {
        [`${FAKE_STACK}_app`]: imagemApp,
        [`${FAKE_STACK}_updater`]: imagemApp.replace("encha-tracker", "tracker-updater"),
      },
    } as unknown as SwarmStackStatus,
  ];
}

async function preparar(opts: { env?: string[]; servicoAusente?: boolean }) {
  const getServiceByNameMock = vi.fn(async () => (opts.servicoAusente ? null : servico(opts.env ?? [])));
  const fetchCachedMock = vi.fn(async (_spec: unknown, _cacheKey: string, _chave?: string) => ({
    version: "1.2.0",
    imageRepo: "ghcr.io/cheiodecoisa/encha-tracker",
    imageTag: "1.2.0",
    obrigatoria: false,
  }));
  vi.doMock("../portainer", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../portainer")>();
    return { ...actual, getServiceByName: getServiceByNameMock };
  });
  vi.doMock("../release-info", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../release-info")>();
    return { ...actual, fetchLatestReleaseCached: fetchCachedMock };
  });
  const { computeReleaseBasedPendingUpdates } = await import("./updates");
  const { enchaTracker } = await import("./encha-tracker");
  return { computeReleaseBasedPendingUpdates, enchaTracker, fetchCachedMock };
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.doUnmock("../portainer");
  vi.doUnmock("../release-info");
});

describe("computeReleaseBasedPendingUpdates — consulta com a chave da stack", () => {
  it("lê TRACKER_CHAVE do serviço app e a repassa à consulta da release", async () => {
    const { computeReleaseBasedPendingUpdates, enchaTracker, fetchCachedMock } = await preparar({
      env: ["OUTRA=1", "TRACKER_CHAVE=CHAVE-DO-PLANO"],
    });
    const r = await computeReleaseBasedPendingUpdates(
      enchaTracker,
      statuses("ghcr.io/cheiodecoisa/encha-tracker:1.0.22"),
      { token: "tok", endpointId: 1 }
    );
    expect(fetchCachedMock).toHaveBeenCalledTimes(1);
    expect(fetchCachedMock.mock.calls[0][2]).toBe("CHAVE-DO-PLANO");
    expect(r.map((p) => p.target)).toContain("ghcr.io/cheiodecoisa/encha-tracker:1.2.0");
  });

  // Mutação: consultar mesmo sem chave. Sem saber o plano, o painel cairia
  // no canal padrão e poderia sugerir um rebaixamento — então não oferece nada.
  it("sem chave legível: não consulta e não oferece atualização", async () => {
    const { computeReleaseBasedPendingUpdates, enchaTracker, fetchCachedMock } = await preparar({ env: ["OUTRA=1"] });
    const r = await computeReleaseBasedPendingUpdates(
      enchaTracker,
      statuses("ghcr.io/cheiodecoisa/encha-tracker:1.0.22"),
      { token: "tok", endpointId: 1 }
    );
    expect(r).toEqual([]);
    expect(fetchCachedMock).not.toHaveBeenCalled();
  });

  it("serviço app ausente: não oferece atualização", async () => {
    const { computeReleaseBasedPendingUpdates, enchaTracker, fetchCachedMock } = await preparar({ servicoAusente: true });
    const r = await computeReleaseBasedPendingUpdates(
      enchaTracker,
      statuses("ghcr.io/cheiodecoisa/encha-tracker:1.0.22"),
      { token: "tok", endpointId: 1 }
    );
    expect(r).toEqual([]);
    expect(fetchCachedMock).not.toHaveBeenCalled();
  });
});
