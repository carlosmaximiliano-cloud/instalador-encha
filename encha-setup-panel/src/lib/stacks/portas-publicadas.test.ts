import { describe, expect, it } from "vitest";
import { ALL_STACKS } from "./registry";
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
const PENDENTES: Record<string, string> = {
  mysql: "F1.2",
  qdrant: "F1.3",
};

// Serviços do nível `services:` (2 espaços) com o bloco de texto de cada um
// (mesma forma de restart-policy-templates.test.ts, que não exporta com segurança).
function servicosDoYaml(yaml: string): { nome: string; bloco: string }[] {
  const linhas = yaml.split("\n");
  const ini = linhas.findIndex((l) => l === "services:");
  if (ini === -1) throw new Error("YAML sem bloco services:");
  const out: { nome: string; bloco: string }[] = [];
  let atual: { nome: string; linhas: string[] } | null = null;
  for (let i = ini + 1; i < linhas.length; i++) {
    const l = linhas[i];
    if (/^\S/.test(l)) break;
    const m = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(l);
    if (m) {
      if (atual) out.push({ nome: atual.nome, bloco: atual.linhas.join("\n") });
      atual = { nome: m[1], linhas: [] };
    } else if (atual) atual.linhas.push(l);
  }
  if (atual) out.push({ nome: atual.nome, bloco: atual.linhas.join("\n") });
  return out;
}

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

// Portas publicadas ("N/proto") de um bloco de serviço: forma curta
// ("A:B", "A:B/udp", "ip:A:B") e forma longa (published/protocol).
function portasPublicadas(bloco: string): string[] {
  const linhas = bloco.split("\n").filter((l) => !/^\s*#/.test(l));
  const out: string[] = [];
  for (let i = 0; i < linhas.length; i++) {
    const m = /^(\s*)ports:\s*$/.exec(linhas[i]);
    if (!m) continue;
    const recuo = m[1].length;
    let longa: { pub?: string; proto: string } | null = null;
    const fecha = () => {
      if (longa?.pub) out.push(`${longa.pub}/${longa.proto}`);
      longa = null;
    };
    for (let j = i + 1; j < linhas.length; j++) {
      const l = linhas[j];
      if (l.trim() === "") continue;
      const ind = l.length - l.trimStart().length;
      if (ind <= recuo && !l.trimStart().startsWith("- ")) break;
      if (ind < recuo) break;
      const item = l.trim();
      const novo = /^-\s+(.*)$/.exec(item);
      if (novo && ind === recuo + 2) {
        fecha();
        const corpo = novo[1].replace(/\s+#.*$/, "").replace(/^["']|["']$/g, "");
        const kv = /^([A-Za-z]\w*):\s*(.*)$/.exec(corpo);
        if (kv) {
          longa = { proto: "tcp" };
          if (kv[1] === "published") longa.pub = kv[2];
          if (kv[1] === "protocol") longa.proto = kv[2];
          continue;
        }
        const [semProto, proto = "tcp"] = corpo.split("/");
        const partes = semProto.split(":");
        const pub = partes.length === 1 ? partes[0] : partes[partes.length - 2];
        out.push(`${pub}/${proto}`);
      } else if (longa) {
        const kv = /^([A-Za-z]\w*):\s*(.*)$/.exec(item.replace(/^-\s+/, ""));
        if (kv?.[1] === "published") longa.pub = kv[2].replace(/["']/g, "");
        if (kv?.[1] === "protocol") longa.proto = kv[2];
      }
    }
    fecha();
  }
  return out;
}

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
    for (const { bloco } of servicosDoYaml(yaml)) {
      for (const porta of portasPublicadas(bloco)) {
        if (stack.id in PENDENTES) continue;
        if (!(ALLOWLIST[stack.id] ?? []).includes(porta)) {
          violacoes.push(`${stack.id}: porta publicada ${porta} fora da allowlist`);
        }
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
      const achadas = new Set(servicosDoYaml(renderiza(stack!)).flatMap((s) => portasPublicadas(s.bloco)));
      expect([...achadas].sort(), id).toEqual([...ALLOWLIST[id]].sort());
    }
  });
});
