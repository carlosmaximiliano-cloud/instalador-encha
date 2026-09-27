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
  vi.doUnmock("./tracker-ativacao");
});

type Host = { bancoExiste: boolean; falharChecagem: boolean; caminhosChecados: string[]; deployFalhas: number };

const INSTALACOES = {
  enchat: { url_enchat: "crm.exemplo.com", chave_licenca: "CHAVE-DE-TESTE-123" },
  "encha-tracker": { dominio_tracker: "tracker.exemplo.com", email_ativacao: "dono@exemplo.com", senha_admin: "Senha-Forte-123!abc" },
} as const;

async function preparar(host: Host, stackId: keyof typeof INSTALACOES = "enchat") {
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
        if (host.deployFalhas > 0) {
          host.deployFalhas--;
          // Ex.: timeout do lado do painel com a stack criada do lado do
          // Portainer — o Postgres pode ter inicializado com estes valores.
          throw new Error("Portainer 504: timeout ao criar a stack");
        }
        return { Id: 7 };
      }),
    };
  });
  vi.doMock("./release-info", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./release-info")>();
    return {
      ...actual,
      // < 0.4.2: formato antigo (variáveis em texto), sem segredos do Docker.
      fetchLatestRelease: vi.fn(async (_base: string, app: string) =>
        app === "tracker"
          ? { version: "1.2.0", imageRepo: "ghcr.io/cheiodecoisa/encha-tracker", imageTag: "1.2.0", obrigatoria: false }
          : {
              version: "0.3.9",
              imageRepo: "ghcr.io/enchainterno/enchat-free",
              imageTag: "0.3.9",
              obrigatoria: false,
            }
      ),
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
  vi.doMock("./tracker-ativacao", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./tracker-ativacao")>();
    return { ...actual, ativarTrackerPorEmail: vi.fn(async () => ({ chave: "CHAVE-TRACKER-123456" })) };
  });
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
      stackId,
      values: { ...INSTALACOES[stackId] },
      swarmCtx: ctx,
      token: "tok",
      user: "tester",
      ip: "127.0.0.1",
    });
  const salvos = (): Record<string, string> => {
    const row = getDb().prepare("SELECT encrypted_envs FROM stack_secrets WHERE stack_name = ?").get(stackId) as
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
      .run(stackId, encryptSecret(JSON.stringify({ values: {}, generated })), now, now);
  };
  return { instalar, salvos, semear, efeitos };
}

