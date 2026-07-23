import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_hoppscotch_frontend: fqdn,
  url_hoppscotch_admin: fqdn,
  url_hoppscotch_backend: fqdn,
  hoppscotch_smtp_email: email,
  hoppscotch_smtp_user: z.string().min(1),
  hoppscotch_smtp_pass: z.string().min(1),
  hoppscotch_smtp_host: z.string().min(1),
  hoppscotch_smtp_port: portNum,
});

export const hoppscotch: StackDefinition = {
  id: "hoppscotch",
  repoUrl: "https://github.com/hoppscotch/hoppscotch",
  logoUrl: "https://raw.githubusercontent.com/hoppscotch/hoppscotch/main/public/logo.svg",
  name: "Hoppscotch",
  description: "Postman alternativo, leve e web-based.",
  category: "communication",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["hoppscotch"],
  optionNumber: 59,
  installVia: "panel",
  fields: [
    { name: "url_hoppscotch_frontend", label: "Domínio da Interface Principal", kind: "domain", placeholder: "hop.suaempresa.com", group: "Domínios" },
    { name: "url_hoppscotch_admin", label: "Domínio do Painel Admin", kind: "domain", placeholder: "admin-hop.suaempresa.com", group: "Domínios" },
    { name: "url_hoppscotch_backend", label: "Domínio do Backend/API", kind: "domain", placeholder: "api-hop.suaempresa.com", group: "Domínios" },
    { name: "hoppscotch_smtp_email", label: "E-mail de envio SMTP", kind: "email", group: "SMTP" },
    { name: "hoppscotch_smtp_user", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "hoppscotch_smtp_pass", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "hoppscotch_smtp_host", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "hoppscotch_smtp_port", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key", value: randomBytes(16).toString("hex") },
    { name: "jwt_secret_key", value: randomBytes(16).toString("hex") },
    { name: "session_secret_key", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const smtpSecure = Number(v.hoppscotch_smtp_port) === 465 ? "true" : "false";
    return `version: "3.8"
services:

  hoppscotch_app:
    image: hoppscotch/hoppscotch-frontend:latest

    networks:
      - ${net}

    environment:
      - VITE_BASE_URL=https://${v.url_hoppscotch_frontend}
      - VITE_SHORTCODE_BASE_URL=https://${v.url_hoppscotch_frontend}
      - VITE_ADMIN_URL=https://${v.url_hoppscotch_admin}
      - VITE_BACKEND_GQL_URL=https://${v.url_hoppscotch_backend}/graphql
      - VITE_BACKEND_WS_URL=wss://${v.url_hoppscotch_backend}/graphql
      - VITE_BACKEND_API_URL=https://${v.url_hoppscotch_backend}/v1
      - VITE_ALLOWED_AUTH_PROVIDERS=EMAIL
      - VITE_APP_TOS_LINK=https://docs.hoppscotch.io/support/terms
      - VITE_APP_PRIVACY_POLICY_LINK=https://docs.hoppscotch.io/support/privacy
      - ENABLE_SUBPATH_BASED_ACCESS=false

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.hoppscotch_app.rule=Host(\`${v.url_hoppscotch_frontend}\`)
        - traefik.http.routers.hoppscotch_app.entrypoints=websecure
        - traefik.http.routers.hoppscotch_app.priority=1
        - traefik.http.routers.hoppscotch_app.tls.certresolver=letsencryptresolver
        - traefik.http.routers.hoppscotch_app.service=hoppscotch_app
        - traefik.http.services.hoppscotch_app.loadbalancer.server.port=3000
        - traefik.http.services.hoppscotch_app.loadbalancer.passHostHeader=true

  hoppscotch_admin:
    image: hoppscotch/hoppscotch-admin:latest

    networks:
      - ${net}

    environment:
      - VITE_BASE_URL=https://${v.url_hoppscotch_frontend}
      - VITE_SHORTCODE_BASE_URL=https://${v.url_hoppscotch_frontend}
      - VITE_ADMIN_URL=https://${v.url_hoppscotch_admin}
      - VITE_BACKEND_GQL_URL=https://${v.url_hoppscotch_backend}/graphql
      - VITE_BACKEND_WS_URL=wss://${v.url_hoppscotch_backend}/graphql
      - VITE_BACKEND_API_URL=https://${v.url_hoppscotch_backend}/v1
      - VITE_ALLOWED_AUTH_PROVIDERS=EMAIL
      - VITE_APP_TOS_LINK=https://docs.hoppscotch.io/support/terms
      - VITE_APP_PRIVACY_POLICY_LINK=https://docs.hoppscotch.io/support/privacy
      - ENABLE_SUBPATH_BASED_ACCESS=false

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.hoppscotch_admin.rule=Host(\`${v.url_hoppscotch_admin}\`)
        - traefik.http.routers.hoppscotch_admin.entrypoints=websecure
        - traefik.http.routers.hoppscotch_admin.priority=1
        - traefik.http.routers.hoppscotch_admin.tls.certresolver=letsencryptresolver
        - traefik.http.routers.hoppscotch_admin.service=hoppscotch_admin
        - traefik.http.services.hoppscotch_admin.loadbalancer.server.port=3100
        - traefik.http.services.hoppscotch_admin.loadbalancer.passHostHeader=true

  hoppscotch_backend:
    image: hoppscotch/hoppscotch-backend:latest

    networks:
      - ${net}

    environment:
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/hoppscotch
      - REDIRECT_URL=https://${v.url_hoppscotch_frontend}
      - WHITELISTED_ORIGINS=https://${v.url_hoppscotch_frontend},https://${v.url_hoppscotch_admin}
      - VITE_BASE_URL=https://${v.url_hoppscotch_frontend}
      - VITE_ADMIN_URL=https://${v.url_hoppscotch_admin}
      - VITE_ALLOWED_AUTH_PROVIDERS=EMAIL
      - MAILER_SMTP_ENABLE=true
      - MAILER_USE_CUSTOM_CONFIGS=true
      - MAILER_ADDRESS_FROM=${v.hoppscotch_smtp_email}
      - MAILER_SMTP_USER=${v.hoppscotch_smtp_user}
      - MAILER_SMTP_PASSWORD=${v.hoppscotch_smtp_pass}
      - MAILER_SMTP_HOST=${v.hoppscotch_smtp_host}
      - MAILER_SMTP_PORT=${v.hoppscotch_smtp_port}
      - MAILER_SMTP_SECURE=${smtpSecure}
      - MAILER_TLS_REJECT_UNAUTHORIZED=true
      - DATA_ENCRYPTION_KEY=${secrets.encryption_key}
      - JWT_SECRET=${secrets.jwt_secret_key}
      - TOKEN_SALT_COMPLEXITY=10
      - MAGIC_LINK_TOKEN_VALIDITY=3
      - REFRESH_TOKEN_VALIDITY=604800000
      - ACCESS_TOKEN_VALIDITY=86400000
      - SESSION_SECRET=${secrets.session_secret_key}
      - ALLOW_SECURE_COOKIES=true
      - RATE_LIMIT_TTL=60
      - RATE_LIMIT_MAX=100
      - GOOGLE_CLIENT_ID=disabled
      - GOOGLE_CLIENT_SECRET=disabled
      - GOOGLE_CALLBACK_URL=https://${v.url_hoppscotch_backend}/v1/auth/google/callback
      - GOOGLE_SCOPE=email,profile
      - GITHUB_CLIENT_ID=disabled
      - GITHUB_CLIENT_SECRET=disabled
      - GITHUB_CALLBACK_URL=https://${v.url_hoppscotch_backend}/v1/auth/github/callback
      - GITHUB_SCOPE=user:email
      - MICROSOFT_CLIENT_ID=disabled
      - MICROSOFT_CLIENT_SECRET=disabled
      - MICROSOFT_CALLBACK_URL=https://${v.url_hoppscotch_backend}/v1/auth/microsoft/callback
      - MICROSOFT_SCOPE=user.read
      - MICROSOFT_TENANT=common

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.hoppscotch_backend.rule=Host(\`${v.url_hoppscotch_backend}\`)
        - traefik.http.routers.hoppscotch_backend.entrypoints=websecure
        - traefik.http.routers.hoppscotch_backend.priority=1
        - traefik.http.routers.hoppscotch_backend.tls.certresolver=letsencryptresolver
        - traefik.http.routers.hoppscotch_backend.service=hoppscotch_backend
        - traefik.http.services.hoppscotch_backend.loadbalancer.server.port=3170
        - traefik.http.services.hoppscotch_backend.loadbalancer.passHostHeader=true

  hoppscotch_migrate:
    image: hoppscotch/hoppscotch-backend:latest
    command: sh -c "sleep 30 && pnpx prisma migrate deploy"

    networks:
      - ${net}

    environment:
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/hoppscotch

    deploy:
      mode: replicated
      replicas: 1
      restart_policy:
        condition: none
      placement:
        constraints:
          - node.role == manager

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_hoppscotch_frontend: string }).url_hoppscotch_frontend}`,
  },
};
