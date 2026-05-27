import { z } from "zod";
import { type StackDefinition, fqdn, slug } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_wordpress: fqdn,
  nome_site_wordpress: slug,
});

export const wordpress: StackDefinition = {
  id: "wordpress",
  repoUrl: "https://github.com/WordPress/WordPress",
  name: "WordPress",
  description: "Plataforma de blogs e sites mais popular do mundo.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer", "mysql", "redis"],
  optionNumber: 34,
  installVia: "panel",
  fields: [
    { name: "url_wordpress", label: "Domínio do WordPress", kind: "domain", placeholder: "loja.encha.ai", group: "Domínios" },
    { name: "nome_site_wordpress", label: "Nome do Site (slug)", kind: "slug", placeholder: "lojaencha", group: "Configuração" },
  ],
  schema,
  generateSecrets: () => [
    { name: "senha_mysql", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  wordpress_${v.nome_site_wordpress}:
    image: wordpress:latest
    volumes:
      - wordpress_${v.nome_site_wordpress}:/var/www/html
      - wordpress_${v.nome_site_wordpress}_php:/usr/local/etc/php
    networks:
      - ${net}
    environment:
      - WORDPRESS_DB_NAME=${v.nome_site_wordpress}
      - WORDPRESS_DB_HOST=mysql
      - WORDPRESS_DB_PORT=3306
      - WORDPRESS_DB_USER=root
      - WORDPRESS_DB_PASSWORD=${secrets.senha_mysql}
      - WP_REDIS_HOST=redis
      - WP_REDIS_PORT=6379
      - WP_REDIS_DATABASE=6
      - VIRTUAL_HOST=${v.url_wordpress}
      - WP_LOCALE=pt_BR
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.wordpress_${v.nome_site_wordpress}.rule=Host(\`${v.url_wordpress}\`)"
        - "traefik.http.routers.wordpress_${v.nome_site_wordpress}.entrypoints=websecure"
        - "traefik.http.routers.wordpress_${v.nome_site_wordpress}.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.wordpress_${v.nome_site_wordpress}.service=wordpress_${v.nome_site_wordpress}"
        - "traefik.http.services.wordpress_${v.nome_site_wordpress}.loadbalancer.server.port=80"
        - "traefik.http.services.wordpress_${v.nome_site_wordpress}.loadbalancer.passHostHeader=true"

volumes:
  wordpress_${v.nome_site_wordpress}:
    name: wordpress_${v.nome_site_wordpress}
    external: true
  wordpress_${v.nome_site_wordpress}_php:
    name: wordpress_${v.nome_site_wordpress}_php
    external: true

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_wordpress: string }).url_wordpress}`,
    notes: ["Acesse o domínio para completar a instalação e criar seu usuário admin."],
  },
};
