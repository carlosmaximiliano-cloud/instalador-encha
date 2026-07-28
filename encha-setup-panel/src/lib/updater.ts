import {
  discoverContext,
  getServiceByName,
  updateServiceImage,
  PortainerError,
} from "./portainer";

// Nome do service Swarm do próprio painel (stack `encha-panel`, service `panel`).
const PANEL_SERVICE = "encha-panel_panel";
const IMAGE_REPO = "ghcr.io/enchaaluno/setup-panel";

export type UpdateResult = { ok: true } | { ok: false; error: string };

// Dispara o redeploy do painel para a versão alvo, via Portainer (mesma via dos
// deploys de stacks). O Swarm faz rolling update; este container será substituído.
export async function triggerSelfUpdate(
  token: string,
  targetVersion: string
): Promise<UpdateResult> {
  try {
    const { endpointId } = await discoverContext(token);
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
