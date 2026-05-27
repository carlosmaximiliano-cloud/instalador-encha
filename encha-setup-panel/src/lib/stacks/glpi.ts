import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_glpi: fqdn,
});

export const glpi: StackDefinition = {
  id: "glpi",
  repoUrl: "https://github.com/glpi-project/glpi",
  name: "GLPI",
  description: "ITSM/gestão de ativos e suporte técnico.",
  category: "erp",
  icon: "headphones",
  dependsOn: ["traefik-portainer", "mysql"],
  optionNumber: 27,
  installVia: "panel",
  fields: [
    { name: "url_glpi", label: "Domínio do GLPI", kind: "domain", placeholder: "helpdesk.suaempresa.com" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  glpi:
    image: diouxx/glpi:latest
    volumes:
      - glpi_data:/var/www/html/glpi
    networks:
      - ${net}
    environment:
      - TIMEZONE=America/Sao_Paulo
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.glpi.rule=Host(\`${v.url_glpi}\`)"
        - "traefik.http.services.glpi.loadbalancer.server.port=80"
        - "traefik.http.routers.glpi.entrypoints=websecure"
        - "traefik.http.routers.glpi.tls.certresolver=letsencryptresolver"

volumes:
  glpi_data:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_glpi: string }).url_glpi}`,
    notes: [
      "Acesse o domínio para completar a instalação via setup",
      "Host MySQL: mysql | Usuário: root | Banco: glpi",
      "Credenciais padrão após setup: glpi / glpi",
    ],
  },
};
