import type { StackDefinition } from "./types";
import { expectedStackNames } from "./types";
import type { SwarmStackStatus } from "../portainer";
import { fetchLatestReleaseCached } from "../release-info";
import { lerChaveDaStack } from "../stack-chave";
import { ehAtualizacaoPorVersao } from "../ordem-versao";

export type PendingUpdate = {
  /** Nome completo do serviço no Swarm, ex.: "evolution_evolution_api". */
  serviceName: string;
  /** Imagem rodando agora (já sem digest). */
  current: string;
  /** Imagem que a definição da stack manda rodar. */
  target: string;
};

/**
 * Nome real de um serviço no Swarm. O `docker stack deploy` prefixa o nome da
 * stack ao nome do serviço no compose — então `evolution_api` dentro da stack
 * `evolution` vira `evolution_evolution_api`.
 */
export function swarmServiceName(stackName: string, service: string): string {
  return `${stackName}_${service}`;
}

// Laço de comparação (stackName -> service -> serviceName -> current vs
// target) compartilhado entre computePendingUpdates (`updatableImages`,
// imagem fixa em código) e computeReleaseBasedPendingUpdates
// (`updateViaRelease`, imagem resolvida pelo Console) — a única diferença
// entre as duas é DE ONDE vem a lista de alvos {service, image} e QUAL
// critério decide "pendente" (`ehPendente`, ver os dois chamadores abaixo).
// Retorna vazio quando a stack não está instalada, ou quando não
// conseguimos ler a imagem em execução — nesse último caso preferimos NÃO
// oferecer atualização a oferecer uma falsa.
function pendingFromTargets(
  def: StackDefinition,
  statuses: SwarmStackStatus[],
  targets: { service: string; image: string }[],
  ehPendente: (atual: string, alvo: string) => boolean
): PendingUpdate[] {
  const byName = new Map(statuses.map((s) => [s.name, s]));
  const pending: PendingUpdate[] = [];

  for (const stackName of expectedStackNames(def)) {
    const status = byName.get(stackName);
    if (!status) continue; // stack não instalada
    for (const { service, image } of targets) {
      const serviceName = swarmServiceName(stackName, service);
      const current = status.images[serviceName];
      if (!current) continue; // imagem desconhecida — não arriscar falso positivo
      if (ehPendente(current, image)) pending.push({ serviceName, current, target: image });
    }
  }

  return pending;
}

/**
 * Compara a imagem em execução com a imagem-alvo de `updatableImages` e
 * devolve só os serviços que estão defasados. Caminho de imagem fixa em
 * código (Postgres, Evolution, EvoCRM) — continua por diferença de texto,
 * porque as tags dele (`pg16`, `8-alpine`, `1.0.0-rc2`) não são X.Y.Z e a
 * ordem semver nunca as reconheceria como "mais novas".
 */
export function computePendingUpdates(
  def: StackDefinition,
  statuses: SwarmStackStatus[]
): PendingUpdate[] {
  return def.updatableImages?.length
    ? pendingFromTargets(def, statuses, def.updatableImages, (atual, alvo) => atual !== alvo)
    : [];
}

/**
 * Equivalente de computePendingUpdates para stacks com `updateViaRelease`
 * (versão-alvo resolvida pelo Console EnchaT, não fixa em código) — busca a
 * release (cacheada, ver fetchLatestReleaseCached) e reusa o mesmo laço de
 * comparação. Console fora do ar ou release não publicada -> catch, devolve
 * [] (mesma disciplina de "preferimos não oferecer atualização a oferecer
 * uma falsa" documentada acima). Caminho do Console: a tag é sempre X.Y.Z
 * (release-info.ts), então só oferece uma versão ESTRITAMENTE maior que a
 * instalada (`ehAtualizacaoPorVersao`, painel-rebaixamento) — tag instalada
 * ilegível nunca vira oferta.
 *
 * A consulta leva a chave da licença da stack instalada, porque é o plano
 * dela que decide o canal (stable × beta). Se a chave não puder ser lida,
 * NÃO oferece nada: cair no canal padrão sugeriria um rebaixamento a quem
 * está em outro canal.
 */
export async function computeReleaseBasedPendingUpdates(
  def: StackDefinition,
  statuses: SwarmStackStatus[],
  ctx: { token: string; endpointId: number }
): Promise<PendingUpdate[]> {
  if (!def.updateViaRelease || !def.release) return [];
  try {
    const chave = await lerChaveDaStack(ctx.token, ctx.endpointId, def.id, def);
    if (def.registryAuth?.licenseEnvVar && !chave) return [];
    const release = await fetchLatestReleaseCached(def.release, def.id, chave);
    return pendingFromTargets(def, statuses, def.updateViaRelease(release), ehAtualizacaoPorVersao);
  } catch {
    return [];
  }
}
