import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_formbricks: fqdn,
  email_formbricks: email,
  user_smtp_formbricks: z.string().min(1),
  senha_formbricks: z.string().min(1),
  host_formbricks: z.string().min(1),
  porta_formbricks: portNum,
});

export const formbricks: StackDefinition = {
  id: "formbricks",
  repoUrl: "https://github.com/formbricks/formbricks",
  logoUrl: "https://raw.githubusercontent.com/formbricks/formbricks/main/apps/docs/public/logo-dark.svg",
  name: "Formbricks",
  description: "Pesquisas e formulários in-product orientados a dados.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["formbricks"],
  optionNumber: 35,
  installVia: "panel",
  fields: [
    { name: "url_formbricks", label: "Domínio do Formbricks", kind: "domain", placeholder: "forms.encha.ai", group: "Domínios" },
    { name: "email_formbricks", label: "Email SMTP", kind: "email", placeholder: "noreply@encha.ai", group: "SMTP" },
    { name: "user_smtp_formbricks", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_formbricks", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "host_formbricks", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_formbricks", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key_form", value: randomBytes(32).toString("hex") },
    { name: "next_key_form", value: randomBytes(32).toString("hex") },
    { name: "cron_key_form", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const sslEnabled = v.porta_formbricks === 465 || v.porta_formbricks === 25 ? 1 : 0;
    return `version: "3.7"
services:

  formbricks:
    image: ghcr.io/formbricks/formbricks:latest
    volumes:
      - formbricks_data:/home/nextjs/apps/web/uploads/
    networks:
      - ${net}
    environment:
      - WEBAPP_URL=https://${v.url_formbricks}
      - NEXTAUTH_URL=https://${v.url_formbricks}
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/formbricks?schema=public
      - ENTERPRISE_LICENSE_KEY=
      - ENCRYPTION_KEY=${secrets.encryption_key_form}
      - NEXTAUTH_SECRET=${secrets.next_key_form}
      - CRON_SECRET=${secrets.cron_key_form}
      - MAIL_FROM=${v.email_formbricks}
      - SMTP_HOST=${v.host_formbricks}
      - SMTP_PORT=${v.porta_formbricks}
      - SMTP_SECURE_ENABLED=${sslEnabled}
      - SMTP_USER=${v.user_smtp_formbricks}
      - SMTP_PASSWORD=${v.senha_formbricks}
      - SIGNUP_DISABLED=0
      - INVITE_DISABLED=0
      - EMAIL_VERIFICATION_DISABLED=0
      - PASSWORD_RESET_DISABLED=0
      - NEXT_PUBLIC_FORMBRICKS_API_HOST=
      - NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID=
      - NEXT_PUBLIC_FORMBRICKS_ONBOARDING_SURVEY_ID=
      - GOOGLE_AUTH_ENABLED=0
      - GOOGLE_CLIENT_ID=
      - GOOGLE_CLIENT_SECRET=
      - GOOGLE_SHEETS_CLIENT_ID=
      - GOOGLE_SHEETS_CLIENT_SECRET=
      - GOOGLE_SHEETS_REDIRECT_URL=
      - GITHUB_AUTH_ENABLED=0
      - GITHUB_ID=
      - GITHUB_SECRET=
      - NOTION_OAUTH_CLIENT_ID=
      - NOTION_OAUTH_CLIENT_SECRET=
      - AIRTABLE_CLIENT_ID=
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
        - traefik.http.routers.formbricks.rule=Host(\`${v.url_formbricks}\`)
        - traefik.http.services.formbricks.loadbalancer.server.port=3000
        - traefik.http.routers.formbricks.service=formbricks
        - traefik.http.routers.formbricks.tls.certresolver=letsencryptresolver
        - traefik.http.routers.formbricks.entrypoints=websecure
        - traefik.http.routers.formbricks.tls=true

volumes:
  formbricks_data:
    external: true
    name: formbricks_data

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_formbricks}`,
    notes: ["Aguarde aproximadamente 5 minutos antes de acessar devido à migração do banco de dados."],
  },
};
