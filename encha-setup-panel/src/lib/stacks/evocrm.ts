import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

// Imagens fixadas em 1.0.0-rc2 — a versão que o upstream (evolution-foundation/
// evo-crm-community) tagueia como "release" atual do monorepo. Todas públicas
// no Docker Hub (sem precisar de registryAuth).
//
// ⚠️ Mesma armadilha de nomenclatura da Evolution API: a tag GIT leva "v"
// (v1.0.0-rc2), a tag DOCKER não (1.0.0-rc2).
export const EVOCRM_GATEWAY_IMAGE = "evoapicloud/evo-crm-gateway:1.0.0-rc2";
export const EVOCRM_AUTH_IMAGE = "evoapicloud/evo-auth-service-community:1.0.0-rc2";
export const EVOCRM_CRM_IMAGE = "evoapicloud/evo-ai-crm-community:1.0.0-rc2";
export const EVOCRM_CORE_IMAGE = "evoapicloud/evo-ai-core-service-community:1.0.0-rc2";
export const EVOCRM_PROCESSOR_IMAGE = "evoapicloud/evo-ai-processor-community:1.0.0-rc2";
export const EVOCRM_BOT_RUNTIME_IMAGE = "evoapicloud/evo-bot-runtime:1.0.0-rc2";
export const EVOCRM_FRONTEND_IMAGE = "evoapicloud/evo-ai-frontend-community:1.0.0-rc2";
export const EVOCRM_REDIS_IMAGE = "redis:8-alpine";

// Fernet key: 32 bytes aleatórios em base64 URL-safe — é o formato que o
// processor (Python/cryptography.Fernet) espera para ENCRYPTION_KEY. Gerar
// como hex quebraria o serviço no boot (Fernet exige exatamente esse formato).
function fernetKey(): string {
  return randomBytes(32).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}

const schema = z.object({
  url_api: fqdn,
  url_frontend: fqdn,
  smtp_host: z.string().optional(),
  smtp_port: portNum.optional(),
  smtp_user: z.string().optional(),
  smtp_pass: z.string().optional(),
  smtp_from: email.optional(),
});

