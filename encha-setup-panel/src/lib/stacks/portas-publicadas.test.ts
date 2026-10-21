import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { ALL_STACKS } from "./registry";
import { anythingllm } from "./anythingllm";
import type { StackDefinition, SwarmContext } from "./types";

// Ciclo painel-portas-banco: o Docker fura o UFW, então porta publicada num
// template é porta aberta para a internet. Só as portas da ALLOWLIST (por
// número e protocolo exatos, não por template) podem ser publicadas; qualquer
// outra falha com o id do template e a porta.
const ALLOWLIST: Record<string, string[]> = {
  "traefik-portainer": ["80/tcp", "443/tcp"],
  azuracast: ["2022/tcp", "8005/tcp"],
  rustdesk: ["21115/tcp", "21116/udp", "21118/udp"],
};

// Templates ainda não consertados, com o micro-ciclo que os conserta.
// Vazio ao fim do ciclo.
const PENDENTES: Record<string, string> = {};

const AMOSTRA_POR_TIPO: Record<string, string> = {
  domain: "exemplo.com.br",
  email: "operador@exemplo.com",
  password: "SenhaForte#123abc",
  username: "usuario",
  port: "5",
  slug: "exemplo",
  text: "exemplo",
};

// enchat e encha-tracker derivam o repo do sidecar pelo sufixo da imagem.
const IMAGEM_POR_ID: Record<string, string> = {
  enchat: "ghcr.io/conta/enchat-free",
  "encha-tracker": "ghcr.io/conta/encha-tracker",
};

function ctx(id: string): SwarmContext {
  return {
    networkName: "rede_traefik",
    serverName: "vps-teste",
    email: "operador@exemplo.com",
    release: { version: "1.2.3", imageRepo: IMAGEM_POR_ID[id] ?? "ghcr.io/conta/imagem", imageTag: "1.2.3", obrigatoria: false },
    machineId: "0123456789abcdef0123456789abcdef",
    fingerprint: "58132042721689d3e6fb25654444e5b7",
    versaoSegredos: "1758900000",
  };
}

// Valores dos campos: default, senão uma amostra por tipo. O Qdrant recebe
// o máximo de nós para cobrir a faixa inteira de portas.
function valoresDe(stack: StackDefinition): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const f of stack.fields) {
    if (f.kind === "checkbox") v[f.name] = f.default ?? false;
    else v[f.name] = f.default ?? AMOSTRA_POR_TIPO[f.kind] ?? "exemplo";
  }
  if (stack.id === "qdrant") v.nodes_qdrant = 20;
  return v;
}

function renderiza(stack: StackDefinition, over: Record<string, unknown> = {}): string {
  const bruto = { ...valoresDe(stack), ...over };
  const r = stack.schema.safeParse(bruto);
  const valores = r.success ? (r.data as Record<string, unknown>) : bruto;
  const secrets: Record<string, string> = {};
  for (const s of stack.generateSecrets?.(valores) ?? []) secrets[s.name] = s.value;
  return stack.generateYaml(valores, secrets, ctx(stack.id));
}

// Portas publicadas ("N/proto") por serviço, lidas do YAML parseado: forma curta
// ("A:B", "A:B/udp", "ip:A:B", número puro; lista em bloco, no mesmo recuo da
// chave ou em fluxo) e forma longa (published/protocol).
type Publicada = { servico: string; porta: string };

function curta(item: string | number): string {
  const [semProto, proto = "tcp"] = String(item).split("/");
  const partes = semProto.split(":");
  const pub = partes.length === 1 ? partes[0] : partes[partes.length - 2];
  return `${pub}/${proto}`;
}

function portasDoYaml(yaml: string): Publicada[] {
  const doc = parse(yaml) as { services?: Record<string, { ports?: unknown }> } | null;
  if (!doc?.services) throw new Error("YAML sem bloco services:");
  const out: Publicada[] = [];
  for (const [servico, def] of Object.entries(doc.services)) {
    const ports = def?.ports;
    if (ports == null) continue;
    if (!Array.isArray(ports)) throw new Error(`${servico}: ports não é uma lista`);
    for (const item of ports) {
      if (typeof item === "object" && item !== null) {
        const l = item as { published?: string | number; protocol?: string };
        if (l.published != null) out.push({ servico, porta: `${l.published}/${l.protocol ?? "tcp"}` });
      } else {
        out.push({ servico, porta: curta(item as string | number) });
      }
    }
  }
  return out;
}

