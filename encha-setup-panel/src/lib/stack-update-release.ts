// Atualiza uma stack cuja versão/imagem vem de `release:` (ex.: Encha
// Tracker) pelo painel Encha Setup — Ciclo 29. Mesma sequência que
// installStack (installer.ts) já usa: pré-puxar autenticado, DEPOIS trocar
// a imagem — nunca o contrário, senão o Swarm tenta puxar uma imagem
// privada sem credencial e a task fica presa em `pending`. A diferença é
// que aqui não há formulário: a chave de licença é relida do `Env` do
// serviço já rodando (ver StackDefinition.registryAuth.licenseEnvVar), e o
// fingerprint vem do MESMO getOrCreateMachineId que a instalação usa —
// nunca recunhado. Ver ciclos/ciclo-29.md (Encha Tracker) para o contrato
// congelado.

import {
  discoverContext,
  getServiceByName,
  stripDigest,
  updateServiceImage,
  type DockerServiceFull,
} from "./portainer";
import { fetchLatestReleaseCached } from "./release-info";
import { resolveRegistryAndPullImages } from "./registry-pull";
import { getOrCreateMachineId } from "./pairing-store";
import { resolverAppHostname } from "./installer";
import { swarmServiceName } from "./stacks/updates";
import { logAudit } from "./audit";
import type { StackDefinition } from "./stacks/types";

export type ApplyReleaseUpdateInput = {
  token: string;
  stackId: string;
  def: StackDefinition;
  user: string;
  ip: string;
};

export type ApplyReleaseUpdateResult = { atualizados: string[] };

// Lê a env var de licença (ex.: "TRACKER_CHAVE=X") do Env cru do serviço —
// campo solto no tipo DockerServiceFull (ContainerSpec só declara `Image`),
// por isso o cast explícito.
function lerChaveDoEnv(svc: DockerServiceFull, envVar: string): string | undefined {
  const env = (svc.Spec.TaskTemplate?.ContainerSpec as { Env?: string[] } | undefined)?.Env ?? [];
  const prefix = `${envVar}=`;
  const entry = env.find((e) => e.startsWith(prefix));
  return entry === undefined ? undefined : entry.slice(prefix.length);
}

export async function applyReleaseUpdate(input: ApplyReleaseUpdateInput): Promise<ApplyReleaseUpdateResult> {
  const { token, stackId, def, user, ip } = input;
  const stackName = stackId.replace(/-/g, "_");

  try {
    if (!def.updateViaRelease || !def.release || !def.registryAuth) {
      throw new Error(
        `stack "${def.id}" chamou applyReleaseUpdate sem updateViaRelease/release/registryAuth — bug de wiring.`
      );
    }
    const { registryAuth } = def;
    if (!registryAuth.licenseEnvVar || !registryAuth.licenseEnvService) {
      throw new Error(
        `stack "${def.id}" declara registryAuth mas não licenseEnvVar/licenseEnvService — bug de wiring.`
      );
    }

    const { endpointId } = await discoverContext(token);
    const release = await fetchLatestReleaseCached(def.release, def.id);
    const targets = def.updateViaRelease(release);

    // Passo 5: busca TODOS os serviços-alvo primeiro — se algum esperado
    // não existir rodando, a stack está num estado inesperado e não há
    // update seguro a fazer.
    const resolved: { target: { service: string; image: string }; svc: DockerServiceFull }[] = [];
    for (const target of targets) {
      const serviceName = swarmServiceName(stackName, target.service);
      const svc = await getServiceByName(token, endpointId, serviceName);
      if (!svc) {
        throw new Error(`Serviço esperado "${serviceName}" não está rodando — a stack está num estado inesperado.`);
      }
      resolved.push({ target, svc });
    }

    // Idempotência: já rodando a versão-alvo em TODOS os serviços -> não
    // toca em nada (nem pull, nem update, nem audit) — chamar de novo
    // depois de já ter atualizado não repete trabalho nem re-pede
    // credencial.
    const jaAtualizados = resolved.every(
      ({ target, svc }) => stripDigest(svc.Spec.TaskTemplate?.ContainerSpec?.Image ?? "") === target.image
    );
    if (jaAtualizados) {
      return { atualizados: [] };
    }

    // Fingerprint: MESMA chamada que installStack já usa — nunca cunha um
    // novo se já existir.
    const { fingerprint } = getOrCreateMachineId(stackId, resolverAppHostname(def, "registryAuth"));

    // Chave: acha o serviço cujo `service` (chave do compose) é o
    // licenseEnvService entre os já buscados acima; busca de novo se não
    // coincidir com nenhum target.
    let licenseSvc = resolved.find((r) => r.target.service === registryAuth.licenseEnvService)?.svc;
    if (!licenseSvc) {
      const serviceName = swarmServiceName(stackName, registryAuth.licenseEnvService);
      const found = await getServiceByName(token, endpointId, serviceName);
      if (!found) {
        throw new Error(`Serviço "${serviceName}" (licenseEnvService) não está rodando — a stack está num estado inesperado.`);
      }
      licenseSvc = found;
    }
    const chave = lerChaveDoEnv(licenseSvc, registryAuth.licenseEnvVar);
    if (chave === undefined) {
      throw new Error(
        `Env var "${registryAuth.licenseEnvVar}" não encontrada no serviço "${registryAuth.licenseEnvService}" — a stack está num estado inesperado.`
      );
    }

    // Pré-pull autenticado de TODAS as imagens-alvo — ANTES de trocar
    // qualquer imagem. É a ordem que fecha o defeito que motivou este
    // ciclo: updateServiceImage nunca autentica sozinho.
    await resolveRegistryAndPullImages({
      token,
      endpointId,
      user,
      ip,
      registryAuth,
      chave,
      fingerprint,
      images: targets.map((t) => t.image),
    });

    const atualizados: string[] = [];
    for (const { target, svc } of resolved) {
      const current = stripDigest(svc.Spec.TaskTemplate?.ContainerSpec?.Image ?? "");
      if (current === target.image) continue;
      await updateServiceImage(token, endpointId, svc, target.image);
      atualizados.push(`${target.service}: ${current} → ${target.image}`);
    }

    logAudit({ user, ip, action: "stack.update", target: stackName, result: "ok", meta: { atualizados } });
    return { atualizados };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    logAudit({
      user,
      ip,
      action: "stack.update.fail",
      target: stackName,
      result: "error",
      meta: { error: msg }, // nunca chave/token
    });
    throw e;
  }
}
