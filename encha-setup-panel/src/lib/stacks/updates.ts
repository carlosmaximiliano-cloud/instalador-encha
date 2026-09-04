import type { StackDefinition } from "./types";
import { expectedStackNames } from "./types";
import type { SwarmStackStatus } from "../portainer";
import { fetchLatestReleaseCached } from "../release-info";

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
// entre as duas é DE ONDE vem a lista de alvos {service, image}. Retorna
// vazio quando a stack não está instalada, ou quando não conseguimos ler a
// imagem em execução — nesse último caso preferimos NÃO oferecer
// atualização a oferecer uma falsa.
function pendingFromTargets(
  def: StackDefinition,
  statuses: SwarmStackStatus[],
  targets: { service: string; image: string }[]
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
      if (current !== image) pending.push({ serviceName, current, target: image });
    }
  }

  return pending;
}

/**
 * Compara a imagem em execução com a imagem-alvo de `updatableImages` e
 * devolve só os serviços que estão defasados.
 */
export function computePendingUpdates(
  def: StackDefinition,
  statuses: SwarmStackStatus[]
): PendingUpdate[] {
  return def.updatableImages?.length ? pendingFromTargets(def, statuses, def.updatableImages) : [];
}

/**
 * Equivalente de computePendingUpdates para stacks com `updateViaRelease`
 * (versão-alvo resolvida pelo Console EnchaT, não fixa em código) — busca a
 * release (cacheada, ver fetchLatestReleaseCached) e reusa o mesmo laço de
 * comparação. Console fora do ar ou release não publicada -> catch, devolve
 * [] (mesma disciplina de "preferimos não oferecer atualização a oferecer
 * uma falsa" documentada acima).
 */
export async function computeReleaseBasedPendingUpdates(
  def: StackDefinition,
  statuses: SwarmStackStatus[]
): Promise<PendingUpdate[]> {
  if (!def.updateViaRelease || !def.release) return [];
  try {
    const release = await fetchLatestReleaseCached(def.release, def.id);
    return pendingFromTargets(def, statuses, def.updateViaRelease(release));
  } catch {
    return [];
  }
}
