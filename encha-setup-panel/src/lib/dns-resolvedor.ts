import { Resolver } from "node:dns/promises";
import type { ResolvedorDns } from "./dns-check";

// O ÚNICO lugar do painel com node:dns. Só consulta registros (A/AAAA) num
// resolvedor; não abre conexão com o domínio.
export const LIMITE_CONSULTA_DNS_MS = 2000;

type ResolverLike = {
  resolve4(nome: string): Promise<string[]>;
  resolve6(nome: string): Promise<string[]>;
  cancel?(): void;
};

/** O resolvedor mais o cancelamento das consultas em voo (Resolver.cancel). */
export type ResolvedorDoSistema = ResolvedorDns & { cancelar: () => void };

/** `Ctor` existe só para o teste injetar uma classe falsa. */
export function criarResolvedorDoSistema(
  Ctor: new (opts: { timeout: number; tries: number }) => ResolverLike = Resolver
): ResolvedorDoSistema {
  const r = new Ctor({ timeout: LIMITE_CONSULTA_DNS_MS, tries: 1 });
  // Com o prazo estourado, as consultas pendentes seguiriam até o timeout do
  // Resolver, que o c-ares repete por servidor de nomes (2 s × N); cancel() as
  // encerra na hora, com ECANCELLED.
  const resolver: ResolvedorDns = (nome, familia) => (familia === 4 ? r.resolve4(nome) : r.resolve6(nome));
  return Object.assign(resolver, { cancelar: () => r.cancel?.() });
}
