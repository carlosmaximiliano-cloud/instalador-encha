import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_wppconnect: fqdn,
});

export const wppconnect: StackDefinition = {
  id: "wppconnect",
  repoUrl: "https://github.com/wppconnect-team/wppconnect-server",
  name: "WPPConnect",
  description: "API multi-sessão para WhatsApp baseada em puppeteer.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer"],
  optionNumber: 62,
  installVia: "panel",
  fields: [
    { name: "url_wppconnect", label: "Domínio do WPPConnect", kind: "domain", placeholder: "wpp.suaempresa.com" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  wppconnect_api:
    image: wppconnect/server-cli:latest
    volumes:
      - wppconnect_config:/usr/src/wpp-server
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.wppconnect_api.rule=Host(\`${v.url_wppconnect}\`) && PathPrefix(\`/\`)
        - traefik.http.routers.wppconnect_api.entrypoints=websecure
        - traefik.http.routers.wppconnect_api.priority=1
        - traefik.http.routers.wppconnect_api.tls.certresolver=letsencryptresolver
        - traefik.http.routers.wppconnect_api.service=wppconnect_api
        - traefik.http.services.wppconnect_api.loadbalancer.server.port=21465
        - traefik.http.services.wppconnect_api.loadbalancer.passHostHeader=true

volumes:
  wppconnect_config:
    external: true
    name: wppconnect_config

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_wppconnect: string }).url_wppconnect}`,
    notes: ["Documentação disponível em https://<seu-dominio>/api-docs"],
  },
};
