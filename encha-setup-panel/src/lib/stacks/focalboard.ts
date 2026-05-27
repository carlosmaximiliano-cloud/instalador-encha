import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_focalboard: fqdn,
});

export const focalboard: StackDefinition = {
  id: "focalboard",
  repoUrl: "https://github.com/mattermost-community/focalboard",
  name: "Focalboard",
  description: "Trello/Notion open-source para gestão de projetos.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 26,
  installVia: "panel",
  fields: [
    { name: "url_focalboard", label: "Domínio do Focalboard", kind: "domain", placeholder: "boards.encha.ai", group: "Domínios" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.8"
services:

  focalboard:
    image: mattermost/focalboard:latest
    volumes:
      - focalboard_data:/opt/focalboard/data
    networks:
      - ${net}
    environment:
      - VIRTUAL_HOST=${v.url_focalboard}
      - VIRTUAL_PORT=8000
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.focalboard.rule=Host(\`${v.url_focalboard}\`)"
        - "traefik.http.services.focalboard.loadbalancer.server.port=8000"
        - "traefik.http.routers.focalboard.entrypoints=websecure"
        - "traefik.http.routers.focalboard.tls.certresolver=letsencryptresolver"

volumes:
  focalboard_data:

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_focalboard}`,
    notes: ["Crie seu usuário no primeiro acesso."],
  },
};
