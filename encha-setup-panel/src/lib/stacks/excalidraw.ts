import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_excalidraw: fqdn,
});

export const excalidraw: StackDefinition = {
  id: "excalidraw",
  repoUrl: "https://github.com/excalidraw/excalidraw",
  logoUrl: "https://raw.githubusercontent.com/excalidraw/excalidraw/main/public/logo.svg",
  name: "Excalidraw",
  description: "Whiteboard virtual estilo lápis para diagramas rápidos.",
  category: "design",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 69,
  installVia: "panel",
  fields: [
    { name: "url_excalidraw", label: "Domínio do Excalidraw", kind: "domain", placeholder: "draw.suaempresa.com", group: "Domínios" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  excalidraw:
    image: excalidraw/excalidraw:latest

    volumes:
      - excalidraw_data:/data

    networks:
      - ${net}

    environment:
      - EXCALIDRAW_PORT=80
      - NODE_ENV=development

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
        - traefik.http.routers.excalidraw.rule=Host(\`${v.url_excalidraw}\`)
        - traefik.http.services.excalidraw.loadbalancer.server.port=80
        - traefik.http.routers.excalidraw.service=excalidraw
        - traefik.http.routers.excalidraw.tls.certresolver=letsencryptresolver
        - traefik.http.routers.excalidraw.entrypoints=websecure
        - traefik.http.routers.excalidraw.tls=true

volumes:
  excalidraw_data:
    external: true
    name: excalidraw_data

networks:
  ${net}:
    name: ${net}
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_excalidraw: string }).url_excalidraw}`,
  },
};
