// computeReleaseBasedPendingUpdates só oferece uma versão ESTRITAMENTE
// maior que a instalada (painel-rebaixamento) — o caminho do Console, cuja
// tag é sempre X.Y.Z (release-info.ts). computePendingUpdates (imagem fixa
// em código: Postgres, Evolution, EvoCRM) continua por diferença de texto,
// porque as tags dele não são X.Y.Z. Mesmo padrão de mock de
// updates-chave.test.ts.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DockerServiceFull, SwarmStackStatus } from "../portainer";

vi.setConfig({ testTimeout: 30_000 });

const FAKE_STACK = "encha_tracker";

function servico(env: string[]): DockerServiceFull {
  return {
    ID: "svc-app",
    Version: { Index: 1 },
    Spec: { Name: `${FAKE_STACK}_app`, TaskTemplate: { ContainerSpec: { Image: "x", Env: env } } },
  } as DockerServiceFull;
}

function imagemComTag(repo: string, tag: string | null): string {
  return tag === null ? repo : `${repo}:${tag}`;
}

function statuses(app: string | null, updater: string | null): SwarmStackStatus[] {
  return [
    {
      name: FAKE_STACK,
      running: 3,
      desired: 3,
      images: {
        [`${FAKE_STACK}_app`]: imagemComTag("ghcr.io/cheiodecoisa/encha-tracker", app),
        [`${FAKE_STACK}_updater`]: imagemComTag("ghcr.io/cheiodecoisa/tracker-updater", updater),
      },
    } as unknown as SwarmStackStatus,
  ];
}

async function preparar(opts: { releaseTag: string; env?: string[] }) {
  const getServiceByNameMock = vi.fn(async () => servico(opts.env ?? ["TRACKER_CHAVE=CHAVE"]));
  const fetchLatestReleaseCachedMock = vi.fn(async (_spec: unknown, _cacheKey: string, _chave?: string) => ({
    version: opts.releaseTag,
    imageRepo: "ghcr.io/cheiodecoisa/encha-tracker",
    imageTag: opts.releaseTag,
    obrigatoria: false,
  }));
  vi.doMock("../portainer", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../portainer")>();
    return { ...actual, getServiceByName: getServiceByNameMock };
  });
  vi.doMock("../release-info", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../release-info")>();
    return { ...actual, fetchLatestReleaseCached: fetchLatestReleaseCachedMock };
  });
  const { computeReleaseBasedPendingUpdates } = await import("./updates");
  const { enchaTracker } = await import("./encha-tracker");
  return { computeReleaseBasedPendingUpdates, enchaTracker, fetchLatestReleaseCachedMock };
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.doUnmock("../portainer");
  vi.doUnmock("../release-info");
});

