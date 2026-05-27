import { z } from "zod";
import { type StackDefinition, fqdn, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_lowcoder: fqdn,
  user_mongodb_lowcoder: z.string().min(1),
  pass_mongodb_lowcoder: z.string().min(1),
  email_smtp_lowcoder: z.string().min(1),
  user_smtp_lowcoder: z.string().min(1),
  senha_smtp_lowcoder: z.string().min(1),
  host_smtp_lowcoder: z.string().min(1),
  porta_smtp_lowcoder: portNum,
});

export const lowcoder: StackDefinition = {
  id: "lowcoder",
  repoUrl: "https://github.com/lowcoder-org/lowcoder",
  name: "Lowcoder",
  description: "Retool open-source — apps low-code colaborativos.",
  category: "admin",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer", "redis"],
  optionNumber: 47,
  installVia: "panel",
  fields: [
    { name: "url_lowcoder", label: "Domínio do Lowcoder", kind: "domain", placeholder: "low.encha.ai", group: "Domínios" },
    { name: "user_mongodb_lowcoder", label: "Usuário MongoDB", kind: "username", group: "MongoDB" },
    { name: "pass_mongodb_lowcoder", label: "Senha MongoDB", kind: "password", sensitive: true, group: "MongoDB" },
    { name: "email_smtp_lowcoder", label: "E-mail remetente", kind: "email", group: "SMTP" },
    { name: "host_smtp_lowcoder", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_lowcoder", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
    { name: "user_smtp_lowcoder", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_smtp_lowcoder", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key1", value: randomBytes(16).toString("hex") },
    { name: "encryption_key2", value: randomBytes(16).toString("hex") },
    { name: "api_key_secret", value: randomBytes(32).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const smtpSsl = v.porta_smtp_lowcoder === 465 ? "true" : "false";
    const smtpStarttls = v.porta_smtp_lowcoder === 465 ? "false" : "true";
    return `version: "3.7"
services:

  lowcoder_api:
    image: lowcoderorg/lowcoder-ce-api-service:latest
    networks:
      - ${net}
    environment:
      - LOWCODER_PUID=9001
      - LOWCODER_PGID=9001
      - LOWCODER_MONGODB_URL=mongodb://${v.user_mongodb_lowcoder}:${v.pass_mongodb_lowcoder}@lowcoder_mongodb:27017/lowcoder?authSource=admin&readPreference=primary&ssl=false&directConnection=true
      - LOWCODER_REDIS_URL=redis://redis:6379
      - LOWCODER_NODE_SERVICE_URL=http://lowcoder_node:6060
      - LOWCODER_MAX_QUERY_TIMEOUT=120
      - LOWCODER_EMAIL_AUTH_ENABLED=true
      - LOWCODER_EMAIL_SIGNUP_ENABLED=true
      - LOWCODER_CREATE_WORKSPACE_ON_SIGNUP=true
      - LOWCODER_WORKSPACE_MODE=SAAS
      - LOWCODER_DB_ENCRYPTION_PASSWORD=${secrets.encryption_key1}
      - LOWCODER_DB_ENCRYPTION_SALT=${secrets.encryption_key2}
      - LOWCODER_API_KEY_SECRET=${secrets.api_key_secret}
      - LOWCODER_CORS_DOMAINS=*
      - LOWCODER_MAX_ORGS_PER_USER=100
      - LOWCODER_MAX_MEMBERS_PER_ORG=1000
      - LOWCODER_MAX_GROUPS_PER_ORG=100
      - LOWCODER_MAX_APPS_PER_ORG=1000
      - LOWCODER_MAX_DEVELOPERS=50
      - LOWCODER_ADMIN_SMTP_HOST=${v.host_smtp_lowcoder}
      - LOWCODER_ADMIN_SMTP_PORT=${v.porta_smtp_lowcoder}
      - LOWCODER_ADMIN_SMTP_USERNAME=${v.user_smtp_lowcoder}
      - LOWCODER_ADMIN_SMTP_PASSWORD=${v.senha_smtp_lowcoder}
      - LOWCODER_ADMIN_SMTP_AUTH=true
      - LOWCODER_ADMIN_SMTP_SSL_ENABLED=${smtpSsl}
      - LOWCODER_ADMIN_SMTP_STARTTLS_ENABLED=${smtpStarttls}
      - LOWCODER_ADMIN_SMTP_STARTTLS_REQUIRED=${smtpStarttls}
      - LOWCODER_EMAIL_NOTIFICATIONS_SENDER=${v.email_smtp_lowcoder}
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

  lowcoder_node:
    image: lowcoderorg/lowcoder-ce-node-service:latest
    networks:
      - ${net}
    environment:
      - LOWCODER_PUID=9001
      - LOWCODER_PGID=9001
      - LOWCODER_API_SERVICE_URL=http://lowcoder_api:8080
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "0.5"
          memory: 1024M

  lowcoder_frontend:
    image: lowcoderorg/lowcoder-ce-frontend:latest
    volumes:
      - lowcoder_assets:/lowcoder/assets
    networks:
      - ${net}
    environment:
      - LOWCODER_PUID=9001
      - LOWCODER_PGID=9001
      - LOWCODER_MAX_REQUEST_SIZE=20m
      - LOWCODER_MAX_QUERY_TIMEOUT=120
      - LOWCODER_API_SERVICE_URL=http://lowcoder_api:8080
      - LOWCODER_NODE_SERVICE_URL=http://lowcoder_node:6060
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.lowcoder.rule=Host(\`${v.url_lowcoder}\`) && PathPrefix(\`/\`)
        - traefik.http.services.lowcoder.loadbalancer.server.port=3000
        - traefik.http.routers.lowcoder.service=lowcoder
        - traefik.http.routers.lowcoder.entrypoints=websecure
        - traefik.http.routers.lowcoder.tls.certresolver=letsencryptresolver
        - traefik.http.routers.lowcoder.tls=true

volumes:
  lowcoder_assets:
    external: true
    name: lowcoder_assets

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_lowcoder: string }).url_lowcoder}`,
    notes: ["Crie seu usuário no primeiro acesso."],
  },
};
