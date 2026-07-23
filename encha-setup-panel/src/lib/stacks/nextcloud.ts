import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";

const schema = z.object({
  url_nextcloud: fqdn,
  user_nextcloud: username,
  pass_nextcloud: z.string().min(1),
});

export const nextcloud: StackDefinition = {
  id: "nextcloud",
  repoUrl: "https://github.com/nextcloud/server",
  logoUrl: "https://raw.githubusercontent.com/nextcloud/server/master/core/img/logo.svg",
  name: "Nextcloud",
  description: "Cloud privado completo — arquivos, calendário, chat.",
  category: "storage",
  icon: "hard-drive",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["nextcloud"],
  optionNumber: 42,
  installVia: "panel",
  fields: [
    { name: "url_nextcloud", label: "Domínio do Nextcloud", kind: "domain", placeholder: "cloud.encha.ai", group: "Domínios" },
    { name: "user_nextcloud", label: "Usuário administrador", kind: "username", placeholder: "admin", group: "Acesso" },
    { name: "pass_nextcloud", label: "Senha do administrador", kind: "password", sensitive: true, group: "Acesso" },
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

  nextcloud:
    image: nextcloud:latest
    volumes:
      - nextcloud_data:/var/www/html
    networks:
      - ${net}
    environment:
      - NEXTCLOUD_ADMIN_USER=${v.user_nextcloud}
      - NEXTCLOUD_ADMIN_PASSWORD=${v.pass_nextcloud}
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=nextcloud
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${secrets.senha_postgres}
      - REDIS_HOST=redis
      - OVERWRITEPROTOCOL=https
      - TRUSTED_PROXIES=127.0.0.1
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.nextcloud.rule=Host(\`${v.url_nextcloud}\`)
        - traefik.http.services.nextcloud.loadbalancer.server.port=80
        - traefik.http.routers.nextcloud.service=nextcloud
        - traefik.http.routers.nextcloud.tls.certresolver=letsencryptresolver
        - traefik.http.routers.nextcloud.entrypoints=web,websecure
        - traefik.http.routers.nextcloud.tls=true
        - traefik.http.routers.nextcloud.middlewares=nextcloud_redirectregex
        - traefik.http.middlewares.nextcloud_redirectregex.redirectregex.permanent=true
        - traefik.http.middlewares.nextcloud_redirectregex.redirectregex.regex=https://(.*)/.well-known/(?:card|cal)dav
        - traefik.http.middlewares.nextcloud_redirectregex.redirectregex.replacement=https://$$1/remote.php/dav

  nextcloud_cron:
    image: nextcloud:latest
    entrypoint: /cron.sh
    volumes:
      - nextcloud_data:/var/www/html
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  nextcloud_data:
    external: true
    name: nextcloud_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_nextcloud}`,
  },
};
