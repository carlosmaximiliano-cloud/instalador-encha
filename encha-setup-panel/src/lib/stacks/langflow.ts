import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_langflow: fqdn,
  user_langflow: username,
  pass_langflow: z.string().min(8),
});

export const langflow: StackDefinition = {
  id: "langflow",
  repoUrl: "https://github.com/logspace-ai/langflow",
  name: "Langflow",
  description: "Editor visual para fluxos LangChain e agentes IA.",
  category: "ai",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "postgres"],
  optionNumber: 29,
  installVia: "panel",
  fields: [
    { name: "url_langflow", label: "Domínio do Langflow", kind: "domain", placeholder: "langflow.suaempresa.com" },
    { name: "user_langflow", label: "Usuário", kind: "username", placeholder: "admin" },
    { name: "pass_langflow", label: "Senha", kind: "password", sensitive: true },
  ],
  schema,
  generateSecrets: () => [
    { name: "key_langflow", value: randomBytes(32).toString("base64") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.8"
services:
  langflow:
    image: langflowai/langflow:latest
    volumes:
      - langflow_data:/app/langflow
    networks:
      - ${net}
    environment:
      - LANGFLOW_AUTO_LOGIN=false
      - LANGFLOW_SUPERUSER=${v.user_langflow}
      - LANGFLOW_SUPERUSER_PASSWORD=${v.pass_langflow}
      - LANGFLOW_HOST=0.0.0.0
      - BACKEND_URL=https://${v.url_langflow}
      - LANGFLOW_SECRET_KEY=${secrets.key_langflow}
      - LANGFLOW_NEW_USER_IS_ACTIVE=false
      - LANGFLOW_DATABASE_URL=postgresql://postgres:${secrets.senha_postgres}@postgres:5432/langflow
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.langflow.rule=Host(\`${v.url_langflow}\`)"
        - "traefik.http.services.langflow.loadbalancer.server.port=7860"
        - "traefik.http.routers.langflow.service=langflow"
        - "traefik.http.routers.langflow.entrypoints=websecure"
        - "traefik.http.routers.langflow.tls.certresolver=letsencryptresolver"

volumes:
  langflow_data:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_langflow: string }).url_langflow}`,
    notes: ["Acesse com o usuário e senha definidos na instalação"],
  },
};
