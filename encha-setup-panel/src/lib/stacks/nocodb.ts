import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_nocodb: fqdn,
});

export const nocodb: StackDefinition = {
  id: "nocodb",
  repoUrl: "https://github.com/nocodb/nocodb",
  logoUrl: "https://raw.githubusercontent.com/nocodb/nocodb/master/packages/nc-gui/assets/nc_logo.png",
  name: "NocoDB",
  description: "Airtable open-source — turn any DB into a spreadsheet.",
  category: "cms",
  icon: "table-properties",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 32,
  installVia: "panel",
  fields: [
    { name: "url_nocodb", label: "Domínio do NocoDB", kind: "domain", placeholder: "nocodb.suaempresa.com", group: "Domínios" },
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
  nocodb:
    image: nocodb/nocodb:latest
    volumes:
      - nocodb_data:/usr/app/data
    networks:
      - ${net}
    environment:
      - NC_PUBLIC_URL=https://${v.url_nocodb}
      - NC_DB_TYPE=pg
      - NC_DB_HOST=postgres
      - NC_DB_PORT=5432
      - NC_DB_DATABASE=nocodb
      - NC_DB_USER=postgres
      - NC_DB_PASSWORD=${secrets.senha_postgres}
      - NC_DISABLE_TELE=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.nocodb.rule=Host(\`${v.url_nocodb}\`)
        - traefik.http.routers.nocodb.entrypoints=websecure
        - traefik.http.routers.nocodb.tls.certresolver=letsencryptresolver
        - traefik.http.routers.nocodb.service=nocodb
        - traefik.http.services.nocodb.loadbalancer.server.port=8080

volumes:
  nocodb_data:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_nocodb: string }).url_nocodb}`,
  },
};
