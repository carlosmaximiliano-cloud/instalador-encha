import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Orquestração dos segredos do Docker (S4): as guardas de limparSegredosAntigos
// isoladas. O fluxo ponta a ponta com um Swarm falso é installer-segredos.test.ts;
// aqui ficam os ramos que ele não alcança (prova de "spec novo aplicado",
// falhas de leitura, best-effort).

const NOVO = ["enchat_a_2", "enchat_b_2"];

function svc(atuais: string[], anteriores: string[] = []) {
  return {
    ID: "s",
    Version: { Index: 1 },
    Spec: { TaskTemplate: { ContainerSpec: { Secrets: atuais.map((n) => ({ SecretName: n })) } } },
    PreviousSpec: { TaskTemplate: { ContainerSpec: { Secrets: anteriores.map((n) => ({ SecretName: n })) } } },
  };
}
const sec = (nome: string) => ({ ID: `id-${nome}`, Spec: { Name: nome, Labels: { "com.encha.segredo-stack": "enchat" } } });

async function carregar(mocks: {
  servicos?: () => Promise<unknown[]>;
  segredos?: () => Promise<unknown[]>;
  remover?: (id: string) => Promise<void>;
  criar?: (a: { name: string; value: string; labels?: Record<string, string> }) => Promise<{ ID: string }>;
}) {
  const remover = vi.fn(mocks.remover ?? (async () => undefined));
  const criar = vi.fn(mocks.criar ?? (async () => ({ ID: "x" })));
  vi.doMock("./portainer", async (io) => {
    const actual = await io<typeof import("./portainer")>();
    return {
      ...actual,
      listStackServices: vi.fn(mocks.servicos ?? (async () => [])),
      listDockerSecrets: vi.fn(mocks.segredos ?? (async () => [])),
      removeDockerSecret: (_t: string, _e: number, id: string) => remover(id),
      createDockerSecret: (_t: string, _e: number, a: { name: string; value: string; labels?: Record<string, string> }) => criar(a),
    };
  });
  const mod = await import("./docker-secrets");
  return { ...mod, remover, criar };
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.doUnmock("./portainer"));

describe("limparSegredosAntigos", () => {
  it("remove só o que não é da versão mantida nem referenciado por nenhum serviço (Spec ou PreviousSpec)", async () => {
    const { limparSegredosAntigos, remover } = await carregar({
      servicos: async () => [svc(["enchat_a_2"], ["enchat_a_1"]), svc(["enchat_b_2"])],
      segredos: async () => ["enchat_a_1", "enchat_a_2", "enchat_b_2", "enchat_b_1", "enchat_c_0"].map(sec),
    });
    const r = await limparSegredosAntigos("t", 1, "enchat", NOVO);
    expect(r.removidos.sort()).toEqual(["enchat_b_1", "enchat_c_0"]);
    expect(remover).not.toHaveBeenCalledWith("id-enchat_a_1"); // alvo do rollback
    expect(remover).not.toHaveBeenCalledWith("id-enchat_a_2");
    expect(remover).not.toHaveBeenCalledWith("id-enchat_b_2");
  });

  it("consulta só os segredos DESTA stack (label com.encha.segredo-stack)", async () => {
    const listar = vi.fn(async () => []);
    vi.doMock("./portainer", async (io) => ({
      ...(await io<typeof import("./portainer")>()),
      listStackServices: vi.fn(async () => [svc(["enchat_a_2"])]),
      listDockerSecrets: listar,
    }));
    const { limparSegredosAntigos } = await import("./docker-secrets");
    await limparSegredosAntigos("t", 1, "enchat", NOVO);
    expect(listar).toHaveBeenCalledWith("t", 1, ["com.encha.segredo-stack=enchat"]);
  });

  it("sem prova de que o deploy novo foi aplicado (nenhum serviço referencia a versão mantida) não remove NADA", async () => {
    const { limparSegredosAntigos, remover } = await carregar({
      servicos: async () => [svc(["enchat_a_1"])], // ainda no spec antigo
      segredos: async () => ["enchat_a_1", "enchat_a_0", "enchat_a_2"].map(sec),
    });
    const r = await limparSegredosAntigos("t", 1, "enchat", NOVO);
    expect(r).toEqual({ removidos: [], motivoPulo: "spec_novo_nao_aplicado" });
    expect(remover).not.toHaveBeenCalled();
  });

  it("stack sem nenhum serviço não remove nada", async () => {
    const { limparSegredosAntigos, remover } = await carregar({
      servicos: async () => [],
      segredos: async () => ["enchat_a_0"].map(sec),
    });
    expect(await limparSegredosAntigos("t", 1, "enchat", NOVO)).toEqual({ removidos: [], motivoPulo: "sem_servicos" });
    expect(remover).not.toHaveBeenCalled();
  });

  it("nunca lança: falha ao listar serviços/segredos vira 'nada removido'", async () => {
    const a = await carregar({
      servicos: async () => {
        throw new Error("portainer fora");
      },
    });
    expect(await a.limparSegredosAntigos("t", 1, "enchat", NOVO)).toEqual({ removidos: [], motivoPulo: "falha_ao_ler" });
    expect(a.remover).not.toHaveBeenCalled();

    vi.resetModules();
    const b = await carregar({
      servicos: async () => [svc(["enchat_a_2"])],
      segredos: async () => {
        throw new Error("boom");
      },
    });
    expect(await b.limparSegredosAntigos("t", 1, "enchat", NOVO)).toEqual({ removidos: [], motivoPulo: "falha_ao_ler" });
  });

  it("um segredo que o daemon recusa remover não derruba a limpeza dos demais", async () => {
    const { limparSegredosAntigos, remover } = await carregar({
      servicos: async () => [svc(["enchat_a_2"])],
      segredos: async () => ["enchat_a_2", "enchat_x_1", "enchat_y_1"].map(sec),
      remover: async (id) => {
        if (id === "id-enchat_x_1") throw new Error("in use");
      },
    });
    const r = await limparSegredosAntigos("t", 1, "enchat", NOVO);
    expect(r.removidos).toEqual(["enchat_y_1"]);
    expect(remover).toHaveBeenCalledTimes(2);
  });
});

describe("criarSegredosVersionados", () => {
  it("cria na ordem dada, com os labels da stack e da base, e o valor cru vai só no `value`", async () => {
    const { criarSegredosVersionados, criar } = await carregar({});
    await criarSegredosVersionados("t", 1, "enchat", [
      { base: "enchat_a", name: "enchat_a_2", value: "va" },
      { base: "enchat_b", name: "enchat_b_2", value: "vb" },
    ]);
    expect(criar.mock.calls.map((c) => c[0])).toEqual([
      { name: "enchat_a_2", value: "va", labels: { "com.encha.segredo-stack": "enchat", "com.encha.segredo-base": "enchat_a" } },
      { name: "enchat_b_2", value: "vb", labels: { "com.encha.segredo-stack": "enchat", "com.encha.segredo-base": "enchat_b" } },
    ]);
  });

  it("a primeira falha interrompe (lança) — os seguintes não são criados", async () => {
    const { criarSegredosVersionados, criar } = await carregar({
      criar: async (a) => {
        if (a.name === "enchat_a_2") throw new Error("falhou");
        return { ID: "x" };
      },
    });
    await expect(
      criarSegredosVersionados("t", 1, "enchat", [
        { base: "enchat_a", name: "enchat_a_2", value: "va" },
        { base: "enchat_b", name: "enchat_b_2", value: "vb" },
      ])
    ).rejects.toThrow("falhou");
    expect(criar).toHaveBeenCalledTimes(1);
  });
});
