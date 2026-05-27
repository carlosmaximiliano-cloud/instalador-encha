import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_appsmith: fqdn,
});

export const appsmith: StackDefinition = {
  id: "appsmith",
  repoUrl: "https://github.com/appsmithorg/appsmith",
  name: "Appsmith",
  description: "Builder visual de painéis e ferramentas internas.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 20,
  installVia: "panel",
  fields: [
    { name: "url_appsmith", label: "Domínio do Appsmith", kind: "domain", placeholder: "apps.suaempresa.com", group: "Domínios" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  appsmith:
    image: appsmith/appsmith-ee:latest
    volumes:
      - appsmith_data:/appsmith-stacks
    networks:
      - ${net}
    environment:
      - APPSMITH_CUSTOM_DOMAIN=https://${v.url_appsmith}
      - APPSMITH_SIGNUP_DISABLED=false
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 4096M
      labels:
        - traefik.enable=true
        - traefik.http.routers.appsmith.rule=Host(\`${v.url_appsmith}\`)
        - traefik.http.routers.appsmith.entrypoints=websecure
        - traefik.http.routers.appsmith.tls.certresolver=letsencryptresolver
        - traefik.http.services.appsmith.loadbalancer.server.port=80

volumes:
  appsmith_data:
    external: true

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_appsmith: string }).url_appsmith}`,
  },
};
