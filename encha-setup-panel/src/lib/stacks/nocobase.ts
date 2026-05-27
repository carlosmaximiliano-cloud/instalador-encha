import { z } from "zod";
import { type StackDefinition, fqdn, email, username } from "./types";

const schema = z.object({
  url_nocobase: fqdn,
  mail_nocobase: email,
  user_nocobase: username,
  pass_nocobase: z.string().min(6),
});

export const nocobase: StackDefinition = {
  id: "nocobase",
  repoUrl: "https://github.com/nocobase/nocobase",
  name: "NocoBase",
  description: "Plataforma low-code para apps internos sobre Postgres.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 12,
  installVia: "panel",
  fields: [
    { name: "url_nocobase", label: "Domínio do NocoBase", kind: "domain", placeholder: "nocobase.suaempresa.com", group: "Domínios" },
    { name: "mail_nocobase", label: "E-mail do admin", kind: "email", group: "Admin" },
    { name: "user_nocobase", label: "Nome de usuário", kind: "username", placeholder: "enchaAdmin", group: "Admin" },
    { name: "pass_nocobase", label: "Senha do usuário", kind: "password", sensitive: true, group: "Admin" },
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
  nocobase:
    image: nocobase/nocobase:latest
    volumes:
      - nocobase_storage:/app/nocobase/storage
    networks:
      - ${net}
    environment:
      - INIT_ROOT_EMAIL=${v.mail_nocobase}
      - INIT_ROOT_PASSWORD=${v.pass_nocobase}
      - INIT_ROOT_NICKNAME=${v.user_nocobase}
      - DB_DIALECT=postgres
      - DB_HOST=postgres
      - DB_DATABASE=nocobase
      - DB_USER=postgres
      - DB_PASSWORD=${secrets.senha_postgres}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.nocobase.rule=Host(\`${v.url_nocobase}\`)
        - traefik.http.routers.nocobase.entrypoints=websecure
        - traefik.http.routers.nocobase.tls.certresolver=letsencryptresolver
        - traefik.http.services.nocobase.loadbalancer.server.port=80

volumes:
  nocobase_storage:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_nocobase: string }).url_nocobase}`,
  },
};
