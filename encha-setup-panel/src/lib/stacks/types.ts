import { z } from "zod";
import type { ReleaseInfo } from "../release-info";
import type { Locale } from "../locale-shared";
import { falhasDaRegra, mensagens, type RegraCampo } from "../validacao-campos";

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
  /** Regra de validação nomeada, espelhada no wizard — ver ../validacao-campos.ts. */
  regra?: RegraCampo;
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
  /**
   * Época (segundos, só dígitos) que versiona o NOME dos segredos do Docker
   * desta instalação (`<base>_<época>`) — preenchida pelo installer antes de
   * generateYaml, só para stacks que declaram `dockerSecrets`. Segredo do
   * Docker é imutável: trocar o valor = criar outro nome. Ver
   * StackDefinition.dockerSecrets.
   */
  versaoSegredos?: string;
  /**
   * Portão por LABEL dos segredos do Docker (S4c): true SOMENTE se o installer
   * leu, depois do pull, o label das imagens da stack e TODAS declaram o
   * recurso (ver StackDefinition.dockerSecretsGate). Ausente/false = formato
   * antigo. O generateYaml só LÊ este campo — nunca consulta imagem (é puro).
   */
  imagensSuportamSegredos?: boolean;
};

/**
 * Um segredo do Swarm a criar antes do deploy (ver StackDefinition.dockerSecrets).
 * `name` é o nome VERSIONADO (o que o YAML referencia em `external: true`);
 * `base` é o mesmo sem a época — vai no label do segredo para o installer achar
 * as versões antigas depois. `value` é o conteúdo cru (nunca logar).
 */
export type DockerSecretSpec = { base: string; name: string; value: string };

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
  /**
   * Rótulo amigável mostrado no card "copie agora" (Ciclo 25) — sem isto o
   * card cai no `name` cru (ex.: "tracker_master_key"), que é o nome da
   * variável, não algo que um cliente sem contexto técnico reconheça.
   * Opcional: stacks que ainda não definem `label` continuam mostrando o
   * `name`, sem quebrar nada (ver install-wizard.tsx).
   */
  label?: string;
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
  /**
   * Nome da env var no serviço RODANDO que carrega a chave de licença (ex.:
   * "TRACKER_CHAVE") — usado só no caminho de UPDATE (Ciclo 29): como
   * `licenseField` só existe no formulário de instalação e a chave nunca é
   * persistida (`transientFields`), o update relê a mesma chave de volta do
   * `Env` do serviço já rodando em vez de pedi-la de novo ao operador. Ver
   * stack-update-release.ts. Ausente = a stack não oferece update in-place
   * via release (só `updatableImages`, ou nenhum update).
   */
  licenseEnvVar?: string;
  /**
   * Qual `service` (chave do compose, a mesma usada em
   * updateViaRelease/updatableImages) tem a env var acima — ex.: "app". Deve
   * vir preenchido sempre que `licenseEnvVar` estiver.
   */
  licenseEnvService?: string;
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
 * Ativação síncrona por e-mail (Ciclo 20b, virou o ÚNICO caminho no Ciclo
 * D) — o cliente só digita o e-mail da compra; nenhum token passa pela mão
 * dele. `sourceField` é um campo de formulário NORMAL (kind:"email" em
 * `fields`, renderizado como qualquer outro) — não há componente/rota
 * dedicados no wizard. installer.ts resolve o fingerprint desta VPS
 * (getOrCreateMachineId, NUNCA recunhado), troca o e-mail por uma chave via
 * Console (ver tracker-ativacao.ts) ANTES de resolver release/registry — é
 * essa chave que os dois passos seguintes consomem — e injeta o resultado
 * em `targetField`, que por sua vez NUNCA aparece em `fields` (por isso
 * precisa estar em `transientFields`).
 */