// Autotestes dos formatos legais de `ports:` (o detector tem que pegar todos).
const FORMATOS: Record<string, { yaml: string; esperado: string[] }> = {
  curta: {
    yaml: 'services:\n  a:\n    ports:\n      - "3306:3306"\n      - 8080:80/udp\n      - "127.0.0.1:5432:5432"\n',
    esperado: ["3306/tcp", "8080/udp", "5432/tcp"],
  },
  fluxo: {
    yaml: 'services:\n  a:\n    ports: ["3306:3306", "27017:27017/tcp"]\n',
    esperado: ["3306/tcp", "27017/tcp"],
  },
  "mesmo-recuo": {
    yaml: 'services:\n  a:\n    ports:\n    - "3306:3306"\n    environment:\n    - A=1\n',
    esperado: ["3306/tcp"],
  },
  longa: {
    yaml: "services:\n  a:\n    ports:\n      - target: 3306\n        published: 3306\n        protocol: udp\n        mode: host\n      - published: '6333'\n        target: 6333\n",
    esperado: ["3306/udp", "6333/tcp"],
  },
  "numero-puro": {
    yaml: "services:\n  a:\n    ports:\n      - 3306\n",
    esperado: ["3306/tcp"],
  },
};
const FORMATOS_EXIGIDOS = ["curta", "fluxo", "mesmo-recuo", "longa", "numero-puro"];

describe("detector de portas: formatos de ports: (Ciclo painel-portas-detector)", () => {
  it("todos os autotestes de formato existem", () => {
    for (const nome of FORMATOS_EXIGIDOS) {
      expect(nome in FORMATOS, `autoteste do formato ${nome} ausente`).toBe(true);
    }
  });
  for (const [nome, c] of Object.entries(FORMATOS)) {
    it(`pega o formato ${nome}`, () => {
      expect(portasDoYaml(c.yaml).map((p) => p.porta)).toEqual(c.esperado);
    });
  }
});

describe("portas publicadas pelos templates (Ciclo painel-portas-banco)", () => {
  const violacoes: string[] = [];
  let renderizados = 0;
  for (const stack of ALL_STACKS) {
    let yaml: string;
    try {
      yaml = renderiza(stack);
    } catch (e) {
      violacoes.push(`${stack.id}: não renderizou (${(e as Error).message})`);
      continue;
    }
    renderizados++;
    for (const { porta } of portasDoYaml(yaml)) {
      if (stack.id in PENDENTES) continue;
      if (!(ALLOWLIST[stack.id] ?? []).includes(porta)) {
        violacoes.push(`${stack.id}: porta publicada ${porta} fora da allowlist`);
      }
    }
  }

  it("nenhum template publica porta fora da allowlist", () => {
    expect(violacoes).toEqual([]);
  });

  it("todos os templates foram renderizados (templates renderizados = ALL_STACKS.length)", () => {
    expect(ALL_STACKS.length).toBeGreaterThan(0);
    expect(renderizados).toBe(ALL_STACKS.length);
  });

  it("a allowlist só cita templates que existem e que de fato publicam", () => {
    for (const id of Object.keys(ALLOWLIST)) {
      const stack = ALL_STACKS.find((s) => s.id === id);
      expect(stack, id).toBeDefined();
      const achadas = new Set(portasDoYaml(renderiza(stack!)).map((p) => p.porta));
      expect([...achadas].sort(), id).toEqual([...ALLOWLIST[id]].sort());
    }
  });
});

describe("AnythingLLM x Qdrant: o endpoint de exemplo é o que o Qdrant gera", () => {
  it("o placeholder do AnythingLLM (pt, en, es) é igual ao endpoint do primeiro nó do qdrant.ts", () => {
    const qdrant = ALL_STACKS.find((s) => s.id === "qdrant")!;
    const nome = Object.keys((parse(renderiza(qdrant, { nodes_qdrant: 1 })) as { services: object }).services)[0];
    const esperado = `http://${nome}:6333`;
    const campo = anythingllm.fields.find((f) => f.name === "qdrant_anythingllm")!;
    expect(campo.placeholder, "placeholder do AnythingLLM (pt)").toBe(esperado);
    expect(anythingllm.i18n?.en?.fields?.qdrant_anythingllm?.placeholder, "placeholder do AnythingLLM (en)").toBe(esperado);
    expect(anythingllm.i18n?.es?.fields?.qdrant_anythingllm?.placeholder, "placeholder do AnythingLLM (es)").toBe(esperado);
  });
});
