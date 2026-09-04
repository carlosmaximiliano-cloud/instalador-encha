import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

// Console EnchaT — o mesmo Console emite licenças de EnchaT e Encha
// Tracker, discriminadas por `produto` (ver Ciclo 18b, repo EnchaT
// Console). Não confundir com a conta GHCR: essa sim é SEPARADA por
// produto (ver TRACKER_GHCR_PULL_* no Console, Ciclo 18c) — a fronteira de
// isolamento de imagem é a CONTA, nunca o Console.
const CONSOLE_BASE_URL = "https://console.enchat.pro";

// Ciclo C (fechamento da instalação) — a única release do Tracker que o
// Console conhece hoje é canal=beta (é o que o release.yml do Tracker
// registra — casa com o plano tracker-beta da licença de teste). Uma
// constante ÚNICA porque este valor precisa bater em TRÊS lugares
// diferentes que não se validam entre si: a resolução de versão na
// INSTALAÇÃO (release.canal, abaixo), e o TRACKER_CANAL de cada um dos
// dois processos que rodam DEPOIS de instalado (app e sidecar
// tracker-updater, generateYaml) — os dois fazem a MESMA consulta
// GET /api/version?...&canal=... pra decidir se há atualização. Divergir
// um dos três faria a instalação funcionar mas o autoupdate nunca achar
// nada (achado ao investigar o ciclo: os dois TRACKER_CANAL estavam
// hardcoded "stable" enquanto a única release publicável é beta).
const CANAL_TRACKER = "beta";

// O hostname FIXO do serviço `app` — TEM que bater com o hostname
// que internal/licenca/fingerprint.go lê via os.Hostname() no primeiro
// boot (ver generateYaml abaixo, `hostname: encha-tracker`). É também o
// segundo argumento de fingerprintEnchat abaixo — os dois nunca podem
// divergir (Ciclo 20).
const TRACKER_APP_HOSTNAME = "encha-tracker";

// Deriva o repo do sidecar tracker-updater a partir do repo resolvido pelo
// Console para a imagem principal do Tracker — mesma convenção de
// updaterRepoFrom em enchat.ts, adaptada ao nome real do binário deste
// produto (cmd/tracker-updater, repo Encha Tracker). Lança se o formato
// mudar, em vez de montar silenciosamente uma referência de imagem errada.
// NOTA: a conta GHCR dedicada ao Tracker ainda está sendo provisionada
// (Ciclo 21) — se o nome do repo publicado divergir de ".../encha-tracker"
// -> ".../tracker-updater", ajustar esta função é a única mudança
// necessária aqui.
function updaterRepoFromTracker(imageRepo: string): string {
  if (!imageRepo.endsWith("/encha-tracker")) {
    throw new Error(
      `image_repo do Console ("${imageRepo}") não termina em "/encha-tracker" — não dá pra derivar o repo do sidecar tracker-updater com segurança.`
    );
  }
  return imageRepo.replace(/\/encha-tracker$/, "/tracker-updater");
}

const schema = z.object({
  dominio_tracker: fqdn,
  // Ciclo D (fechamento da instalação) — o cliente nunca digita/cola uma
  // chave. `email_ativacao` é o ÚNICO campo de licenciamento visível no
  // wizard; installer.ts troca esse e-mail por uma chave via Console
  // (ativarTrackerPorEmail) ANTES de resolver release/registry, e injeta o
  // resultado em `chave_licenca` — que por isso é opcional aqui (nunca
  // chega preenchido do formulário; existe só pra generateYaml/registryAuth
  // lerem depois de injetado).
  email_ativacao: z.string().email("E-mail inválido"),
  chave_licenca: z.string().min(8, "Chave de licença inválida").max(200).optional(),
  email_admin: z.string().email("E-mail inválido"),
});

