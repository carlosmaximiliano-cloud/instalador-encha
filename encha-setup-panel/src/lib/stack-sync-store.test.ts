import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

let tmp: string;
beforeEach(() => {
  vi.resetModules();
  tmp = mkdtempSync(path.join(tmpdir(), "encha-sync-store-"));
  process.env.DB_PATH = path.join(tmp, "panel.db");
  process.env.MASTER_KEY_PATH = path.join(tmp, "master.key");
});
afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
  delete process.env.DB_PATH;
  delete process.env.MASTER_KEY_PATH;
});

describe("stack-sync-store", () => {
  it("lease: um dono por vez, expira e o mesmo dono renova", async () => {
    const s = await import("./stack-sync-store");
    expect(s.tentarLease("enchat", "A", 1000, 100)).toBe(true);
    expect(s.tentarLease("enchat", "B", 1000, 500)).toBe(false); // A ainda vale
    expect(s.tentarLease("enchat", "A", 1000, 600)).toBe(true); // A renova
    expect(s.tentarLease("enchat", "B", 1000, 1500)).toBe(false); // A renovou até 1600
    expect(s.tentarLease("enchat", "B", 1000, 1700)).toBe(true); // 1700 > 1600: livre
  });

  it("lease expirado passa para outro dono", async () => {
    const s = await import("./stack-sync-store");
    expect(s.tentarLease("enchat", "A", 1000, 100)).toBe(true);
    expect(s.tentarLease("enchat", "B", 1000, 1200)).toBe(true);
  });

  it("liberar só vale para o dono", async () => {
    const s = await import("./stack-sync-store");
    s.tentarLease("enchat", "A", 10_000, 100);
    s.liberarLease("enchat", "B");
    expect(s.tentarLease("enchat", "B", 1000, 200)).toBe(false);
    s.liberarLease("enchat", "A");
    expect(s.tentarLease("enchat", "B", 1000, 200)).toBe(true);
  });

  it("falhas: backoff crescente e desliga o auto na 3ª", async () => {
    const s = await import("./stack-sync-store");
    s.registrarResultado("enchat", "falhou", "x", { agora: 1000 });
    expect(s.podeTentarAuto("enchat", 1000).pode).toBe(false);
    expect(s.podeTentarAuto("enchat", 1000 + 5 * 60_000 + 1).pode).toBe(true);
    s.registrarResultado("enchat", "falhou", "x", { agora: 2000 });
    expect(s.lerEstadoSync("enchat").nextAttemptAt).toBe(2000 + 15 * 60_000);
    s.registrarResultado("enchat", "falhou", "x", { agora: 3000 });
    const e = s.lerEstadoSync("enchat");
    expect(e.autoDisabledReason).toBe("falhas_consecutivas");
    expect(s.podeTentarAuto("enchat", 10 ** 12).pode).toBe(false);
    s.religarAuto("enchat");
    expect(s.podeTentarAuto("enchat", 10 ** 12).pode).toBe(true);
  });

  it("sucesso zera tentativas e grava o high-water", async () => {
    const s = await import("./stack-sync-store");
    s.registrarResultado("enchat", "falhou", "x", { agora: 1000 });
    s.registrarResultado("enchat", "aplicada", null, { highWater: { app: "0.4.7" }, agora: 2000 });
    const e = s.lerEstadoSync("enchat");
    expect(e.attempts).toBe(0);
    expect(e.nextAttemptAt).toBe(0);
    expect(e.highWater).toEqual({ app: "0.4.7" });
  });

  it("dois processos: o segundo não pega o lease do primeiro (mesmo arquivo SQLite)", async () => {
    const s = await import("./stack-sync-store");
    expect(s.tentarLease("enchat", "proc-1", 60_000)).toBe(true);
    // Outro processo = outra conexão ao mesmo arquivo.
    const Database = (await import("better-sqlite3")).default;
    const outro = new Database(process.env.DB_PATH!);
    outro.pragma("busy_timeout = 3000");
    const r = outro.prepare("SELECT lease_owner FROM stack_sync WHERE stack_id='enchat'").get() as { lease_owner: string };
    expect(r.lease_owner).toBe("proc-1");
    outro.close();
    expect(s.tentarLease("enchat", "proc-2", 60_000)).toBe(false);
  });
});
