import {
  discoverContext,
  getServiceByName,
  updateServiceImage,
  listStacks,
  getStackById,
  getStackFile,
  updateSwarmStack,
  PortainerError,
} from "./portainer";

// Nome do service Swarm do próprio painel (stack `encha-panel`, service `panel`).
const PANEL_STACK = "encha-panel";
const PANEL_SERVICE = "encha-panel_panel";
const IMAGE_REPO = "ghcr.io/enchaaluno/setup-panel";

export type UpdateResult = { ok: true } | { ok: false; error: string };

// Dispara o redeploy do painel para a versão alvo, via Portainer.
//
// Quando o painel foi instalado como stack gerenciada pelo Portainer (ver
// ferramenta_encha_panel em secondary.sh), o update tem que passar por
// `PUT /api/stacks/{id}` — não por `docker service update` — senão o compose
// armazenado fica com a tag antiga e o próximo "Update the stack" clicado no
// Portainer reverteria a imagem silenciosamente. Instalações legadas
// (host-owned, `docker stack deploy` direto) não aparecem em `/api/stacks`
// com arquivo próprio; para essas, cai no `updateServiceImage` de sempre.
export async function triggerSelfUpdate(
  token: string,
  targetVersion: string
): Promise<UpdateResult> {
  try {
    const { endpointId } = await discoverContext(token);
    const stacks = await listStacks(token);
    const stack = stacks.find((s) => s.Name === PANEL_STACK);

    if (stack) {
      const updatedViaStack = await tryUpdateViaStack(token, stack.Id, endpointId, targetVersion);
      if (updatedViaStack) return { ok: true };
      // Sem arquivo armazenado (stack externa/legada) — cai no fallback abaixo.
    }

    const service = await getServiceByName(token, endpointId, PANEL_SERVICE);
    if (!service) {
      return { ok: false, error: `Service ${PANEL_SERVICE} não encontrado no Swarm` };
    }
    await updateServiceImage(token, endpointId, service, `${IMAGE_REPO}:${targetVersion}`);
    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof PortainerError ? `Portainer ${e.status}: ${e.message}` : (e as Error).message;
    return { ok: false, error: msg };
  }
}

// Patcheia PANEL_IMAGE_TAG no Env armazenado da stack e reenvia o mesmo
// compose. Devolve false (sem lançar) quando a stack não tem arquivo
// armazenado — GET /api/stacks/{id}/file 404 é o sinal de uma stack externa,
// criada fora da API do Portainer.
async function tryUpdateViaStack(
  token: string,
  stackId: number,
  endpointId: number,
  targetVersion: string
): Promise<boolean> {
  let fileContent: string;
  try {
    fileContent = await getStackFile(token, stackId);
  } catch (e) {
    if (e instanceof PortainerError && e.status === 404) return false;
    throw e;
  }

  // Preserva as demais variáveis (PANEL_ADMIN_USER, PORTAINER_PASSWORD,
  // etc.) — updateSwarmStack substitui o array Env inteiro.
  const stack = await getStackById(token, stackId);
  const env = stack.Env ?? [];
  const patchedEnv = env.some((e) => e.name === "PANEL_IMAGE_TAG")
    ? env.map((e) => (e.name === "PANEL_IMAGE_TAG" ? { ...e, value: targetVersion } : e))
    : [...env, { name: "PANEL_IMAGE_TAG", value: targetVersion }];

  await updateSwarmStack(token, stackId, endpointId, {
    stackFileContent: fileContent,
    env: patchedEnv,
    prune: false,
    pullImage: true,
  });
  return true;
}
