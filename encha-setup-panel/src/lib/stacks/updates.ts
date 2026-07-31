import type { StackDefinition } from "./types";
import { expectedStackNames } from "./types";
import type { SwarmStackStatus } from "../portainer";

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

/**
 * Compara a imagem em execução com a imagem-alvo de `updatableImages` e
 * devolve só os serviços que estão defasados.
 *
 * Retorna vazio quando a stack não é atualizável in-place, quando não está
 * instalada, ou quando não conseguimos ler a imagem em execução — nesse
 * último caso preferimos NÃO oferecer atualização a oferecer uma falsa.
 */
export function computePendingUpdates(
  def: StackDefinition,
  statuses: SwarmStackStatus[]
): PendingUpdate[] {
  if (!def.updatableImages?.length) return [];

  const byName = new Map(statuses.map((s) => [s.name, s]));
  const pending: PendingUpdate[] = [];

  for (const stackName of expectedStackNames(def)) {
    const status = byName.get(stackName);
    if (!status) continue; // stack não instalada
    for (const { service, image } of def.updatableImages) {
      const serviceName = swarmServiceName(stackName, service);
      const current = status.images[serviceName];
      if (!current) continue; // imagem desconhecida — não arriscar falso positivo
      if (current !== image) pending.push({ serviceName, current, target: image });
    }
  }

  return pending;
}
