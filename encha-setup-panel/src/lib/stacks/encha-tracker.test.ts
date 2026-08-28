import { describe, expect, it } from "vitest";
import { enchaTracker } from "./encha-tracker";
import type { SwarmContext } from "./types";

const valuesValidos = {
  dominio_tracker: "tracker.exemplo.com",
  email_admin: "admin@exemplo.com",
  chave_licenca: "TRACKER-CHAVE-DE-TESTE-12345",
};

const secrets = {
  tracker_master_key: "master-key-fake",
  postgres_password: "postgres-pw-fake",
  admin_senha: "admin-senha-fake",
  updater_token: "updater-token-fake",
};

const ctxBase: SwarmContext = {
  networkName: "rede_traefik",
  serverName: "vps-teste",
  email: "operador@exemplo.com",
  release: { version: "1.2.3", imageRepo: "ghcr.io/conta-tracker/encha-tracker", imageTag: "1.2.3", obrigatoria: false },
  machineId: "0123456789abcdef0123456789abcdef",
  fingerprint: "58132042721689d3e6fb25654444e5b7",
};

describe("encha-tracker — schema", () => {
  it("aceita os valores válidos", () => {
    expect(enchaTracker.schema.safeParse(valuesValidos).success).toBe(true);
  });

  it("recusa sem chave_licenca", () => {
    const { chave_licenca: _omit, ...semChave } = valuesValidos;
    expect(enchaTracker.schema.safeParse(semChave).success).toBe(false);
  });

  it("recusa domínio inválido", () => {
    expect(enchaTracker.schema.safeParse({ ...valuesValidos, dominio_tracker: "não é um domínio" }).success).toBe(false);
  });

  it("recusa e-mail inválido", () => {
    expect(enchaTracker.schema.safeParse({ ...valuesValidos, email_admin: "não é email" }).success).toBe(false);
  });
});

describe("encha-tracker — appHostname (Ciclo 20)", () => {
  it("é 'encha-tracker' — tem que bater com internal/licenca/fingerprint.go (os.Hostname() do container)", () => {
    expect(enchaTracker.appHostname).toBe("encha-tracker");
  });
});

describe("encha-tracker — generateYaml", () => {
  const yaml = enchaTracker.generateYaml(valuesValidos, secrets, ctxBase);

  // M3: hostname do serviço app tem que estar presente e ser exatamente
  // o mesmo valor de appHostname — é o que faz o fingerprint calculado
  // no primeiro boot bater com o que o painel já usou.
  it("o serviço app declara hostname: encha-tracker", () => {
    expect(yaml).toMatch(/hostname:\s*encha-tracker\s*$/m);
  });

  it("TRACKER_MACHINE_ID no YAML é exatamente ctx.machineId", () => {
    expect(yaml).toContain(`TRACKER_MACHINE_ID: "${ctxBase.machineId}"`);
  });

  it("o serviço app usa a imagem/tag resolvidas pelo Console", () => {
    expect(yaml).toContain("image: ghcr.io/conta-tracker/encha-tracker:1.2.3");
  });

  it("o serviço updater usa o repo derivado (.../tracker-updater), mesma tag", () => {
    expect(yaml).toContain("image: ghcr.io/conta-tracker/tracker-updater:1.2.3");
  });

  it("TRACKER_SWARM_SERVICE bate com <stackId com _>_app", () => {
    expect(yaml).toContain('TRACKER_SWARM_SERVICE: "encha_tracker_app"');
  });

  it("lança sem ctx.release", () => {
    expect(() => enchaTracker.generateYaml(valuesValidos, secrets, { ...ctxBase, release: undefined })).toThrow();
  });

  it("sanitiza o domínio contra injeção de YAML/label (aspas, crase, quebra de linha)", () => {
    const malicioso = { ...valuesValidos, dominio_tracker: 'tracker.exemplo.com`\n  malicious: "x"' };
    const y = enchaTracker.generateYaml(malicioso, secrets, ctxBase);
    // A propriedade de segurança é NUNCA introduzir uma linha/chave YAML
    // NOVA a partir do valor do domínio — crase (fora das duas que o
    // template de Host() já usa por padrão), aspas e quebra de linha são
    // exatamente os caracteres que permitiriam isso, e san() os remove.
    // Não testa "zero backtick no YAML inteiro": o template de Host()
    // sempre tem backticks próprios, legítimos, ao redor de ${domain}.
    expect(y).not.toMatch(/\n\s*malicious:/);
    expect(y).not.toContain('"x"\n');
    const linhasComDominio = y.split("\n").filter((l) => l.includes("tracker.exemplo.com"));
    for (const linha of linhasComDominio) {
      expect(linha).not.toContain("`  malicious");
    }
  });
});

describe("encha-tracker — registryAuth.images (mutação M5)", () => {
  it("as duas imagens de pré-pull são da conta do Tracker, nunca do EnchaT", () => {
    const imgs = enchaTracker.registryAuth!.images(valuesValidos, ctxBase.release);
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      expect(img).toMatch(/^ghcr\.io\/conta-tracker\//);
      expect(img).not.toMatch(/enchat-free|enchat-updater|pinfy/);
    }
    expect(imgs).toContain("ghcr.io/conta-tracker/encha-tracker:1.2.3");
    expect(imgs).toContain("ghcr.io/conta-tracker/tracker-updater:1.2.3");
  });

  it("lança sem release resolvida", () => {
    expect(() => enchaTracker.registryAuth!.images(valuesValidos, undefined)).toThrow();
  });

  it("registryAuth.licenseField é 'chave_licenca', e ela está em transientFields", () => {
    expect(enchaTracker.registryAuth!.licenseField).toBe("chave_licenca");
    expect(enchaTracker.transientFields).toContain("chave_licenca");
  });
});

describe("encha-tracker — release (produto/edicao)", () => {
  it("app='tracker', edicao='full' — o Tracker não tem edição grátis", () => {
    expect(enchaTracker.release?.app).toBe("tracker");
    expect(enchaTracker.release?.edicao).toBe("full");
  });
});
