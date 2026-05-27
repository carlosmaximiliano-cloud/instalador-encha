import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_wiki: fqdn,
});

export const wiki: StackDefinition = {
  id: "wiki",
  repoUrl: "https://github.com/requarks/wiki",
  logoUrl: "https://raw.githubusercontent.com/requarks/wiki/master/docs/assets/logo.svg",
  name: "Wiki.js",
  description: "Documentação corporativa moderna com markdown e Git.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 56,
  installVia: "panel",
  fields: [
    { name: "url_wiki", label: "Domínio do Wiki.js", kind: "domain", placeholder: "wiki.suaempresa.com", group: "Domínios" },
  ],
  schema,
  generateSecrets: () => [
    { name: "wiki_postgres_password", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  wiki_app:
    image: requarks/wiki:latest

    networks:
      - ${net}

    environment:
      - DB_TYPE=postgres
      - DB_HOST=wiki_db
      - DB_PORT=5432
      - DB_USER=wikijs
      - DB_PASS=${secrets.wiki_postgres_password}
      - DB_NAME=wiki

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.wiki_app.rule=Host(\`${v.url_wiki}\`)
        - traefik.http.routers.wiki_app.entrypoints=websecure
        - traefik.http.routers.wiki_app.priority=1
        - traefik.http.routers.wiki_app.tls.certresolver=letsencryptresolver
        - traefik.http.routers.wiki_app.service=wiki_app
        - traefik.http.services.wiki_app.loadbalancer.server.port=3000
        - traefik.http.services.wiki_app.loadbalancer.passHostHeader=true

  wiki_db:
    image: postgres:15-alpine

    volumes:
      - wiki_db:/var/lib/postgresql/data

    networks:
      - ${net}

    environment:
      - POSTGRES_DB=wiki
      - POSTGRES_PASSWORD=${secrets.wiki_postgres_password}
      - POSTGRES_USER=wikijs

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  wiki_db:
    external: true
    name: wiki_db

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_wiki: string }).url_wiki}`,
    notes: ["Acesse o domínio para completar a instalação e criar seu usuário."],
  },
};
