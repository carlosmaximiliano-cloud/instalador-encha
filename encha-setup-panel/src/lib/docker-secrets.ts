import {
  createDockerSecret,
  listDockerSecrets,
  listStackServices,
  removeDockerSecret,
  secretsReferenciadosPorServico,
} from "./portainer";
import type { DockerSecretSpec } from "./stacks/types";

// Orquestração dos segredos do Docker de uma stack (ciclo S4, achado 2) — o
// modelo é o do painel (M3, C9): nomes versionados `<base>_<época>`, criados
// ANTES do deploy; as versões antigas só saem DEPOIS de o deploy novo estar
// aplicado, e nunca as que algum serviço (Spec atual ou PreviousSpec do
// rollback) ainda referencia. Fica fora de installer.ts para os testes
// exercitarem a ordem sem montar um installStack inteiro.

// Labels dos segredos criados por aqui — é o que permite achar as versões
// antigas de UMA stack sem tocar nos segredos de outras (nem no
// encha_panel_master_key, criado por outro caminho). Mesmos nomes usados por
// secondary.sh (opção 84), de propósito: uma reinstalação pelo painel limpa o
// que o menu criou e vice-versa.
export const LABEL_SEGREDO_STACK = "com.encha.segredo-stack";
export const LABEL_SEGREDO_BASE = "com.encha.segredo-base";

// Cria todos os segredos da lista. Falha na criação de qualquer um aborta
// (lança) — o chamador ainda não fez deploy, e os segredos antigos, que a
// stack em uso referencia, ficam intocados. Os já criados nesta rodada ficam
// órfãos (sem serviço) e a próxima instalação bem-sucedida os varre pelo label.
// O valor nunca sai daqui: nenhum log, nenhum erro reescrito com ele.
export async function criarSegredosVersionados(
  token: string,
  endpointId: number,
  stackName: string,
  specs: DockerSecretSpec[]
): Promise<void> {
  for (const s of specs) {
    await createDockerSecret(token, endpointId, {
      name: s.name,
      value: s.value,
      labels: { [LABEL_SEGREDO_STACK]: stackName, [LABEL_SEGREDO_BASE]: s.base },
    });
  }
}

export type LimpezaSegredos = { removidos: string[]; motivoPulo?: "sem_servicos" | "spec_novo_nao_aplicado" | "falha_ao_ler" };

// Remove versões antigas dos segredos da stack. NUNCA lança (best-effort: o
// que sobrar é varrido na próxima rodada) e só age quando há prova de que o
// deploy novo foi APLICADO — ao menos um serviço da stack referencia, no Spec
// atual, um dos nomes que devem ser mantidos. Nunca remove:
//   - um nome de `manter` (a versão recém-aplicada);
//   - um nome que qualquer serviço da stack ainda referencia no Spec OU no
//     PreviousSpec (o alvo do rollback automático do Swarm — auditoria C9).
export async function limparSegredosAntigos(
  token: string,
  endpointId: number,
  stackName: string,
  manter: string[]
): Promise<LimpezaSegredos> {
  const mantidos = new Set(manter);
  let referenciados: Set<string>;
  try {
    const servicos = await listStackServices(token, endpointId, stackName);
    if (servicos.length === 0) return { removidos: [], motivoPulo: "sem_servicos" };
    referenciados = new Set<string>();
    let novoAplicado = false;
    for (const svc of servicos) {
      for (const n of secretsReferenciadosPorServico(svc)) referenciados.add(n);
      const atuais = svc.Spec.TaskTemplate?.ContainerSpec?.Secrets ?? [];
      if (atuais.some((s) => s.SecretName && mantidos.has(s.SecretName))) novoAplicado = true;
    }
    if (!novoAplicado) return { removidos: [], motivoPulo: "spec_novo_nao_aplicado" };
  } catch {
    return { removidos: [], motivoPulo: "falha_ao_ler" };
  }

  const removidos: string[] = [];
  let existentes;
  try {
    existentes = await listDockerSecrets(token, endpointId, [`${LABEL_SEGREDO_STACK}=${stackName}`]);
  } catch {
    return { removidos, motivoPulo: "falha_ao_ler" };
  }
  for (const sec of existentes) {
    const nome = sec.Spec?.Name;
    if (!nome || mantidos.has(nome) || referenciados.has(nome)) continue;
    try {
      await removeDockerSecret(token, endpointId, sec.ID);
      removidos.push(nome);
    } catch {
      // Em uso, ou o daemon recusou: fica para a próxima rodada.
    }
  }
  return { removidos };
}
