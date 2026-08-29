import { z } from "zod";
import type { ReleaseInfo } from "../release-info";

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
  /**
   * Preenchido pelo installer ANTES de generateYaml quando a stack declara
   * `release` — a versão/imagem resolvidas na hora, consultando o Console.
   * Ausente se a stack não declarar `release`.
   */
  release?: ReleaseInfo;
  /**
   * Fingerprint de instalação já vinculado a uma licença via pareamento
   * self-service (ver license-pairing.ts) — precisa ser o MESMO valor que
   * o app vai calcular no primeiro boot (sha256(machineId + "|" + hostname)),
   * nunca recalculado aqui. Repassado ao registryAuth.exchangeUrl: uma
   * licença recém-pareada já nasce vinculada no Console, e a partir desse
   * instante o campo passa a ser exigido por lá. Ausente quando a stack não
   * tem pareamento (fields.chave_licenca colada manualmente) ou quando o
   * pareamento ainda não populou este contexto.
   */
  fingerprint?: string;
  /**
   * ENCHAT_MACHINE_ID desta instalação (ver enchat-fingerprint.ts +
   * pairing-store.ts) — precisa ir pro env da stack IDENTICO ao que gerou
   * `fingerprint` acima; a stack então calcula o mesmo fingerprint no
   * primeiro boot. Vazio ("") numa instalação que já existia antes deste
   * campo existir (fingerprint legado preservado de propósito — ver
   * getOrCreateMachineId). Ausente só quando a stack não usa este
   * mecanismo.
   */
  machineId?: string;
};

export type GeneratedSecret = {
  name: string;
  value: string;
  /**
   * Se true, o valor é devolvido uma única vez na resposta de instalação
   * (POST /api/stacks) para o operador copiar — nunca fica só no banco do
   * painel. Reservado para segredos cuja perda é irrecuperável fora daqui
   * (ex.: enchat_master_key). NÃO marcar segredos internos de uso exclusivo
   * entre containers (ex.: senha do Postgres, token do Pinfy) — esses não
   * precisam sair do painel e só aumentariam a superfície de exposição.
   */
  reveal?: boolean;
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
  /**
   * Imagens privadas a pré-puxar (com a credencial) antes do deploy — falha
   * rápido se a chave não tiver acesso. `release` vem preenchido quando a
   * stack declara `release` (ver StackDefinition.release) — resolvido pelo
   * installer antes deste ponto, então nunca é `undefined` nesse caso.
   */
  images: (values: Record<string, unknown>, release?: ReleaseInfo) => string[];
};

/**
 * Consulta `GET {baseUrl}/api/version?app=&edicao=&canal=` no Console EnchaT
 * para resolver a versão/imagem a instalar, em vez de pedir isso num campo
 * do formulário — evita o operador digitar uma versão que não existe
 * publicada. Resolvido pelo installer ANTES de generateYaml/registryAuth.images,
 * e exposto em `ctx.release`. Ver release-info.ts.
 */
export type ReleaseSpec = {
  baseUrl: string;
  app: string;
  edicao: string;
  canal: string;
};

/**
 * Pareamento self-service de licença (ver license-pairing.ts +
 * pairing-store.ts) — o cliente gera a própria licença dentro do wizard, em
 * vez de precisar de uma license_key já criada por um admin. Consumido pelo
 * componente LicensePairing (wizard) e pelas rotas /api/license/pair/*.
 */
export type PairingSpec = {
  /** Base do Console EnchaT a parear (mesmo valor de release.baseUrl/registryAuth.exchangeUrl, tipicamente). */
  consoleBaseUrl: string;
  /** Edição enviada ao Console no pair/start (ex.: "free") — sempre a MESMA edição que a imagem instalada, nunca escolhida pelo usuário (ver risco de instalar a imagem free com uma chave MAX). */
  edicao: string;
  /** Nome do campo do schema que recebe a chave confirmada pelo pareamento (deve também estar em transientFields). */
  targetField: string;
  /** Nome do campo (hidden, registrado no form) que carrega o id opaco da sessão de pareamento até o submit. */
  sessionField: string;
  /** Grupo visual (StackField.group) onde o componente de pareamento é renderizado no wizard. */
  group?: string;
};

/**
 * Ativação síncrona por e-mail (Ciclo 20b) — POST direto, sem sessão nem
 * polling: o cliente digita o e-mail, a rota do painel resolve o
 * fingerprint (via getOrCreateMachineId, NUNCA recunhado) e troca por uma
 * chave num passo só. Ver src/lib/tracker-ativacao.ts.
 */
export type EmailActivationSpec = {
  consoleBaseUrl: string;
  /** Nome do campo do formulário que recebe a chave devolvida. */
  targetField: string;
  group?: string;
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
  /**
   * Diretórios a garantir (mkdir -p) no node manager antes do deploy —
   * necessário para bind mounts, que o Swarm não cria sozinho. Passe
   * `{ path, owner }` quando o processo dentro do container NÃO roda como
   * root (ex.: `USER enchat` no Dockerfile) — sem isso o bind mount nasce
   * `root:root` e o app não consegue escrever nele (achado real:
   * `/data/media` ficava mudo, "permission denied", em toda instalação).
   * String pura continua valendo para diretórios que o próprio container
   * (ex.: postgres) já ajusta sozinho no boot — não dar chown neles.
   */
  hostDirs?: (string | { path: string; owner: string })[];
  /** Nomes de campos do formulário que NUNCA devem ser persistidos em stack_secrets nem em audit meta (ex.: chave de licença). */
  transientFields?: string[];
  registryAuth?: RegistryAuthSpec;
  /** Resolve a versão/imagem a instalar pelo Console, em vez de pedir num campo do formulário. */
  release?: ReleaseSpec;
  /** Pareamento self-service de licença — ver PairingSpec. Ausente = a stack não oferece esse fluxo (chave só manual). */
  pairing?: PairingSpec;
  /**
   * Ativação síncrona por e-mail — ver EmailActivationSpec (Ciclo 20b).
   * Diferente de `pairing`: um POST só, sem sessão, sem polling. Ausente =
   * a stack não oferece esse fluxo (chave só manual/pairing).
   */
  emailActivation?: EmailActivationSpec;
  /**
   * Hostname do CONTAINER do app desta stack (nunca o hostname da VPS) —
   * é o segundo argumento de fingerprintEnchat(machineId, hostname)
   * (enchat-fingerprint.ts), fixo no `hostname:` do serviço dentro de
   * generateYaml. OBRIGATÓRIO em toda stack que declare `registryAuth`
   * OU `pairing` — installer.ts lança um erro alto e explícito se estiver
   * ausente nesse caso, em vez de deixar getOrCreateMachineId/
   * fingerprintEnchat caírem no default "enchat-app" em silêncio (Ciclo
   * 20 — achado: os 3 call sites desse mecanismo genérico nunca passavam
   * hostname, então QUALQUER stack com hostname de container diferente de
   * "enchat-app" calculava um fingerprint errado, e o Console torna esse
   * erro IRREVERSÍVEL depois do primeiro vínculo).
   */
  appHostname?: string;
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
    /**
     * Função quando as notas dependem de COMO a instalação foi feita (ex.:
     * pareamento self-service vs. chave colada à mão) — ver enchat.ts para
     * o caso real. Lista fixa quando não há essa distinção.
     */
    notes?: string[] | ((values: Record<string, unknown>) => string[]);
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
