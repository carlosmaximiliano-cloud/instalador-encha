import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StackDefinition } from "./stacks/types";

// resolveRegistryAndPullImages é a extração EXATA (Ciclo 29) do bloco que
// installer.ts (installStack) usava inline — ver registry-pull.ts. Testado
// isoladamente aqui: sucesso na 1ª tentativa; falha transitória retenta até
// 3x com backoff; falha NÃO transitória não retenta; os dois logAudit
// acontecem com os campos certos e SEM chave/token no meta.

const registryAuthSpec: NonNullable<StackDefinition["registryAuth"]> = {
  registryHost: "ghcr.io",
  registryName: "GHCR Teste",
  exchangeUrl: "https://console.exemplo.com/api/v1/tracker/registry-auth",
  licenseField: "chave_licenca",
  images: () => [],
};

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.doUnmock("./registry-auth");
  vi.doUnmock("./portainer");
  vi.doUnmock("./audit");
  vi.useRealTimers();
});

describe("resolveRegistryAndPullImages", () => {
  it("sucesso na 1ª tentativa: troca, registra, pré-puxa todas as imagens, um único logAudit ok", async () => {
    const exchangeMock = vi.fn(async () => ({ username: "user1", token: "tok1" }));
    const ensureRegistryMock = vi.fn(async () => 42);
    const pullMock = vi.fn(async () => undefined);
    const auditMock = vi.fn();

    vi.doMock("./registry-auth", async (importOriginal) => {
      const actual = await importOriginal<typeof import("./registry-auth")>();
      return { ...actual, exchangeLicenseForGhcrCredentials: exchangeMock, ensureRegistry: ensureRegistryMock };
    });
    vi.doMock("./portainer", () => ({ pullImageWithRegistry: pullMock }));
    vi.doMock("./audit", () => ({ logAudit: auditMock }));

    const { resolveRegistryAndPullImages } = await import("./registry-pull");

    await resolveRegistryAndPullImages({
      token: "tok",
      endpointId: 1,
      user: "tester",
      ip: "127.0.0.1",
      registryAuth: registryAuthSpec,
      chave: "CHAVE-SECRETA-1",
      fingerprint: "fp-1",
      images: ["ghcr.io/x/img:1.0.0", "ghcr.io/x/updater:1.0.0"],
    });

    expect(exchangeMock).toHaveBeenCalledTimes(1);
    expect(exchangeMock).toHaveBeenCalledWith(registryAuthSpec.exchangeUrl, "CHAVE-SECRETA-1", "fp-1");
    expect(ensureRegistryMock).toHaveBeenCalledTimes(1);
    expect(pullMock).toHaveBeenCalledTimes(2);
    expect(pullMock).toHaveBeenNthCalledWith(1, "tok", 1, "ghcr.io/x/img:1.0.0", 42);
    expect(pullMock).toHaveBeenNthCalledWith(2, "tok", 1, "ghcr.io/x/updater:1.0.0", 42);

    expect(auditMock).toHaveBeenCalledTimes(1);
    const [entry] = auditMock.mock.calls[0];
    expect(entry.action).toBe("registry.auth");
    expect(entry.result).toBe("ok");
    expect(entry.meta).toEqual({ registryId: 42, username: "user1", tentativa: 1 });
    // Nunca a chave nem o token no meta.
    const serialized = JSON.stringify(auditMock.mock.calls);
    expect(serialized).not.toMatch(/CHAVE-SECRETA-1/);
    expect(serialized).not.toMatch(/tok1/);
  });

  // M3: falha transitória (network/timeout/rate_limited/server) tem que
  // retentar até 3x com backoff (2000*tentativa ms).
  it("M3a: falha transitória (network) retenta até suceder, com backoff entre tentativas", async () => {
    vi.useFakeTimers();
    const { RegistryAuthError } = await import("./registry-auth");
    let chamada = 0;
    const exchangeMock = vi.fn(async () => {
      chamada++;
      if (chamada < 3) throw new RegistryAuthError("network", "falha de rede transitória");
      return { username: "user1", token: "tok1" };
    });
    const ensureRegistryMock = vi.fn(async () => 42);
    const pullMock = vi.fn(async () => undefined);
    const auditMock = vi.fn();

    vi.doMock("./registry-auth", async (importOriginal) => {
      const actual = await importOriginal<typeof import("./registry-auth")>();
      return { ...actual, exchangeLicenseForGhcrCredentials: exchangeMock, ensureRegistry: ensureRegistryMock };
    });
    vi.doMock("./portainer", () => ({ pullImageWithRegistry: pullMock }));
    vi.doMock("./audit", () => ({ logAudit: auditMock }));

    const { resolveRegistryAndPullImages } = await import("./registry-pull");

    const promise = resolveRegistryAndPullImages({
      token: "tok",
      endpointId: 1,
      user: "tester",
      ip: "127.0.0.1",
      registryAuth: registryAuthSpec,
      chave: "CHAVE-1",
      fingerprint: "fp-1",
      images: ["ghcr.io/x/img:1.0.0"],
    });
    await vi.runAllTimersAsync();
    await promise;

    expect(exchangeMock).toHaveBeenCalledTimes(3);
    expect(pullMock).toHaveBeenCalledTimes(1);
    expect(auditMock).toHaveBeenCalledTimes(3); // 2 falhas + 1 sucesso
    expect(auditMock.mock.calls[0][0].action).toBe("registry.auth.fail");
    expect(auditMock.mock.calls[0][0].meta.tentativa).toBe(1);
    expect(auditMock.mock.calls[1][0].action).toBe("registry.auth.fail");
    expect(auditMock.mock.calls[1][0].meta.tentativa).toBe(2);
    expect(auditMock.mock.calls[2][0].action).toBe("registry.auth");
  });

  // M3: falha NÃO transitória (chave revogada/fingerprint mismatch) NUNCA
  // pode gastar as 3 tentativas — é erro do cliente, não da rede.
  it("M3b: falha NÃO transitória (chave revogada) não retenta, lança na 1ª falha", async () => {
    const { RegistryAuthError } = await import("./registry-auth");
    const exchangeMock = vi.fn(async () => {
      throw new RegistryAuthError("chave_revogada", "Esta licença foi revogada.");
    });
    const ensureRegistryMock = vi.fn(async () => 42);
    const pullMock = vi.fn(async () => undefined);
    const auditMock = vi.fn();

    vi.doMock("./registry-auth", async (importOriginal) => {
      const actual = await importOriginal<typeof import("./registry-auth")>();
      return { ...actual, exchangeLicenseForGhcrCredentials: exchangeMock, ensureRegistry: ensureRegistryMock };
    });
    vi.doMock("./portainer", () => ({ pullImageWithRegistry: pullMock }));
    vi.doMock("./audit", () => ({ logAudit: auditMock }));

    const { resolveRegistryAndPullImages } = await import("./registry-pull");

    await expect(
      resolveRegistryAndPullImages({
        token: "tok",
        endpointId: 1,
        user: "tester",
        ip: "127.0.0.1",
        registryAuth: registryAuthSpec,
        chave: "CHAVE-1",
        fingerprint: "fp-1",
        images: ["ghcr.io/x/img:1.0.0"],
      })
    ).rejects.toThrow(/revogada/);

    expect(exchangeMock).toHaveBeenCalledTimes(1);
    expect(pullMock).not.toHaveBeenCalled();
    expect(auditMock).toHaveBeenCalledTimes(1);
    expect(auditMock.mock.calls[0][0].action).toBe("registry.auth.fail");
    expect(auditMock.mock.calls[0][0].meta.reason).toBe("chave_revogada");
  });
});
