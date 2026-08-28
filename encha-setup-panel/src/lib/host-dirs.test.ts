import { describe, expect, it } from "vitest";
import { ALLOWED_DIR_RE, ALLOWED_OWNER_RE } from "./host-dirs";
import { ALL_STACKS } from "./stacks/registry";

describe("ALLOWED_DIR_RE", () => {
  it("aceita diretórios sob /var/enchat/<slug>", () => {
    expect(ALLOWED_DIR_RE.test("/var/enchat/media")).toBe(true);
    expect(ALLOWED_DIR_RE.test("/var/enchat/postgres")).toBe(true);
    expect(ALLOWED_DIR_RE.test("/var/enchat/tracker-postgres")).toBe(true);
  });

  it("recusa qualquer coisa fora de /var/enchat/", () => {
    expect(ALLOWED_DIR_RE.test("/var/tracker/postgres")).toBe(false);
    expect(ALLOWED_DIR_RE.test("/var/enchat")).toBe(false); // sem o slug depois
    expect(ALLOWED_DIR_RE.test("/etc/passwd")).toBe(false);
  });

  it("recusa tentativas de path traversal", () => {
    expect(ALLOWED_DIR_RE.test("/var/enchat/../etc")).toBe(false);
    expect(ALLOWED_DIR_RE.test("/var/enchat/../../etc/passwd")).toBe(false);
    expect(ALLOWED_DIR_RE.test("/var/enchat/tracker/../../../etc")).toBe(false);
  });

  it("recusa maiúsculas e caminho com barra final", () => {
    expect(ALLOWED_DIR_RE.test("/var/enchat/Tracker")).toBe(false);
    expect(ALLOWED_DIR_RE.test("/var/enchat/tracker/")).toBe(false);
  });
});

describe("ALLOWED_OWNER_RE", () => {
  it("aceita usuario:grupo alfanumérico", () => {
    expect(ALLOWED_OWNER_RE.test("1000:1000")).toBe(true);
    expect(ALLOWED_OWNER_RE.test("tracker:tracker")).toBe(true);
  });

  it("recusa qualquer coisa que não seja usuario:grupo simples", () => {
    expect(ALLOWED_OWNER_RE.test("1000")).toBe(false);
    expect(ALLOWED_OWNER_RE.test("1000:1000; rm -rf /")).toBe(false);
    expect(ALLOWED_OWNER_RE.test("")).toBe(false);
  });
});

// Prova, contra o REGISTRO REAL de stacks (não uma cópia), que toda stack
// declarada hoje respeita a regex — inclui a encha-tracker deste ciclo.
describe("hostDirs de todas as stacks batem com ALLOWED_DIR_RE", () => {
  for (const stack of ALL_STACKS) {
    if (!stack.hostDirs || stack.hostDirs.length === 0) continue;
    it(`${stack.id}`, () => {
      for (const spec of stack.hostDirs!) {
        const path = typeof spec === "string" ? spec : spec.path;
        expect(ALLOWED_DIR_RE.test(path)).toBe(true);
        if (typeof spec !== "string" && spec.owner) {
          expect(ALLOWED_OWNER_RE.test(spec.owner)).toBe(true);
        }
      }
    });
  }
});
