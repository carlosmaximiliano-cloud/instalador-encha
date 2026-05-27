import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_tooljet: fqdn,
  email_smtp_tooljet: email,
  usuario_smtp_tooljet: z.string().min(1),
  senha_smtp_tooljet: z.string().min(1),
  host_smtp_tooljet: z.string().min(1),
  porta_smtp_tooljet: portNum,
});

export const tooljet: StackDefinition = {
  id: "tooljet",
  repoUrl: "https://github.com/ToolJet/ToolJet",
  name: "ToolJet",
  description: "Construa apps internos low-code com drag-and-drop.",
  category: "admin",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer", "postgres", "redis"],
  optionNumber: 73,
  installVia: "panel",
  fields: [
    { name: "url_tooljet", label: "Domínio do ToolJet", kind: "domain", placeholder: "tooljet.encha.ai", group: "Domínios" },
    { name: "email_smtp_tooljet", label: "E-mail SMTP", kind: "email", group: "SMTP" },
    { name: "host_smtp_tooljet", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_tooljet", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
    { name: "usuario_smtp_tooljet", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_smtp_tooljet", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "master_key", value: randomBytes(16).toString("hex") },
    { name: "secret_key", value: randomBytes(16).toString("hex") },
    { name: "jwt_key", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  tooljet_app:
    image: tooljet/tooljet:ee-lts-latest
    command: npm run start:prod
    networks:
      - ${net}
    environment:
      - TOOLJET_HOST=https://${v.url_tooljet}
      - SERVE_CLIENT=true
      - PORT=80
      - DISABLE_SIGNUPS=false
      - ENABLE_ONBOARDING_QUESTIONS_FOR_ALL_SIGN_UPS=true
      - LOCKBOX_MASTER_KEY=${secrets.master_key}
      - SECRET_KEY_BASE=${secrets.secret_key}
      - DATABASE_URL=postgres://postgres:${secrets.senha_postgres}@postgres:5432/tooljet_app?sslmode=disable
      - ENABLE_TOOLJET_DB=true
      - TOOLJET_DB=tooljet
      - TOOLJET_DB_USER=postgres
      - TOOLJET_DB_HOST=postgres
      - TOOLJET_DB_PASS=${secrets.senha_postgres}
      - PGRST_HOST=tooljet_postgrest
      - PGRST_JWT_SECRET=${secrets.jwt_key}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - CHROMA_DB_URL=http://tooljet_chroma:8000
      - DEFAULT_FROM_EMAIL=${v.email_smtp_tooljet}
      - SMTP_USERNAME=${v.usuario_smtp_tooljet}
      - SMTP_PASSWORD=${v.senha_smtp_tooljet}
      - SMTP_DOMAIN=${v.host_smtp_tooljet}
      - SMTP_PORT=${v.porta_smtp_tooljet}
      - COMMENT_FEATURE_ENABLE=true
      - ENABLE_MULTIPLAYER_EDITING=true
      - ENABLE_MARKETPLACE_FEATURE=true
      - CHECK_FOR_UPDATES=false
      - USER_SESSION_EXPIRY=120
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "2"
          memory: 4096M
      labels:
        - traefik.enable=true
        - traefik.http.routers.tooljet.rule=Host(\`${v.url_tooljet}\`)
        - traefik.http.services.tooljet.loadbalancer.server.port=80
        - traefik.http.routers.tooljet.service=tooljet
        - traefik.http.routers.tooljet.tls.certresolver=letsencryptresolver
        - traefik.http.routers.tooljet.entrypoints=websecure
        - traefik.http.routers.tooljet.tls=true

  tooljet_postgrest:
    image: postgrest/postgrest:v12.0.2
    networks:
      - ${net}
    environment:
      - PGRST_SERVER_PORT=80
      - PGRST_DB_URI=postgres://postgres:${secrets.senha_postgres}@postgres:5432/tooljet_app?sslmode=disable
      - PGRST_DB_SCHEMA=public
      - PGRST_DB_ANON_ROLE=anon
      - PGRST_JWT_SECRET=${secrets.jwt_key}
      - PGRST_JWT_AUD=tooljet
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

  tooljet_chroma:
    image: chromadb/chroma:latest
    volumes:
      - tooljet_chromadb:/chroma
    networks:
      - ${net}
    environment:
      - CHROMA_HOST_PORT=8000
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

volumes:
  tooljet_chromadb:
    external: true
    name: tooljet_chromadb

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_tooljet: string }).url_tooljet}`,
    notes: ["Crie sua conta no primeiro acesso."],
  },
};
