import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_browserless: fqdn,
});

export const browserless: StackDefinition = {
  id: "browserless",
  repoUrl: "https://github.com/browserless/browserless",
  name: "Browserless",
  description: "Chrome headless como serviço para automação.",
  category: "monitoring",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 63,
  installVia: "panel",
  fields: [
    { name: "url_browserless", label: "Domínio do Browserless", kind: "domain", placeholder: "browserless.suaempresa.com" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  browserless:
    image: browserless/chrome:latest

    networks:
      - ${net}

    environment:
      - MAX_CONCURRENT_SESSIONS=20
      - MAX_QUEUE_LENGTH=40
      - CONNECTION_TIMEOUT=60000
      - WORKSPACE_DELETE_EXPIRED=1
      - PREBOOT_CHROME=1
      - WORKSPACE_EXPIRE_DAYS=1
      - KEEP_ALIVE=1

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "2"
          memory: 4096M
      labels:
        - traefik.enable=true
        - traefik.http.routers.browserless.rule=Host(\`${v.url_browserless}\`)
        - traefik.http.services.browserless.loadbalancer.server.port=3000
        - traefik.http.routers.browserless.service=browserless
        - traefik.http.routers.browserless.tls.certresolver=letsencryptresolver
        - traefik.http.routers.browserless.entrypoints=websecure
        - traefik.http.routers.browserless.tls=true

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_browserless: string }).url_browserless}`,
  },
};
