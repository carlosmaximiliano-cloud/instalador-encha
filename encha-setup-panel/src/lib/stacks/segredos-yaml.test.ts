import { describe, expect, it, vi } from "vitest";
import {
  blocoMontagensSegredos,
  blocoSegredosTopo,
  exigeVersaoSegredos,
  linhaEnvArquivo,
  nomeSegredoVersionado,
} from "./segredos-yaml";
import type { SwarmContext } from "./types";

vi.setConfig({ testTimeout: 30_000 });

describe("segredos-yaml — blocos puros de YAML", () => {
  it("SY1: linhaEnvArquivo: seis espaços, _FILE e /run/secrets/<base> entre aspas", () => {
    expect(linhaEnvArquivo("TRACKER_ADMIN_SENHA", "encha_tracker_senha_admin")).toBe(
      '      TRACKER_ADMIN_SENHA_FILE: "/run/secrets/encha_tracker_senha_admin"'
    );
  });

  it("SY2: blocoMontagensSegredos: source = target = base, uid/gid entre aspas, mode 0400, na ordem recebida", () => {
    const out = blocoMontagensSegredos([
      { base: "b_um", uid: "1000", gid: "1000" },
      { base: "b_dois", uid: "0", gid: "0" },
    ]);
    expect(out).toBe(
      "    secrets:\n" +
        '      - source: b_um\n        target: b_um\n        uid: "1000"\n        gid: "1000"\n        mode: 0400\n' +
        '      - source: b_dois\n        target: b_dois\n        uid: "0"\n        gid: "0"\n        mode: 0400\n'
    );
  });

  it("SY3: blocoSegredosTopo: linha em branco antes, external: true, nome versionado, sem reordenar", () => {
    const out = blocoSegredosTopo([
      { base: "z_b", nome: "z_b_1" },
      { base: "a_b", nome: "a_b_1" },
    ]);
    expect(out).toBe(
      "\nsecrets:\n  z_b:\n    external: true\n    name: z_b_1\n  a_b:\n    external: true\n    name: a_b_1\n"
    );
  });

  it("SY4: nomeSegredoVersionado junta base e época com _", () => {
    expect(nomeSegredoVersionado("encha_tracker_senha_admin", "1758900000")).toBe(
      "encha_tracker_senha_admin_1758900000"
    );
  });

  it("SY5: exigeVersaoSegredos: só dígitos (1 a 20); o resto lança citando versaoSegredos", () => {
    const base: SwarmContext = { networkName: "r", serverName: "s", email: "" };
    expect(exigeVersaoSegredos({ ...base, versaoSegredos: "1758900000" })).toBe("1758900000");
    for (const v of [undefined, "", "abc", "1.2", " 1758900000", "1".repeat(21)]) {
      expect(() => exigeVersaoSegredos({ ...base, versaoSegredos: v })).toThrow(/versaoSegredos/);
    }
  });
});

describe("segredos-yaml — SN1: prefixo de stack (registry inteiro)", () => {
  it("toda stack com dockerSecrets: bases só com o prefixo da própria stack no Swarm, e nenhuma se repete", async () => {
    const { ALL_STACKS } = await import("./registry");
    const { expectedStackNames } = await import("./types");

    const sentinelas = {
      enchat_master_key: "SENT-master-key",
      postgres_password: "SENT-postgres-pw",
      pinfy_master_key: "SENT-pinfy-master",
      pinfy_webhook_token: "SENT-pinfy-webhook",
      pinfy_panel_password: "SENT-pinfy-panel",
      pinfy_db_password: "SENT-pinfy-dbpw",
      pinfy_session_key: "SENT-pinfy-session",
      updater_token: "SENT-updater-token",
      enchat_setup_token: "SENT-setup-token",
    };

    const ABERTOS: Record<string, { values: Record<string, unknown>; secrets: Record<string, string>; ctx: SwarmContext }> = {
      enchat: {
        values: { url_enchat: "crm.exemplo.com", chave_licenca: "SENT-chave-licenca" },
        secrets: sentinelas,
        ctx: {
          networkName: "rede_traefik",
          serverName: "vps-teste",
          email: "operador@exemplo.com",
          release: { version: "0.4.3", imageRepo: "ghcr.io/enchainterno/enchat-free", imageTag: "0.4.3", obrigatoria: false },
          imagensSuportamSegredos: true,
          versaoSegredos: "1758900000",
        },
      },
      "encha-tracker": {
        values: {
          dominio_tracker: "tracker.exemplo.com",
          email_ativacao: "cliente@exemplo.com",
          senha_admin: "SenhaForte#123",
        },
        secrets: {
          tracker_master_key: "SENT-tracker-master-key",
          postgres_password: "SENT-tracker-postgres-pw",
          updater_token: "SENT-tracker-updater-token",
        },
        ctx: {
          networkName: "rede_traefik",
          serverName: "vps-teste",
          email: "operador@exemplo.com",
          release: { version: "1.2.1", imageRepo: "ghcr.io/cheiodecoisa/encha-tracker", imageTag: "1.2.1", obrigatoria: false },
          versaoSegredos: "1758900000",
        },
      },
    };

    expect(
      ALL_STACKS.filter((d) => d.dockerSecrets)
        .map((d) => d.id)
        .sort()
    ).toEqual(Object.keys(ABERTOS).sort());

    const todasBases = new Map<string, string>();
    const prefixos: string[] = [];

    for (const def of ALL_STACKS.filter((d) => d.dockerSecrets)) {
      const { values, secrets, ctx } = ABERTOS[def.id];
      const specs = def.dockerSecrets!(values, secrets, ctx);
      expect(specs.length).toBeGreaterThan(0);
      const prefixo = `${expectedStackNames(def)[0]}_`;
      prefixos.push(prefixo);
      for (const s of specs) {
        expect(s.base.startsWith(prefixo)).toBe(true);
        expect(s.name).toBe(`${s.base}_1758900000`);
        expect(todasBases.has(s.base)).toBe(false);
        todasBases.set(s.base, def.id);
      }
    }

    for (const a of prefixos) {
      for (const b of prefixos) {
        if (a === b) continue;
        expect(b.startsWith(a)).toBe(false);
      }
    }
  });
});
