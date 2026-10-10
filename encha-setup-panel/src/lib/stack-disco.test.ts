import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, chmodSync, statSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MARCA_CORROMPIDO, MARCA_DIVERGIU, MARCA_OK, MARCA_RESTAURADO, MARCA_SEM_ARQUIVO,
  SCRIPT_GRAVAR, SCRIPT_RESTAURAR, StackDiscoError, envDoJob, sha256,
} from "./stack-disco";

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
const P = { arquivo: "docker-compose.yml", esperadoSha: "a".repeat(64), novoSha: "b".repeat(64), novoB64: b64("x") };

describe("envDoJob (validação — nada de usuário vai para o script)", () => {
  it("aceita parâmetros válidos", () => {
    expect(envDoJob({ ...P, modo: "gravar" })).toEqual([
      "ARQ=docker-compose.yml", `ESPERADO_SHA=${"a".repeat(64)}`, `NOVO_SHA=${"b".repeat(64)}`, `NOVO_B64=${b64("x")}`,
    ]);
  });
  it.each([
    ["arquivo com ..", { arquivo: "../x.yml" }],
    ["arquivo com espaço", { arquivo: "a b.yml" }],
    ["arquivo sem extensão yaml", { arquivo: "compose.sh" }],
    ["sha curto", { esperadoSha: "abc" }],
    ["sha maiúsculo", { novoSha: "A".repeat(64) }],
    ["base64 com aspas", { novoB64: 'abc"; rm -rf /' }],
    ["conteúdo gigante", { novoB64: "A".repeat(400_000) }],
  ])("recusa: %s", (_n, over) => {
    expect(() => envDoJob({ ...P, ...over, modo: "gravar" })).toThrowError(StackDiscoError);
  });
  it("restaurar não exige conteúdo novo", () => {
    expect(envDoJob({ ...P, novoSha: "", novoB64: "", modo: "restaurar" })).toHaveLength(2);
  });
});

