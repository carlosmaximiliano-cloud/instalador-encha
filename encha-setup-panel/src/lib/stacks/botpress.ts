import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_botpress: fqdn,
});

export const botpress: StackDefinition = {
  id: "botpress",
  repoUrl: "https://github.com/botpress/botpress",
  logoUrl: "https://raw.githubusercontent.com/botpress/botpress/master/docs/logo.svg",
  name: "Botpress",
  description: "Plataforma de chatbots conversacionais com IA.",
  category: "chatbot",
  icon: "bot",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["botpress"],
  optionNumber: 13,
  installVia: "panel",
  fields: [
    { name: "url_botpress", label: "Domínio do Botpress", kind: "domain", placeholder: "botpress.suaempresa.com" },
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

  botpress:
    image: botpress/server:latest
    volumes:
      - botpress_data:/botpress/data
    networks:
      - ${net}
    environment:
      - EXTERNAL_URL=https://${v.url_botpress}
      - BP_PRODUCTION=true
      - DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/botpress
      - REDIS_URL=redis://redis:6379
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.botpress.rule=Host(\`${v.url_botpress}\`)"
        - "traefik.http.services.botpress.loadbalancer.server.port=3000"
        - "traefik.http.routers.botpress.entrypoints=websecure"
        - "traefik.http.routers.botpress.tls.certresolver=letsencryptresolver"

volumes:
  botpress_data:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_botpress: string }).url_botpress}`,
    notes: ["Crie seu usuário no primeiro acesso"],
  },
};