const novoHost = (over: Partial<Host> = {}): Host => ({
  bancoExiste: false,
  falharChecagem: false,
  caminhosChecados: [],
  deployFalhas: 0,
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

  // Basta UM segredo protegido sem valor salvo: a senha do Postgres nova não
  // abre o volume mesmo com a chave-mestra certa (e vice-versa). Sem este
  // caso, trocar o `.some` por `.every` em installer.ts passava em tudo.
  for (const faltando of ["postgres_password", "enchat_master_key"]) {
    it(`banco existe e stack_secrets PARCIAL (sem ${faltando}): aborta, sem deploy e sem gravar nada`, async () => {
      const host = novoHost({ bancoExiste: true });
      const { instalar, salvos, semear, efeitos } = await preparar(host);
      const completos = [
        { name: "enchat_master_key", value: "MASTER-ANTIGA-DO-BANCO" },
        { name: "postgres_password", value: "SENHA-ANTIGA-DO-VOLUME" },
        { name: "pinfy_session_key", value: "SESSAO-ANTIGA" },
      ];
      semear(completos.filter((g) => g.name !== faltando));

      const r = await instalar();
      expect(r.ok).toBe(false);
      expect(r.reason).toBe("banco_existente_sem_chaves");
      expect(efeitos.deploys).toHaveLength(0);
      expect(host.caminhosChecados).toEqual(["/var/enchat/postgres/PG_VERSION"]);
      expect(salvos()[faltando]).toBeUndefined(); // nada sorteado foi gravado por cima
    });
  }

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

  // O deploy pode falhar DEPOIS de o Postgres ter inicializado com os valores
  // sorteados (timeout do painel com a stack criada no Portainer; o operador
  // remove a stack e tenta de novo). Se esses valores só fossem salvos depois
  // do deploy, o retry veria banco + nenhuma chave salva e abortaria — numa
  // instalação nova, legítima, que o próprio painel começou. Salvos antes do
  // deploy, o retry reusa exatamente os mesmos.
  it("deploy falhou depois de sortear as chaves: o retry (já com banco no host) reusa as MESMAS chaves em vez de abortar", async () => {
    const host = novoHost({ bancoExiste: false, deployFalhas: 1 });
    const { instalar, salvos, efeitos } = await preparar(host);

    const r1 = await instalar();
    expect(r1.ok).toBe(false);
    expect(efeitos.deploys).toHaveLength(1);
    const primeiras = salvos();
    expect(primeiras.enchat_master_key).toBeTruthy();
    expect(primeiras.postgres_password).toBeTruthy();
    expect(efeitos.deploys[0]).toContain(primeiras.postgres_password);
    expect(efeitos.deploys[0]).toContain(primeiras.enchat_master_key);

    host.bancoExiste = true; // o Postgres inicializou com os valores da 1ª tentativa
    host.caminhosChecados.length = 0;
    const r2 = await instalar();
    expect(r2.ok, r2.error).toBe(true);
    expect(host.caminhosChecados).toEqual([]); // chaves salvas: nem olha o disco
    const g = Object.fromEntries((r2.generatedSecrets ?? []).map((s) => [s.name, s.value]));
    expect(g.enchat_master_key).toBe(primeiras.enchat_master_key);
    expect(g.postgres_password).toBe(primeiras.postgres_password);
    expect(efeitos.deploys[1]).toContain(primeiras.postgres_password);
  });

  it("a gravação antecipada não conta como instalação na auditoria: só o deploy aceito registra stack.install", async () => {
    const host = novoHost({ bancoExiste: false, deployFalhas: 1 });
    const { instalar } = await preparar(host);
    await instalar();
    const { listAudit } = await import("./audit");
    const acoes = listAudit(50).map((a) => a.action);
    expect(acoes).toContain("stack.install.fail");
    expect(acoes).not.toContain("stack.install");
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

// Mesma trava no Tracker, com a mensagem DELE: o diretório do Tracker, nunca
// o do EnchaT (apagar /var/enchat/postgres por engano destruiria outro banco).
describe("installStack (Encha Tracker) — banco existente no host", () => {
  it("banco do Tracker existe e o painel NÃO tem stack_secrets: aborta citando só o diretório do Tracker", async () => {
    const host = novoHost({ bancoExiste: true });
    const { instalar, salvos, efeitos } = await preparar(host, "encha-tracker");

    const r = await instalar();
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("banco_existente_sem_chaves");
    expect(r.httpStatus).toBe(409);
    expect(host.caminhosChecados).toEqual(["/var/enchat/tracker-postgres/PG_VERSION"]);
    expect(r.error).toContain("/var/enchat/tracker-postgres");
    expect(r.error).not.toContain("/var/enchat/postgres");
    expect(r.error).not.toContain("dados_enchat");
    expect(efeitos.deploys).toHaveLength(0);
    expect(salvos()).toEqual({});
  });

  it("Tracker novo (sem banco, sem stack_secrets): instala com chaves novas", async () => {
    const host = novoHost({ bancoExiste: false });
    const { instalar, salvos, efeitos } = await preparar(host, "encha-tracker");

    const r = await instalar();
    expect(r.ok, r.error).toBe(true);
    expect(efeitos.deploys).toHaveLength(1);
    expect(salvos().tracker_master_key).toBeTruthy();
    expect(host.caminhosChecados).toEqual(["/var/enchat/tracker-postgres/PG_VERSION"]);
  });
});
