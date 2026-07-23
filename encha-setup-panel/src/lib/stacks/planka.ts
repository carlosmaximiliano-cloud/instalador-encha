import { z } from "zod";
import { type StackDefinition, fqdn, email, username, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_planka: fqdn,
  nome_adm_planka: z.string().min(1),
  email_adm_planka: email,
  user_adm_planka: username,
  senha_adm_planka: z.string().min(1),
  email_planka: email,
  usuario_email_planka: z.string().min(1),
  senha_email_planka: z.string().min(1),
  smtp_email_planka: z.string().min(1),
  porta_smtp_planka: portNum,
});

export const planka: StackDefinition = {
  id: "planka",
  repoUrl: "https://github.com/plankanban/planka",
  logoUrl: "https://raw.githubusercontent.com/plankanban/planka/main/public/logo.svg",
  name: "Planka",
  description: "Kanban Trello-like minimalista e rápido.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["planka"],
  optionNumber: 61,
  installVia: "panel",
  fields: [
    { name: "url_planka", label: "Domínio do Planka", kind: "domain", placeholder: "planka.suaempresa.com", group: "Domínios" },
    { name: "nome_adm_planka", label: "Nome do administrador", kind: "text", group: "Admin" },
    { name: "email_adm_planka", label: "E-mail do administrador", kind: "email", group: "Admin" },
    { name: "user_adm_planka", label: "Usuário do administrador", kind: "username", group: "Admin" },
    { name: "senha_adm_planka", label: "Senha do administrador", kind: "password", sensitive: true, group: "Admin" },
    { name: "email_planka", label: "E-mail de envio SMTP", kind: "email", group: "SMTP" },
    { name: "usuario_email_planka", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_email_planka", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "smtp_email_planka", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_planka", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "secret_key", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    const smtpSecure = Number(v.porta_smtp_planka) === 465 ? "true" : "false";
    const tlsReject = Number(v.porta_smtp_planka) === 465 ? "false" : "true";
    return `version: "3.7"
services:

  planka:
    image: ghcr.io/plankanban/planka:latest

    networks:
      - ${net}

    volumes:
      - planka_avatars:/app/public/user-avatars
      - planka_backgrounds:/app/public/project-background-images
      - planka_attachments:/app/private/attachments

    environment:
      - BASE_URL=https://${v.url_planka}
      - DEFAULT_ADMIN_NAME=${v.nome_adm_planka}
      - DEFAULT_ADMIN_USERNAME=${v.user_adm_planka}
      - DEFAULT_ADMIN_PASSWORD=${v.senha_adm_planka}
      - DEFAULT_ADMIN_EMAIL=${v.email_adm_planka}
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/planka
      - SECRET_KEY=${secrets.secret_key}
      - ALLOW_ALL_TO_CREATE_PROJECTS=true
      - SMTP_NAME=Planka
      - SMTP_FROM=Planka <${v.email_planka}>
      - SMTP_USER=${v.usuario_email_planka}
      - SMTP_PASSWORD=${v.senha_email_planka}
      - SMTP_HOST=${v.smtp_email_planka}
      - SMTP_PORT=${v.porta_smtp_planka}
      - SMTP_SECURE=${smtpSecure}
      - SMTP_TLS_REJECT_UNAUTHORIZED=${tlsReject}

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
        - traefik.http.routers.planka.rule=Host(\`${v.url_planka}\`)
        - traefik.http.services.planka.loadbalancer.server.port=1337
        - traefik.http.routers.planka.service=planka
        - traefik.http.routers.planka.tls.certresolver=letsencryptresolver
        - traefik.http.routers.planka.entrypoints=websecure
        - traefik.http.routers.planka.tls=true

volumes:
  planka_avatars:
    external: true
    name: planka_avatars
  planka_backgrounds:
    external: true
    name: planka_backgrounds
  planka_attachments:
    external: true
    name: planka_attachments

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_planka: string }).url_planka}`,
  },
};
