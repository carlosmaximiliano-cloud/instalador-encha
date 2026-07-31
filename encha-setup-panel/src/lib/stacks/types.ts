import { z } from "zod";

export type FieldKind = "text" | "domain" | "email" | "password" | "username" | "port" | "checkbox" | "slug";

export type StackField = {
  name: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  helpText?: string;
  sensitive?: boolean;
  optional?: boolean;
  default?: string | boolean;
  group?: string;
};

export type SwarmContext = {
  networkName: string;
  serverName: string;
  email: string;
};

export type GeneratedSecret = {
  name: string;
  value: string;
};

/**
 * Troca uma chave de licença por credencial de um registro Docker privado
 * (ex.: GHCR) e a registra no Portainer antes do deploy, para que o
 * `docker stack deploy` nativo do Portainer anexe o `EncodedRegistryAuth`
 * automaticamente. Ver installer.ts para a orquestração.
 */
export type RegistryAuthSpec = {
  /** Host exato do registro — vira o campo URL do registry no Portainer. Ex.: "ghcr.io" (sem esquema/barra). */
  registryHost: string;
  /** Nome amigável do registry criado/atualizado no Portainer. */
  registryName: string;
  /** Endpoint que troca a chave de licença por {username, token}. */
  exchangeUrl: string;
  /** Nome do campo do formulário que carrega a chave (deve também estar em transientFields). */
  licenseField: string;
  /** Imagens privadas a pré-puxar (com a credencial) antes do deploy — falha rápido se a chave não tiver acesso. */
  images: (values: Record<string, unknown>) => string[];
};

export type StackDefinition = {
  id: string;
  name: string;
  description: string;
  category:
    | "infra"
    | "database"
    | "messaging"
    | "automation"
    | "ai"
    | "crm"
    | "cms"
    | "communication"
    | "marketing"
    | "scheduling"
    | "storage"
    | "monitoring"
    | "erp"
    | "analytics"
    | "auth"
    | "chatbot"
    | "media"
    | "remote"
    | "design"
    | "admin";
  icon: string;
  dependsOn: string[];
  optionNumber: number;
  fields: StackField[];
  schema: z.ZodTypeAny;
  swarmStackNames?: string[];
  externalVolumes?: string[];
  /** Bancos a garantir no Postgres compartilhado (serviço postgres_postgres) antes do deploy. */
  postgresDatabases?: string[];
  /**
   * Extensões a garantir por banco do Postgres compartilhado, depois de
   * criado (idempotente — CREATE EXTENSION IF NOT EXISTS). `database` deve
   * também estar em `postgresDatabases`.
   */
  postgresExtensions?: { database: string; extensions: string[] }[];
  /** Diretórios a garantir (mkdir -p) no node manager antes do deploy — necessário para bind mounts, que o Swarm não cria sozinho. */
  hostDirs?: string[];
  /** Nomes de campos do formulário que NUNCA devem ser persistidos em stack_secrets nem em audit meta (ex.: chave de licença). */
  transientFields?: string[];
  registryAuth?: RegistryAuthSpec;
  /**
   * Serviços cuja imagem pode ser trocada in-place (rolling update do Swarm),
   * sem recriar a stack nem tocar em volumes/banco. `service` é o nome do
   * serviço DENTRO do compose — o nome real no Swarm é `<stack>_<service>`.
   * Fonte da verdade da versão-alvo: é comparado com a imagem em execução
   * para decidir se há atualização disponível. Ver /api/stacks/[id]/update.
   */
  updatableImages?: { service: string; image: string }[];
  repoUrl?: string;
  logoUrl?: string;
  installVia?: "panel" | "bash";
  generateSecrets?: (values: Record<string, unknown>) => GeneratedSecret[];
  generateYaml: (
    values: Record<string, unknown>,
    secrets: Record<string, string>,
    ctx: SwarmContext
  ) => string;
  postInstall?: {
    accessUrl?: (values: Record<string, unknown>) => string;
    notes?: string[];
  };
};

export function expectedStackNames(def: StackDefinition): string[] {
  return def.swarmStackNames ?? [def.id.replace(/-/g, "_")];
}

// "Pronta" = todos os serviços esperados existem E estão com running>=desired.
// Compartilhado entre GET /api/stacks (monta o catálogo) e POST /api/stacks
// (valida dependsOn antes de instalar) — mesma definição nos dois lugares,
// para não divergir sobre o que conta como "dependência satisfeita".
export function isStackReady(
  def: StackDefinition,
  installedNames: Set<string>,
  statusByName: Map<string, { ready: boolean }>
): boolean {
  const expected = expectedStackNames(def);
  const present = expected.every((n) => installedNames.has(n));
  return present && expected.every((n) => statusByName.get(n)?.ready ?? false);
}

export const fqdn = z
  .string()
  .min(3)
  .max(253)
  .regex(
    /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
    "Domínio inválido (use formato: ex.dominio.com)"
  );

export const slug = z.string().min(2).max(40).regex(/^[a-zA-Z0-9-]+$/, "Use apenas letras, números e hifens");

export const strongPassword = z
  .string()
  .min(12, "Mínimo 12 caracteres")
  .regex(/[A-Z]/, "Inclua uma letra maiúscula")
  .regex(/[a-z]/, "Inclua uma letra minúscula")
  .regex(/[0-9]/, "Inclua um número")
  .regex(/[^A-Za-z0-9]/, "Inclua um símbolo");

export const username = z.string().min(3).max(40).regex(/^[a-zA-Z0-9_-]+$/);

export const email = z.string().email();

export const portNum = z.coerce.number().int().min(1).max(65535);