describe("computeReleaseBasedPendingUpdates — só oferece versão estritamente maior (painel-rebaixamento)", () => {
  it("U1: alvo maior é oferecido nos dois serviços", async () => {
    const { computeReleaseBasedPendingUpdates, enchaTracker } = await preparar({ releaseTag: "1.2.1" });
    const r = await computeReleaseBasedPendingUpdates(enchaTracker, statuses("1.2.0", "1.2.0"), {
      token: "tok",
      endpointId: 1,
    });
    expect(r).toEqual([
      {
        serviceName: "encha_tracker_app",
        current: "ghcr.io/cheiodecoisa/encha-tracker:1.2.0",
        target: "ghcr.io/cheiodecoisa/encha-tracker:1.2.1",
      },
      {
        serviceName: "encha_tracker_updater",
        current: "ghcr.io/cheiodecoisa/tracker-updater:1.2.0",
        target: "ghcr.io/cheiodecoisa/tracker-updater:1.2.1",
      },
    ]);
  });

  it("U2: alvo menor não é oferecido: instalada 1.3.31 e o canal devolve 1.2.1", async () => {
    const { computeReleaseBasedPendingUpdates, enchaTracker } = await preparar({ releaseTag: "1.2.1" });
    const r = await computeReleaseBasedPendingUpdates(enchaTracker, statuses("1.3.31", "1.3.31"), {
      token: "tok",
      endpointId: 1,
    });
    expect(r).toEqual([]);
  });

  it("U3: alvo igual não é oferecido", async () => {
    const { computeReleaseBasedPendingUpdates, enchaTracker } = await preparar({ releaseTag: "1.2.1" });
    const r = await computeReleaseBasedPendingUpdates(enchaTracker, statuses("1.2.1", "1.2.1"), {
      token: "tok",
      endpointId: 1,
    });
    expect(r).toEqual([]);
  });

  it("U4: ordem numérica: 1.9.0 → 1.10.0 é oferecido; 1.10.0 → 1.9.0 não", async () => {
    const primeira = await preparar({ releaseTag: "1.10.0" });
    const r1 = await primeira.computeReleaseBasedPendingUpdates(primeira.enchaTracker, statuses("1.9.0", "1.9.0"), {
      token: "tok",
      endpointId: 1,
    });
    expect(r1).toHaveLength(2);

    vi.resetModules();
    const segunda = await preparar({ releaseTag: "1.9.0" });
    const r2 = await segunda.computeReleaseBasedPendingUpdates(segunda.enchaTracker, statuses("1.10.0", "1.10.0"), {
      token: "tok",
      endpointId: 1,
    });
    expect(r2).toEqual([]);
  });

  it.each(["latest", "1.2.0-beta.3", "v1.2.0", null])(
    "U5: tag instalada ilegível não é oferecida (%s)",
    async (tagInstalada) => {
      const { computeReleaseBasedPendingUpdates, enchaTracker } = await preparar({ releaseTag: "1.2.1" });
      const r = await computeReleaseBasedPendingUpdates(
        enchaTracker,
        statuses(tagInstalada, tagInstalada),
        { token: "tok", endpointId: 1 }
      );
      expect(r).toEqual([]);
    }
  );

  it("U5b: alvo ilegível não é oferecido", async () => {
    // O mock de release-info pula de propósito a validação de SEMVER que
    // release-info.ts faria de verdade: a regra de ordem não pode depender
    // dela, e sim de ehAtualizacaoPorVersao.
    const { computeReleaseBasedPendingUpdates, enchaTracker } = await preparar({ releaseTag: "latest" });
    const r = await computeReleaseBasedPendingUpdates(enchaTracker, statuses("1.2.0", "1.2.0"), {
      token: "tok",
      endpointId: 1,
    });
    expect(r).toEqual([]);
  });

  it("U6: cada serviço decide sozinho: app igual e updater atrás", async () => {
    const { computeReleaseBasedPendingUpdates, enchaTracker } = await preparar({ releaseTag: "1.2.1" });
    const r = await computeReleaseBasedPendingUpdates(enchaTracker, statuses("1.2.1", "1.2.0"), {
      token: "tok",
      endpointId: 1,
    });
    expect(r).toEqual([
      {
        serviceName: "encha_tracker_updater",
        current: "ghcr.io/cheiodecoisa/tracker-updater:1.2.0",
        target: "ghcr.io/cheiodecoisa/tracker-updater:1.2.1",
      },
    ]);
  });
});

describe("computePendingUpdates — imagem fixa em código continua por diferença de texto (painel-rebaixamento)", () => {
  it("U7: Evolution e Redis pendentes por diferença de texto, não por ordem semver", async () => {
    const { computePendingUpdates } = await import("./updates");
    const { evolution, EVOLUTION_IMAGE, EVOLUTION_REDIS_IMAGE } = await import("./evolution");

    const defasado: SwarmStackStatus[] = [
      {
        name: "evolution",
        running: 2,
        desired: 2,
        images: {
          evolution_evolution_api: "evoapicloud/evolution-api:2.3.0-rc1",
          evolution_evolution_redis: "redis:7-alpine",
        },
      } as unknown as SwarmStackStatus,
    ];
    const emDia: SwarmStackStatus[] = [
      {
        name: "evolution",
        running: 2,
        desired: 2,
        images: {
          evolution_evolution_api: EVOLUTION_IMAGE,
          evolution_evolution_redis: EVOLUTION_REDIS_IMAGE,
        },
      } as unknown as SwarmStackStatus,
    ];

    const pendentes = computePendingUpdates(evolution, defasado);
    expect(pendentes.map((p) => p.target)).toEqual([EVOLUTION_IMAGE, EVOLUTION_REDIS_IMAGE]);

    expect(computePendingUpdates(evolution, emDia)).toEqual([]);
  });
});