export const enchaTracker: StackDefinition = {
  id: "encha-tracker",
  name: "Encha Tracker",
  description: "Rastreamento server-side de campanhas (Meta CAPI + GA4) com painel de ROAS/CPA.",
  category: "analytics",
  icon: "bar-chart-3",
  dependsOn: ["traefik-portainer"], // Postgres é dedicado a esta stack, não o compartilhado — mesma decisão de enchat.
  optionNumber: 86, // enchat usa 84, evocrm usa 85 — ver registry.test.ts (Ciclo 20) para a checagem de unicidade que este ciclo acrescenta a TODAS as stacks (achado: evolution/postgres colidiam em 3, chatwoot/mysql em 5 — corrigido no mesmo commit).
  installVia: "panel",
  appHostname: TRACKER_APP_HOSTNAME,
  // postgres: SEM owner — a imagem postgres:16-alpine ajusta o dono dela
  // sozinha no boot, mesmo tratamento de enchat_postgres em enchat.ts.
  hostDirs: ["/var/enchat/tracker-postgres"],
  transientFields: ["chave_licenca", "email_ativacao"],
  // Sem `updatableImages` — o Tracker tem seu PRÓPRIO botão de atualizar
  // dentro do produto (sidecar tracker-updater, Ciclo 19/19b), que já lida
  // com pré-pull autenticado e rollback. Um botão de update in-place aqui
  // teria as duas mesmas limitações documentadas em enchat.ts.

  release: {
    baseUrl: CONSOLE_BASE_URL,
    app: "tracker",
    edicao: "full", // o Tracker não tem edição grátis — plans.edicao é sempre 'full'.
    canal: CANAL_TRACKER,
  },

  // Ciclo D: ativação por e-mail é o ÚNICO caminho — não sobrou campo de
  // chave manual no wizard (ver `fields` abaixo e o schema).
  emailActivation: {
    consoleBaseUrl: CONSOLE_BASE_URL,
    sourceField: "email_ativacao",
    targetField: "chave_licenca",
    group: "Licença",
  },

  registryAuth: {
    registryHost: "ghcr.io",
    registryName: "GHCR Encha Tracker",
    // Ciclo 18c: endpoint dedicado a RE-OBTER a credencial a partir de uma
    // chave já vinculada (diferente de /tracker/ativar, que ativa E
    // devolve credencial num passo só — esse é o caminho do Ciclo 20b).
    // Mesma forma de resposta que installer.ts já sabe consumir
    // ({username, token} no topo) — nenhum adaptador necessário.
    exchangeUrl: `${CONSOLE_BASE_URL}/api/v1/tracker/registry-auth`,
    licenseField: "chave_licenca",
    images: (_v, release) => {
      if (!release) throw new Error("release não resolvida antes de registryAuth.images — bug no installer.");
      return [`${release.imageRepo}:${release.imageTag}`, `${updaterRepoFromTracker(release.imageRepo)}:${release.imageTag}`];
    },
  },

  fields: [
    {
      name: "dominio_tracker",
      label: "Domínio do painel do Tracker",
      kind: "domain",
      placeholder: "tracker.suaempresa.com",
      group: "Domínios",
      helpText: "O DNS já deve apontar para esta VPS antes de instalar.",
    },
    {
      name: "email_admin",
      label: "E-mail de login do painel",
      kind: "email",
      group: "Acesso",
      helpText: "Identidade de login do painel do Tracker — a senha é gerada e exibida ao final.",
    },
    {
      name: "email_ativacao",
      label: "E-mail da compra",
      kind: "email",
      group: "Licença",
      helpText: "Usamos este e-mail só para ativar a licença junto ao Console — nenhum token é pedido.",
    },
  ],
  schema,
  generateSecrets: () => [
    { name: "tracker_master_key", value: randomBytes(32).toString("base64"), reveal: true },
    { name: "postgres_password", value: randomBytes(24).toString("hex") },
    { name: "admin_senha", value: randomBytes(12).toString("base64url"), reveal: true },
    // Compartilhado entre o app e o sidecar tracker-updater (Authorization: Bearer).
    { name: "updater_token", value: randomBytes(24).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    if (!ctx.release) throw new Error("ctx.release ausente em generateYaml — bug no installer.");
    const net = ctx.networkName;
    const san = (x: unknown) => String(x ?? "").replace(/[`"\n\r]/g, "");
    const domain = san(v.dominio_tracker);
    const { imageRepo, imageTag } = ctx.release;
    const updaterRepo = updaterRepoFromTracker(imageRepo);
    return `version: "3.7"
services:

  app:
    image: ${imageRepo}:${imageTag}
    hostname: ${TRACKER_APP_HOSTNAME}
    networks:
      - ${net}
      - encha_tracker_net
    environment:
      DATABASE_URL: "postgresql://tracker:${secrets.postgres_password}@encha_tracker_postgres:5432/tracker?sslmode=disable"
      PORT: "8080"
      TRACKER_MASTER_KEY: "${secrets.tracker_master_key}"
      TRACKER_ADMIN_EMAIL: "${san(v.email_admin)}"
      TRACKER_ADMIN_SENHA: "${secrets.admin_senha}"
      TRACKER_CONSOLE_URL: "${CONSOLE_BASE_URL}"
      TRACKER_CHAVE: "${san(v.chave_licenca)}"
      TRACKER_CANAL: "${CANAL_TRACKER}"
      TRACKER_MACHINE_ID: "${san(ctx.machineId ?? "")}"
      TRACKER_UPDATER_URL: "http://encha_tracker_updater:9000"
      TRACKER_UPDATER_TOKEN: "${secrets.updater_token}"
    deploy:
      replicas: 1
      update_config:
        order: start-first
      # Sem max_attempts DE PROPÓSITO — mesmo raciocínio de enchat_app: o
      # Swarm não tem depends_on com condição de saúde, e uma VPS lenta
      # pra subir o Postgres não pode esgotar tentativas e derrubar a
      # instalação de vez.
      restart_policy:
        condition: on-failure
        delay: 5s
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.docker.network=${net}"
        - "traefik.http.routers.encha-tracker.rule=Host(\`${domain}\`)"
        - "traefik.http.routers.encha-tracker.entrypoints=websecure"
        - "traefik.http.routers.encha-tracker.tls=true"
        - "traefik.http.routers.encha-tracker.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.encha-tracker-http.rule=Host(\`${domain}\`)"
        - "traefik.http.routers.encha-tracker-http.entrypoints=web"
        - "traefik.http.routers.encha-tracker-http.middlewares=encha-tracker-https-redirect"
        - "traefik.http.middlewares.encha-tracker-https-redirect.redirectscheme.scheme=https"
        - "traefik.http.middlewares.encha-tracker-https-redirect.redirectscheme.permanent=true"
        - "traefik.http.services.encha-tracker.loadbalancer.server.port=8080"

  # Sidecar de atualização em um clique (docker.sock) — Ciclo 19/19b.
  # Swarm-only, sem .env nenhum (Portainer não monta arquivo): as âncoras
  # de confiança vão como env var explícita, nunca escolhidas pelo Console.
  updater:
    image: ${updaterRepo}:${imageTag}
    hostname: encha-tracker-updater
    networks:
      - encha_tracker_net
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      TRACKER_UPDATER_TOKEN: "${secrets.updater_token}"
      TRACKER_LICENSE_SERVER_URL: "${CONSOLE_BASE_URL}"
      TRACKER_LICENSE_KEY: "${san(v.chave_licenca)}"
      TRACKER_CANAL: "${CANAL_TRACKER}"
      TRACKER_IMAGEM_PADRAO: "${imageRepo}"
      TRACKER_SWARM_SERVICE: "encha_tracker_app"
      TRACKER_HEALTHZ_URL: "http://encha_tracker_app:8080/api/healthz"
      TRACKER_STATE_FILE: "/data/estado.json"
      PORT: "9000"
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == manager

  postgres:
    image: postgres:16-alpine
    networks:
      - encha_tracker_net
    volumes:
      - /var/enchat/tracker-postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: "tracker"
      POSTGRES_PASSWORD: "${secrets.postgres_password}"
      POSTGRES_DB: "tracker"
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == manager

networks:
  ${net}:
    external: true
    name: ${net}
  encha_tracker_net:
    driver: overlay
    attachable: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).dominio_tracker}`,
    notes: (values) => [
      `Login do painel: ${(values as Record<string, unknown>).email_admin} — a senha gerada aparece só nesta tela, guarde-a.`,
      "Guarde a TRACKER_MASTER_KEY exibida — sem ela, os segredos gravados no banco são irrecuperáveis.",
      "O fingerprint desta instalação já está vinculado à licença informada — trocar a chave por outra licença exige uma nova instalação.",
    ],
  },
};
