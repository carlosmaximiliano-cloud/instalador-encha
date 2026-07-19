import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_openproject: fqdn,
});

export const openproject: StackDefinition = {
  id: "openproject",
  repoUrl: "https://github.com/opf/openproject",
  logoUrl: "https://raw.githubusercontent.com/opf/openproject/dev/docs/logo.svg",
  name: "OpenProject",
  description: "Gestão de projetos enterprise open-source.",
  category: "erp",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 48,
  installVia: "panel",
  fields: [
    { name: "url_openproject", label: "Domínio do OpenProject", kind: "domain", placeholder: "projetos.suaempresa.com" },
  ],
  schema,
  generateSecrets: () => [
    { name: "key_openproject", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  openproject:
    image: openproject/openproject:15

    volumes:
      - openproject_pgdata:/var/openproject/pgdata
      - openproject_assets:/var/openproject/assets

    networks:
      - ${net}

    environment:
      - OPENPROJECT_SECRET_KEY_BASE=${secrets.key_openproject}
      - OPENPROJECT_HOST__NAME=${v.url_openproject}
      - OPENPROJECT_HTTPS=true
      - OPENPROJECT_RAILS__CACHE__STORE=redis
      - OPENPROJECT_CACHE_REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/openproject
      - OPENPROJECT_DEFAULT__LANGUAGE=pt-BR

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.openproject.rule=Host(\`${v.url_openproject}\`)
        - traefik.http.routers.openproject.entrypoints=websecure
        - traefik.http.routers.openproject.priority=1
        - traefik.http.routers.openproject.tls.certresolver=letsencryptresolver
        - traefik.http.routers.openproject.service=openproject
        - traefik.http.services.openproject.loadbalancer.server.port=8080
        - traefik.http.services.openproject.loadbalancer.passHostHeader=true

volumes:
  openproject_pgdata:
    external: true
    name: openproject_pgdata
  openproject_assets:
    external: true
    name: openproject_assets

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_openproject: string }).url_openproject}`,
    notes: ["Usuário padrão: admin | Senha padrão: admin (altere no primeiro login)"],
  },
};