export type EmailActivationSpec = {
  consoleBaseUrl: string;
  /** Nome do campo do formulário (visível, `fields`) que carrega o e-mail digitado pelo cliente. */
  sourceField: string;
  /** Nome do campo (ausente de `fields` — só existe internamente) que recebe a chave devolvida pelo Console. */
  targetField: string;
  group?: string;
};

/**
 * Todas as categorias possíveis de uma stack — fonte da verdade única, usada
 * tanto pelo schema de `StackDefinition.category` abaixo quanto pelo rótulo
 * exibido na UI (ver category-labels.ts, que exige um rótulo por categoria
 * daqui via `Record<StackCategory, string>` — o TS acusa erro se a lista
 * divergir).
 */
export type StackCategory =
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

/**
 * Fase 3 de i18n (i18n/GLOSSARY.md) — conteúdo editorial (não UI chrome) de
 * uma stack, sobreposto ao pt-BR quando o locale não é "pt". Opcional e
 * parcial de propósito: uma stack sem `i18n`, ou com só parte dos campos
 * preenchida, continua funcionando — o que faltar cai no pt-BR original via
 * getStackText()/stackFieldText() (src/lib/stacks/i18n-resolve.ts). Isso é
 * o que permite traduzir stack a stack sem travar release.
 *
 * `fields`/`secretLabels` são indexados pelo mesmo `name` já usado em
 * StackField/GeneratedSecret — nunca reinvente uma chave nova.
 * `notes` estático (array) só é aplicado se tiver o MESMO número de itens
 * que o pt-BR resolvido — evita nota traduzida "grudando" na posição errada
 * quando `postInstall.notes` é uma função que varia por `values` (ver
 * enchat.ts). Notes dinâmicas por enquanto só traduzem se a função de
 * notes for reescrita para aceitar locale — fora do escopo desta fase.
 */
export type StackTextOverlay = {
  description?: string;
  fields?: Record<string, { label?: string; placeholder?: string; helpText?: string; group?: string }>;
  notes?: string[];
  secretLabels?: Record<string, string>;
};

