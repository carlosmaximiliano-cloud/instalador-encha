import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";

const boolStr = z.enum(["true", "false"]);

const schema = z.object({
  url_unoapi: fqdn,
  url_chatwoot_uno: fqdn,
  token_chatwoot_uno: z.string().min(1, "Informe o token do Chatwoot"),
  op_1: boolStr,
  op_2: boolStr,
  op_3: boolStr,
  op_4: boolStr,
  op_5: boolStr,
  op_6: boolStr,
  url_s3: fqdn,
  s3_access_key: z.string().min(1),
  s3_secret_key: z.string().min(1),
  user_rabbit_mqs: username,
  senha_rabbit_mqs: z.string().min(1),
});

export const unoapi: StackDefinition = {
  id: "unoapi",
  repoUrl: "https://github.com/clairton/unoapi-cloud",
  logoUrl: "https://raw.githubusercontent.com/clairton/unoapi-cloud/main/public/logo.svg",
  name: "UnoAPI",
  description: "Gateway WhatsApp Cloud + Baileys com fila Redis.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer", "redis", "rabbitmq", "minio", "chatwoot"],
  optionNumber: 67,
  installVia: "panel",
  fields: [
    { name: "url_unoapi", label: "Domínio da Uno API", kind: "domain", placeholder: "unoapi.suaempresa.com", group: "Domínios" },
    { name: "url_chatwoot_uno", label: "Domínio do Chatwoot", kind: "domain", placeholder: "chatwoot.suaempresa.com", group: "Domínios" },
    { name: "token_chatwoot_uno", label: "Token administrador Chatwoot", kind: "password", sensitive: true, group: "Chatwoot" },
    { name: "op_1", label: "Ignorar mensagens de grupos", kind: "text", placeholder: "true ou false", default: "true", group: "Comportamento" },
    { name: "op_2", label: "Ignorar status de transmissão", kind: "text", placeholder: "true ou false", default: "true", group: "Comportamento" },
    { name: "op_3", label: "Ignorar mensagens de transmissão", kind: "text", placeholder: "true ou false", default: "true", group: "Comportamento" },
    { name: "op_4", label: "Ignorar mensagem de status", kind: "text", placeholder: "true ou false", default: "true", group: "Comportamento" },
    { name: "op_5", label: "Ignorar próprias mensagens", kind: "text", placeholder: "true ou false", default: "true", group: "Comportamento" },
    { name: "op_6", label: "Enviar status de conexão", kind: "text", placeholder: "true ou false", default: "true", group: "Comportamento" },
    { name: "url_s3", label: "Endpoint S3 (MinIO)", kind: "domain", placeholder: "s3.suaempresa.com", group: "MinIO/S3" },
    { name: "s3_access_key", label: "Access Key MinIO", kind: "text", sensitive: true, group: "MinIO/S3" },
    { name: "s3_secret_key", label: "Secret Key MinIO", kind: "password", sensitive: true, group: "MinIO/S3" },
    { name: "user_rabbit_mqs", label: "Usuário RabbitMQ", kind: "username", group: "RabbitMQ" },
    { name: "senha_rabbit_mqs", label: "Senha RabbitMQ", kind: "password", sensitive: true, group: "RabbitMQ" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  unoapi:
    image: clairton/unoapi-cloud:latest
    entrypoint: yarn cloud
    volumes:
      - unoapi_data:/home/u/app
    networks:
      - ${net}
    environment:
      - BASE_URL=https://${v.url_unoapi}
      - UNOAPI_AUTH_TOKEN=any
      - IGNORE_GROUP_MESSAGES=${v.op_1}
      - IGNORE_BROADCAST_STATUSES=${v.op_2}
      - IGNORE_BROADCAST_MESSAGES=${v.op_3}
      - IGNORE_STATUS_MESSAGE=${v.op_4}
      - IGNORE_OWN_MESSAGES=${v.op_5}
      - REJECT_CALLS=
      - REJECT_CALLS_WEBHOOK=
      - SEND_CONNECTION_STATUS=${v.op_6}
      - WEBHOOK_URL=https://${v.url_chatwoot_uno}/webhooks/whatsapp
      - WEBHOOK_HEADER=api_access_token
      - WEBHOOK_TOKEN=${v.token_chatwoot_uno}
      - STORAGE_ENDPOINT=https://${v.url_s3}
      - STORAGE_ACCESS_KEY_ID=${v.s3_access_key}
      - STORAGE_SECRET_ACCESS_KEY=${v.s3_secret_key}
      - STORAGE_BUCKET_NAME=unoapi
      - STORAGE_FORCE_PATH_STYLE=true
      - AMQP_URL=amqp://${v.user_rabbit_mqs}:${v.senha_rabbit_mqs}@rabbitmq:5672/unoapi
      - REDIS_URL=redis://redis:6379
      - LOG_LEVEL=debug
      - UNO_LOG_LEVEL=debug
      - UNOAPI_RETRY_REQUEST_DELAY=1_000
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M
      labels:
        - traefik.enable=true
        - traefik.http.routers.unoapi.rule=Host(\`${v.url_unoapi}\`)
        - traefik.http.routers.unoapi.entrypoints=websecure
        - traefik.http.routers.unoapi.tls.certresolver=letsencryptresolver
        - traefik.http.services.unoapi.loadbalancer.server.port=9876
        - traefik.http.routers.unoapi.priority=1
        - traefik.http.services.unoapi.loadbalancer.passHostHeader=true
        - traefik.http.routers.unoapi.service=unoapi

volumes:
  unoapi_data:
    external: true
    name: unoapi_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_unoapi: string }).url_unoapi}`,
    notes: [
      "Auth Token padrão: any",
      "Endpoint de health-check: /ping",
    ],
  },
};
