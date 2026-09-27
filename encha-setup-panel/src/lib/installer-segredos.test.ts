import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { SwarmContext } from "./stacks/types";

// S4 (achado 2): a orquestração dos segredos do Docker no installStack do
// EnchaT REAL (stacks/enchat.ts) contra um Swarm FALSO que se comporta como o
// Docker onde importa:
//   - `secret create` de nome existente = 409;
//   - o deploy grava, por serviço, os segredos que o YAML monta (Spec) e
//     guarda o Spec anterior (PreviousSpec) quando o serviço já existia;
//   - `secret rm` de segredo referenciado pelo Spec ATUAL = 400 (o daemon não
//     olha o PreviousSpec — é a armadilha do rollback do C9);
//   - `docker stack deploy` com segredo `external` que não existe = falha.
// A ORDEM criar → deploy → limpar é gravada em `ordem`.

let tmpDir: string;

beforeEach(() => {
  vi.resetModules();
  tmpDir = mkdtempSync(path.join(tmpdir(), "encha-setup-installer-segredos-"));
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
  vi.useRealTimers();
});

type SegredoSwarm = { ID: string; nome: string; valor: string; labels: Record<string, string> };
type ServicoSwarm = { nome: string; atuais: string[]; anteriores: string[] };

function novoSwarm() {
  return {
    segredos: new Map<string, SegredoSwarm>(),
    servicos: new Map<string, ServicoSwarm>(),
    yamls: [] as string[],
    ordem: [] as string[],
    falharDeploy: false,
    falharCriacaoDoN: 0 as number, // 0 = nunca; N = a N-ésima criação falha
    criacoes: 0,
  };
}
type Swarm = ReturnType<typeof novoSwarm>;

// Lê o YAML como o Docker: segredos `external` do topo (alias → nome real) e,
// por serviço, os `source:` montados. Falha se um external não existir.
function aplicarDeployNoSwarm(swarm: Swarm, yaml: string) {
  const [servicos, topo = ""] = yaml.split(/^secrets:$/m);
  const externos = new Map<string, string>();
  for (const m of topo.matchAll(/^ {2}(\S+):\n {4}external: true\n {4}name: (\S+)$/gm)) externos.set(m[1], m[2]);
  for (const nome of externos.values()) {
    if (!swarm.segredos.has(nome)) throw new Error(`secret not found: ${nome}`);
  }
  const partes = servicos.split(/^ {2}(enchat_[a-z]+):$/m);
  for (let i = 1; i < partes.length; i += 2) {
    const chave = partes[i];
    const corpo = partes[i + 1];
    const atuais = [...corpo.matchAll(/- source: (\S+)/g)].map((m) => externos.get(m[1]) ?? `SEM-EXTERNAL:${m[1]}`);
    const nome = `enchat_${chave}`;
    const antigo = swarm.servicos.get(nome);
    swarm.servicos.set(nome, { nome, atuais, anteriores: antigo ? antigo.atuais : [] });
  }
}