export type StackDefinition = {
  id: string;
  name: string;
  description: string;
  category: StackCategory;
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
  /**
   * Trava contra chave nova por cima de dados existentes (S5-A). Se o arquivo
   * `arquivoNoHost` (ex.: /var/enchat/postgres/PG_VERSION) existe no host E
   * o painel não tem valor salvo (stack_secrets) para algum segredo em
   * `segredosQueNaoPodemSerNovos`, a instalação ABORTA em vez de sortear valor
   * novo: a senha do Postgres nova não abre o volume, a chave-mestra nova
   * torna os segredos cifrados ilegíveis. Nunca apaga nada do host.
   * `arquivoDeCredenciais`: onde o operador acha as chaves de uma instalação
   * feita fora do painel (ex.: /root/dados_vps/dados_enchat da opção 84 do
   * menu); só entra na mensagem de erro — ausente = a stack só se instala
   * pelo painel. A mensagem é montada a partir DESTES campos (route.ts),
   * nunca fixa: apontar o diretório de outra stack mandaria apagar o banco
   * errado.
   */
  protegeDadosExistentes?: {
    arquivoNoHost: string;
    segredosQueNaoPodemSerNovos: string[];
    arquivoDeCredenciais?: string;
  };
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
  /**
   * Equivalente de `updatableImages` para uma stack cuja versão/imagem vem
   * de `release:` (Console EnchaT), não de uma constante fixa em código —
   * recebe a release já resolvida e devolve os alvos service->imagem. Só
   * uma das duas (`updatableImages`/`updateViaRelease`) é esperada por
   * stack, nunca as duas (Ciclo 29). Ver stack-update-release.ts para a
   * sequência completa de update (pré-pull autenticado antes da troca de
   * imagem — mesmo raciocínio do caminho de instalação).
   */
  updateViaRelease?: (release: ReleaseInfo) => { service: string; image: string }[];
  repoUrl?: string;
  logoUrl?: string;
  installVia?: "panel" | "bash";
  generateSecrets?: (values: Record<string, unknown>) => GeneratedSecret[];
  /**
   * Segredos do Docker que o installer deve criar no Swarm ANTES do deploy
   * (com os valores EFETIVOS — os mesmos que o generateYaml usa, já com o que
   * foi reaproveitado de uma instalação anterior). Lista vazia = esta
   * instalação usa o formato antigo (variáveis em texto): é o portão por
   * versão da imagem. O installer cria, faz o deploy e só depois remove as
   * versões antigas; ver installer.ts. Ausente = a stack não usa segredos do
   * Docker.
   */
  dockerSecrets?: (
    values: Record<string, unknown>,
    secrets: Record<string, string>,
    ctx: SwarmContext
  ) => DockerSecretSpec[];
  /**
   * Portão dos segredos do Docker por LABEL das imagens (S4c). Depois do
   * pré-pull das imagens de `registryAuth.images`, o installer lê o label
   * `label` de CADA uma; só se todas contêm o token `recurso` (e `versaoOk`
   * passa) é que `ctx.imagensSuportamSegredos` vira true. `versaoOk` falso =
   * nem consulta os labels. Falha ao ler = fechado, com aviso ao operador.
   */
  dockerSecretsGate?: {
    versaoOk: (imageTag: string | undefined) => boolean;
    label: string;
    recurso: string;
  };
  generateYaml: (
    values: Record<string, unknown>,
    secrets: Record<string, string>,
    ctx: SwarmContext
  ) => string;
  postInstall?: {
    accessUrl?: (values: Record<string, unknown>) => string;
    /**
     * Link de primeiro acesso que depende de um SEGREDO gerado pela stack
     * (ex.: EnchaT: https://<domínio>/?setup=<enchat_setup_token>, que cria o
     * primeiro administrador). Separado de `accessUrl` de propósito:
     * `accessUrl` é a URL pública limpa (installer.ts a usa para bater em
     * /api/license depois do deploy) e nunca pode carregar segredo.
     * `secrets` é o mesmo mapa entregue ao generateYaml — já com os valores
     * reaproveitados de uma instalação anterior, então o link bate com o
     * env que o app de fato recebeu.
     */
    setupUrl?: (values: Record<string, unknown>, secrets: Record<string, string>) => string;
    /**
     * Função quando as notas dependem de COMO a instalação foi feita (ex.:
     * pareamento self-service vs. chave colada à mão) — ver enchat.ts para
     * o caso real. Lista fixa quando não há essa distinção.
     */
    notes?: string[] | ((values: Record<string, unknown>) => string[]);
  };
  /** Fase 3 de i18n — ver StackTextOverlay. Ausente = stack ainda só em pt-BR. */
  i18n?: Partial<Record<Exclude<Locale, "pt">, StackTextOverlay>>;
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

// Construída a partir de validacao-campos.ts (regra única, compartilhada com o
// wizard). O texto continua em pt aqui: a tradução por idioma acontece em
// errosDeCampoDoServidor, pelo campo, não pelo texto do zod.
export const strongPassword = z.string().superRefine((s, ctx) => {
  for (const message of mensagens(falhasDaRegra("senha_forte", s), "pt"))
    ctx.addIssue({ code: z.ZodIssueCode.custom, message });
});

// Senha digitada que vai em texto no YAML do painel (minio, mongodb, pgadmin,
// directus, clickhouse, supabase): a forte de sempre, sem $, aspas simples e espaço.
export const senhaForteTexto = z.string().superRefine((s, ctx) => {
  for (const message of mensagens(falhasDaRegra("senha_forte_texto", s), "pt"))
    ctx.addIssue({ code: z.ZodIssueCode.custom, message });
});

export const username = z.string().min(3).max(40).regex(/^[a-zA-Z0-9_-]+$/);

export const email = z.string().email();

export const portNum = z.coerce.number().int().min(1).max(65535);
