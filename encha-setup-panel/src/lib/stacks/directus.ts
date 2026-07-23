import { z } from "zod";
import { type StackDefinition, fqdn, email, strongPassword } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_directus: fqdn,
  email_admin: email,
  senha_admin: strongPassword,
});

export const directus: StackDefinition = {
  id: "directus",
  repoUrl: "https://github.com/directus/directus",
  logoUrl: "https://raw.githubusercontent.com/directus/directus/main/docs/public/img/directus-icon.svg",
  name: "Directus",
  description: "Headless CMS instantâneo sobre seu banco de dados. Painel de admin pronto + API REST/GraphQL.",
  category: "admin",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer", "postgres", "minio"],
  postgresDatabases: ["directus"],
  optionNumber: 9,
  fields: [
    { name: "url_directus", label: "Domínio", kind: "domain", placeholder: "directus.suaempresa.com", group: "Domínios" },
    { name: "email_admin", label: "E-mail admin", kind: "email", group: "Admin" },
    { name: "senha_admin", label: "Senha admin", kind: "password", sensitive: true, group: "Admin" },
  ],
  schema,
  generateSecrets: () => [
    { name: "key", value: randomBytes(16).toString("hex") },
    { name: "secret", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  directus:
    image: directus/directus:latest
    networks:
      - ${net}
    environment:
      - KEY=${secrets.key}
      - SECRET=${secrets.secret}
      - DB_CLIENT=pg
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=directus
      - DB_USER=postgres
      - DB_PASSWORD=${secrets.senha_postgres}
      - ADMIN_EMAIL=${v.email_admin}
      - ADMIN_PASSWORD=${v.senha_admin}
      - PUBLIC_URL=https://${v.url_directus}
      - STORAGE_LOCATIONS=s3
      - STORAGE_S3_DRIVER=s3
      - STORAGE_S3_ENDPOINT=http://minio:9000
      - STORAGE_S3_BUCKET=directus
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.directus.rule=Host(\`${v.url_directus}\`)
        - traefik.http.routers.directus.entrypoints=websecure
        - traefik.http.routers.directus.tls.certresolver=letsencryptresolver
        - traefik.http.services.directus.loadbalancer.server.port=8055

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: { accessUrl: (v) => `https://${(v as { url_directus: string }).url_directus}` },
};
