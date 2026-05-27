import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_strapi: fqdn,
});

export const strapi: StackDefinition = {
  id: "strapi",
  repoUrl: "https://github.com/strapi/strapi",
  logoUrl: "https://raw.githubusercontent.com/strapi/strapi/master/packages/core/admin/admin/src/assets/images/logo-strapi.svg",
  name: "Strapi",
  description: "Headless CMS líder do mercado em Node.js.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 43,
  installVia: "panel",
  fields: [
    { name: "url_strapi", label: "Domínio do Strapi", kind: "domain", placeholder: "strapi.encha.ai", group: "Domínios" },
  ],
  schema,
  generateSecrets: () => [
    { name: "jwt_secret", value: randomBytes(16).toString("hex") },
    { name: "admin_jwt", value: randomBytes(16).toString("hex") },
    { name: "app_key", value: randomBytes(16).toString("hex") },
    { name: "senha_mysql", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  strapi_app:
    image: strapi/strapi
    volumes:
      - strapi_data:/srv/app
    networks:
      - ${net}
    environment:
      - DATABASE_CLIENT=mysql
      - DATABASE_HOST=strapi_db
      - DATABASE_NAME=strapi
      - DATABASE_PORT=3306
      - DATABASE_USERNAME=root
      - DATABASE_PASSWORD=${secrets.senha_mysql}
      - JWT_SECRET=${secrets.jwt_secret}
      - ADMIN_JWT_SECRET=${secrets.admin_jwt}
      - APP_KEYS=${secrets.app_key}
      - NODE_ENV=production
      - STRAPI_TELEMETRY_DISABLED=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.strapi.rule=Host(\`${v.url_strapi}\`)
        - traefik.http.routers.strapi.entrypoints=web,websecure
        - traefik.http.routers.strapi.tls.certresolver=letsencryptresolver
        - traefik.http.routers.strapi.service=strapi
        - traefik.http.services.strapi.loadbalancer.server.port=1337
        - traefik.http.services.strapi.loadbalancer.passHostHeader=true

  strapi_db:
    image: percona/percona-server:8.0
    command:
      - "--character-set-server=utf8mb4"
      - "--collation-server=utf8mb4_general_ci"
      - "--sql-mode="
      - "--default-authentication-plugin=mysql_native_password"
      - "--max-allowed-packet=512MB"
    volumes:
      - strapi_db:/var/lib/mysql
    networks:
      - ${net}
    environment:
      - MYSQL_ROOT_PASSWORD=${secrets.senha_mysql}
      - MYSQL_DATABASE=strapi
      - TZ=America/Sao_Paulo
    deploy:
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M

volumes:
  strapi_data:
    external: true
    name: strapi_data
  strapi_db:
    external: true
    name: strapi_db

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_strapi: string }).url_strapi}/admin`,
    notes: ["Aguarde até 5 minutos para a primeira inicialização e acesse o link para criar seu usuário."],
  },
};
