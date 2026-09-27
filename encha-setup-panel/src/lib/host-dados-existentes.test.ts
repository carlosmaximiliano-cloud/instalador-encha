import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ALLOWED_DIR_RE } from "./host-dirs";
import { ALLOWED_PROBE_RE } from "./host-dados-existentes";
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
