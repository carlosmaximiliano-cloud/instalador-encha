import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_wisemapping: fqdn,
});

export const wisemapping: StackDefinition = {
  id: "wisemapping",
  repoUrl: "https://github.com/wisemapping/wisemapping-open-source",
  logoUrl: "https://raw.githubusercontent.com/wisemapping/wisemapping-open-source/develop/packages/webapp/public/logo.svg",
  name: "WiseMapping",
  description: "Editor de mapas mentais colaborativo open-source.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 51,
  installVia: "panel",
  fields: [
    { name: "url_wisemapping", label: "Domínio do WiseMapping", kind: "domain", placeholder: "mapa.suaempresa.com", group: "Domínios" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  wisemapping:
    image: wisemapping/wisemapping:latest

    volumes:
      - wisemapping_db:/var/lib/wisemapping/db

    networks:
      - ${net}

    environment:
      - JAVA_OPTS=-Dserver.port=8080

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
        - traefik.http.routers.wisemapping.rule=Host(\`${v.url_wisemapping}\`)
        - traefik.http.services.wisemapping.loadbalancer.server.port=8080
        - traefik.http.routers.wisemapping.service=wisemapping
        - traefik.http.routers.wisemapping.tls.certresolver=letsencryptresolver
        - traefik.http.routers.wisemapping.entrypoints=websecure
        - traefik.http.routers.wisemapping.tls=true

volumes:
  wisemapping_db:
    external: true
    name: wisemapping_db

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_wisemapping: string }).url_wisemapping}`,
  },
};
