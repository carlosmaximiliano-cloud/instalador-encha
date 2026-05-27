import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_woofed: fqdn,
  user_motor_woofed: username,
  pass_motor_woofed: z.string().min(6),
});

export const woofedcrm: StackDefinition = {
  id: "woofedcrm",
  repoUrl: "https://github.com/woofedcrm/woofedcrm",
  logoUrl: "https://raw.githubusercontent.com/woofedcrm/woofedcrm/main/logo.svg",
  name: "WooFed CRM",
  description: "CRM open-source brasileiro focado em WhatsApp.",
  category: "crm",
  icon: "headphones",
  dependsOn: ["traefik-portainer", "postgres", "redis"],
  optionNumber: 22,
  installVia: "panel",
  fields: [
    { name: "url_woofed", label: "Domínio do WoofedCRM", kind: "domain", placeholder: "crm.suaempresa.com", group: "Domínios" },
    { name: "user_motor_woofed", label: "Usuário painel MOTOR (admin)", kind: "username", placeholder: "encha_admin", group: "Admin" },
    { name: "pass_motor_woofed", label: "Senha painel MOTOR", kind: "password", sensitive: true, group: "Admin" },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key_woofed", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  woofedcrm_web:
    image: douglara/woofedcrm:latest
    command: bundle exec rails s -p 3000 -b 0.0.0.0
    networks:
      - ${net}
    environment:
      - FRONTEND_URL=https://${v.url_woofed}
      - SECRET_KEY_BASE=${secrets.encryption_key_woofed}
      - ENABLE_USER_SIGNUP=true
      - MOTOR_AUTH_USERNAME=${v.user_motor_woofed}
      - MOTOR_AUTH_PASSWORD=${v.pass_motor_woofed}
      - DATABASE_URL=postgres://postgres:${secrets.senha_postgres}@postgres:5432/woofedcrm
      - REDIS_URL=redis://redis:6379/0
      - ACTIVE_STORAGE_SERVICE=local
      - RAILS_ENV=production
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.woofedcrm.rule=Host(\`${v.url_woofed}\`)
        - traefik.http.routers.woofedcrm.entrypoints=websecure
        - traefik.http.routers.woofedcrm.tls.certresolver=letsencryptresolver
        - traefik.http.services.woofedcrm.loadbalancer.server.port=3000

  woofedcrm_sidekiq:
    image: douglara/woofedcrm:latest
    command: bundle exec sidekiq -C config/sidekiq.yml
    networks:
      - ${net}
    environment:
      - FRONTEND_URL=https://${v.url_woofed}
      - SECRET_KEY_BASE=${secrets.encryption_key_woofed}
      - DATABASE_URL=postgres://postgres:${secrets.senha_postgres}@postgres:5432/woofedcrm
      - REDIS_URL=redis://redis:6379/0
      - RAILS_ENV=production
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
    accessUrl: (v) => `https://${(v as { url_woofed: string }).url_woofed}`,
    notes: ["Crie seu usuário no primeiro acesso", `Painel Admin (MOTOR): /motor_admin`],
  },
};
