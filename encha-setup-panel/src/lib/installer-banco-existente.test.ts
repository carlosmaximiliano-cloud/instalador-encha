import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { SwarmContext } from "./stacks/types";

// S5-A: instalar o EnchaT por cima de um banco que já existe no host, sem ter
// as chaves dele, NÃO pode sortear chave nova. Usa o installStack e a stack
// enchat REAIS; só Portainer/Console/disco do host são falsos.
//   - banco existe + sem stack_secrets            -> aborta, nada é criado/deployado
//   - banco existe + stack_secrets com as chaves  -> reusa as chaves salvas
//   - banco não existe                            -> gera chaves novas (instalação nova)
//   - não deu para verificar o host               -> aborta (nunca vira "não existe")

let tmpDir: string;

beforeEach(() => {
  vi.resetModules();
  tmpDir = mkdtempSync(path.join(tmpdir(), "encha-setup-banco-existente-"));
  process.env.DB_PATH = path.join(tmpDir, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmpDir, "master.key");
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.DB_PATH;
  delete process.env.MASTER_KEY_PATH;
  vi.doUnmock("./portainer");
  vi.doUnmock("./release-info");
  vi.doUnmock("./host-dirs");
  vi.doUnmock("./host-dados-existentes");
  vi.doUnmock("./registry-pull");
});

type Host = { bancoExiste: boolean; falharChecagem: boolean; caminhosChecados: string[] };

async function preparar(host: Host) {
  const efeitos = { deploys: [] as string[], hostDirs: 0, pulls: 0 };
  vi.doMock("./portainer", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./portainer")>();
    return {
      ...actual,
      discoverContext: vi.fn(async () => ({ endpointId: 1, swarmId: "swarm-1" })),
      ensurePostgresDatabase: vi.fn(async () => undefined),
      ensurePostgresExtension: vi.fn(async () => undefined),
      ensureSwarmVolume: vi.fn(async () => undefined),
      listStacks: vi.fn(async () => []),
      deploySwarmStack: vi.fn(async (a: { yaml: string }) => {
        efeitos.deploys.push(a.yaml);
        return { Id: 7 };
      }),
    };
  });
  vi.doMock("./release-info", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./release-info")>();
    return {
      ...actual,
      // < 0.4.1: formato antigo (variáveis em texto), sem segredos do Docker.
      fetchLatestRelease: vi.fn(async () => ({
        version: "0.3.9",
        imageRepo: "ghcr.io/enchainterno/enchat-free",
        imageTag: "0.3.9",
        obrigatoria: false,
      })),
    };
  });
  vi.doMock("./registry-pull", () => ({
    resolveRegistryAndPullImages: vi.fn(async () => {
      efeitos.pulls++;
    }),
  }));
  vi.doMock("./host-dirs", () => ({
    ensureHostDirs: vi.fn(async () => {
      efeitos.hostDirs++;
    }),
  }));
  vi.doMock("./host-dados-existentes", () => ({
    hostTemArquivo: vi.fn(async (_t: string, _e: number, caminho: string) => {
      host.caminhosChecados.push(caminho);
      if (host.falharChecagem) throw new Error("Portainer 500: sonda falhou");
      return host.bancoExiste;
    }),
  }));

  const { installStack } = await import("./installer");
  const { getDb } = await import("./db");
  const { decryptSecret, encryptSecret } = await import("./crypto");
  const ctx: SwarmContext = { networkName: "rede", serverName: "vps", email: "" };
  const instalar = () =>
    installStack({
      stackId: "enchat",
      values: { url_enchat: "crm.exemplo.com", chave_licenca: "CHAVE-DE-TESTE-123" },
      swarmCtx: ctx,
      token: "tok",
      user: "tester",
      ip: "127.0.0.1",
    });
  const salvos = (): Record<string, string> => {
    const row = getDb().prepare("SELECT encrypted_envs FROM stack_secrets WHERE stack_name = ?").get("enchat") as
      | { encrypted_envs: string }
      | undefined;
    if (!row) return {};
    const parsed = JSON.parse(decryptSecret(row.encrypted_envs)) as { generated: { name: string; value: string }[] };
    return Object.fromEntries(parsed.generated.map((g) => [g.name, g.value]));
  };
  const semear = (generated: { name: string; value: string }[]) => {
    const now = Date.now();
    getDb()
      .prepare("INSERT INTO stack_secrets (stack_name, encrypted_envs, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .run("enchat", encryptSecret(JSON.stringify({ values: {}, generated })), now, now);
  };
  return { instalar, salvos, semear, efeitos };
}

