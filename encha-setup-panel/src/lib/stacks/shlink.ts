import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_shlink: fqdn,
  url_shlink_api: fqdn,
  shlink_user: username,
  shlink_pass: z.string().min(1),
});

export const shlink: StackDefinition = {
  id: "shlink",
  repoUrl: "https://github.com/shlinkio/shlink",
  logoUrl: "https://raw.githubusercontent.com/shlinkio/shlink/main/docs/logo.svg",
  name: "Shlink",
  description: "Encurtador de URLs com analytics open-source.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "postgres", "redis"],
  optionNumber: 80,
  installVia: "panel",
  fields: [
    { name: "url_shlink", label: "Domínio do Painel Shlink", kind: "domain", placeholder: "painel-shlink.suaempresa.com", group: "Domínios" },
    { name: "url_shlink_api", label: "Domínio da API Shlink", kind: "domain", placeholder: "shlink.suaempresa.com", group: "Domínios" },
    { name: "shlink_user", label: "Usuário", kind: "username", group: "Admin" },
    { name: "shlink_pass", label: "Senha", kind: "password", sensitive: true, group: "Admin" },
  ],
  schema,
  generateSecrets: () => [
    { name: "shlink_api_key", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.8"
services:

  shlink_app:
    image: shlinkio/shlink-web-client:latest

    networks:
      - ${net}

    environment:
      - DEFAULT_DOMAIN=${v.url_shlink_api}
      - IS_HTTPS_ENABLED=true
      - INITIAL_API_KEY=${secrets.shlink_api_key}
      - DB_DRIVER=postgres
      - DB_HOST=postgres
      - DB_NAME=shlink
      - DB_USER=postgres
      - DB_PASSWORD=${secrets.senha_postgres}
      - DB_PORT=5432
      - REDIS_URL=redis://redis:6379
      - TIMEZONE=America/Sao_Paulo

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.shlink_app.rule=Host(\`${v.url_shlink}\`)
        - traefik.http.routers.shlink_app.entrypoints=websecure
        - traefik.http.routers.shlink_app.priority=1
        - traefik.http.routers.shlink_app.tls.certresolver=letsencryptresolver
        - traefik.http.routers.shlink_app.service=shlink_app
        - traefik.http.services.shlink_app.loadbalancer.server.port=8080
        - traefik.http.services.shlink_app.loadbalancer.passHostHeader=true

  shlink_api:
    image: shlinkio/shlink:latest

    volumes:
      - shlink_data:/etc/shlink

    networks:
      - ${net}

    environment:
      - DEFAULT_DOMAIN=${v.url_shlink_api}
      - IS_HTTPS_ENABLED=true
      - INITIAL_API_KEY=${secrets.shlink_api_key}
      - DB_DRIVER=postgres
      - DB_HOST=postgres
      - DB_NAME=shlink
      - DB_USER=postgres
      - DB_PASSWORD=${secrets.senha_postgres}
      - DB_PORT=5432
      - REDIS_URL=redis://redis:6379
      - TIMEZONE=America/Sao_Paulo

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.shlink_api.rule=Host(\`${v.url_shlink_api}\`)
        - traefik.http.routers.shlink_api.entrypoints=websecure
        - traefik.http.routers.shlink_api.priority=1
        - traefik.http.routers.shlink_api.tls.certresolver=letsencryptresolver
        - traefik.http.routers.shlink_api.service=shlink_api
        - traefik.http.services.shlink_api.loadbalancer.server.port=8080
        - traefik.http.services.shlink_api.loadbalancer.passHostHeader=true

volumes:
  shlink_data:
    external: true
    name: shlink_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_shlink: string }).url_shlink}`,
  },
};
