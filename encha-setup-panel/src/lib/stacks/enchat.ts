import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

// Imagem do Pinfy (WhatsApp não-oficial, bundled) — o docker-stack.yaml
// upstream do EnchaT Grátis (ENCHAT GRÁTIS/swarm/) aponta por padrão pra
// ghcr.io/octavioEncha/pinfy. Divergência NÃO resolvida com o time do EnchaT
// ainda (ver plano de validação e2e). Republicada em 2026-08-01 sob
// ghcr.io/enchainterno/ (mesmo digest do original, `docker buildx imagetools`)
// pelo mesmo motivo do enchat-free: "Manage access" cross-conta no GHCR não
// governa `docker pull` de verdade (testado, ver [[ghcr-isolamento-pacotes]]
// na memória do repo ENCHAT) — só a fronteira de conta isola de fato.
const PINFY_IMAGE = "ghcr.io/enchainterno/pinfy-api:1.0.0";
// O default do upstream (licenca.pinfy.com.br) tem DNS morto.
const PINFY_LICENSE_SERVER_URL = "https://app.pinfy.fun/";

// A edição Grátis do EnchaT (e o Pinfy embutido) vivem num owner GHCR
// SEPARADO do da edição MAX — de propósito, é o que permite a credencial de
// pull entregue por registryAuth.exchangeUrl alcançar só as imagens do
// Grátis, nunca a MAX.
const CONSOLE_BASE_URL = "https://console.enchat.pro";

// Deriva o repo do sidecar enchat-updater a partir do repo resolvido pelo
// Console para a imagem principal — os dois são publicados sob o mesmo owner
// (ver ENCHAT GRÁTIS/README.md), então "enchat-free" -> "enchat-updater" é
// estável. Lança se o formato mudar, em vez de silenciosamente montar uma
// referência de imagem errada.
function updaterRepoFrom(imageRepo: string): string {
  if (!imageRepo.endsWith("/enchat-free")) {
    throw new Error(
      `image_repo do Console ("${imageRepo}") não termina em "/enchat-free" — não dá pra derivar o repo do sidecar enchat-updater com segurança.`
    );
  }
  return imageRepo.replace(/\/enchat-free$/, "/enchat-updater");
}

const schema = z.object({
  url_enchat: fqdn,
  chave_licenca: z.string().min(8, "Chave de licença inválida").max(200),
});

