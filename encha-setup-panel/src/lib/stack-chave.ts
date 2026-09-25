// Lê a chave de licença de uma stack JÁ INSTALADA, do Env do serviço que a
// carrega (ex.: TRACKER_CHAVE no serviço "app" do Tracker). Compartilhado
// entre a aplicação da atualização (stack-update-release.ts) e a checagem
// de "há atualização?" (stacks/updates.ts): as duas precisam consultar o
// Console COM a chave, porque é o plano da licença — não o canal do
// painel — que decide qual release o cliente recebe.

import { getServiceByName, type DockerServiceFull } from "./portainer";
import type { StackDefinition } from "./stacks/types";

// Lê a env var (ex.: "TRACKER_CHAVE=X") do Env cru do serviço — campo solto
// no tipo DockerServiceFull (ContainerSpec só declara `Image`), por isso o
// cast explícito.
export function lerChaveDoEnv(svc: DockerServiceFull, envVar: string): string | undefined {
  const env = (svc.Spec.TaskTemplate?.ContainerSpec as { Env?: string[] } | undefined)?.Env ?? [];
  const prefix = `${envVar}=`;
  const entry = env.find((e) => e.startsWith(prefix));
  return entry === undefined ? undefined : entry.slice(prefix.length);
}

/**
 * Chave da stack instalada, ou `undefined` se não for possível lê-la (serviço
 * fora do ar, env ausente, Portainer indisponível). Quem chama trata
 * `undefined` como "não sei qual é o plano" e NÃO oferece atualização —
 * consultar sem chave cairia no canal padrão e podia sugerir um rebaixamento
 * a um cliente de plano beta.
 */
export async function lerChaveDaStack(
  token: string,
  endpointId: number,
  stackId: string,
  def: StackDefinition
): Promise<string | undefined> {
  const { licenseEnvVar, licenseEnvService } = def.registryAuth ?? {};
  if (!licenseEnvVar || !licenseEnvService) return undefined;
  try {
    const svc = await getServiceByName(
      token,
      endpointId,
      `${stackId.replace(/-/g, "_")}_${licenseEnvService}`
    );
    return svc ? lerChaveDoEnv(svc, licenseEnvVar) || undefined : undefined;
  } catch {
    return undefined;
  }
}