// `tagRef` permite trocar a release entre duas instalações do mesmo teste
// (formato antigo -> segredos); sem ele vale `tagRelease` (padrão 0.4.1).
async function preparar(opts: { swarm: Swarm; tagRelease?: string; tagRef?: { atual: string } }) {
  const { swarm } = opts;
  const tagFixa = opts.tagRelease ?? "0.4.1";
  const tagAtual = () => opts.tagRef?.atual ?? tagFixa;

  vi.doMock("./portainer", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./portainer")>();
    return {
      ...actual,
      discoverContext: vi.fn(async () => ({ endpointId: 1, swarmId: "swarm-1" })),
      ensurePostgresDatabase: vi.fn(async () => undefined),
      ensurePostgresExtension: vi.fn(async () => undefined),
      ensureSwarmVolume: vi.fn(async () => undefined),
      listStacks: vi.fn(async () => []),
      createDockerSecret: vi.fn(async (_t: string, _e: number, a: { name: string; value: string; labels?: Record<string, string> }) => {
        swarm.criacoes++;
        if (swarm.falharCriacaoDoN && swarm.criacoes === swarm.falharCriacaoDoN) {
          throw new actual.PortainerError(500, "falha simulada ao criar");
        }
        if (swarm.segredos.has(a.name)) throw new actual.PortainerError(409, "name conflicts with an existing object");
        swarm.ordem.push(`criar:${a.name}`);
        swarm.segredos.set(a.name, { ID: `id-${a.name}`, nome: a.name, valor: a.value, labels: a.labels ?? {} });
        return { ID: `id-${a.name}` };
      }),
      deploySwarmStack: vi.fn(async (a: { yaml: string }) => {
        swarm.ordem.push("deploy");
        swarm.yamls.push(a.yaml);
        if (swarm.falharDeploy) throw new actual.PortainerError(500, "deploy falhou");
        aplicarDeployNoSwarm(swarm, a.yaml);
        return { Id: 7 };
      }),
      listStackServices: vi.fn(async () =>
        [...swarm.servicos.values()].map((s) => ({
          ID: s.nome,
          Version: { Index: 1 },
          Spec: { Name: s.nome, TaskTemplate: { ContainerSpec: { Secrets: s.atuais.map((n) => ({ SecretName: n })) } } },
          PreviousSpec: { TaskTemplate: { ContainerSpec: { Secrets: s.anteriores.map((n) => ({ SecretName: n })) } } },
        }))
      ),
      listDockerSecrets: vi.fn(async (_t: string, _e: number, labels?: string[]) =>
        [...swarm.segredos.values()]
          .filter((s) => (labels ?? []).every((l) => `${l}` === Object.entries(s.labels).map(([k, v]) => `${k}=${v}`).find((x) => x === l)))
          .map((s) => ({ ID: s.ID, Spec: { Name: s.nome, Labels: s.labels } }))
      ),
      removeDockerSecret: vi.fn(async (_t: string, _e: number, id: string) => {
        const s = [...swarm.segredos.values()].find((x) => x.ID === id);
        if (!s) return;
        if ([...swarm.servicos.values()].some((sv) => sv.atuais.includes(s.nome))) {
          throw new actual.PortainerError(400, "secret is in use by service");
        }
        swarm.ordem.push(`remover:${s.nome}`);
        swarm.segredos.delete(s.nome);
      }),
    };
  });
  vi.doMock("./release-info", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./release-info")>();
    return {
      ...actual,
      fetchLatestRelease: vi.fn(async () => ({
        version: tagAtual(),
        imageRepo: "ghcr.io/enchainterno/enchat-free",
        imageTag: tagAtual(),
        obrigatoria: false,
      })),
    };
  });
  vi.doMock("./registry-pull", () => ({ resolveRegistryAndPullImages: vi.fn(async () => undefined) }));
  vi.doMock("./host-dirs", () => ({ ensureHostDirs: vi.fn(async () => undefined) }));
  // S5-A: estes testes são de instalação nova (sem banco no host).
  vi.doMock("./host-dados-existentes", () => ({ hostTemArquivo: vi.fn(async () => false) }));

  const { installStack } = await import("./installer");
  const { getDb } = await import("./db");
  const { decryptSecret } = await import("./crypto");
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
  const geradosSalvos = (): Record<string, string> => {
    const row = getDb().prepare("SELECT encrypted_envs FROM stack_secrets WHERE stack_name = ?").get("enchat") as
      | { encrypted_envs: string }
      | undefined;
    if (!row) return {};
    const parsed = JSON.parse(decryptSecret(row.encrypted_envs)) as { generated: { name: string; value: string }[] };
    return Object.fromEntries(parsed.generated.map((g) => [g.name, g.value]));
  };
  return { instalar, geradosSalvos };
}

const nomesCriados = (swarm: Swarm) => swarm.ordem.filter((o) => o.startsWith("criar:")).map((o) => o.slice(6));

