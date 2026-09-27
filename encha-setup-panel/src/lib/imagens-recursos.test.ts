import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

// S4c — leitura dos labels das imagens (com.enchat.recursos). Contrato: só
// devolve `declaram: true` se TODAS as imagens têm o token exato; qualquer
// falha de leitura conta como "não declara" e NUNCA lança.

afterEach(() => {
  vi.doUnmock("./portainer");
  vi.resetModules();
});

async function carregar(inspect: (image: string) => Promise<unknown>) {
  vi.resetModules();
  vi.doMock("./portainer", () => ({ inspectImage: vi.fn(async (_t: string, _e: number, image: string) => inspect(image)) }));
  return import("./imagens-recursos");
}

const comLabel = (v: unknown) => ({ Config: { Labels: { "com.enchat.recursos": v } } });
const IMAGENS = ["r/app:1", "r/upd:1", "r/pinfy:1"];
const entrada = (images = IMAGENS) => ({ token: "t", endpointId: 1, images, label: "com.enchat.recursos", recurso: "segredos-arquivo" });

describe("labelTemToken", () => {
  it("token exato por palavra; substring de outro token não vale", async () => {
    const { labelTemToken } = await carregar(async () => ({}));
    expect(labelTemToken("segredos-arquivo", "segredos-arquivo")).toBe(true);
    expect(labelTemToken("a segredos-arquivo b", "segredos-arquivo")).toBe(true);
    expect(labelTemToken("a\tsegredos-arquivo\nb", "segredos-arquivo")).toBe(true);
    expect(labelTemToken("nao-segredos-arquivo-x", "segredos-arquivo")).toBe(false);
    expect(labelTemToken("segredos-arquivo2", "segredos-arquivo")).toBe(false);
    expect(labelTemToken("x-segredos-arquivo", "segredos-arquivo")).toBe(false);
    expect(labelTemToken("Segredos-Arquivo", "segredos-arquivo")).toBe(false);
    expect(labelTemToken("outro-recurso", "segredos-arquivo")).toBe(false);
    expect(labelTemToken("", "segredos-arquivo")).toBe(false);
    expect(labelTemToken(undefined, "segredos-arquivo")).toBe(false);
    expect(labelTemToken(["segredos-arquivo"], "segredos-arquivo")).toBe(false);
    expect(labelTemToken("segredos-arquivo", "")).toBe(false);
  });
});

// Paridade com a opção 84 (enchat_label_tem_token, secondary.sh): o MESMO
// vetor é lido por tests/test-enchat-segredos.sh — mesma decisão para cada valor.
describe("labelTemToken — vetor de paridade com a opção 84", () => {
  const linhas = readFileSync(path.join(__dirname, "stacks", "label-recursos-vetor.tsv"), "utf8")
    .split("\n")
    .filter((l) => l !== "" && !l.startsWith("#"));
  it("o vetor tem casos dos dois lados", () => {
    expect(linhas.filter((l) => l.startsWith("abre\t")).length).toBeGreaterThan(3);
    expect(linhas.filter((l) => l.startsWith("fecha\t")).length).toBeGreaterThan(10);
  });
  for (const linha of linhas) {
    const [esperado, hex, descricao] = linha.split("\t");
    it(`${esperado}: ${descricao}`, async () => {
      const { labelTemToken } = await carregar(async () => ({}));
      const valor = hex === "-" ? "" : Buffer.from(hex, "hex").toString("utf8");
      expect(labelTemToken(valor, "segredos-arquivo")).toBe(esperado === "abre");
    });
  }
});

describe("imagensDeclaramRecurso", () => {
  it("3 de 3 declaram: true", async () => {
    const { imagensDeclaramRecurso } = await carregar(async () => comLabel("segredos-arquivo"));
    const r = await imagensDeclaramRecurso(entrada());
    expect(r.declaram).toBe(true);
    expect(r.detalhes.map((d) => d.estado)).toEqual(["declara", "declara", "declara"]);
  });

  for (let i = 0; i < 3; i++) {
    it(`só a imagem ${i + 1} sem label: false (2 de 3 não basta)`, async () => {
      const { imagensDeclaramRecurso } = await carregar(async (img) => (img === IMAGENS[i] ? { Config: { Labels: null } } : comLabel("segredos-arquivo")));
      const r = await imagensDeclaramRecurso(entrada());
      expect(r.declaram).toBe(false);
      expect(r.detalhes.filter((d) => d.estado !== "declara")).toEqual([{ image: IMAGENS[i], estado: "sem_label" }]);
    });
  }

  it("erros e formas inesperadas nunca lançam e nunca abrem", async () => {
    const formas: (() => Promise<unknown>)[] = [
      async () => { throw new Error("rede"); },
      async () => { throw Object.assign(new Error("404"), { status: 404 }); },
      async () => "<html/>",
      async () => null,
      async () => 42,
      async () => ({}),
      async () => ({ Config: null }),
      async () => ({ Config: { Labels: [] } }),
      async () => ({ Config: {} }),
      async () => comLabel(undefined),
      async () => comLabel({ x: "segredos-arquivo" }),
    ];
    for (const f of formas) {
      const { imagensDeclaramRecurso } = await carregar(f);
      const r = await imagensDeclaramRecurso(entrada());
      expect(r.declaram).toBe(false);
    }
  });

  it("lista de imagens vazia = fechado (nada a comprovar)", async () => {
    const { imagensDeclaramRecurso } = await carregar(async () => comLabel("segredos-arquivo"));
    expect((await imagensDeclaramRecurso(entrada([]))).declaram).toBe(false);
  });

  it("um label herdado do protótipo (__proto__/constructor) não conta", async () => {
    const { imagensDeclaramRecurso } = await carregar(async () => ({ Config: { Labels: Object.create({ "com.enchat.recursos": "segredos-arquivo" }) } }));
    expect((await imagensDeclaramRecurso(entrada())).declaram).toBe(false);
  });
});

describe("avisoSegredosNaoAtivados", () => {
  it("nomeia cada imagem problemática e não vaza nada além de repo:tag; vazio quando todas declaram", async () => {
    const { avisoSegredosNaoAtivados } = await carregar(async () => ({}));
    expect(avisoSegredosNaoAtivados([{ image: "r/app:1", estado: "declara" }])).toBeUndefined();
    const a = avisoSegredosNaoAtivados([
      { image: "r/app:1", estado: "declara" },
      { image: "r/upd:1", estado: "sem_label" },
      { image: "r/pinfy:1", estado: "erro_leitura" },
    ])!;
    expect(a).toContain("a imagem r/upd:1 ainda não declara suporte");
    expect(a).toContain("não foi possível ler os labels da imagem r/pinfy:1");
    expect(a).not.toContain("r/app:1");
  });
});