export const enchat: StackDefinition = {
  id: "enchat",
  name: "EnchaT Grátis",
  description: "CRM conversacional (WhatsApp) — edição gratuita do EnchaT, com Pinfy embutido.",
  category: "crm",
  icon: "headphones",
  dependsOn: ["traefik-portainer"], // Postgres é dedicado a esta stack, não o compartilhado.
  optionNumber: 84,
  installVia: "panel",
  hostDirs: ["/var/enchat/media", "/var/enchat/postgres"],
  transientFields: ["chave_licenca"],
  // Sem `updatableImages` DE PROPÓSITO — não é omissão, é decisão. Dois
  // motivos reais impedem um botão de update in-place funcionar hoje:
  //   1. updateServiceImage() (portainer.ts) não manda X-Registry-Auth; só o
  //      pré-pull do install (pullImageWithRegistry, usado em installer.ts)
  //      é autenticado. Um update trocaria a imagem sem credencial —
  //      enchat_app/enchat_pinfy ficariam presas em "pending" sem erro claro.
  //   2. `chave_licenca` é transientField e nunca é persistida (decisão de
  //      segurança). No momento do update não há como refazer o exchange, e
  //      o token GHCR já registrado no Portainer é de curta duração.
  // A atualização de versão E o upgrade de plano (free -> full) passam pelo
  // sidecar enchat_updater (ver generateYaml), não por este botão do painel.
  // Para habilitar update in-place: dar suporte a registry auth no caminho de
  // update (pedir a chave de novo num modal dedicado, refazer o exchange,
  // então pullImageWithRegistry antes do updateServiceImage).

  release: {
    baseUrl: CONSOLE_BASE_URL,
    app: "enchat",
    edicao: "free",
    canal: "stable",
  },

  registryAuth: {
    registryHost: "ghcr.io",
    registryName: "GHCR EnchaT",
    exchangeUrl: `${CONSOLE_BASE_URL}/api/v1/installs/registry-auth`,
    licenseField: "chave_licenca",
    images: (_v, release) => {
      if (!release) throw new Error("release não resolvida antes de registryAuth.images — bug no installer.");
      return [
        `${release.imageRepo}:${release.imageTag}`,
        `${updaterRepoFrom(release.imageRepo)}:${release.imageTag}`,
        PINFY_IMAGE,
      ];
    },
  },
  fields: [
    {
      name: "url_enchat",
      label: "Domínio do painel EnchaT",
      kind: "domain",
      placeholder: "crm.suaempresa.com",
      group: "Domínios",
      helpText: "O DNS já deve apontar para esta VPS antes de instalar.",
    },
    {
      name: "chave_licenca",
      label: "Chave de licença EnchaT",
      kind: "password",
      sensitive: true,
      group: "Licença",
      helpText: "Usada para obter a credencial de download da imagem e resolver a versão mais recente. Não é gravada em disco.",
    },
  ],
  schema,
  generateSecrets: () => [
    { name: "enchat_master_key", value: randomBytes(32).toString("base64") },
    { name: "postgres_password", value: randomBytes(24).toString("hex") },
    { name: "pinfy_master_key", value: randomBytes(24).toString("hex") },
    { name: "pinfy_webhook_token", value: randomBytes(24).toString("hex") },
    { name: "pinfy_panel_password", value: randomBytes(24).toString("hex") },
    // Compartilhado entre enchat_app e enchat_updater (Authorization: Bearer) —
    // ver cmd/enchat-updater/README.md no repo do EnchaT.
    { name: "updater_token", value: randomBytes(24).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    if (!ctx.release) throw new Error("ctx.release ausente em generateYaml — bug no installer.");
    const net = ctx.networkName;
    const san = (x: unknown) => String(x ?? "").replace(/[`"\n\r]/g, "");
    const domain = san(v.url_enchat);
    const { imageRepo, imageTag } = ctx.release;
    const updaterRepo = updaterRepoFrom(imageRepo);
    return `version: "3.7"
services:

  enchat_app:
    image: ${imageRepo}:${imageTag}
    hostname: enchat-app
    networks:
      - ${net}
      - enchat_net
    volumes:
      - /var/enchat/media:/data/media
    environment:
      DATABASE_URL: "postgresql://enchat:${secrets.postgres_password}@enchat_postgres:5432/enchat?sslmode=disable"
      WHATSAPP_APP_SECRET: ""
      WHATSAPP_VERIFY_TOKEN: ""
      WHATSAPP_API_VERSION: "v21.0"
      INSTAGRAM_APP_ID: ""
      INSTAGRAM_APP_SECRET: ""
      INSTAGRAM_REDIRECT_URI: "https://${domain}/api/instagram/oauth/callback"
      INSTAGRAM_VERIFY_TOKEN: ""
      INSTAGRAM_API_VERSION: "v21.0"
      PINFY_BASE_URL: "http://enchat_pinfy:3000"
      PINFY_MASTER_KEY: "${secrets.pinfy_master_key}"
      PINFY_WEBHOOK_URL: "http://enchat_app:8080/api/webhooks/pinfy"
      PINFY_WEBHOOK_TOKEN: "${secrets.pinfy_webhook_token}"
      MAUTIC_BASE_URL: ""
      MAUTIC_USER: ""
      MAUTIC_PASSWORD: ""
      MAUTIC_WEBHOOK_TOKEN: ""
      SMS_GATEWAY_ENABLED: "false"
      SMS_GATEWAY_WEBHOOK_TOKEN: ""
      WORDPRESS_WEBHOOK_TOKEN: ""
      PUBLIC_BASE_URL: "https://${domain}"
      MEDIA_DIR: "/data/media"
      LICENSE_SERVER_URL: "${CONSOLE_BASE_URL}"
      ENCHAT_CANAL: "stable"
      ENCHAT_MASTER_KEY: "${secrets.enchat_master_key}"
      TZ: "America/Sao_Paulo"
      UPDATER_URL: "http://enchat_updater:9000"
      UPDATER_TOKEN: "${secrets.updater_token}"
      UPDATE_MODE: ""
    deploy:
      replicas: 1
      update_config:
        order: start-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 5
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.docker.network=${net}"
        - "traefik.http.routers.enchat-free.rule=Host(\`${domain}\`)"
        - "traefik.http.routers.enchat-free.entrypoints=websecure"
        - "traefik.http.routers.enchat-free.tls=true"
        - "traefik.http.routers.enchat-free.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.enchat-free-http.rule=Host(\`${domain}\`)"
        - "traefik.http.routers.enchat-free-http.entrypoints=web"
        - "traefik.http.routers.enchat-free-http.middlewares=enchat-free-https-redirect"
        - "traefik.http.middlewares.enchat-free-https-redirect.redirectscheme.scheme=https"
        - "traefik.http.middlewares.enchat-free-https-redirect.redirectscheme.permanent=true"
        - "traefik.http.services.enchat-free.loadbalancer.server.port=8080"

  # Sidecar de atualização em um clique (docker.sock) — necessário tanto para
  # "atualizar versão" quanto para o upgrade de plano (free -> full). Sem
  # arquivo .env no host (Swarm/Portainer), então as âncoras de confiança
  # (ver repoConfiavel em cmd/enchat-updater/main.go, no repo do EnchaT) vão
  # como env var explícita — nunca escolhidas pelo Console.
  enchat_updater:
    image: ${updaterRepo}:${imageTag}
    hostname: enchat-updater
    networks:
      - enchat_net
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      UPDATER_TOKEN: "${secrets.updater_token}"
      LICENSE_SERVER_URL: "${CONSOLE_BASE_URL}"
      ENCHAT_EDICAO: "free"
      ENCHAT_CANAL: "stable"
      ENCHAT_IMAGEM_PADRAO: "${imageRepo}"
      ENCHAT_IMAGEM_UPGRADE: "ghcr.io/carlosmaximiliano-cloud/enchat"
      DEPLOY_MODE: "swarm"
      SWARM_SERVICE: "enchat_enchat_app"
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == manager

  enchat_pinfy:
    image: ${PINFY_IMAGE}
    hostname: enchat-pinfy
    networks:
      - enchat_net
    environment:
      DATABASE_URL: "postgresql://enchat:${secrets.postgres_password}@enchat_postgres:5432/enchat?schema=pinfy&sslmode=disable"
      MASTER_KEY: "${secrets.pinfy_master_key}"
      PANEL_PASSWORD: "${secrets.pinfy_panel_password}"
      LICENSE_SERVER_URL: "${PINFY_LICENSE_SERVER_URL}"
      TZ: "America/Sao_Paulo"
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == manager

  enchat_postgres:
    image: pgvector/pgvector:pg16
    networks:
      - enchat_net
    volumes:
      - /var/enchat/postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: "enchat"
      POSTGRES_PASSWORD: "${secrets.postgres_password}"
      POSTGRES_DB: "enchat"
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
  enchat_net:
    driver: overlay
    attachable: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_enchat}`,
    notes: [
      "Ativação: abra o domínio e pareie pelo WhatsApp (ou digite o CPF, fluxo legado) no primeiro acesso.",
      "Guarde a ENCHAT_MASTER_KEY exibida — sem ela, os segredos gravados no banco são irrecuperáveis.",
      "O painel do Pinfy não é exposto por domínio — diagnóstico só via docker exec no container enchat_pinfy.",
    ],
  },
};
