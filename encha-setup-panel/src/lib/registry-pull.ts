// Extração do bloco de credencial de registro privado (retry + pré-pull)
// que installer.ts usava inline (installStack, Ciclo 29). Mesmo
// comportamento, mesma contagem de tentativas, mesmos campos de audit — só
// parametrizado, para ser reaproveitado pelo caminho de UPDATE
// (stack-update-release.ts) sem duplicar a lógica. Ver ciclos/ciclo-29.md
// (Encha Tracker) para o contrato congelado.

import { pullImageWithRegistry } from "./portainer";
import { RegistryAuthError, ensureRegistry, exchangeLicenseForGhcrCredentials } from "./registry-auth";
import { logAudit } from "./audit";
import type { StackDefinition } from "./stacks/types";

export type ResolveRegistryAndPullImagesInput = {
  token: string;
  endpointId: number;
  user: string;
  ip: string;
  registryAuth: NonNullable<StackDefinition["registryAuth"]>;
  chave: string;
  fingerprint?: string;
  /** Imagens repo:tag completas, já resolvidas pelo chamador. */
  images: string[];
};

// Credencial de registro privado (ex.: GHCR) — precisa existir no Portainer
// ANTES do deploy/update, é lá que ele resolve o EncodedRegistryAuth por
// serviço. O pré-pull falha rápido se a chave não tiver acesso, em vez de
// deixar as tasks presas em `pending` sem explicação.
//
// Retry (3 tentativas, backoff): a credencial devolvida pelo exchange pode
// ter vida curta — repetir SÓ o pull com a mesma credencial vencida falha do
// mesmo jeito, então cada tentativa refaz o exchange + ensureRegistry (que
// já faz UPDATE, não INSERT, quando o registry existe) antes de repetir o
// pré-pull. `pullImageWithRegistry` lê a senha por `registryId`, então basta
// atualizar o registry no Portainer pra a MESMA chamada de pull passar a
// usar a credencial nova. Só NÃO repete em erro que não é transitório
// (chave inválida/revogada, fingerprint_mismatch etc.) — aí é erro do
// cliente, não da rede.
export async function resolveRegistryAndPullImages(input: ResolveRegistryAndPullImagesInput): Promise<void> {
  const { token, endpointId, user, ip, registryAuth, chave, fingerprint, images } = input;
  const MAX_TENTATIVAS = 3;
  let ultimoErro: unknown;
  let sucesso = false;
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS && !sucesso; tentativa++) {
    if (tentativa > 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000 * tentativa));
    }
    try {
      const creds = await exchangeLicenseForGhcrCredentials(registryAuth.exchangeUrl, chave, fingerprint);
      const registryId = await ensureRegistry(token, {
        url: registryAuth.registryHost,
        name: registryAuth.registryName,
        username: creds.username,
        password: creds.token,
      });
      logAudit({
        user,
        ip,
        action: "registry.auth",
        target: registryAuth.registryHost,
        result: "ok",
        meta: { registryId, username: creds.username, tentativa }, // nunca a chave nem o token
      });
      for (const img of images) {
        await pullImageWithRegistry(token, endpointId, img, registryId);
      }
      sucesso = true;
    } catch (e) {
      ultimoErro = e;
      // RegistryAuthError carrega a causa estruturada (reason/httpStatus/
      // serverDetail) — grava tudo no audit em vez de só a mensagem final,
      // pra dar pra distinguir depois "chave errada" de "Console fora do ar"
      // sem precisar reproduzir o problema. Nunca inclui a chave nem o
      // token (RegistryAuthError já não os captura em lugar nenhum). Falha
      // de PULL (não é RegistryAuthError — é PortainerError, lançada dentro
      // de pullImageRaw) sempre é tratada como transitória: é justamente o
      // caso "credencial venceu no meio do download", que só se resolve
      // tentando de novo.
      const meta: Record<string, unknown> = {
        error: e instanceof Error ? e.message : "Erro desconhecido",
        tentativa,
      };
      let transitorio = true;
      if (e instanceof RegistryAuthError) {
        meta.reason = e.reason;
        if (e.httpStatus !== undefined) meta.httpStatus = e.httpStatus;
        if (e.serverDetail !== undefined) meta.serverDetail = e.serverDetail;
        transitorio =
          e.reason === "timeout" ||
          e.reason === "network" ||
          e.reason === "rate_limited" ||
          e.reason === "server";
      }
      logAudit({
        user,
        ip,
        action: "registry.auth.fail",
        target: registryAuth.registryHost,
        result: "error",
        meta,
      });
      if (!transitorio || tentativa === MAX_TENTATIVAS) {
        throw e;
      }
    }
  }
  if (!sucesso) {
    // Inatingível de fato (o laço só sai sem sucesso lançando acima), mas o
    // TypeScript não sabe disso — guarda explícita evita "possibly used
    // before assigned" mais adiante e documenta a invariante.
    throw ultimoErro instanceof Error ? ultimoErro : new Error("Falha desconhecida no registry-auth");
  }
}
