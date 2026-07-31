// Troca de chave de licença por credencial de registro Docker privado, e
// registro dessa credencial no Portainer — usado por stacks que instalam
// imagens privadas (ex.: EnchaT Grátis, GHCR). Ver installer.ts para a
// orquestração completa e stacks/types.ts para o contrato RegistryAuthSpec.

import { PortainerError, createRegistry, listRegistries, updateRegistry } from "./portainer";

const EXCHANGE_TIMEOUT_MS = 8000;

export type ExchangedCredentials = { username: string; token: string };

// Lança em vez de best-effort (ao contrário de monitor.ts): uma falha aqui
// deve abortar a instalação, nunca seguir silenciosamente sem credencial.
export async function exchangeLicenseForGhcrCredentials(
  exchangeUrl: string,
  chave: string
): Promise<ExchangedCredentials> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), EXCHANGE_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(exchangeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave }),
      signal: ctrl.signal,
      cache: "no-store",
    });
  } catch (e) {
    throw new Error("Chave de licença inválida ou Console EnchaT indisponível");
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    throw new Error("Chave de licença inválida ou Console EnchaT indisponível");
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("Chave de licença inválida ou Console EnchaT indisponível");
  }

  const username = (json as { username?: unknown })?.username;
  const token = (json as { token?: unknown })?.token;
  if (typeof username !== "string" || typeof token !== "string" || !username || !token) {
    throw new Error("Chave de licença inválida ou Console EnchaT indisponível");
  }
  // Nunca logar a chave nem o token — só o host/username são seguros de registrar.
  return { username, token };
}

// Idempotente por URL — a mesma chave que o Portainer usa para casar a
// credencial no deploy (igualdade de string contra o domínio da imagem).
// Sempre atualiza as credenciais quando já existe: o token do exchange é
// de curta duração, e um token obsoleto é pior que nenhum.
export async function ensureRegistry(
  token: string,
  spec: { url: string; name: string; username: string; password: string }
): Promise<number> {
  try {
    const existing = (await listRegistries(token)).find((r) => r.URL === spec.url);
    if (existing) {
      await updateRegistry(token, existing.Id, spec);
      return existing.Id;
    }
    const created = await createRegistry(token, spec);
    return created.Id;
  } catch (e) {
    if (e instanceof PortainerError && e.status === 403) {
      throw new Error(
        "O usuário do Portainer usado para entrar no painel precisa ser administrador " +
          "para registrar o GHCR. Entre com a conta admin e tente de novo."
      );
    }
    throw e;
  }
}
