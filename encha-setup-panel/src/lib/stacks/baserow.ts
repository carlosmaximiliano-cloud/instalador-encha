import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_baserow: fqdn,
});

export const baserow: StackDefinition = {
  id: "baserow",
  repoUrl: "https://github.com/bram2w/baserow",
  logoUrl: "https://raw.githubusercontent.com/bram2w/baserow/master/docs/logo.png",
  name: "Baserow",
  description: "Airtable open-source colaborativo.",
  category: "cms",
  icon: "table-properties",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["baserow"],
  optionNumber: 14,
  installVia: "panel",
  fields: [
    { name: "url_baserow", label: "Domínio do Baserow", kind: "domain", placeholder: "baserow.suaempresa.com", group: "Domínios" },
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
  baserow:
    image: baserow/baserow:latest
    volumes:
      - baserow_data:/baserow/data
    networks:
      - ${net}
    environment:
      - BASEROW_PUBLIC_URL=https://${v.url_baserow}
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/baserow
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.baserow.rule=Host(\`${v.url_baserow}\`)
        - traefik.http.routers.baserow.entrypoints=websecure
        - traefik.http.routers.baserow.tls.certresolver=letsencryptresolver
        - traefik.http.services.baserow.loadbalancer.server.port=80

volumes:
  baserow_data:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_baserow: string }).url_baserow}`,
  },
};