const novoHost = (over: Partial<Host> = {}): Host => ({
  bancoExiste: false,
  falharChecagem: false,
  caminhosChecados: [],
  ...over,
});

describe("installStack (EnchaT) — banco existente no host (S5-A)", () => {
  it("banco existe e o painel NÃO tem stack_secrets: aborta com 409, não gera chave, não puxa imagem, não cria diretório, não faz deploy", async () => {
    const host = novoHost({ bancoExiste: true });
    const { instalar, salvos, efeitos } = await preparar(host);

    const r = await instalar();

    expect(r.ok).toBe(false);
    expect(r.reason).toBe("banco_existente_sem_chaves");
    expect(r.httpStatus).toBe(409);
    expect(r.error).toContain("/root/dados_vps/dados_enchat");
    expect(r.error).toContain("/var/enchat/postgres");
    expect(r.generatedSecrets).toBeUndefined(); // nenhuma chave nova saiu daqui
    expect(efeitos.deploys).toHaveLength(0);
    expect(efeitos.pulls).toBe(0);
    expect(efeitos.hostDirs).toBe(0);
    expect(salvos()).toEqual({}); // nada gravado em stack_secrets
    expect(host.caminhosChecados).toEqual(["/var/enchat/postgres/PG_VERSION"]);
    // Registrado na auditoria (stack.install.fail), sem valores.
    const { listAudit } = await import("./audit");
    const falha = listAudit(20).find((a) => a.action === "stack.install.fail");
    expect(JSON.parse(falha?.meta ?? "{}")).toMatchObject({ reason: "banco_existente_sem_chaves", httpStatus: 409 });
  });

  it("banco existe e stack_secrets está ilegível (chave-mestra do painel trocada): também aborta", async () => {
    const host = novoHost({ bancoExiste: true });
    const { instalar, efeitos } = await preparar(host);
    const { getDb } = await import("./db");
    const now = Date.now();
    getDb()
      .prepare("INSERT INTO stack_secrets (stack_name, encrypted_envs, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .run("enchat", "lixo-que-nao-decifra", now, now);

    const r = await instalar();
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("banco_existente_sem_chaves");
    expect(efeitos.deploys).toHaveLength(0);
  });

  it("banco existe e stack_secrets TEM as chaves: reusa exatamente as salvas (nem olha o disco) e instala", async () => {
    const host = novoHost({ bancoExiste: true });
    const { instalar, salvos, semear, efeitos } = await preparar(host);
    semear([
      { name: "enchat_master_key", value: "MASTER-ANTIGA-DO-BANCO" },
      { name: "postgres_password", value: "SENHA-ANTIGA-DO-VOLUME" },
      { name: "pinfy_session_key", value: "SESSAO-ANTIGA" },
    ]);

    const r = await instalar();
    expect(r.ok, r.error).toBe(true);
    const g = Object.fromEntries((r.generatedSecrets ?? []).map((s) => [s.name, s.value]));
    expect(g.enchat_master_key).toBe("MASTER-ANTIGA-DO-BANCO");
    expect(g.postgres_password).toBe("SENHA-ANTIGA-DO-VOLUME");
    expect(g.pinfy_session_key).toBe("SESSAO-ANTIGA");
    expect(salvos().enchat_master_key).toBe("MASTER-ANTIGA-DO-BANCO");
    expect(efeitos.deploys).toHaveLength(1);
    expect(efeitos.deploys[0]).toContain("SENHA-ANTIGA-DO-VOLUME");
    expect(host.caminhosChecados).toEqual([]); // caminho normal não paga a checagem
  });

  it("instalação nova (sem banco no host e sem stack_secrets): gera chaves novas e instala", async () => {
    const host = novoHost({ bancoExiste: false });
    const { instalar, salvos, efeitos } = await preparar(host);

    const r = await instalar();
    expect(r.ok, r.error).toBe(true);
    expect(efeitos.deploys).toHaveLength(1);
    expect(salvos().enchat_master_key).toBeTruthy();
    expect(salvos().postgres_password).toBeTruthy();
    expect(host.caminhosChecados).toEqual(["/var/enchat/postgres/PG_VERSION"]);
  });

  it("não deu para verificar o host: aborta (a dúvida nunca vira 'não existe'), sem deploy", async () => {
    const host = novoHost({ falharChecagem: true });
    const { instalar, efeitos } = await preparar(host);

    const r = await instalar();
    expect(r.ok).toBe(false);
    expect(r.error).toContain("sonda falhou");
    expect(efeitos.deploys).toHaveLength(0);
  });
});
