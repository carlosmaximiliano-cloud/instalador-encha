import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({
  url_flowise: fqdn,
  user_flowise: username,
  pass_flowise: z.string().min(8),
});

export const flowise: StackDefinition = {
  id: "flowise",
  repoUrl: "https://github.com/FlowiseAI/Flowise",
  logoUrl: "https://raw.githubusercontent.com/FlowiseAI/Flowise/main/images/flowise.png",
  name: "Flowise",
  description: "Construa agentes LLM com fluxos visuais drag-and-drop.",
  category: "ai",
  icon: "workflow",
  dependsOn: ["traefik-portainer", "postgres"],
  postgresDatabases: ["flowise"],
  optionNumber: 28,
  installVia: "panel",
  fields: [
    { name: "url_flowise", label: "Domínio do Flowise", kind: "domain", placeholder: "flowise.suaempresa.com" },
    { name: "user_flowise", label: "Usuário", kind: "username", placeholder: "admin" },
    { name: "pass_flowise", label: "Senha", kind: "password", sensitive: true },
  ],
  schema,
  generateSecrets: () => [
    { name: "encryption_key", value: randomBytes(16).toString("hex") },
    { name: "senha_postgres", value: "REUSE_POSTGRES" },
  ],
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  flowise:
    image: flowiseai/flowise:latest
    volumes:
      - flowise_data:/root/.flowise
    networks:
      - ${net}
    environment:
      - FLOWISE_USERNAME=${v.user_flowise}
      - FLOWISE_PASSWORD=${v.pass_flowise}
      - DATABASE_TYPE=postgres
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_USER=postgres
      - DATABASE_PASSWORD=${secrets.senha_postgres}
      - DATABASE_NAME=flowise
      - FLOWISE_SECRETKEY_OVERWRITE=${secrets.encryption_key}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.flowise.rule=Host(\`${v.url_flowise}\`)"
        - "traefik.http.services.flowise.loadbalancer.server.port=3000"
        - "traefik.http.routers.flowise.service=flowise"
        - "traefik.http.routers.flowise.entrypoints=websecure"
        - "traefik.http.routers.flowise.tls.certresolver=letsencryptresolver"

volumes:
  flowise_data:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as { url_flowise: string }).url_flowise}`,
    notes: ["Acesse com o usuário e senha definidos na instalação"],
  },
};
