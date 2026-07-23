import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_metabase: fqdn,
});

export const metabase: StackDefinition = {
  id: "metabase",
  repoUrl: "https://github.com/metabase/metabase",
  logoUrl: "https://raw.githubusercontent.com/metabase/metabase/master/resources/metabase.svg",
  name: "Metabase",
  description: "BI open-source — gráficos e dashboards em minutos.",
  category: "analytics",
  icon: "table-properties",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["metabase"],
  optionNumber: 36,
  installVia: "panel",
  fields: [
    { name: "url_metabase", label: "Domínio do Metabase", kind: "domain", placeholder: "bi.suaempresa.com" },
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

  metabase:
    image: metabase/metabase:latest

    volumes:
      - metabase_data:/metabase3-data

    networks:
      - ${net}

    environment:
      - MB_SITE_URL=https://${v.url_metabase}
      - MB_REDIRECT_ALL_REQUESTS_TO_HTTPS=true
      - MB_JETTY_PORT=3000
      - MB_JETTY_HOST=0.0.0.0
      - MB_DB_MIGRATION_LOCATION=none
      - MB_DB_TYPE=postgres
      - MB_DB_DBNAME=metabase
      - MB_DB_PORT=5432
      - MB_DB_USER=postgres
      - MB_DB_PASS=${secrets.senha_postgres}
      - MB_DB_HOST=postgres
      - MB_AUTOMIGRATE=false

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.metabase.rule=Host(\`${v.url_metabase}\`)
        - traefik.http.services.metabase.loadbalancer.server.port=3000
        - traefik.http.routers.metabase.service=metabase
        - traefik.http.routers.metabase.entrypoints=websecure
        - traefik.http.routers.metabase.tls=true
        - traefik.http.routers.metabase.tls.certresolver=letsencryptresolver

volumes:
  metabase_data:
    external: true
    name: metabase_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_metabase: string }).url_metabase}`,
    notes: ["Acesse o domínio para completar a instalação e criar seu usuário"],
  },
};
