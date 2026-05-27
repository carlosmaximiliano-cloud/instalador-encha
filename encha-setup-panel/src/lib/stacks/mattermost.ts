import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_mattermost: fqdn,
});

export const mattermost: StackDefinition = {
  id: "mattermost",
  repoUrl: "https://github.com/mattermost/mattermost",
  name: "Mattermost",
  description: "Slack self-hosted para times técnicos e seguros.",
  category: "communication",
  icon: "message-circle",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 24,
  installVia: "panel",
  fields: [
    { name: "url_mattermost", label: "Domínio do Mattermost", kind: "domain", placeholder: "chat.encha.ai", group: "Domínios" },
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

  mattermost:
    image: mattermost/mattermost-team-edition:latest
    volumes:
      - mattermost_data:/mattermost/data
      - mattermost_config:/mattermost/config
      - mattermost_logs:/mattermost/logs
      - mattermost_plugins:/mattermost/plugins
      - mattermost_client_plugins:/mattermost/client/plugins
    networks:
      - ${net}
    environment:
      - MM_SERVICESETTINGS_SITEURL=https://${v.url_mattermost}
      - MM_SQLSETTINGS_DRIVERNAME=postgres
      - MM_SQLSETTINGS_DATASOURCE=postgres://postgres:${secrets.senha_postgres}@postgres:5432/mattermost?sslmode=disable&connect_timeout=10
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.mattermost.rule=Host(\`${v.url_mattermost}\`)"
        - "traefik.http.services.mattermost.loadbalancer.server.port=8065"
        - "traefik.http.routers.mattermost.entrypoints=websecure"
        - "traefik.http.routers.mattermost.tls.certresolver=letsencryptresolver"

volumes:
  mattermost_data:
    external: true
  mattermost_config:
    external: true
  mattermost_logs:
    external: true
  mattermost_plugins:
    external: true
  mattermost_client_plugins:
    external: true

networks:
  ${net}:
    external: true
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_mattermost}`,
    notes: ["Crie seu usuário no primeiro acesso."],
  },
};