// Executa os scripts de verdade (sh + coreutils GNU/busybox). No macOS falta
// `stat -c`/`sha256sum`: nesse caso o bloco é pulado (roda no CI/Linux e na VPS).
const temGnu = (() => {
  try {
    execFileSync("sh", ["-c", "sha256sum /dev/null >/dev/null && stat -c %a / >/dev/null && echo x | base64 -d >/dev/null"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

function rodaScript(script: string, dir: string, env: Record<string, string>): string {
  // O script usa /stackdir; reescreve só para o teste (o texto de produção é constante).
  const s = script.replace("D=/stackdir", `D=${dir}`);
  const r = spawnSync("sh", ["-c", s], { env: { PATH: process.env.PATH ?? "", ...env } as unknown as NodeJS.ProcessEnv, encoding: "utf8" });
  return (r.stdout ?? "") + (r.stderr ?? "");
}

describe.skipIf(!temGnu)("scripts de gravar/restaurar (execução real)", () => {
  const mk = () => {
    const dir = mkdtempSync(path.join(tmpdir(), "encha-disco-"));
    const orig = "services:\n  a:\n    image: x:1\n";
    writeFileSync(path.join(dir, "docker-compose.yml"), orig);
    chmodSync(path.join(dir, "docker-compose.yml"), 0o600);
    return { dir, orig };
  };
  const envG = (orig: string, novo: string, over: Record<string, string> = {}) => ({
    ARQ: "docker-compose.yml", ESPERADO_SHA: sha256(orig), NOVO_SHA: sha256(novo), NOVO_B64: b64(novo), ...over,
  });

  it("grava com CAS, guarda cópia, preserva permissão e deixa só o arquivo final", () => {
    const { dir, orig } = mk();
    const novo = orig.replace("x:1", "x:2@sha256:" + "c".repeat(64));
    const out = rodaScript(SCRIPT_GRAVAR, dir, envG(orig, novo));
    expect(out).toContain(MARCA_OK);
    expect(readFileSync(path.join(dir, "docker-compose.yml"), "utf8")).toBe(novo);
    expect(readFileSync(path.join(dir, "docker-compose.yml.enchat-pre-sync"), "utf8")).toBe(orig);
    expect((statSync(path.join(dir, "docker-compose.yml")).mode & 0o777).toString(8)).toBe("600");
    expect(existsSync(path.join(dir, ".enchat-sync.tmp"))).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });

  it("CAS: se o arquivo mudou depois da leitura, NÃO grava", () => {
    const { dir, orig } = mk();
    const out = rodaScript(SCRIPT_GRAVAR, dir, envG(orig + "# editado\n", "novo"));
    expect(out).toContain(MARCA_DIVERGIU);
    expect(readFileSync(path.join(dir, "docker-compose.yml"), "utf8")).toBe(orig);
    rmSync(dir, { recursive: true, force: true });
  });

  it("conteúdo corrompido (hash não bate) não substitui nada", () => {
    const { dir, orig } = mk();
    const out = rodaScript(SCRIPT_GRAVAR, dir, envG(orig, "novo", { NOVO_SHA: "d".repeat(64) }));
    expect(out).toContain(MARCA_CORROMPIDO);
    expect(readFileSync(path.join(dir, "docker-compose.yml"), "utf8")).toBe(orig);
    expect(existsSync(path.join(dir, ".enchat-sync.tmp"))).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });

  it("sem arquivo: não cria", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "encha-disco-"));
    const out = rodaScript(SCRIPT_GRAVAR, dir, envG("a", "b"));
    expect(out).toContain(MARCA_SEM_ARQUIVO);
    expect(existsSync(path.join(dir, "docker-compose.yml"))).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });

  it("restaurar desfaz só se o arquivo ainda é o gravado", () => {
    const { dir, orig } = mk();
    const novo = orig.replace("x:1", "x:2");
    rodaScript(SCRIPT_GRAVAR, dir, envG(orig, novo));
    // alguém editou depois: não restaura
    writeFileSync(path.join(dir, "docker-compose.yml"), novo + "# cliente\n");
    let out = rodaScript(SCRIPT_RESTAURAR, dir, { ARQ: "docker-compose.yml", ESPERADO_SHA: sha256(novo) });
    expect(out).toContain(MARCA_DIVERGIU);
    expect(readFileSync(path.join(dir, "docker-compose.yml"), "utf8")).toBe(novo + "# cliente\n");
    // sem edição: restaura
    writeFileSync(path.join(dir, "docker-compose.yml"), novo);
    out = rodaScript(SCRIPT_RESTAURAR, dir, { ARQ: "docker-compose.yml", ESPERADO_SHA: sha256(novo) });
    expect(out).toContain(MARCA_RESTAURADO);
    expect(readFileSync(path.join(dir, "docker-compose.yml"), "utf8")).toBe(orig);
    rmSync(dir, { recursive: true, force: true });
  });

  it("o script de produção não interpola nada de fora (constante, sem ${ do JS)", () => {
    expect(SCRIPT_GRAVAR).not.toMatch(/\$\{/);
    expect(SCRIPT_GRAVAR).toContain("D=/stackdir");
  });
});

// localizarDiretorioDaStack / gravarComposeEmDisco com o Portainer simulado.
import { beforeEach, vi } from "vitest";

const p = vi.hoisted(() => ({
  getServiceExact: vi.fn(),
  getVolumeMountpoint: vi.fn(),
  listServiceTasks: vi.fn(),
  imageExistsLocally: vi.fn(),
  pullImage: vi.fn(),
  runOneShotJob: vi.fn(),
}));
vi.mock("./portainer", () => ({ ...p }));

describe("localizarDiretorioDaStack / gravarComposeEmDisco", () => {
  beforeEach(() => {
    Object.values(p).forEach((f) => f.mockReset());
    p.getServiceExact.mockResolvedValue({
      ID: "svc",
      Spec: { TaskTemplate: { ContainerSpec: { Mounts: [{ Type: "volume", Source: "portainer_data", Target: "/data" }] } } },
    });
    p.getVolumeMountpoint.mockResolvedValue("/var/lib/docker/volumes/portainer_data/_data");
    p.listServiceTasks.mockResolvedValue([{ ID: "t", NodeID: "node1", DesiredState: "running", Status: { State: "running" } }]);
    p.imageExistsLocally.mockResolvedValue(true);
  });
  const stack = { Id: 2, ProjectPath: "/data/compose/2", EntryPoint: "docker-compose.yml" };

  it("monta o caminho no host (volume nomeado) e fixa o job no nó do Portainer", async () => {
    const { localizarDiretorioDaStack } = await import("./stack-disco");
    const r = await localizarDiretorioDaStack("t", 1, stack);
    expect(r).toEqual({
      hostDir: "/var/lib/docker/volumes/portainer_data/_data/compose/2",
      arquivo: "docker-compose.yml",
      constraint: "node.id == node1",
    });
  });

  it("bind mount: usa a origem direta", async () => {
    p.getServiceExact.mockResolvedValue({
      ID: "svc",
      Spec: { TaskTemplate: { ContainerSpec: { Mounts: [{ Type: "bind", Source: "/opt/portainer", Target: "/data" }] } } },
    });
    const { localizarDiretorioDaStack } = await import("./stack-disco");
    expect((await localizarDiretorioDaStack("t", 1, stack)).hostDir).toBe("/opt/portainer/compose/2");
    expect(p.getVolumeMountpoint).not.toHaveBeenCalled();
  });

  it.each([
    ["ProjectPath com ..", { ...stack, ProjectPath: "/data/compose/../x" }],
    ["ProjectPath fora de /data/compose", { ...stack, ProjectPath: "/data/other/2" }],
    ["EntryPoint com caminho", { ...stack, EntryPoint: "../x.yml" }],
    ["sem ProjectPath", { Id: 2 }],
  ])("recusa: %s (nada é montado)", async (_n, s) => {
    const { localizarDiretorioDaStack } = await import("./stack-disco");
    await expect(localizarDiretorioDaStack("t", 1, s)).rejects.toMatchObject({ codigo: "caminho_invalido" });
    expect(p.runOneShotJob).not.toHaveBeenCalled();
  });

  it("grava e confere pela API; divergência do CAS vira erro 'divergiu'", async () => {
    const { gravarComposeEmDisco, sha256 } = await import("./stack-disco");
    p.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: "ENCHA_SYNC_OK\r\n", timedOut: false });
    await expect(gravarComposeEmDisco("t", 1, stack, "velho", "novo", async () => "novo")).resolves.toBeUndefined();
    const spec = p.runOneShotJob.mock.calls[0][2];
    expect(spec.constraints).toEqual(["node.id == node1"]);
    expect(spec.spec.HostConfig.Binds).toEqual(["/var/lib/docker/volumes/portainer_data/_data/compose/2:/stackdir"]);
    expect(spec.spec.Env).toContain(`ESPERADO_SHA=${sha256("velho")}`);
    expect(spec.spec.Env).toContain(`NOVO_SHA=${sha256("novo")}`);
    p.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: "ENCHA_SYNC_DIVERGIU", timedOut: false });
    await expect(gravarComposeEmDisco("t", 1, stack, "velho", "novo", async () => "novo")).rejects.toMatchObject({ codigo: "divergiu" });
  });

  it("o Portainer não enxerga o que gravamos: restaura e falha fechado", async () => {
    const { gravarComposeEmDisco } = await import("./stack-disco");
    p.runOneShotJob.mockResolvedValue({ exitCode: 0, logs: "ENCHA_SYNC_OK", timedOut: false });
    await expect(gravarComposeEmDisco("t", 1, stack, "velho", "novo", async () => "outra coisa")).rejects.toMatchObject({ codigo: "verificacao_falhou" });
    expect(p.runOneShotJob).toHaveBeenCalledTimes(2); // gravar + restaurar
    expect(p.runOneShotJob.mock.calls[1][2].spec.Cmd[0]).toContain("enchat-pre-sync");
  });

  it("job com timeout ou exit != 0: job_falhou", async () => {
    const { gravarComposeEmDisco } = await import("./stack-disco");
    p.runOneShotJob.mockResolvedValue({ exitCode: 1, logs: "", timedOut: false });
    await expect(gravarComposeEmDisco("t", 1, stack, "a", "b", async () => "b")).rejects.toMatchObject({ codigo: "job_falhou" });
  });
});
