import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_twentycrm: fqdn,
});

export const twentycrm: StackDefinition = {
  id: "twentycrm",
  repoUrl: "https://github.com/twentyhq/twenty",
  logoUrl: "https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-ui/assets/logo/logo.svg",
  name: "Twenty CRM",
  description: "CRM moderno open-source com UI estilo Notion.",
  category: "crm",
  icon: "headphones",
  dependsOn: ["traefik-portainer", "redis"],
  optionNumber: 23,
  installVia: "panel",
  fields: [
    { name: "url_twentycrm", label: "Domínio do TwentyCRM", kind: "domain", placeholder: "20.suaempresa.com", group: "Domínios" },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_postgres_twentycrm", value: randomBytes(16).toString("hex") },
    { name: "app_secret_twentycrm", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  twentycrm_server:
    image: twentycrm/twenty:latest
    volumes:
      - twentycrm_data:/app/packages/twenty-server/.local-storage
      - twentycrm_docker:/app/docker-data
    networks:
      - ${net}
    environment:
      - PORT=3000
      - SERVER_URL=https://${v.url_twentycrm}
      - REDIS_URL=redis://redis:6379
      - PG_DATABASE_URL=postgres://postgres:${secrets.senha_postgres_twentycrm}@twentycrm_db:5432/default
      - STORAGE_TYPE=local
      - APP_SECRET=${secrets.app_secret_twentycrm}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.twentycrm.rule=Host(\`${v.url_twentycrm}\`)
        - traefik.http.routers.twentycrm.entrypoints=websecure
        - traefik.http.routers.twentycrm.tls.certresolver=letsencryptresolver
        - traefik.http.services.twentycrm.loadbalancer.server.port=3000

  twentycrm_worker:
    image: twentycrm/twenty:latest
    command: ["yarn", "worker:prod"]
    networks:
      - ${net}
    environment:
      - PORT=3000
      - SERVER_URL=https://${v.url_twentycrm}
      - REDIS_URL=redis://redis:6379
      - PG_DATABASE_URL=postgres://postgres:${secrets.senha_postgres_twentycrm}@twentycrm_db:5432/default
      - DISABLE_DB_MIGRATIONS=true
      - STORAGE_TYPE=local
      - APP_SECRET=${secrets.app_secret_twentycrm}
    deploy:
      mode: replicated
      replicas: 1

  twentycrm_db:
    image: twentycrm/twenty-postgres-spilo:latest
    volumes:
      - twentycrm_db_data:/home/postgres/pgdata
    networks:
      - ${net}
    environment:
      - PGUSER_SUPERUSER=postgres
      - POSTGRESQL_PASSWORD=${secrets.senha_postgres_twentycrm}
      - PGPASSWORD_SUPERUSER=${secrets.senha_postgres_twentycrm}
      - ALLOW_NOSSL=true
      - SPILO_PROVIDER=local
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  twentycrm_data:
  twentycrm_docker:
  twentycrm_db_data:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_twentycrm: string }).url_twentycrm}`,
    notes: ["Crie seu usuário no primeiro acesso"],
  },
};
