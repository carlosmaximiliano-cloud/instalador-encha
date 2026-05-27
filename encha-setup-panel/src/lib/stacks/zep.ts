import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_zep: fqdn,
  apikey_openai_zep: z.string().min(1),
});

export const zep: StackDefinition = {
  id: "zep",
  repoUrl: "https://github.com/getzep/zep",
  name: "Zep",
  description: "Memória de longo prazo e contexto para agentes IA.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer"],
  optionNumber: 49,
  installVia: "panel",
  fields: [
    {
      name: "url_zep",
      label: "Domínio do Zep",
      kind: "domain",
      placeholder: "zep.encha.ai",
    },
    {
      name: "apikey_openai_zep",
      label: "API Key da OpenAI",
      kind: "password",
      placeholder: "sk-...",
      sensitive: true,
    },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key_zep", value: randomBytes(16).toString("hex") },
    { name: "apikey_zep", value: randomBytes(16).toString("hex") },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  zep_nlp:
    image: ghcr.io/getzep/zep-nlp-server:latest
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  zep_app:
    image: ghcr.io/getzep/zep:latest
    networks:
      - ${net}
    environment:
      - ZEP_STORE_TYPE=postgres
      - ZEP_STORE_POSTGRES_DSN=postgres://postgres:POSTGRES_PASSWORD@pgvector:5432/zep?sslmode=disable
      - ZEP_AUTH_SECRET=${secrets.apikey_zep}
      - ZEP_OPENAI_API_KEY=${v.apikey_openai_zep}
      - ZEP_NLP_SERVER_URL=http://zep_nlp:5557
      - ZEP_EXTRACTORS_DOCUMENTS_EMBEDDINGS_SERVICE=openai
      - ZEP_EXTRACTORS_DOCUMENTS_EMBEDDINGS_DIMENSIONS=1536
      - ZEP_EXTRACTORS_MESSAGES_EMBEDDINGS_SERVICE=openai
      - ZEP_EXTRACTORS_MESSAGES_EMBEDDINGS_DIMENSIONS=1536
      - ZEP_EXTRACTORS_MESSAGES_SUMMARIZER_EMBEDDINGS_SERVICE=openai
      - ZEP_EXTRACTORS_MESSAGES_SUMMARIZER_EMBEDDINGS_DIMENSIONS=1536
      - ZEP_GRAPHITI_URL=http://zep_graphiti:8003
      - ZEP_LOG_LEVEL=debug
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.zep.rule=Host(\`${v.url_zep}\`)
        - traefik.http.routers.zep.entrypoints=websecure
        - traefik.http.routers.zep.tls.certresolver=letsencryptresolver
        - traefik.http.services.zep.loadbalancer.server.port=8000
        - traefik.http.services.zep.loadbalancer.passHostHeader=true
        - traefik.http.routers.zep.service=zep

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_zep}/admin`,
  },
};
