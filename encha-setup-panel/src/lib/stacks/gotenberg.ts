import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_gotenberg: fqdn,
});

export const gotenberg: StackDefinition = {
  id: "gotenberg",
  repoUrl: "https://github.com/gotenberg/gotenberg",
  logoUrl: "https://raw.githubusercontent.com/gotenberg/gotenberg/main/docs/static/logo.svg",
  name: "Gotenberg",
  description: "API HTTP para gerar PDFs a partir de HTML.",
  category: "monitoring",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 55,
  installVia: "panel",
  fields: [
    { name: "url_gotenberg", label: "Domínio do Gotenberg", kind: "domain", placeholder: "pdf.suaempresa.com" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  gotenberg:
    image: gotenberg/gotenberg:latest
    command:
      - "gotenberg"

    volumes:
      - gotenberg_data:/gotenberg

    networks:
      - ${net}

    environment:
      - DEFAULT_LISTEN_PORT=3000

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M
      labels:
        - traefik.enable=true
        - traefik.http.routers.gotenberg.rule=Host(\`${v.url_gotenberg}\`)
        - traefik.http.services.gotenberg.loadbalancer.server.port=3000
        - traefik.http.routers.gotenberg.service=gotenberg
        - traefik.http.routers.gotenberg.tls.certresolver=letsencryptresolver
        - traefik.http.routers.gotenberg.entrypoints=websecure
        - traefik.http.routers.gotenberg.tls=true

volumes:
  gotenberg_data:
    external: true
    name: gotenberg_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_gotenberg: string }).url_gotenberg}`,
  },
};
