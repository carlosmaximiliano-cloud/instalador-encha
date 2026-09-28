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
import { lerChaveDoEnv } from "./stack-chave";
import { resolveRegistryAndPullImages } from "./registry-pull";
import { getOrCreateMachineId } from "./pairing-store";
import { resolverAppHostname } from "./installer";
import { swarmServiceName } from "./stacks/updates";
import { logAudit } from "./audit";
import type { StackDefinition } from "./stacks/types";
import { ehAtualizacaoPorVersao, RebaixamentoRecusadoError } from "./ordem-versao";

export type ApplyReleaseUpdateInput = {
  token: string;
  stackId: string;
  def: StackDefinition;
  user: string;
  ip: string;
};

export type ApplyReleaseUpdateResult = { atualizados: string[] };

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
    // Chave: relida do Env do serviço que a carrega, ANTES de resolver a
    // release — é o plano da licença, no Console, que decide o canal (stable
    // × beta). Consultar anônimo daria sempre o canal padrão do painel e
    // podia oferecer um rebaixamento a quem está em outro canal.
    const licenseServiceName = swarmServiceName(stackName, registryAuth.licenseEnvService);
    const licenseSvc = await getServiceByName(token, endpointId, licenseServiceName);
    if (!licenseSvc) {
      throw new Error(`Serviço "${licenseServiceName}" (licenseEnvService) não está rodando — a stack está num estado inesperado.`);
    }
    const chave = lerChaveDoEnv(licenseSvc, registryAuth.licenseEnvVar);
    if (chave === undefined) {
      throw new Error(
        `Env var "${registryAuth.licenseEnvVar}" não encontrada no serviço "${registryAuth.licenseEnvService}" — a stack está num estado inesperado.`
      );
    }
    const release = await fetchLatestReleaseCached(def.release, def.id, chave);
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

    // Trava de rebaixamento (painel-rebaixamento): cada serviço-alvo cai em
    // uma de três classes, ANTES de qualquer machine-id, pull ou troca de
    // imagem — nunca "tudo ou nada", porque o sidecar tracker-updater nunca
    // se auto-atualiza (Ciclo 54 do Tracker): depois de uma atualização
    // feita de dentro do produto o app fica à frente do updater, e um
    // rollback do sidecar pode deixar o app atrás. Então a decisão é por
    // serviço:
    //   - igual: current === target.image (texto) — não mexe, como hoje.
    //   - aplicável: ehAtualizacaoPorVersao(current, target.image) — alvo
    //     estritamente maior e legível dos dois lados — é pré-puxado e
    //     atualizado.
    //   - recusado: todo o resto (menor, igual só por tag em outro
    //     repositório, ilegível de qualquer lado) — nunca é puxado nem
    //     tocado.
    const aplicaveis: typeof resolved = [];
    const recusados: { servico: string; atual: string; alvo: string }[] = [];
    for (const item of resolved) {
      const { target, svc } = item;
      const current = stripDigest(svc.Spec.TaskTemplate?.ContainerSpec?.Image ?? "");
      if (current === target.image) {
        // igual: não mexe.
      } else if (ehAtualizacaoPorVersao(current, target.image)) {
        aplicaveis.push(item);
      } else {
        recusados.push({ servico: swarmServiceName(stackName, target.service), atual: current, alvo: target.image });
      }
    }

    if (aplicaveis.length === 0) {
      if (recusados.length > 0) {
        throw new RebaixamentoRecusadoError(recusados);
      }
      // Idempotência: já rodando a versão-alvo em TODOS os serviços -> não
      // toca em nada (nem pull, nem update, nem audit) — chamar de novo
      // depois de já ter atualizado não repete trabalho nem re-pede
      // credencial.
      return { atualizados: [] };
    }

    // Fingerprint: MESMA chamada que installStack já usa — nunca cunha um
    // novo se já existir.
    const { fingerprint } = getOrCreateMachineId(stackId, resolverAppHostname(def, "registryAuth"));

    // Pré-pull autenticado SÓ das imagens aplicáveis — ANTES de trocar
    // qualquer imagem. É a ordem que fecha o defeito que motivou o Ciclo 29:
    // updateServiceImage nunca autentica sozinho. Os recusados nunca são
    // puxados nem tocados.
    await resolveRegistryAndPullImages({
      token,
      endpointId,
      user,
      ip,
      registryAuth,
      chave,
      fingerprint,
      images: aplicaveis.map((a) => a.target.image),
    });

    const atualizados: string[] = [];
    for (const { target, svc } of aplicaveis) {
      const current = stripDigest(svc.Spec.TaskTemplate?.ContainerSpec?.Image ?? "");
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
