import { describe, expect, it } from "vitest";
import { enchaTracker } from "./encha-tracker";
import type { SwarmContext } from "./types";

const valuesValidos = {
  dominio_tracker: "tracker.exemplo.com",
  email_ativacao: "cliente@exemplo.com",
  senha_admin: "SenhaForte#123",
};

const secrets = {
  tracker_master_key: "master-key-fake",
  postgres_password: "postgres-pw-fake",
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

  // Ciclo D (fechamento da instalação) — chave_licenca deixou de ser
  // pedida ao cliente; email_ativacao é o único campo de licenciamento
  // obrigatório (installer.ts troca o e-mail por uma chave via Console
  // antes de qualquer outra coisa).
  it("recusa sem email_ativacao", () => {
    const { email_ativacao: _omit, ...semEmail } = valuesValidos;
    expect(enchaTracker.schema.safeParse(semEmail).success).toBe(false);
  });

  it("aceita SEM chave_licenca — é opcional (injetada por installer.ts depois da ativação)", () => {
    expect(enchaTracker.schema.safeParse(valuesValidos).success).toBe(true);
    expect("chave_licenca" in valuesValidos).toBe(false);
  });

  it("recusa domínio inválido", () => {
    expect(enchaTracker.schema.safeParse({ ...valuesValidos, dominio_tracker: "não é um domínio" }).success).toBe(false);
  });

  it("recusa e-mail inválido", () => {
    expect(enchaTracker.schema.safeParse({ ...valuesValidos, email_ativacao: "não é email" }).success).toBe(false);
  });
});

describe("encha-tracker — senha_admin (Ciclo 25: escolhida pelo cliente, não mais gerada)", () => {
  it("recusa senha fraca (menos de 12 chars, sem símbolo etc. — mesma régua de strongPassword)", () => {
    expect(enchaTracker.schema.safeParse({ ...valuesValidos, senha_admin: "curta1A!" }).success).toBe(false);
    expect(enchaTracker.schema.safeParse({ ...valuesValidos, senha_admin: "semsimbolobemlongo123" }).success).toBe(false);
  });

  // Mutação M2 (Onda 1) — a mais importante depois da M1: san() no
  // generateYaml REMOVE aspas dupla/crase/quebra de linha em vez de
  // escapar, e não trata barra invertida (caractere de escape dentro de um
  // scalar YAML entre aspas duplas). Sem esta recusa no schema, o cliente
  // digitaria uma senha e o container subiria com OUTRA, silenciosamente.
  it.each(['Senha"Forte#123', "Senha`Forte#123", "Senha\\Forte#123", "Senha\nForte#123", "Senha\rForte#123"])(
    "recusa senha contendo caractere perigoso para o YAML: %j",
    (senhaPerigosa) => {
      expect(enchaTracker.schema.safeParse({ ...valuesValidos, senha_admin: senhaPerigosa }).success).toBe(false);
    }
  );

  it("aceita senha forte sem caracteres perigosos", () => {
    expect(enchaTracker.schema.safeParse({ ...valuesValidos, senha_admin: "OutraSenha#456" }).success).toBe(true);
  });
});

describe("encha-tracker — appHostname (Ciclo 20)", () => {
  it("é 'encha-tracker' — tem que bater com internal/licenca/fingerprint.go (os.Hostname() do container)", () => {
    expect(enchaTracker.appHostname).toBe("encha-tracker");
  });
});

