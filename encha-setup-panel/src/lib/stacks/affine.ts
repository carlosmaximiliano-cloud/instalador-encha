import { z } from "zod";
import { type StackDefinition, fqdn, email, portNum } from "./types";

const schema = z.object({
  url_affine: fqdn,
  email_affine: email,
  senha_affine: z.string().min(1),
  email_smtp_affine: email,
  senha_smtp_affine: z.string().min(1),
  host_smtp_affine: z.string().min(1),
  porta_smtp_affine: portNum,
});

export const affine: StackDefinition = {
  id: "affine",
  repoUrl: "https://github.com/toeverything/AFFiNE",
  logoUrl: "https://raw.githubusercontent.com/toeverything/AFFiNE/master/assets/affine-logo.svg",
  name: "AFFiNE",
  description: "Notion + Miro all-in-one com blocos editáveis.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer", "postgres", "redis"],
  optionNumber: 40,
  installVia: "panel",
  fields: [
    { name: "url_affine", label: "Domínio do AFFiNE", kind: "domain", placeholder: "affine.suaempresa.com", group: "Domínios" },
    { name: "email_affine", label: "E-mail do administrador", kind: "email", group: "Admin" },
    { name: "senha_affine", label: "Senha do administrador", kind: "password", sensitive: true, group: "Admin" },
    { name: "email_smtp_affine", label: "E-mail de envio SMTP", kind: "email", group: "SMTP" },
    { name: "senha_smtp_affine", label: "Senha SMTP", kind: "password", sensitive: true, group: "SMTP" },
    { name: "host_smtp_affine", label: "Host SMTP", kind: "text", placeholder: "smtp.hostinger.com", group: "SMTP" },
    { name: "porta_smtp_affine", label: "Porta SMTP", kind: "port", placeholder: "465", group: "SMTP" },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  affine:
    image: ghcr.io/toeverything/affine-graphql:stable-39476d1
    command:
      ['sh', '-c', 'node ./scripts/self-host-predeploy && node ./dist/index.js']

    volumes:
      - affine_config:/root/.affine/config:rw
      - affine_storage:/root/.affine/storage:rw

    networks:
      - ${net}

    logging:
      driver: 'json-file'
      options:
        max-size: '1000m'
    restart: on-failure:5

    environment:
      - AFFINE_ADMIN_EMAIL=${v.email_affine}
      - AFFINE_ADMIN_PASSWORD=${v.senha_affine}
      - AFFINE_SERVER_HOST=${v.url_affine}
      - MAILER_USER=${v.email_smtp_affine}
      - MAILER_PASSWORD=${v.senha_smtp_affine}
      - MAILER_HOST=${v.host_smtp_affine}
      - MAILER_PORT=${v.porta_smtp_affine}
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${secrets.senha_postgres}
      - POSTGRES_DB=affine
      - DATABASE_URL=postgres://postgres:${secrets.senha_postgres}@postgres:5432/affine?sslmode=disable
      - PGDATA=/var/lib/postgresql/data/pgdata
      - NODE_OPTIONS="--import=./scripts/register.js"
      - AFFINE_CONFIG_PATH=/root/.affine/config
      - REDIS_SERVER_HOST=redis
      - NODE_ENV=production

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.affine.rule=Host(\`${v.url_affine}\`)
        - traefik.http.services.affine.loadbalancer.server.port=3010
        - traefik.http.routers.affine.service=affine
        - traefik.http.routers.affine.tls.certresolver=letsencryptresolver
        - traefik.http.routers.affine.entrypoints=websecure
        - traefik.http.routers.affine.tls=true
        - traefik.frontend.headers.STSPreload=true
        - traefik.frontend.headers.STSSeconds=31536000

volumes:
  affine_config:
    external: true
    name: affine_config
  affine_storage:
    external: true
    name: affine_storage

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_affine: string }).url_affine}`,
  },
};
