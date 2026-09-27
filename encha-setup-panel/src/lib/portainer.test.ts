import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// C3 (M3): authenticateService() (privada) resolve PORTAINER_PASSWORD via
// lerSegredo em vez da lógica ad-hoc que só olhava PORTAINER_PASSWORD_FILE
// (sem cair para a env quando os dois estavam definidos). Exercitado através
// de getServiceToken(), a única porta de entrada pública — mocka o `fetch`
// do undici para nunca bater numa rede real e captura o corpo enviado a
// POST /api/auth pra confirmar QUAL senha foi usada.

const ENV_KEYS = ["PORTAINER_USER", "PORTAINER_PASSWORD", "PORTAINER_PASSWORD_FILE"] as const;

describe("authenticateService / getServiceToken (credencial de serviço do Portainer)", () => {
  let dir: string;

  beforeEach(() => {
    vi.resetModules();
    dir = mkdtempSync(join(tmpdir(), "portainer-service-cred-"));
  });

  afterEach(() => {
    for (const k of ENV_KEYS) delete process.env[k];
    rmSync(dir, { recursive: true, force: true });
    vi.doUnmock("undici");
  });

  function arquivoCom(conteudo: string): string {
    const caminho = join(dir, "senha");
    writeFileSync(caminho, conteudo);
    return caminho;
  }

  function mockAuthFetch() {
    const fetchMock = vi.fn(async (_url: string, init: { body?: string }) => {
      return new Response(JSON.stringify({ jwt: "cabecalho.corpo.assinatura" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    return fetchMock;
  }

  async function carregarPortainerComFetch(fetchMock: ReturnType<typeof mockAuthFetch>) {
    vi.doMock("undici", async (importOriginal) => {
      const actual = await importOriginal<typeof import("undici")>();
      return { ...actual, fetch: fetchMock };
    });
    return import("./portainer");
  }

  // Não é o RED do 503: a lógica antiga de authenticateService já lia o
  // _FILE sozinho (o 503 vinha de hasServiceCredentials, coberto em
  // auth/local-admin.test.ts). Este caso fixa que a troca pelo lerSegredo
  // não perdeu o suporte que já existia. Os que falham contra o código
  // anterior são "env direta vence" (o antigo dava prioridade ao _FILE) e
  // "arquivo inexistente" (o antigo vazava o ENOENT cru em vez do 503).
  it("PORTAINER_PASSWORD_FILE sozinho (sem env direta) autentica com sucesso", async () => {
    process.env.PORTAINER_USER = "svc";
    process.env.PORTAINER_PASSWORD_FILE = arquivoCom("senha-do-arquivo\n");

    const fetchMock = mockAuthFetch();
    const { getServiceToken } = await carregarPortainerComFetch(fetchMock);

    const jwt = await getServiceToken();
    expect(jwt).toBe("cabecalho.corpo.assinatura");

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse((init as { body: string }).body)).toEqual({
      username: "svc",
      password: "senha-do-arquivo",
    });
  });

  it("env direta vence sobre _FILE mesmo com os dois definidos", async () => {
    process.env.PORTAINER_USER = "svc";
    process.env.PORTAINER_PASSWORD = "senha-da-env";
    process.env.PORTAINER_PASSWORD_FILE = arquivoCom("senha-do-arquivo");

    const fetchMock = mockAuthFetch();
    const { getServiceToken } = await carregarPortainerComFetch(fetchMock);

    await getServiceToken();
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse((init as { body: string }).body).password).toBe("senha-da-env");
  });

  it("sem env e com _FILE apontando para arquivo inexistente: 503 claro, nunca lança erro cru de fs", async () => {
    process.env.PORTAINER_USER = "svc";
    process.env.PORTAINER_PASSWORD_FILE = join(dir, "nao-existe");

    const fetchMock = mockAuthFetch();
    const { getServiceToken } = await carregarPortainerComFetch(fetchMock);

    await expect(getServiceToken()).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sem PORTAINER_USER: 503, mesmo com senha resolvível", async () => {
    process.env.PORTAINER_PASSWORD = "senha-da-env";

    const fetchMock = mockAuthFetch();
    const { getServiceToken } = await carregarPortainerComFetch(fetchMock);

    await expect(getServiceToken()).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// getServiceExact (C5): mesma busca de getServiceByName, mas sem o fallback
// `?? services[0]`. O caso central aqui é o que prova a correção do bug —
// buscar "encha-guard" quando só existe "encha-guard-teste" (nome PARECIDO,
// casado pelo filtro de prefixo do Docker) precisa devolver null, nunca o
// serviço parecido.

type ServicoFake = { ID: string; Version: { Index: number }; Spec: { Name: string } };

function servicoFake(name: string, id = `id-${name}`, versionIndex = 1): ServicoFake {
  return { ID: id, Version: { Index: versionIndex }, Spec: { Name: name } };
}

function mockJsonFetch(respostaPorChamada: () => unknown) {
  return vi.fn(async (_url: string, _init?: { method?: string; body?: string }) => {
    const corpo = respostaPorChamada();
    return new Response(JSON.stringify(corpo), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}

async function carregarPortainerComFetchGenerico(fetchMock: ReturnType<typeof vi.fn>) {
  vi.doMock("undici", async (importOriginal) => {
    const actual = await importOriginal<typeof import("undici")>();
    return { ...actual, fetch: fetchMock };
  });
  return import("./portainer");
}

describe("getServiceExact (C5 — sem o fallback de nome parecido de getServiceByName)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("undici");
  });

  it("serviço com nome EXATO existe → retorna ele", async () => {
    const alvo = servicoFake("encha-guard");
    const fetchMock = mockJsonFetch(() => [alvo]);
    const { getServiceExact } = await carregarPortainerComFetchGenerico(fetchMock);

    const resultado = await getServiceExact("token", 1, "encha-guard");
    expect(resultado?.ID).toBe(alvo.ID);
  });

  it("só existe um de nome PARECIDO (encha-guard-teste) → retorna null, nunca o parecido", async () => {
    const parecido = servicoFake("encha-guard-teste");
    // O filtro `name` do Docker é por prefixo — a API real devolveria esse
    // serviço parecido na lista mesmo pedindo "encha-guard" exato.
    const fetchMock = mockJsonFetch(() => [parecido]);
    const { getServiceExact } = await carregarPortainerComFetchGenerico(fetchMock);

    const resultado = await getServiceExact("token", 1, "encha-guard");
    expect(resultado).toBeNull();
  });

  it("lista vazia → null", async () => {
    const fetchMock = mockJsonFetch(() => []);
    const { getServiceExact } = await carregarPortainerComFetchGenerico(fetchMock);

    const resultado = await getServiceExact("token", 1, "encha-guard");
    expect(resultado).toBeNull();
  });

  it("contraste: getServiceByName cai no serviço parecido (?? services[0]) — o bug que getServiceExact corrige", async () => {
    const parecido = servicoFake("encha-guard-teste");
    const fetchMock = mockJsonFetch(() => [parecido]);
    const { getServiceByName } = await carregarPortainerComFetchGenerico(fetchMock);

    const resultado = await getServiceByName("token", 1, "encha-guard");
    expect(resultado?.Spec.Name).toBe("encha-guard-teste");
  });
});

describe("listNodes", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("undici");
  });

  it("GET .../docker/nodes e devolve a lista tal como veio", async () => {
    const nodes = [
      { ID: "n1", Status: { Addr: "10.0.0.5" } },
      { ID: "n2", Status: { Addr: "10.0.0.6" }, ManagerStatus: { Addr: "10.0.0.6:2377", Leader: true } },
    ];
    const fetchMock = mockJsonFetch(() => nodes);
    const { listNodes } = await carregarPortainerComFetchGenerico(fetchMock);

    const resultado = await listNodes("token", 1);
    expect(resultado).toEqual(nodes);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("/api/endpoints/1/docker/nodes");
  });
});

// Auditoria C6: um serviço criado com `{ Target: "host" }` grava no spec o
// ID da rede `host` PREDEFINIDA DO SWARM (swarmkit, 25 chars), que é outro
// objeto que a rede `host` local (64 hex) — e a listagem
// `GET /networks?filters=...` só devolve a local (o daemon filtra as
// predefinidas do Swarm). Respostas abaixo copiadas da encha-test (Docker
// 27.3.1, API 1.47). O mock responde às DUAS rotas como o Docker real, então
// voltar a resolver pela listagem devolve o ID local e o teste falha.
describe("getHostNetworkId (auditoria C6 — ID da rede host no escopo do Swarm)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("undici");
  });

  const HOST_LOCAL = {
    Name: "host",
    Id: "7e9e1cd77ec77ec21782f2b73913128241dbaf6b58e1205cbb2400f305248e39",
    Scope: "local",
    Driver: "host",
  };
  const HOST_SWARM = {
    Name: "host",
    Id: "kaw3tshz1db9n30614rln6tij",
    Scope: "swarm",
    Driver: "host",
    Labels: { "com.docker.swarm.predefined": "true" },
  };

  function fetchComoDocker(respostaInspect: unknown) {
    return vi.fn(async (url: string) => {
      const corpo = url.includes("/docker/networks?") ? [HOST_LOCAL] : respostaInspect;
      return new Response(JSON.stringify(corpo), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
  }

  it("devolve o ID da rede host do SWARM (o que o spec do serviço guarda), nunca o da rede host local", async () => {
    const fetchMock = fetchComoDocker(HOST_SWARM);
    const { getHostNetworkId } = await carregarPortainerComFetchGenerico(fetchMock);

    expect(await getHostNetworkId("token", 1)).toBe(HOST_SWARM.Id);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("/api/endpoints/1/docker/networks/host?scope=swarm");
  });

  it("resposta que não é a rede host do Swarm (ex.: daemon antigo ignorando scope) -> null", async () => {
    const { getHostNetworkId } = await carregarPortainerComFetchGenerico(fetchComoDocker(HOST_LOCAL));
    expect(await getHostNetworkId("token", 1)).toBeNull();
  });
});

describe("createService / updateService", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("undici");
  });

  const specFake = {
    Name: "encha-guard",
    Mode: { Global: {} as Record<string, never> },
    TaskTemplate: {
      ContainerSpec: { Image: "img@sha256:abc", Command: ["/usr/local/bin/encha-guard"] },
    },
  };

  it("createService: POST em .../docker/services/create com o spec como body", async () => {
    const fetchMock = mockJsonFetch(() => ({ ID: "svc-1" }));
    const { createService } = await carregarPortainerComFetchGenerico(fetchMock);

    const resultado = await createService("token", 1, specFake);
    expect(resultado).toEqual({ ID: "svc-1" });

    const [url, init] = fetchMock.mock.calls[0] as [string, { method: string; body: string }];
    expect(url).toContain("/api/endpoints/1/docker/services/create");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(specFake);
  });

  it("updateService: POST em .../services/{id}/update?version={version} com o spec como body", async () => {
    const fetchMock = mockJsonFetch(() => "");
    const { updateService } = await carregarPortainerComFetchGenerico(fetchMock);

    await updateService("token", 1, "svc-1", 7, specFake);

    const [url, init] = fetchMock.mock.calls[0] as [string, { method: string; body: string }];
    expect(url).toContain("/api/endpoints/1/docker/services/svc-1/update?version=7");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(specFake);
  });
});

// Segredos do Docker via Portainer (S4, achado 2). O valor viaja em base64 no
// campo `Data` (formato do Docker), nunca em claro, nunca em URL e nunca em
// mensagem de erro.
describe("segredos do Docker (createDockerSecret / listDockerSecrets / removeDockerSecret)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("undici");
  });

  it("createDockerSecret: POST .../docker/secrets/create com Name, Labels e Data em base64 (utf8)", async () => {
    const fetchMock = mockJsonFetch(() => ({ ID: "sec-1" }));
    const { createDockerSecret } = await carregarPortainerComFetchGenerico(fetchMock);

    const valor = "senha-com-acento-é-e-ç-123";
    const r = await createDockerSecret("token", 3, {
      name: "enchat_master_key_1758900000",
      value: valor,
      labels: { "com.encha.segredo-stack": "enchat" },
    });
    expect(r).toEqual({ ID: "sec-1" });

    const [url, init] = fetchMock.mock.calls[0] as [string, { method: string; body: string }];
    expect(url).toContain("/api/endpoints/3/docker/secrets/create");
    expect(url).not.toContain(encodeURIComponent(valor));
    expect(init.method).toBe("POST");
    const corpo = JSON.parse(init.body);
    expect(corpo).toEqual({
      Name: "enchat_master_key_1758900000",
      Labels: { "com.encha.segredo-stack": "enchat" },
      Data: Buffer.from(valor, "utf8").toString("base64"),
    });
    // O valor cru não aparece em lugar nenhum do corpo.
    expect(init.body).not.toContain(valor);
  });

  it("createDockerSecret: valor vazio falha antes de chamar o Portainer (o Docker recusa segredo vazio)", async () => {
    const fetchMock = mockJsonFetch(() => ({ ID: "x" }));
    const { createDockerSecret } = await carregarPortainerComFetchGenerico(fetchMock);
    await expect(createDockerSecret("token", 1, { name: "n", value: "" })).rejects.toThrow(/vazio/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("createDockerSecret: erro do Portainer não vaza o valor na mensagem", async () => {
    const valor = "VALOR-SECRETO-NUNCA-NO-ERRO";
    const fetchMock = vi.fn(async () => new Response("name conflicts with an existing object", { status: 409 }));
    const { createDockerSecret, PortainerError } = await carregarPortainerComFetchGenerico(fetchMock);
    const erro = await createDockerSecret("token", 1, { name: "n", value: valor }).catch((e) => e);
    expect(erro).toBeInstanceOf(PortainerError);
    expect(erro.status).toBe(409);
    expect(String(erro.message)).not.toContain(valor);
  });

  it("listDockerSecrets: filtro por label vai no query `filters` do Docker; sem label, sem query", async () => {
    const lista = [{ ID: "a", Spec: { Name: "enchat_master_key_1", Labels: { k: "v" } } }];
    const fetchMock = mockJsonFetch(() => lista);
    const { listDockerSecrets } = await carregarPortainerComFetchGenerico(fetchMock);

    expect(await listDockerSecrets("token", 2, ["com.encha.segredo-stack=enchat"])).toEqual(lista);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("/api/endpoints/2/docker/secrets?filters=");
    expect(JSON.parse(decodeURIComponent(url.split("filters=")[1]))).toEqual({
      label: ["com.encha.segredo-stack=enchat"],
    });

    await listDockerSecrets("token", 2);
    const [url2] = fetchMock.mock.calls[1] as [string];
    expect(url2.endsWith("/docker/secrets")).toBe(true);
  });

  it("removeDockerSecret: DELETE .../docker/secrets/{id}; 404 é ok, outro erro sobe", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    const { removeDockerSecret } = await carregarPortainerComFetchGenerico(fetchMock);
    await removeDockerSecret("token", 4, "sec-9");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, { method: string }];
    expect(url).toContain("/api/endpoints/4/docker/secrets/sec-9");
    expect(init.method).toBe("DELETE");

    vi.resetModules();
    const f404 = vi.fn(async () => new Response("not found", { status: 404 }));
    const m404 = await carregarPortainerComFetchGenerico(f404);
    await expect(m404.removeDockerSecret("token", 4, "x")).resolves.toBeUndefined();

    vi.resetModules();
    const f400 = vi.fn(async () => new Response("secret is in use by service", { status: 400 }));
    const m400 = await carregarPortainerComFetchGenerico(f400);
    await expect(m400.removeDockerSecret("token", 4, "x")).rejects.toMatchObject({ status: 400 });
  });

  it("secretsReferenciadosPorServico: junta o Spec ATUAL e o PreviousSpec (alvo do rollback)", async () => {
    const { secretsReferenciadosPorServico } = await carregarPortainerComFetchGenerico(vi.fn());
    const svc = {
      ID: "s",
      Version: { Index: 1 },
      Spec: {
        TaskTemplate: { ContainerSpec: { Secrets: [{ SecretName: "enchat_a_2" }, {}] } },
      },
      PreviousSpec: { TaskTemplate: { ContainerSpec: { Secrets: [{ SecretName: "enchat_a_1" }] } } },
    };
    expect(secretsReferenciadosPorServico(svc).sort()).toEqual(["enchat_a_1", "enchat_a_2"]);
    expect(secretsReferenciadosPorServico({ ID: "s", Version: { Index: 1 }, Spec: {} })).toEqual([]);
  });

  it("listStackServices: filtra pelo label de namespace da stack", async () => {
    const fetchMock = mockJsonFetch(() => []);
    const { listStackServices } = await carregarPortainerComFetchGenerico(fetchMock);
    await listStackServices("token", 1, "enchat");
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(JSON.parse(decodeURIComponent(url.split("filters=")[1]))).toEqual({
      label: ["com.docker.stack.namespace=enchat"],
    });
  });
});
