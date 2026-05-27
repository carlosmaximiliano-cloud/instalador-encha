import { z } from "zod";
import { type StackDefinition, fqdn, email, strongPassword } from "./types";

const schema = z.object({
  url_pgadmin: fqdn,
  email_pgadmin: email,
  senha_pgadmin: strongPassword,
});

export const pgadmin: StackDefinition = {
  id: "pgadmin",
  repoUrl: "https://github.com/pgadmin-org/pgadmin4",
  logoUrl: "https://raw.githubusercontent.com/pgadmin-org/pgadmin4/master/docs/en_US/_static/pgadmin.svg",
  name: "PgAdmin",
  description: "UI web para gerenciar o PostgreSQL — queries, schemas, backups.",
  category: "admin",
  icon: "table-properties",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 11,
  fields: [
    { name: "url_pgadmin", label: "Domínio", kind: "domain", placeholder: "pgadmin.suaempresa.com", group: "Domínios" },
    { name: "email_pgadmin", label: "E-mail de login", kind: "email", group: "Credenciais" },
    { name: "senha_pgadmin", label: "Senha", kind: "password", sensitive: true, group: "Credenciais" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  pgadmin:
    image: dpage/pgadmin4:latest
    networks:
      - ${net}
    environment:
      - PGADMIN_DEFAULT_EMAIL=${v.email_pgadmin}
      - PGADMIN_DEFAULT_PASSWORD=${v.senha_pgadmin}
      - PGADMIN_CONFIG_ENHANCED_COOKIE_PROTECTION=True
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.pgadmin.rule=Host(\`${v.url_pgadmin}\`)
        - traefik.http.routers.pgadmin.entrypoints=websecure
        - traefik.http.routers.pgadmin.tls.certresolver=letsencryptresolver
        - traefik.http.services.pgadmin.loadbalancer.server.port=80

volumes:
  pgadmin_data:
    external: true
    name: pgadmin_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: { accessUrl: (v) => `https://${(v as { url_pgadmin: string }).url_pgadmin}` },
};
