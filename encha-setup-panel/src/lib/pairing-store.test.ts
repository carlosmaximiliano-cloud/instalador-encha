import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// getDb() (db.ts) guarda um singleton em memória de módulo — precisa de um
// DB_PATH isolado por teste, definido ANTES do primeiro import que toca o
// banco, e um resetModules para o singleton não vazar entre testes.
let dbDir: string;

beforeEach(async () => {
  vi.resetModules();
  dbDir = mkdtempSync(path.join(tmpdir(), "encha-setup-pairing-test-"));
  process.env.DB_PATH = path.join(dbDir, "panel.db");
});

afterEach(() => {
  rmSync(dbDir, { recursive: true, force: true });
  delete process.env.DB_PATH;
});

// Fingerprint golden vector cruzado — 0123...cdef + encha-tracker ->
// 58132042721689d3e6fb25654444e5b7 (mesmo vetor de enchat-fingerprint.test.ts
// e internal/licenca/testdata/vetor_fingerprint.json, repo Encha Tracker).

describe("getOrCreateMachineId — mutação M1/M4 do contrato (Ciclo 20)", () => {
  it("cunha um machineId novo e o fingerprint usa o HOSTNAME PASSADO, não o default", async () => {
    const { getOrCreateMachineId } = await import("./pairing-store");
    const { fingerprintEnchat } = await import("./enchat-fingerprint");

    const r = getOrCreateMachineId("stack-teste-tracker", "encha-tracker");

    expect(r.legacy).toBe(false);
    expect(r.machineId).toMatch(/^[0-9a-f]{32}$/);
    // A prova central: o fingerprint devolvido tem que bater com
    // fingerprintEnchat(machineId, "encha-tracker") — se o hostname
    // passado for ignorado internamente (mutação M1/M4), o fingerprint
    // real seria calculado com o default "enchat-app" e este teste falha.
    expect(r.fingerprint).toBe(fingerprintEnchat(r.machineId, "encha-tracker"));
    // E, por construção, tem que DIVERGIR do que o default produziria —
    // prova que os dois hostnames realmente levam a valores diferentes.
    expect(r.fingerprint).not.toBe(fingerprintEnchat(r.machineId));
  });

  it("é idempotente por stackId — a segunda chamada devolve EXATAMENTE o mesmo machineId/fingerprint, mesmo passando um hostname diferente", async () => {
    const { getOrCreateMachineId } = await import("./pairing-store");

    const primeira = getOrCreateMachineId("stack-idempotente", "encha-tracker");
    // Um hostname diferente na segunda chamada NÃO pode recalcular — a
    // linha já existe em stack_machine_ids, e recalcular divergiria do
    // fingerprint que uma sessão de pareamento anterior já vinculou no
    // Console.
    const segunda = getOrCreateMachineId("stack-idempotente", "outro-hostname-qualquer");

    expect(segunda.machineId).toBe(primeira.machineId);
    expect(segunda.fingerprint).toBe(primeira.fingerprint);
    expect(segunda.legacy).toBe(false);
  });

  it("stacks diferentes recebem machineIds diferentes", async () => {
    const { getOrCreateMachineId } = await import("./pairing-store");

    const a = getOrCreateMachineId("stack-a", "encha-tracker");
    const b = getOrCreateMachineId("stack-b", "encha-tracker");

    expect(a.machineId).not.toBe(b.machineId);
  });

  it("instalação legada (stack_secrets sem stack_machine_ids) usa hostname no fingerprint do vazio, não cunha machineId novo", async () => {
    const { getOrCreateMachineId } = await import("./pairing-store");
    const { fingerprintEnchat } = await import("./enchat-fingerprint");
    const { getDb } = await import("./db");

    const db = getDb();
    db.prepare(
      "INSERT INTO stack_secrets (stack_name, encrypted_envs, created_at, updated_at) VALUES (?, ?, ?, ?)"
    ).run("stack-legada", "{}", Date.now(), Date.now());

    const r = getOrCreateMachineId("stack-legada", "encha-tracker");

    expect(r.legacy).toBe(true);
    expect(r.machineId).toBe("");
    expect(r.fingerprint).toBe(fingerprintEnchat("", "encha-tracker"));
  });
});
