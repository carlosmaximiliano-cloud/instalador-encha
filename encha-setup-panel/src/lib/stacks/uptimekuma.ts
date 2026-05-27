import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_uptimekuma: fqdn,
});

export const uptimekuma: StackDefinition = {
  id: "uptimekuma",
  repoUrl: "https://github.com/louislam/uptime-kuma",
  logoUrl: "https://raw.githubusercontent.com/louislam/uptime-kuma/master/public/icon.svg",
  name: "Uptime Kuma",
  description: "Monitoramento de uptime bonito e simples.",
  category: "monitoring",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 17,
  installVia: "panel",
  fields: [
    { name: "url_uptimekuma", label: "Domínio do Uptime Kuma", kind: "domain", placeholder: "status.encha.ai", group: "Domínios" },
  ],
  schema,
  generateSecrets: () => [],
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  uptimekuma:
    image: louislam/uptime-kuma:latest
    volumes:
      - uptimekuma_data:/app/data
    networks:
      - ${net}
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.uptimekuma.rule=Host(\`${v.url_uptimekuma}\`)"
        - "traefik.http.services.uptimekuma.loadbalancer.server.port=3001"
        - "traefik.http.routers.uptimekuma.entrypoints=websecure"
        - "traefik.http.routers.uptimekuma.tls.certresolver=letsencryptresolver"

volumes:
  uptimekuma_data:

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_uptimekuma}`,
    notes: ["Crie seu usuário no primeiro acesso."],
  },
};