describe("installStack (EnchaT) — segredos do Docker: ordem criar → deploy → limpar", () => {
  it("primeira instalação com 0.4.1: cria os 12 segredos ANTES do deploy; sem segredo antigo, nada é removido", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-26T12:00:00Z"));
    const swarm = novoSwarm();
    const { instalar } = await preparar({ swarm });

    const r = await instalar();
    expect(r.ok, r.error).toBe(true);

    const idxDeploy = swarm.ordem.indexOf("deploy");
    expect(idxDeploy).toBe(12);
    expect(swarm.ordem.slice(0, 12).every((o) => o.startsWith("criar:"))).toBe(true);
    expect(swarm.ordem.some((o) => o.startsWith("remover:"))).toBe(false);
    // Época = segundos do relógio no momento; nomes versionados.
    const epoca = String(Math.floor(new Date("2026-09-26T12:00:00Z").getTime() / 1000));
    for (const n of nomesCriados(swarm)) expect(n.endsWith(`_${epoca}`)).toBe(true);
    // Rótulos para achar as versões antigas depois.
    for (const s of swarm.segredos.values()) {
      expect(s.labels["com.encha.segredo-stack"]).toBe("enchat");
      expect(`${s.labels["com.encha.segredo-base"]}_${epoca}`).toBe(s.nome);
    }
    // O YAML enviado ao Portainer não tem NENHUM valor de segredo em texto.
    const yaml = swarm.yamls[0];
    for (const s of swarm.segredos.values()) {
      if (s.nome.includes("license_key")) expect(yaml).not.toContain(s.valor);
      else expect(yaml, s.nome).not.toContain(s.valor);
    }
    expect(yaml).not.toContain("CHAVE-DE-TESTE-123");
  });

  it("o valor de cada segredo é o que o installer gerou e persistiu em stack_secrets (a mesma senha do Postgres)", async () => {
    const swarm = novoSwarm();
    const { instalar, geradosSalvos } = await preparar({ swarm });
    expect((await instalar()).ok).toBe(true);

    const gerados = geradosSalvos();
    const valorDe = (base: string) => [...swarm.segredos.values()].find((s) => s.labels["com.encha.segredo-base"] === base)?.valor;
    expect(valorDe("enchat_postgres_password")).toBe(gerados.postgres_password);
    expect(valorDe("enchat_master_key")).toBe(gerados.enchat_master_key);
    expect(valorDe("enchat_database_url")).toContain(`enchat:${gerados.postgres_password}@`);
    expect(valorDe("enchat_license_key")).toBe("CHAVE-DE-TESTE-123");
  });

  it("REINSTALAÇÃO (migração): reutiliza os MESMOS valores (senha do Postgres do volume), cria versões novas, e só remove as antigas depois do deploy", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-26T12:00:00Z"));
    const swarm = novoSwarm();
    const { instalar, geradosSalvos } = await preparar({ swarm });
    expect((await instalar()).ok).toBe(true);
    const primeiros = new Map([...swarm.segredos.values()].map((s) => [s.labels["com.encha.segredo-base"], s]));
    const gerados1 = geradosSalvos();

    // Operador removeu a stack no Portainer (os segredos externos ficam) e reinstala.
    swarm.servicos.clear();
    swarm.ordem.length = 0;
    vi.setSystemTime(new Date("2026-09-26T12:10:00Z"));
    expect((await instalar()).ok).toBe(true);

    expect(geradosSalvos()).toEqual(gerados1); // nada foi re-sorteado
    const novos = [...swarm.segredos.values()];
    expect(novos.length).toBe(12); // os 12 antigos saíram
    for (const s of novos) {
      const antigo = primeiros.get(s.labels["com.encha.segredo-base"])!;
      expect(s.valor).toBe(antigo.valor); // MESMO valor (a senha do Postgres do volume não muda)
      expect(s.nome).not.toBe(antigo.nome); // nome novo (versão nova)
    }
    // Ordem: 12 criações, deploy, 12 remoções — nunca remover antes do deploy.
    const idxDeploy = swarm.ordem.indexOf("deploy");
    expect(swarm.ordem.slice(0, idxDeploy).every((o) => o.startsWith("criar:"))).toBe(true);
    expect(swarm.ordem.slice(idxDeploy + 1).every((o) => o.startsWith("remover:"))).toBe(true);
    expect(swarm.ordem.filter((o) => o.startsWith("remover:")).length).toBe(12);
  });

  it("deploy que FALHA não remove segredo nenhum (a stack em uso continua com segredo válido) e não persiste valores", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-26T12:00:00Z"));
    const swarm = novoSwarm();
    const { instalar, geradosSalvos } = await preparar({ swarm });
    expect((await instalar()).ok).toBe(true);
    const antigos = new Set(swarm.segredos.keys());
    swarm.ordem.length = 0;

    swarm.falharDeploy = true;
    vi.setSystemTime(new Date("2026-09-26T12:10:00Z"));
    const r = await instalar();
    expect(r.ok).toBe(false);
    expect(swarm.ordem.some((o) => o.startsWith("remover:"))).toBe(false);
    for (const n of antigos) expect(swarm.segredos.has(n)).toBe(true);
    // Os serviços em uso continuam apontando para segredos que existem.
    for (const sv of swarm.servicos.values()) for (const n of sv.atuais) expect(swarm.segredos.has(n)).toBe(true);
    expect(Object.keys(geradosSalvos()).length).toBeGreaterThan(0); // o da 1ª instalação segue lá
  });

  it("falha ao CRIAR um segredo (no meio) aborta antes do deploy: nada trocado, nenhum antigo removido", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-26T12:00:00Z"));
    const swarm = novoSwarm();
    const { instalar } = await preparar({ swarm });
    expect((await instalar()).ok).toBe(true);
    const antigos = new Set(swarm.segredos.keys());
    swarm.ordem.length = 0;
    swarm.criacoes = 0;
    swarm.falharCriacaoDoN = 5;

    vi.setSystemTime(new Date("2026-09-26T12:10:00Z"));
    const r = await instalar();
    expect(r.ok).toBe(false);
    expect(swarm.ordem).not.toContain("deploy");
    expect(swarm.ordem.some((o) => o.startsWith("remover:"))).toBe(false);
    for (const n of antigos) expect(swarm.segredos.has(n)).toBe(true);

    // A próxima tentativa completa e varre os órfãos da rodada que falhou.
    swarm.falharCriacaoDoN = 0;
    swarm.servicos.clear();
    vi.setSystemTime(new Date("2026-09-26T12:20:00Z"));
    expect((await instalar()).ok).toBe(true);
    expect(swarm.segredos.size).toBe(12);
  });

  it("nunca remove um segredo que o PreviousSpec (alvo do rollback) ainda referencia", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-26T12:00:00Z"));
    const swarm = novoSwarm();
    const { instalar } = await preparar({ swarm });
    expect((await instalar()).ok).toBe(true);
    const antigos = new Set(swarm.segredos.keys());

    // Segunda instalação SEM remover a stack: o serviço já existe, então o
    // Spec anterior aponta para os segredos antigos (rollback automático).
    swarm.ordem.length = 0;
    vi.setSystemTime(new Date("2026-09-26T12:10:00Z"));
    expect((await instalar()).ok).toBe(true);
    for (const n of antigos) expect(swarm.segredos.has(n), `removeu ${n}`).toBe(true);
    expect(swarm.ordem.some((o) => o.startsWith("remover:"))).toBe(false);
    for (const sv of swarm.servicos.values()) for (const n of sv.anteriores) expect(swarm.segredos.has(n)).toBe(true);
  });

  it("portão fechado (release 0.4.0): formato antigo — nenhum segredo criado/listado/removido, YAML com env em texto", async () => {
    const swarm = novoSwarm();
    const { instalar } = await preparar({ swarm, tagRelease: "0.4.0" });
    expect((await instalar()).ok).toBe(true);

    expect(swarm.segredos.size).toBe(0);
    expect(swarm.ordem).toEqual(["deploy"]);
    expect(swarm.yamls[0]).toContain("CHAVE-DE-TESTE-123");
    expect(swarm.yamls[0]).toMatch(/DATABASE_URL: "postgresql:\/\/enchat:/);
    expect(swarm.yamls[0]).not.toContain("/run/secrets/");
    expect(swarm.yamls[0]).not.toMatch(/^secrets:/m);
  });
});

