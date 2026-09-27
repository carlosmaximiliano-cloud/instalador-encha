import { fqdn } from "./stacks/types";

// Verificação de DNS do domínio digitado no wizard (ciclo painel-dns). Módulo
// PURO: recebe o resolvedor por injeção e não abre conexão nenhuma — quem fala
// com o DNS é dns-resolvedor.ts, o único arquivo com node:dns. O resultado só
// AVISA; nunca bloqueia a instalação.
//
// Regra (tabela avaliada nesta ordem):
//   1  domínio ou host do painel inválido          -> indeterminado (nada é resolvido)
//   2  prazo total estourou                        -> indeterminado
//   3  host do painel com falha não definitiva, ou sem endereço -> indeterminado
//   4  domínio sem endereço e com falha não definitiva          -> indeterminado
//   5  domínio sem endereço (só ENOTFOUND/ENODATA) -> nao_resolve
//   6  algum endereço do domínio fora do conjunto do painel     -> nao_aponta
//   7  tudo no conjunto, mas uma família com falha não definitiva -> indeterminado
//   8  todos os endereços do domínio no conjunto do painel      -> aponta
//
// A regra é estrita porque o desafio HTTP-01 do Let's Encrypt prefere o IPv6
// quando há AAAA: um AAAA esquecido apontando para fora derruba o certificado
// mesmo com o A certo. E vira "indeterminado" na dúvida para não assustar
// quem está certo com um falso "não resolve" por timeout do resolvedor.

export type EstadoDns = "aponta" | "nao_aponta" | "nao_resolve" | "indeterminado";
export type FamiliaIp = 4 | 6;
export type ResolvedorDns = (nome: string, familia: FamiliaIp) => Promise<string[]>;
export type ResultadoResolucao = { ips: string[]; falhou: boolean };

export const LIMITE_VERIFICACAO_DNS_MS = 3000;

/** O mesmo `fqdn` que o servidor aplica nos campos de domínio — sem cópia da regex. */
export function dominioValido(dominio: unknown): dominio is string {
  return fqdn.safeParse(dominio).success;
}

/**
 * Nome do painel a partir do cabeçalho Host. null se for vazio, IP, localhost
 * ou IPv6 (literal ou sem colchetes): só um nome de domínio dá o que resolver.
 */
export function hostDoPainel(host: string | null | undefined): string | null {
  if (typeof host !== "string") return null;
  let h = host.trim().toLowerCase();
  if (h === "") return null;
  if (h.startsWith("[")) return null;
  if ((h.match(/:/g) ?? []).length > 1) return null;
  h = h.replace(/:\d+$/, "");
  h = h.replace(/\.$/, "");
  return dominioValido(h) ? h : null;
}

/**
 * IPv6 pela serialização WHATWG (minúsculas, comprimido); IPv4 como veio.
 * O parser de URL só serve de serializador de host: a base "file:" evita
 * escrever um endereço de rede literal aqui (o teste D13 proíbe qualquer URL
 * de rede nestes arquivos) e dá exatamente o mesmo hostname que "http:".
 */
export function canonicalizarIp(ip: string): string {
  if (!ip.includes(":")) return ip;
  try {
    return new URL("//[" + ip + "]/", "file:").hostname.replace(/^\[|\]$/g, "");
  } catch {
    return ip.toLowerCase();
  }
}

function definitiva(e: unknown): boolean {
  const code = (e as { code?: unknown } | null | undefined)?.code;
  return code === "ENOTFOUND" || code === "ENODATA";
}

/** Resolve A e AAAA em paralelo. ENOTFOUND/ENODATA = família vazia; o resto = falhou. */
export async function resolverNome(nome: string, resolvedor: ResolvedorDns): Promise<ResultadoResolucao> {
  const familias: FamiliaIp[] = [4, 6];
  // async: um resolvedor que lança de forma síncrona também vira rejeição.
  const resultados = await Promise.allSettled(familias.map(async (f) => resolvedor(nome, f)));
  const ips = new Set<string>();
  let falhou = false;
  for (const r of resultados) {
    if (r.status === "fulfilled") {
      for (const ip of r.value) ips.add(canonicalizarIp(ip));
    } else if (!definitiva(r.reason)) {
      falhou = true;
    }
  }
  return { ips: [...ips], falhou };
}

/** Linhas 3 a 8 da tabela, nessa ordem. */
export function estadoPorEnderecos(dominio: ResultadoResolucao, painel: ResultadoResolucao): EstadoDns {
  if (painel.falhou || painel.ips.length === 0) return "indeterminado";
  if (dominio.ips.length === 0 && dominio.falhou) return "indeterminado";
  if (dominio.ips.length === 0) return "nao_resolve";
  const conjunto = new Set(painel.ips);
  if (dominio.ips.some((ip) => !conjunto.has(ip))) return "nao_aponta";
  if (dominio.falhou) return "indeterminado";
  return "aponta";
}

export async function verificarDns(args: {
  dominio: string;
  hostPainel: string | null;
  resolvedor: ResolvedorDns;
  limiteMs?: number;
}): Promise<EstadoDns> {
  try {
    if (!dominioValido(args.dominio)) return "indeterminado";
    const host = hostDoPainel(args.hostPainel);
    if (host === null) return "indeterminado";

    let timer: ReturnType<typeof setTimeout> | undefined;
    const prazo = new Promise<EstadoDns>((resolve) => {
      timer = setTimeout(() => resolve("indeterminado"), args.limiteMs ?? LIMITE_VERIFICACAO_DNS_MS);
    });
    const consulta = Promise.all([
      resolverNome(args.dominio.toLowerCase(), args.resolvedor),
      resolverNome(host, args.resolvedor),
    ]).then(([dominio, painel]) => estadoPorEnderecos(dominio, painel));
    try {
      return await Promise.race([consulta, prazo]);
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return "indeterminado";
  }
}
