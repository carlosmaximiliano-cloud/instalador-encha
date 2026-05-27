import { z } from "zod";
import { type StackDefinition } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({});

export const postgres: StackDefinition = {
  id: "postgres",
  repoUrl: "https://github.com/pgvector/pgvector",
  name: "PostgreSQL (interno)",
  description: "Banco PostgreSQL compartilhado pelas stacks que precisam (Evolution, N8N, Chatwoot, Directus). Senha gerada automaticamente.",
  category: "database",
  icon: "database",
  dependsOn: ["traefik-portainer"],
  optionNumber: -1,
  fields: [],
  schema,
  generateSecrets: () => [{ name: "senha_postgres", value: randomBytes(16).toString("hex") }],
  generateYaml(_v, secrets, ctx) {
    const senha = secrets.senha_postgres;
    return `version: "3.7"
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      - POSTGRES_PASSWORD=${senha}
      - PG_MAX_CONNECTIONS=500
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ${ctx.networkName}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  postgres_data:
    external: true
    name: postgres_data

networks:
  ${ctx.networkName}:
    external: true
    name: ${ctx.networkName}
`;
  },
};