// Auditoria S4 — a migração que importa em campo: stack instalada pelo painel
// no formato ANTIGO (release < 0.4.1, env em texto), removida e reinstalada
// com o portão aberto. O valor de cada segredo tem que ser BYTE A BYTE o que a
// mesma variável tinha no YAML antigo: a senha do Postgres está gravada no
// volume (o initdb não roda de novo — provado num Swarm real na auditoria: com
// senha diferente no segredo, o volume vence e o app não conecta), a
// ENCHAT_MASTER_KEY cifra os segredos no banco (outra = boot aborta no
// canário) e a PINFY_SESSION_KEY cifra as sessões do WhatsApp (outra = QR de
// novo em todas). Tabela (serviço, variável, segredo) = a do contrato.
describe("installStack (EnchaT) — migração do formato antigo para segredos", () => {
  const contrato = readFileSync(path.join(__dirname, "stacks", "__fixtures__", "enchat-segredos-contrato.tsv"), "utf8")
    .split("\n")
    .filter((l) => l.trim() !== "" && !l.startsWith("#"))
    .slice(1)
    .map((l) => l.split("\t"))
    .map(([servico, variavel, segredo]) => ({ servico, variavel, segredo }));

  const envAntigo = (yaml: string, servico: string, variavel: string): string | undefined => {
    const bloco = yaml.split(new RegExp(`^ {2}enchat_${servico}:$`, "m"))[1]?.split(/^ {2}\S|^\S/m)[0] ?? "";
    return new RegExp(`^ {6}${variavel}: "(.*)"$`, "m").exec(bloco)?.[1];
  };

  it("0.4.0 (env) -> remover -> 0.4.1 (segredos): cada segredo tem o valor exato da variável antiga, e nada é re-sorteado", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-26T12:00:00Z"));
    const swarm = novoSwarm();
    const tagRef = { atual: "0.4.0" };
    const { instalar, geradosSalvos } = await preparar({ swarm, tagRef });

    expect((await instalar()).ok).toBe(true);
    expect(swarm.segredos.size).toBe(0); // formato antigo: nenhum segredo
    const yamlAntigo = swarm.yamls[0];
    expect(yamlAntigo).not.toContain("/run/secrets/");
    const gerados1 = geradosSalvos();

    swarm.servicos.clear(); // operador removeu a stack; o volume do Postgres fica
    tagRef.atual = "0.4.1";
    vi.setSystemTime(new Date("2026-09-26T12:10:00Z"));
    expect((await instalar()).ok).toBe(true);

    expect(geradosSalvos()).toEqual(gerados1);
    expect(swarm.yamls[1]).toMatch(/^secrets:$/m);
    const valorDoSegredo = (segredo: string) =>
      [...swarm.segredos.values()].find((s) => s.labels["com.encha.segredo-base"] === `enchat_${segredo}`)?.valor;
    expect(contrato.length).toBe(14);
    for (const { servico, variavel, segredo } of contrato) {
      const antes = envAntigo(yamlAntigo, servico, variavel);
      expect(antes, `${servico}/${variavel} no YAML antigo`).toBeTruthy();
      expect(valorDoSegredo(segredo), `${servico}/${variavel} -> enchat_${segredo}`).toBe(antes);
    }
    // As que não se pode perder, explicitamente.
    expect(valorDoSegredo("master_key")).toBe(gerados1.enchat_master_key);
    expect(valorDoSegredo("pinfy_session_key")).toBe(gerados1.pinfy_session_key);
    expect(valorDoSegredo("postgres_password")).toBe(gerados1.postgres_password);
  });
});
