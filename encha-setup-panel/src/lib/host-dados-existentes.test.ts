import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ALLOWED_DIR_RE } from "./host-dirs";
import { ALLOWED_PROBE_RE, scriptSonda } from "./host-dados-existentes";
import { enchat } from "./stacks/enchat";

beforeEach(() => {
  vi.resetModules();
});
afterEach(() => {
  vi.doUnmock("./portainer");
});

async function comJob(resultado: { exitCode: number; logs: string; timedOut: boolean }) {
  const specs: { Cmd: string[]; HostConfig: { Binds: string[] } }[] = [];
  vi.doMock("./portainer", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./portainer")>();
    return {
      ...actual,
      imageExistsLocally: vi.fn(async () => true),
      pullImage: vi.fn(async () => undefined),
      runOneShotJob: vi.fn(async (_t: string, _e: number, args: { spec: (typeof specs)[number] }) => {
        specs.push(args.spec);
        return resultado;
      }),
    };
  });
  const mod = await import("./host-dados-existentes");
  return { ...mod, specs };
}

describe("hostTemArquivo", () => {
  it("presente: true; o bind é SOMENTE LEITURA e o script só testa o arquivo (nunca escreve)", async () => {
    const { hostTemArquivo, specs } = await comJob({ exitCode: 0, logs: "ENCHA_HOST_PROBE_PRESENTE\r\n", timedOut: false });
    await expect(hostTemArquivo("t", 1, "/var/enchat/postgres/PG_VERSION")).resolves.toBe(true);
    expect(specs[0].HostConfig.Binds).toEqual(["/var:/host-var:ro"]);
    expect(specs[0].Cmd[0]).toContain('[ -e "/host-var/enchat/postgres/PG_VERSION" ]');
    expect(specs[0].Cmd[0]).not.toMatch(/\b(rm|mkdir|chown|mv|cp|tee)\b|>/);
  });

  it("ausente: false", async () => {
    const { hostTemArquivo } = await comJob({ exitCode: 0, logs: "ENCHA_HOST_PROBE_AUSENTE", timedOut: false });
    await expect(hostTemArquivo("t", 1, "/var/enchat/postgres/PG_VERSION")).resolves.toBe(false);
  });

  it("INDETERMINADO (diretório do caminho existe mas não pôde ser atravessado): LANÇA, nunca vira 'não existe'", async () => {
    const { hostTemArquivo } = await comJob({
      exitCode: 0,
      logs: "sh: cd: can't cd to /host-var/enchat/postgres: Permission denied\r\nENCHA_HOST_PROBE_INDETERMINADO\r\n",
      timedOut: false,
    });
    await expect(hostTemArquivo("t", 1, "/var/enchat/postgres/PG_VERSION")).rejects.toThrow(/Não foi possível verificar/);
  });

  it("timeout, exit != 0 ou saída desconhecida: LANÇA (nunca devolve false por dúvida)", async () => {
    for (const r of [
      { exitCode: -1, logs: "", timedOut: true },
      { exitCode: 1, logs: "boom", timedOut: false },
      { exitCode: 0, logs: "outra coisa", timedOut: false },
    ]) {
      vi.resetModules();
      const { hostTemArquivo } = await comJob(r);
      await expect(hostTemArquivo("t", 1, "/var/enchat/postgres/PG_VERSION")).rejects.toThrow();
    }
  });

  it("recusa caminho fora do formato permitido (o caminho vai para um script de shell)", async () => {
    const { hostTemArquivo } = await comJob({ exitCode: 0, logs: "", timedOut: false });
    for (const c of ["/etc/passwd", "/var/enchat/../etc/x", '/var/enchat/a/b"; rm -rf /; "', "/var/enchat/postgres", "/var/enchat/a/b c"]) {
      await expect(hostTemArquivo("t", 1, c)).rejects.toThrow(/não permitido/);
    }
  });
});

describe("enchat.protegeDadosExistentes", () => {
  const p = enchat.protegeDadosExistentes!;
  it("aponta para o PG_VERSION do diretório do Postgres que a própria stack cria e o caminho é aceito pela sonda", () => {
    expect(ALLOWED_PROBE_RE.test(p.arquivoNoHost)).toBe(true);
    const dir = p.arquivoNoHost.replace(/\/[^/]+$/, "");
    expect(ALLOWED_DIR_RE.test(dir)).toBe(true);
    const dirs = (enchat.hostDirs ?? []).map((d) => (typeof d === "string" ? d : d.path));
    expect(dirs).toContain(dir);
  });
  it("protege a chave-mestra e a senha do Postgres, que existem em generateSecrets", () => {
    const nomes = enchat.generateSecrets!({}).map((g) => g.name);
    for (const n of p.segredosQueNaoPodemSerNovos) expect(nomes).toContain(n);
    expect(p.segredosQueNaoPodemSerNovos).toEqual(expect.arrayContaining(["enchat_master_key", "postgres_password"]));
  });
});

// O script de verdade, executado por um /bin/sh de verdade contra uma árvore
// temporária no lugar de /host-var (mesma substituição de prefixo que o bind
// faz). Cobre o que o mock do job não cobre: o que o shell responde.
describe("scriptSonda executado de verdade", () => {
  let raiz: string;
  beforeEach(() => {
    raiz = mkdtempSync(path.join(tmpdir(), "encha-sonda-"));
  });
  afterEach(() => {
    try {
      chmodSync(path.join(raiz, "enchat", "postgres"), 0o755);
    } catch {
      /* não existia */
    }
    rmSync(raiz, { recursive: true, force: true });
  });
  const rodar = () =>
    execFileSync("/bin/sh", ["-c", scriptSonda("/host-var/enchat/postgres/PG_VERSION").replaceAll("/host-var", raiz)], {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();

  it("PG_VERSION presente -> PRESENTE", () => {
    mkdirSync(path.join(raiz, "enchat", "postgres"), { recursive: true });
    writeFileSync(path.join(raiz, "enchat", "postgres", "PG_VERSION"), "16\n");
    expect(rodar()).toContain("ENCHA_HOST_PROBE_PRESENTE");
  });

  it("diretório criado pelo preparo (ensureHostDirs) mas vazio -> AUSENTE (instalação nova segue)", () => {
    mkdirSync(path.join(raiz, "enchat", "postgres"), { recursive: true });
    expect(rodar()).toContain("ENCHA_HOST_PROBE_AUSENTE");
  });

  it("nem /var/enchat existe -> AUSENTE", () => {
    expect(rodar()).toContain("ENCHA_HOST_PROBE_AUSENTE");
  });

  // Root atravessa 0700 por CAP_DAC_OVERRIDE; o caso só é reproduzível sem
  // ele (o runner do CI roda como usuário comum; em contêiner root, pula).
  it.skipIf(process.getuid?.() === 0)(
    "diretório do Postgres existe mas não pode ser atravessado (0700 de outro dono, root sem DAC) -> INDETERMINADO, nunca AUSENTE",
    () => {
      const pg = path.join(raiz, "enchat", "postgres");
      mkdirSync(pg, { recursive: true });
      writeFileSync(path.join(pg, "PG_VERSION"), "16\n");
      chmodSync(pg, 0o000);
      const saida = rodar();
      expect(saida).toContain("ENCHA_HOST_PROBE_INDETERMINADO");
      expect(saida).not.toContain("ENCHA_HOST_PROBE_AUSENTE");
    }
  );
});