export const evocrm: StackDefinition = {
  id: "evocrm",
  repoUrl: "https://github.com/evolution-foundation/evo-crm-community",
  logoUrl: "https://raw.githubusercontent.com/evolution-foundation/evo-crm-community/main/public/hover-evolution.png",
  name: "Evo CRM Community",
  description:
    "Plataforma de atendimento com IA da Evolution Foundation — CRM, agentes de IA, auth e frontend. Edição community (rc2), sem o módulo de Segments/campanhas (EvoFlow).",
  category: "crm",
  icon: "headphones",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["evocrm"],
  // O processor usa pgvector (busca semântica de conhecimento) — a extensão
  // não vem das migrations Rails, então garantimos aqui.
  postgresExtensions: [{ database: "evocrm", extensions: ["vector"] }],
  optionNumber: 85,
  installVia: "panel",
  externalVolumes: ["evocrm_redis", "evocrm_processor_logs", "evocrm_storage", "evoauth_storage"],
  updatableImages: [
    { service: "evocrm_gateway", image: EVOCRM_GATEWAY_IMAGE },
    { service: "evocrm_auth", image: EVOCRM_AUTH_IMAGE },
    { service: "evocrm_auth_sidekiq", image: EVOCRM_AUTH_IMAGE },
    { service: "evocrm_crm", image: EVOCRM_CRM_IMAGE },
    { service: "evocrm_crm_sidekiq", image: EVOCRM_CRM_IMAGE },
    { service: "evocrm_core", image: EVOCRM_CORE_IMAGE },
    { service: "evocrm_processor", image: EVOCRM_PROCESSOR_IMAGE },
    { service: "evocrm_bot_runtime", image: EVOCRM_BOT_RUNTIME_IMAGE },
    { service: "evocrm_frontend", image: EVOCRM_FRONTEND_IMAGE },
    { service: "evocrm_redis", image: EVOCRM_REDIS_IMAGE },
  ],
  fields: [
    {
      name: "url_api",
      label: "Domínio da API (gateway)",
      kind: "domain",
      placeholder: "api-crm.suaempresa.com",
      group: "Domínios",
      helpText: "O DNS já deve apontar para esta VPS antes de instalar.",
    },
    {
      name: "url_frontend",
      label: "Domínio do painel CRM",
      kind: "domain",
      placeholder: "crm.suaempresa.com",
      group: "Domínios",
      helpText: "O DNS já deve apontar para esta VPS antes de instalar.",
    },
    {
      name: "smtp_host",
      label: "Host SMTP",
      kind: "text",
      placeholder: "smtp.hostinger.com",
      optional: true,
      helpText: "Opcional — necessário para convites de equipe e reset de senha.",
      group: "E-mail (opcional)",
    },
    {
      name: "smtp_port",
      label: "Porta SMTP",
      kind: "port",
      placeholder: "587",
      optional: true,
      group: "E-mail (opcional)",
    },
    {
      name: "smtp_user",
      label: "Usuário SMTP",
      kind: "text",
      optional: true,
      group: "E-mail (opcional)",
    },
    {
      name: "smtp_pass",
      label: "Senha SMTP",
      kind: "password",
      sensitive: true,
      optional: true,
      group: "E-mail (opcional)",
    },
    {
      name: "smtp_from",
      label: "E-mail remetente",
      kind: "email",
      placeholder: "nao-responda@suaempresa.com",
      optional: true,
      group: "E-mail (opcional)",
    },
  ],
  schema,
  generateSecrets: () => [
    { name: "secret_key_base", value: randomBytes(64).toString("hex") },
    { name: "jwt_secret_key", value: randomBytes(32).toString("hex") },
    { name: "evoai_crm_api_token", value: randomBytes(32).toString("hex") },
    { name: "doorkeeper_jwt_secret", value: randomBytes(32).toString("hex") },
    { name: "encryption_key", value: fernetKey() },
    { name: "bot_runtime_secret", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const san = (x: unknown) => String(x ?? "").replace(/[`"\n\r]/g, "");
    const apiUrl = san(v.url_api);
    const frontendUrl = san(v.url_frontend);

    // Bloco SMTP condicional — igual ao padrão de infisical.ts. Vazio = sem
    // envio de e-mail, que é o comportamento default do upstream (as envs de
    // e-mail vêm em branco no compose oficial quando não usadas).
    const smtpBlock = v.smtp_host
      ? `
      - SMTP_DOMAIN=${san(v.smtp_from).split("@")[1] ?? ""}
      - MAILER_SENDER_EMAIL=${san(v.smtp_from)}
      - SMTP_USERNAME=${san(v.smtp_user)}
      - SMTP_PASSWORD=${san(v.smtp_pass)}
      - SMTP_ADDRESS=${san(v.smtp_host)}
      - SMTP_PORT=${v.smtp_port ?? 587}
      - SMTP_AUTHENTICATION=plain
      - SMTP_ENABLE_STARTTLS_AUTO=true`
      : "";

    // Repetido em evocrm_auth e evocrm_auth_sidekiq — igual ao compose oficial.
    const authCommonEnv = `
    ## ⚙️ Rails (ambiente)
      - RAILS_ENV=production

    ## 🔐 Segredos e tokens — mesmo valor nos dois serviços de auth
      - SECRET_KEY_BASE=${secrets.secret_key_base}
      - JWT_SECRET_KEY=${secrets.jwt_secret_key}
      - EVOAI_CRM_API_TOKEN=${secrets.evoai_crm_api_token}

    ## 🗄️ PostgreSQL
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=${secrets.senha_postgres}
      - POSTGRES_DATABASE=evocrm
      - POSTGRES_SSLMODE=disable

    ## 🧊 Redis
      - REDIS_URL=redis://evocrm_redis:6379/1

    ## 🌐 URLs públicas e CORS
      - FRONTEND_URL=https://${frontendUrl}
      - BACKEND_URL=https://${apiUrl}
      - CORS_ORIGINS=https://${frontendUrl},https://${apiUrl}

    ## ✉️ E-mail (Mailer + SMTP) — opcional${smtpBlock}

    ## 🛂 Doorkeeper (OAuth / JWT)
      - DOORKEEPER_JWT_SECRET_KEY=${secrets.doorkeeper_jwt_secret}
      - DOORKEEPER_JWT_ALGORITHM=hs256
      - DOORKEEPER_JWT_ISS=evo-auth-service

    ## 🔑 MFA e filas
      - MFA_ISSUER=EvoCRM
      - SIDEKIQ_CONCURRENCY=10

    ## 🗂️ Storage — mídia gravada em disco (volumes locais)
      - ACTIVE_STORAGE_SERVICE=local
      - ACTIVE_STORAGE_URL=https://${apiUrl}

      - OAUTH_TOKEN_EXPIRES_IN=28800`;

    return `version: "3.7"
services:

  evocrm_gateway:
    image: ${EVOCRM_GATEWAY_IMAGE}
    networks:
      - ${net}
    environment:
      - AUTH_UPSTREAM=evocrm_auth:3001
      - CRM_UPSTREAM=evocrm_crm:3000
      - CORE_UPSTREAM=evocrm_core:5555
      - PROCESSOR_UPSTREAM=evocrm_processor:8000
      - BOT_RUNTIME_UPSTREAM=evocrm_bot_runtime:8080
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.evocrm_gateway.rule=Host(\`${apiUrl}\`)
        - traefik.http.routers.evocrm_gateway.entrypoints=websecure
        - traefik.http.routers.evocrm_gateway.priority=1
        - traefik.http.routers.evocrm_gateway.tls.certresolver=letsencryptresolver
        - traefik.http.routers.evocrm_gateway.service=evocrm_gateway
        - traefik.http.services.evocrm_gateway.loadbalancer.server.port=3030
        - traefik.http.services.evocrm_gateway.loadbalancer.passHostHeader=true

  evocrm_auth:
    image: ${EVOCRM_AUTH_IMAGE}
    command: bash -c "bundle exec rails db:migrate 2>&1 || echo 'Migration had errors, continuing...'; bundle exec rails s -p 3001 -b 0.0.0.0"
    networks:
      - ${net}
    environment:${authCommonEnv}
    volumes:
      - evoauth_storage:/app/storage
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  evocrm_auth_sidekiq:
    image: ${EVOCRM_AUTH_IMAGE}
    command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"]
    networks:
      - ${net}
    environment:${authCommonEnv}
    volumes:
      - evoauth_storage:/app/storage
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  evocrm_crm:
    image: ${EVOCRM_CRM_IMAGE}
    command: bash -c "bundle exec rails db:migrate 2>&1 || echo 'Migration had errors, continuing...'; bundle exec rails s -p 3000 -b 0.0.0.0"
    networks:
      - ${net}
    environment:
      - RAILS_ENV=production
      - RAILS_SERVE_STATIC_FILES=true
      - RAILS_LOG_TO_STDOUT=true
      - SECRET_KEY_BASE=${secrets.secret_key_base}
      - JWT_SECRET_KEY=${secrets.jwt_secret_key}
      - EVOAI_CRM_API_TOKEN=${secrets.evoai_crm_api_token}
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=${secrets.senha_postgres}
      - POSTGRES_DATABASE=evocrm
      - POSTGRES_SSLMODE=disable
      - REDIS_URL=redis://evocrm_redis:6379/1
      - EVO_AUTH_SERVICE_URL=http://evocrm_auth:3001
      - EVO_AI_CORE_SERVICE_URL=http://evocrm_core:5555
      ## 🔀 EvoFlow (Segments/campanhas) — desligado nesta edição.
      - EVO_FLOW_ENABLED=false
      - BACKEND_URL=https://${apiUrl}
      - FRONTEND_URL=https://${frontendUrl}
      - CORS_ORIGINS=https://${frontendUrl},https://${apiUrl}
      - DISABLE_TELEMETRY=true
      - LOG_LEVEL=info
      - ENABLE_ACCOUNT_SIGNUP=true
      - ENABLE_PUSH_RELAY_SERVER=true
      - ENABLE_INBOX_EVENTS=true
      - BOT_RUNTIME_URL=http://evocrm_bot_runtime:8080
      - BOT_RUNTIME_SECRET=${secrets.bot_runtime_secret}
      - BOT_RUNTIME_POSTBACK_BASE_URL=http://evocrm_crm:3000
      - ACTIVE_STORAGE_SERVICE=local
      - ACTIVE_STORAGE_URL=https://${apiUrl}${smtpBlock}
    volumes:
      - evocrm_storage:/app/storage
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  evocrm_crm_sidekiq:
    image: ${EVOCRM_CRM_IMAGE}
    command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"]
    networks:
      - ${net}
    environment:
      - RAILS_ENV=production
      - SECRET_KEY_BASE=${secrets.secret_key_base}
      - JWT_SECRET_KEY=${secrets.jwt_secret_key}
      - EVOAI_CRM_API_TOKEN=${secrets.evoai_crm_api_token}
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=${secrets.senha_postgres}
      - POSTGRES_DATABASE=evocrm
      - POSTGRES_SSLMODE=disable
      - REDIS_URL=redis://evocrm_redis:6379/1
      - EVO_AUTH_SERVICE_URL=http://evocrm_auth:3001
      - EVO_AI_CORE_SERVICE_URL=http://evocrm_core:5555
      - EVO_FLOW_ENABLED=false
      - BACKEND_URL=https://${apiUrl}
      - FRONTEND_URL=https://${frontendUrl}
      - CORS_ORIGINS=https://${frontendUrl},https://${apiUrl}
      - BOT_RUNTIME_URL=http://evocrm_bot_runtime:8080
      - BOT_RUNTIME_SECRET=${secrets.bot_runtime_secret}
      - BOT_RUNTIME_POSTBACK_BASE_URL=http://evocrm_crm:3000
      - ACTIVE_STORAGE_SERVICE=local
      - ACTIVE_STORAGE_URL=https://${apiUrl}${smtpBlock}
    volumes:
      - evocrm_storage:/app/storage
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  evocrm_core:
    image: ${EVOCRM_CORE_IMAGE}
    networks:
      - ${net}
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=${secrets.senha_postgres}
      - DB_NAME=evocrm
      - SECRET_KEY_BASE=${secrets.secret_key_base}
      - JWT_SECRET_KEY=${secrets.jwt_secret_key}
      - ENCRYPTION_KEY=${secrets.encryption_key}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  evocrm_processor:
    image: ${EVOCRM_PROCESSOR_IMAGE}
    command: sh -c "alembic upgrade head 2>&1 || echo 'Alembic migration had errors, continuing...'; python -m scripts.run_seeders; uvicorn src.main:app --host $$HOST --port $$PORT"
    networks:
      - ${net}
    environment:
      - POSTGRES_CONNECTION_STRING=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/evocrm?sslmode=disable
      - REDIS_HOST=evocrm_redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=
      - REDIS_SSL=false
      - REDIS_DB=1
      - REDIS_KEY_PREFIX=a2a_
      - REDIS_TTL=3600
      - HOST=0.0.0.0
      - PORT=8000
      - DEBUG=false
      - SECRET_KEY_BASE=${secrets.secret_key_base}
      - ENCRYPTION_KEY=${secrets.encryption_key}
      - EVOAI_CRM_API_TOKEN=${secrets.evoai_crm_api_token}
      - EVO_AUTH_BASE_URL=http://evocrm_auth:3001
      - EVO_AI_CRM_URL=http://evocrm_crm:3000
      - CORE_SERVICE_URL=http://evocrm_core:5555/api/v1
      - APP_URL=https://${apiUrl}
      - API_URL=https://${apiUrl}
      - API_TITLE=Agent Processor Community
      - API_DESCRIPTION=Agent Processor Community for Evo AI
      - API_VERSION=1.0.0
      - ORGANIZATION_NAME=Evo CRM
      - TOOLS_CACHE_ENABLED=true
      - TOOLS_CACHE_TTL=3600
    volumes:
      - evocrm_processor_logs:/app/logs
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  evocrm_bot_runtime:
    image: ${EVOCRM_BOT_RUNTIME_IMAGE}
    networks:
      - ${net}
    environment:
      - BOT_RUNTIME_SECRET=${secrets.bot_runtime_secret}
      - EVOAI_CRM_URL=http://evocrm_crm:3000
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  evocrm_frontend:
    image: ${EVOCRM_FRONTEND_IMAGE}
    networks:
      - ${net}
    environment:
      - VITE_APP_ENV=production
      - VITE_API_URL=https://${apiUrl}
      - VITE_AUTH_API_URL=https://${apiUrl}
      - VITE_EVOAI_API_URL=https://${apiUrl}
      - VITE_AGENT_PROCESSOR_URL=https://${apiUrl}
      - VITE_WS_URL=https://${apiUrl}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.evocrm_frontend.rule=Host(\`${frontendUrl}\`)
        - traefik.http.routers.evocrm_frontend.entrypoints=websecure
        - traefik.http.routers.evocrm_frontend.priority=1
        - traefik.http.routers.evocrm_frontend.tls.certresolver=letsencryptresolver
        - traefik.http.routers.evocrm_frontend.service=evocrm_frontend
        - traefik.http.services.evocrm_frontend.loadbalancer.server.port=80
        - traefik.http.services.evocrm_frontend.loadbalancer.passHostHeader=true

  evocrm_redis:
    image: ${EVOCRM_REDIS_IMAGE}
    command: ["redis-server", "--appendonly", "yes", "--port", "6379"]
    volumes:
      - evocrm_redis:/data
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  evocrm_redis:
    external: true
    name: evocrm_redis
  evocrm_processor_logs:
    external: true
    name: evocrm_processor_logs
  evocrm_storage:
    external: true
    name: evocrm_storage
  evoauth_storage:
    external: true
    name: evoauth_storage

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_frontend}`,
    notes: [
      "Os dois domínios (API e painel) precisam ter DNS apontado para esta VPS antes de instalar.",
      "O boot é lento — Rails e o processor Python rodam migrations na subida. A stack pode levar vários minutos para ficar 'Instalado'.",
      "Primeiro acesso: crie a conta pelo próprio painel (cadastro aberto).",
      "Módulo de Segments/campanhas (EvoFlow) não está incluído nesta edição.",
      "Ainda é um release candidate (1.0.0-rc2) do upstream — espere instabilidade.",
    ],
  },
};
