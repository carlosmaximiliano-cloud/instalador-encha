import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_chatwoot: fqdn,
  email_admin_chatwoot: email,
  user_smtp_chatwoot: z.string().min(1),
  senha_smtp_chatwoot: z.string().min(1),
  smtp_email_chatwoot: z.string().min(1),
  porta_smtp_chatwoot: portNum,
});

export const chatwoot: StackDefinition = {
  id: "chatwoot",
  repoUrl: "https://github.com/chatwoot/chatwoot",
  logoUrl: "https://raw.githubusercontent.com/chatwoot/chatwoot/develop/app/assets/images/chatwoot_icon.svg",
  name: "Chatwoot",
  description: "Plataforma open-source de atendimento omnichannel (WhatsApp, Telegram, Web, etc.).",
  category: "messaging",
  icon: "headphones",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["chatwoot"],
  optionNumber: 5,
  fields: [
    { name: "url_chatwoot", label: "Domínio do Chatwoot", kind: "domain", placeholder: "chatwoot.suaempresa.com", group: "Domínios" },
    { name: "email_admin_chatwoot", label: "E-mail admin", kind: "email", group: "Admin" },
    { name: "smtp_email_chatwoot", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_chatwoot", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
    { name: "user_smtp_chatwoot", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_smtp_chatwoot", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "secret_key_base", value: randomBytes(64).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  chatwoot_app:
    image: chatwoot/chatwoot:latest
    command: bundle exec rails s -p 3000 -b 0.0.0.0
    networks:
      - ${net}
    environment:
      - INSTALLATION_NAME=Chatwoot
      - NODE_ENV=production
      - RAILS_ENV=production
      - INSTALLATION_ENV=docker
      - SECRET_KEY_BASE=${secrets.secret_key_base}
      - FRONTEND_URL=https://${v.url_chatwoot}
      - DEFAULT_LOCALE=pt_BR
      - FORCE_SSL=true
      - ENABLE_ACCOUNT_SIGNUP=false
      - REDIS_URL=redis://chatwoot_redis:6379
      - POSTGRES_HOST=postgres
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=${secrets.senha_postgres}
      - POSTGRES_DATABASE=chatwoot
      - RAILS_MAX_THREADS=5
      - MAILER_SENDER_EMAIL=Chatwoot <${v.email_admin_chatwoot}>
      - SMTP_DOMAIN=${v.smtp_email_chatwoot}
      - SMTP_ADDRESS=${v.smtp_email_chatwoot}
      - SMTP_PORT=${v.porta_smtp_chatwoot}
      - SMTP_USERNAME=${v.user_smtp_chatwoot}
      - SMTP_PASSWORD=${v.senha_smtp_chatwoot}
      - SMTP_AUTHENTICATION=login
      - SMTP_ENABLE_STARTTLS_AUTO=true
      - ACTIVE_STORAGE_SERVICE=local
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.chatwoot_app.rule=Host(\`${v.url_chatwoot}\`)
        - traefik.http.routers.chatwoot_app.entrypoints=websecure
        - traefik.http.routers.chatwoot_app.tls.certresolver=letsencryptresolver
        - traefik.http.services.chatwoot_app.loadbalancer.server.port=3000

  chatwoot_sidekiq:
    image: chatwoot/chatwoot:latest
    command: bundle exec sidekiq -C config/sidekiq.yml
    networks:
      - ${net}
    environment:
      - NODE_ENV=production
      - RAILS_ENV=production
      - SECRET_KEY_BASE=${secrets.secret_key_base}
      - FRONTEND_URL=https://${v.url_chatwoot}
      - REDIS_URL=redis://chatwoot_redis:6379
      - POSTGRES_HOST=postgres
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=${secrets.senha_postgres}
      - POSTGRES_DATABASE=chatwoot
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  chatwoot_redis:
    image: redis:latest
    command: ["redis-server", "--appendonly", "yes"]
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_chatwoot: string }).url_chatwoot}`,
    notes: ["Crie sua conta de superadmin no primeiro acesso"],
  },
};
