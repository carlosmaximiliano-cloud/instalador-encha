import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_typebot: fqdn,
  url_viewer: fqdn,
  email_typebot: email,
  usuario_email_typebot: z.string().min(1),
  senha_email_typebot: z.string().min(1),
  smtp_email_typebot: z.string().min(1),
  porta_smtp_typebot: portNum,
});

export const typebot: StackDefinition = {
  id: "typebot",
  repoUrl: "https://github.com/baptisteArno/typebot.io",
  logoUrl: "https://raw.githubusercontent.com/typebot-io/typebot.js/main/apps/builder/public/logo.svg",
  name: "Typebot",
  description: "Construtor de chatbots conversacionais com builder visual. Depende do MinIO para uploads.",
  category: "automation",
  icon: "bot",
  dependsOn: ["traefik-portainer", "postgres", "minio"],
  optionNumber: 8,
  fields: [
    { name: "url_typebot", label: "Domínio do Builder", kind: "domain", placeholder: "type.suaempresa.com", group: "Domínios" },
    { name: "url_viewer", label: "Domínio do Viewer", kind: "domain", placeholder: "viewer.suaempresa.com", group: "Domínios" },
    { name: "smtp_email_typebot", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_typebot", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
    { name: "email_typebot", label: "E-mail remetente", kind: "email", group: "SMTP" },
    { name: "usuario_email_typebot", label: "Usuário SMTP", kind: "text", group: "SMTP" },
    { name: "senha_email_typebot", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_secret", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
    { name: "minio_access", value: "REUSE_MINIO" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  typebot_builder:
    image: baptistearno/typebot-builder:latest
    networks:
      - ${net}
    environment:
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/typebot
      - ENCRYPTION_SECRET=${secrets.encryption_secret}
      - DEFAULT_WORKSPACE_PLAN=UNLIMITED
      - AUTH_TRUST_HOST=https://${v.url_typebot}
      - NEXTAUTH_URL=https://${v.url_typebot}
      - NEXT_PUBLIC_VIEWER_URL=https://${v.url_viewer}
      - ADMIN_EMAIL=${v.email_typebot}
      - SMTP_HOST=${v.smtp_email_typebot}
      - SMTP_PORT=${v.porta_smtp_typebot}
      - SMTP_USERNAME=${v.usuario_email_typebot}
      - SMTP_PASSWORD=${v.senha_email_typebot}
      - SMTP_FROM=${v.email_typebot}
      - SMTP_SECURE=true
      - S3_ENDPOINT=minio
      - S3_PORT=9000
      - S3_BUCKET=typebot
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.typebot_builder.rule=Host(\`${v.url_typebot}\`)
        - traefik.http.routers.typebot_builder.entrypoints=websecure
        - traefik.http.routers.typebot_builder.tls.certresolver=letsencryptresolver
        - traefik.http.services.typebot_builder.loadbalancer.server.port=3000

  typebot_viewer:
    image: baptistearno/typebot-viewer:latest
    networks:
      - ${net}
    environment:
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/typebot
      - ENCRYPTION_SECRET=${secrets.encryption_secret}
      - AUTH_TRUST_HOST=https://${v.url_typebot}
      - NEXTAUTH_URL=https://${v.url_typebot}
      - NEXT_PUBLIC_VIEWER_URL=https://${v.url_viewer}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.typebot_viewer.rule=Host(\`${v.url_viewer}\`)
        - traefik.http.routers.typebot_viewer.entrypoints=websecure
        - traefik.http.routers.typebot_viewer.tls.certresolver=letsencryptresolver
        - traefik.http.services.typebot_viewer.loadbalancer.server.port=3000

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: { accessUrl: (v) => `https://${(v as { url_typebot: string }).url_typebot}` },
};
