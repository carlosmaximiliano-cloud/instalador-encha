import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_evolution: fqdn,
});

export const evolution: StackDefinition = {
  id: "evolution",
  repoUrl: "https://github.com/EvolutionAPI/evolution-api",
  name: "Evolution API",
  description: "API multi-instância de WhatsApp com integração nativa para N8N, Chatwoot e Typebot.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 3,
  fields: [
    {
      name: "url_evolution",
      label: "Domínio da Evolution API",
      kind: "domain",
      placeholder: "evolution.suaempresa.com",
      group: "Domínios",
    },
  ],
  schema,
  generateSecrets: () => [
    { name: "apikeyglobal", value: randomBytes(32).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  evolution_api:
    image: evoapicloud/evolution-api:latest
    volumes:
      - evolution_instances:/evolution/instances
    networks:
      - ${net}
    environment:
      - SERVER_URL=https://${v.url_evolution}
      - AUTHENTICATION_API_KEY=${secrets.apikeyglobal}
      - AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
      - DEL_INSTANCE=false
      - QRCODE_LIMIT=1902
      - LANGUAGE=pt-BR
      - CONFIG_SESSION_PHONE_CLIENT=Encha
      - CONFIG_SESSION_PHONE_NAME=Chrome
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/evolution
      - DATABASE_CONNECTION_CLIENT_NAME=evolution
      - DATABASE_SAVE_DATA_INSTANCE=true
      - DATABASE_SAVE_DATA_NEW_MESSAGE=true
      - DATABASE_SAVE_MESSAGE_UPDATE=true
      - DATABASE_SAVE_DATA_CONTACTS=true
      - DATABASE_SAVE_DATA_CHATS=true
      - DATABASE_SAVE_DATA_LABELS=true
      - DATABASE_SAVE_DATA_HISTORIC=true
      - N8N_ENABLED=true
      - OPENAI_ENABLED=true
      - DIFY_ENABLED=true
      - TYPEBOT_ENABLED=true
      - TYPEBOT_API_VERSION=latest
      - CHATWOOT_ENABLED=true
      - CHATWOOT_MESSAGE_READ=true
      - CHATWOOT_MESSAGE_DELETE=true
      - CACHE_REDIS_ENABLED=true
      - CACHE_REDIS_URI=redis://evolution_redis:6379/1
      - CACHE_REDIS_PREFIX_KEY=evolution
      - CACHE_REDIS_SAVE_INSTANCES=false
      - CACHE_LOCAL_ENABLED=false
      - TELEMETRY=false
      - WEBSOCKET_ENABLED=false
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.evolution.rule=Host(\`${v.url_evolution}\`)
        - traefik.http.routers.evolution.entrypoints=websecure
        - traefik.http.routers.evolution.priority=1
        - traefik.http.routers.evolution.tls.certresolver=letsencryptresolver
        - traefik.http.routers.evolution.service=evolution
        - traefik.http.services.evolution.loadbalancer.server.port=8080
        - traefik.http.services.evolution.loadbalancer.passHostHeader=true

  evolution_redis:
    image: redis:latest
    command: ["redis-server", "--appendonly", "yes", "--port", "6379"]
    volumes:
      - evolution_redis:/data
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  evolution_instances:
    external: true
    name: evolution_instances
  evolution_redis:
    external: true
    name: evolution_redis

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_evolution: string }).url_evolution}/manager`,
    notes: [
      "Acesse o Manager para criar instâncias",
      "Sua API key global foi gerada e salva criptografada — recupere em Logs > Detalhes da instalação",
    ],
  },
};
