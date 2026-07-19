import { z } from "zod";
import { type StackDefinition, fqdn } from "./types";

const schema = z.object({
  url_anythingllm: fqdn,
  qdrant_anythingllm: z.string().min(1),
  api_qdrant_anythingllm: z.string().optional(),
});

export const anythingllm: StackDefinition = {
  id: "anythingllm",
  repoUrl: "https://github.com/Mintplex-Labs/anything-llm",
  logoUrl: "https://raw.githubusercontent.com/Mintplex-Labs/anything-llm/master/public/logo.svg",
  name: "AnythingLLM",
  description: "Cliente LLM all-in-one com RAG sobre seus documentos.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer", "qdrant"],
  optionNumber: 31,
  installVia: "panel",
  fields: [
    { name: "url_anythingllm", label: "Domínio do AnythingLLM", kind: "domain", placeholder: "anything.suaempresa.com" },
    { name: "qdrant_anythingllm", label: "Endpoint do Qdrant", kind: "text", placeholder: "http://qdrant:6333" },
    { name: "api_qdrant_anythingllm", label: "API Key do Qdrant (opcional)", kind: "password", sensitive: true, optional: true },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  anythingllm:
    image: mintplexlabs/anythingllm:latest
    volumes:
      - anythingllm_storage:/app/server/storage
    networks:
      - ${net}
    environment:
      - STORAGE_DIR=/app/server/storage
      - VECTOR_DB=qdrant
      - QDRANT_ENDPOINT=${v.qdrant_anythingllm}
      - QDRANT_API_KEY=${v.api_qdrant_anythingllm ?? ""}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.anythingllm.rule=Host(\`${v.url_anythingllm}\`)"
        - "traefik.http.services.anythingllm.loadbalancer.server.port=3001"
        - "traefik.http.routers.anythingllm.service=anythingllm"
        - "traefik.http.routers.anythingllm.entrypoints=websecure"
        - "traefik.http.routers.anythingllm.tls.certresolver=letsencryptresolver"

volumes:
  anythingllm_storage:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_anythingllm: string }).url_anythingllm}`,
    notes: ["Usuário e senha criados no primeiro acesso"],
  },
};
