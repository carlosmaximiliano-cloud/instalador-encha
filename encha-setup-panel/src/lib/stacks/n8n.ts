import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z
  .object({
    url_editorn8n: fqdn,
    url_webhookn8n: fqdn,
    smtp_enabled: z.boolean().default(false),
    email_smtp_n8n: email.optional(),
    usuario_smtp_n8n: z.string().optional(),
    senha_smtp_n8n: z.string().optional(),
    host_smtp_n8n: z.string().optional(),
    porta_smtp_n8n: portNum.optional(),
  })
  .refine(
    (d) => !d.smtp_enabled || (d.email_smtp_n8n && d.usuario_smtp_n8n && d.senha_smtp_n8n && d.host_smtp_n8n && d.porta_smtp_n8n),
    { message: "Preencha todos os campos SMTP ou desative o toggle" }
  );

export const n8n: StackDefinition = {
  id: "n8n",
  repoUrl: "https://github.com/n8n-io/n8n",
  logoUrl: "https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png",
  name: "N8N",
  description: "Plataforma de automação de fluxos (low-code) com 400+ integrações. Editor visual de workflows.",
  category: "automation",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["n8n"],
  optionNumber: 4,
  fields: [
    { name: "url_editorn8n", label: "Domínio do Editor N8N", kind: "domain", placeholder: "n8n.suaempresa.com", group: "Domínios" },
    { name: "url_webhookn8n", label: "Domínio dos Webhooks", kind: "domain", placeholder: "webhook.suaempresa.com", group: "Domínios" },
    { name: "smtp_enabled", label: "Configurar SMTP agora?", kind: "checkbox", optional: true, default: false, group: "SMTP" },
    { name: "host_smtp_n8n", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", optional: true, group: "SMTP" },
    { name: "porta_smtp_n8n", label: "Porta SMTP", kind: "port", placeholder: "465", optional: true, group: "SMTP" },
    { name: "email_smtp_n8n", label: "E-mail remetente", kind: "email", optional: true, group: "SMTP" },
    { name: "usuario_smtp_n8n", label: "Usuário SMTP", kind: "text", optional: true, group: "SMTP" },
    { name: "senha_smtp_n8n", label: "Senha SMTP", kind: "password", sensitive: true, optional: true, group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const smtpBlock = v.smtp_enabled
      ? `      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=${v.host_smtp_n8n}
      - N8N_SMTP_PORT=${v.porta_smtp_n8n}
      - N8N_SMTP_USER=${v.usuario_smtp_n8n}
      - N8N_SMTP_PASS=${v.senha_smtp_n8n}
      - N8N_SMTP_SENDER=${v.email_smtp_n8n}
      - N8N_SMTP_SSL=true`
      : `      - N8N_EMAIL_MODE=`;

    return `version: "3.7"
services:
  n8n:
    image: n8nio/n8n:latest
    networks:
      - ${net}
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=${secrets.senha_postgres}
      - N8N_ENCRYPTION_KEY=${secrets.encryption_key}
      - N8N_HOST=${v.url_editorn8n}
      - N8N_EDITOR_BASE_URL=https://${v.url_editorn8n}
      - WEBHOOK_URL=https://${v.url_webhookn8n}/
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - EXECUTIONS_MODE=regular
      - N8N_RUNNERS_ENABLED=true
${smtpBlock}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.n8n_editor.rule=Host(\`${v.url_editorn8n}\`)
        - traefik.http.routers.n8n_editor.entrypoints=websecure
        - traefik.http.routers.n8n_editor.tls.certresolver=letsencryptresolver
        - traefik.http.routers.n8n_editor.service=n8n_editor
        - traefik.http.services.n8n_editor.loadbalancer.server.port=5678
        - traefik.http.routers.n8n_webhook.rule=Host(\`${v.url_webhookn8n}\`)
        - traefik.http.routers.n8n_webhook.entrypoints=websecure
        - traefik.http.routers.n8n_webhook.tls.certresolver=letsencryptresolver
        - traefik.http.routers.n8n_webhook.service=n8n_webhook
        - traefik.http.services.n8n_webhook.loadbalancer.server.port=5678

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_editorn8n: string }).url_editorn8n}`,
    notes: ["Crie sua conta de admin no primeiro acesso"],
  },
  i18n: {
    en: {
      description: "Low-code workflow automation platform with 400+ integrations. Visual workflow editor.",
      fields: {
        url_editorn8n: { label: "N8N Editor Domain", placeholder: "n8n.yourcompany.com", group: "Domains" },
        url_webhookn8n: { label: "Webhooks Domain", placeholder: "webhook.yourcompany.com", group: "Domains" },
        smtp_enabled: { label: "Set up SMTP now?" },
        host_smtp_n8n: { label: "SMTP Host", placeholder: "smtp.hostinger.com" },
        porta_smtp_n8n: { label: "SMTP Port", placeholder: "465" },
        email_smtp_n8n: { label: "Sender email" },
        usuario_smtp_n8n: { label: "SMTP username" },
        senha_smtp_n8n: { label: "SMTP password" },
      },
      notes: ["Create your admin account on first access"],
    },
    es: {
      description: "Plataforma de automatización de flujos (low-code) con más de 400 integraciones. Editor visual de flujos de trabajo.",
      fields: {
        url_editorn8n: { label: "Dominio del Editor N8N", placeholder: "n8n.suempresa.com", group: "Dominios" },
        url_webhookn8n: { label: "Dominio de los Webhooks", placeholder: "webhook.suempresa.com", group: "Dominios" },
        smtp_enabled: { label: "¿Configurar SMTP ahora?" },
        host_smtp_n8n: { label: "Host SMTP", placeholder: "smtp.hostinger.com" },
        porta_smtp_n8n: { label: "Puerto SMTP", placeholder: "465" },
        email_smtp_n8n: { label: "Correo remitente" },
        usuario_smtp_n8n: { label: "Usuario SMTP" },
        senha_smtp_n8n: { label: "Contraseña SMTP" },
      },
      notes: ["Cree su cuenta de administrador en el primer acceso"],
    },
  },
};
