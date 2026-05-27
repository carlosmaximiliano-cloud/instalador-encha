import { z } from "zod";
import { type StackDefinition } from "./types";
import { randomBytes } from "node:crypto";

const schema = z.object({});

export const postgres: StackDefinition = {
  id: "postgres",
  repoUrl: "https://github.com/postgres/postgres",
  logoUrl: "https://raw.githubusercontent.com/postgres/postgres/master/src/interfaces/libpq/libpq.png",
  name: "PostgreSQL",
  description: "Banco de dados relacional compartilhado pelas stacks que precisam (Evolution, N8N, Chatwoot, Directus). Senha gerada automaticamente.",
  category: "database",
  icon: "database",
  dependsOn: ["traefik-portainer"],
  optionNumber: 3,
  installVia: "panel",
  fields: [],
  schema,
  generateSecrets: () => [{ name: "senha_postgres", value: randomBytes(16).toString("hex") }],
  generateYaml(_v, secrets, ctx) {
    const senha = secrets.senha_postgres;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  postgres:
    image: postgres:16
    command:
      - "postgres"
      - "-c"
      - "max_connections=500"
      - "-c"
      - "shared_buffers=512MB"
    environment:
      - POSTGRES_PASSWORD=${senha}
      - TZ=America/Sao_Paulo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ${net}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M

volumes:
  postgres_data:

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    notes: [
      "Host interno (dentro do Swarm): postgres_postgres:5432",
      "Usuário: postgres",
      "Senha gerada automaticamente — veja no Audit log",
      "Porta 5432 não exposta externamente por segurança",
    ],
  },
};