// Ciclo 27 — memória do sidecar tracker-updater. installer.ts cria este
// volume via Portainer API antes do deploy (mesmo mecanismo de redis_data
// etc. em outras stacks), preservando estado.json em reinstall.
describe("encha-tracker — externalVolumes (Ciclo 27)", () => {
  it("é exatamente ['encha_tracker_updater_data']", () => {
    expect(enchaTracker.externalVolumes).toEqual(["encha_tracker_updater_data"]);
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

  // Ciclo 25 — o e-mail de login do painel é o MESMO da ativação (decisão
  // do usuário: um e-mail só), e a senha é a que o cliente digitou, não
  // mais um valor de generateSecrets.
  it("TRACKER_ADMIN_EMAIL usa email_ativacao (não existe mais email_admin)", () => {
    expect(yaml).toContain(`TRACKER_ADMIN_EMAIL: "${valuesValidos.email_ativacao}"`);
  });

  it("TRACKER_ADMIN_SENHA usa a senha digitada pelo cliente (values.senha_admin), não secrets", () => {
    expect(yaml).toContain(`TRACKER_ADMIN_SENHA: "${valuesValidos.senha_admin}"`);
    expect(yaml).not.toContain("admin_senha");
  });

  it("lança sem ctx.release", () => {
    expect(() => enchaTracker.generateYaml(valuesValidos, secrets, { ...ctxBase, release: undefined })).toThrow();
  });

  // Ciclo 27 — o Console exige `fingerprint` em /tracker/registry-auth (sem
  // "antes de ativar" como em /tracker/ativar). A única fonte confiável é o
  // painel (ctx.fingerprint, calculado por installer.ts via
  // getOrCreateMachineId), então generateYaml recusa gerar o compose sem
  // ele — mesmo padrão de guarda de ctx.release.
  it("lança sem ctx.fingerprint (undefined)", () => {
    expect(() => enchaTracker.generateYaml(valuesValidos, secrets, { ...ctxBase, fingerprint: undefined })).toThrow();
  });

  // Mutação M5 — generateYaml não pode aceitar fingerprint vazio em
  // silêncio: "" passaria pelo `if (!ctx.fingerprint)` só se a guarda for
  // removida ou trocada por uma checagem mais fraca (ex.: `=== undefined`).
  it("lança sem ctx.fingerprint (string vazia)", () => {
    expect(() => enchaTracker.generateYaml(valuesValidos, secrets, { ...ctxBase, fingerprint: "" })).toThrow();
  });

  // Mutação M1 (a mais importante do ciclo) e M2 — o serviço `updater`
  // precisa carregar TRACKER_FINGERPRINT (pro C28 chamar
  // /tracker/registry-auth) E ter memória persistente (volume /data,
  // declarado external:true no bloco top-level) — sem isso estado.json
  // some no primeiro restart do container.
  it("o serviço updater ganha TRACKER_FINGERPRINT, o volume /data montado, e o bloco top-level volumes é external", () => {
    const yaml = enchaTracker.generateYaml(valuesValidos, secrets, ctxBase);
    expect(yaml).toContain(`TRACKER_FINGERPRINT: "${ctxBase.fingerprint}"`);
    expect(yaml).toContain("- encha_tracker_updater_data:/data");
    expect(yaml).toMatch(/\nvolumes:\n {2}encha_tracker_updater_data:\n {4}external: true\n {4}name: encha_tracker_updater_data\n/);
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

describe("encha-tracker — generateSecrets (Ciclo 25: senha sai daqui)", () => {
  const gerados = enchaTracker.generateSecrets!(valuesValidos);

  it("não gera mais admin_senha — a senha vem do formulário, não é sorteada", () => {
    expect(gerados.find((s) => s.name === "admin_senha")).toBeUndefined();
  });

  // Mutação M4 (Onda 1) — sob a mutação, admin_senha volta a ser gerada e
  // marcada reveal:true, e a tela final volta a despejar DOIS valores
  // crus (a chave mestra e uma senha que o cliente nem escolheu).
  it("exatamente um segredo é revelado ao final, e é a chave mestra", () => {
    const revelados = gerados.filter((s) => s.reveal);
    expect(revelados).toHaveLength(1);
    expect(revelados[0].name).toBe("tracker_master_key");
    expect(revelados[0].label).toBe("Chave mestra");
  });
});

describe("encha-tracker — ativação só por e-mail (Ciclo D, fechamento da instalação)", () => {
  // Mutação M1 (a mais importante do ciclo) — nenhum campo de chave/token
  // pode aparecer no wizard. `fields` é a fonte usada pelo componente do
  // wizard para renderizar inputs — se um campo de licença voltar a
  // aparecer aqui, o cliente volta a ver um token que não tem em mãos.
  it("nenhum campo de fields expõe chave/token de licença", () => {
    for (const f of enchaTracker.fields) {
      expect(f.name).not.toBe("chave_licenca");
      expect(f.label.toLowerCase()).not.toMatch(/chave|token/);
    }
  });

  it("email_ativacao é o único campo de licenciamento visível, do tipo email", () => {
    const campo = enchaTracker.fields.find((f) => f.name === "email_ativacao");
    expect(campo).toBeDefined();
    expect(campo?.kind).toBe("email");
  });

  // Mutação M3 (Onda 1) — decisão do usuário: um e-mail só (compra = login).
  // Sob a mutação (email_admin volta como campo separado), existiriam DOIS
  // campos de e-mail no wizard — exatamente o atrito que a Onda 1 remove.
  it("existe exatamente UM campo de e-mail no wizard — não há mais email_admin separado", () => {
    const camposDeEmail = enchaTracker.fields.filter((f) => f.kind === "email");
    expect(camposDeEmail).toHaveLength(1);
    expect(camposDeEmail[0].name).toBe("email_ativacao");
  });

  it("senha_admin é campo do tipo password, sensível, com helpText de regra de senha", () => {
    const campo = enchaTracker.fields.find((f) => f.name === "senha_admin");
    expect(campo).toBeDefined();
    expect(campo?.kind).toBe("password");
    expect(campo?.sensitive).toBe(true);
    expect(campo?.helpText).toBeTruthy();
  });

  it("chave_licenca está em transientFields — nunca é persistida mesmo se algum dia voltar a ser digitável", () => {
    expect(enchaTracker.transientFields).toContain("chave_licenca");
    expect(enchaTracker.transientFields).toContain("email_ativacao");
  });

  it("emailActivation.sourceField é o campo visível (email_ativacao), targetField é a chave interna (chave_licenca)", () => {
    expect(enchaTracker.emailActivation?.sourceField).toBe("email_ativacao");
    expect(enchaTracker.emailActivation?.targetField).toBe("chave_licenca");
  });
});

describe("encha-tracker — release (produto/edicao)", () => {
  it("app='tracker', edicao='full' — o Tracker não tem edição grátis", () => {
    expect(enchaTracker.release?.app).toBe("tracker");
    expect(enchaTracker.release?.edicao).toBe("full");
  });

  // Mutação M1 (Ciclo C, fechamento da instalação) — a única release do
  // Tracker que o Console conhece hoje é canal=beta (release.yml do
  // Tracker só registra nesse canal). "stable" faria GET /api/version
  // devolver 404 pra sempre — o próprio defeito que motivou este ciclo.
  it("canal='beta' — é a única release que o Console conhece hoje", () => {
    expect(enchaTracker.release?.canal).toBe("beta");
  });

  // O canal de RESOLUÇÃO na instalação (release.canal, acima) é um valor
  // diferente do TRACKER_CANAL que o generateYaml grava no ambiente do
  // container — os dois não se validam entre si em runtime nenhum. Achado
  // ao investigar este ciclo: os dois TRACKER_CANAL (app e sidecar
  // updater) estavam hardcoded "stable" enquanto release.canal já dizia
  // "beta" — a instalação funcionaria, mas o autoupdate depois de
  // instalado nunca acharia uma release nova (mesma consulta
  // GET /api/version?...&canal=..., feita pelo binário Go em produção).
  it("os dois TRACKER_CANAL do YAML (app e updater) batem com release.canal", () => {
    const yaml = enchaTracker.generateYaml(valuesValidos, secrets, ctxBase);
    const ocorrencias = yaml.match(/TRACKER_CANAL: "([^"]*)"/g) ?? [];
    expect(ocorrencias).toHaveLength(2);
    for (const linha of ocorrencias) {
      expect(linha).toBe(`TRACKER_CANAL: "${enchaTracker.release?.canal}"`);
    }
  });
});
