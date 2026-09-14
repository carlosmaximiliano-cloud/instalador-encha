import { z } from "zod";
import { type StackDefinition } from "./types";
import { randomBytes } from "node:crypto";

// pgvector/pgvector:pg16 é a imagem oficial do postgres:16 (mesma base Debian,
// mesmo PG_MAJOR) + a extensão pgvector pré-compilada — drop-in, mesmo PGDATA.
// Trocado a partir do postgres:16 puro porque o Evo CRM Community exige a
// extensão `vector` (usada pelo processor de IA para busca semântica).
export const POSTGRES_IMAGE = "pgvector/pgvector:pg16";

const schema = z.object({});

export const postgres: StackDefinition = {
  id: "postgres",
  repoUrl: "https://github.com/pgvector/pgvector",
  logoUrl: "https://raw.githubusercontent.com/postgres/postgres/master/src/interfaces/libpq/libpq.png",
  name: "PostgreSQL",
  description: "Banco de dados relacional compartilhado pelas stacks que precisam (Evolution, N8N, Chatwoot, Directus, Evo CRM). Inclui a extensão pgvector. Senha gerada automaticamente.",
  category: "database",
  icon: "database",
  dependsOn: ["traefik-portainer"],
  optionNumber: 3,
  installVia: "panel",
  externalVolumes: ["postgres_data"],
  updatableImages: [{ service: "postgres", image: POSTGRES_IMAGE }],
  fields: [],
  schema,
  generateSecrets: () => [{ name: "senha_postgres", value: randomBytes(16).toString("hex") }],
  generateYaml(_v, secrets, ctx) {
    const senha = secrets.senha_postgres;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  postgres:
    image: ${POSTGRES_IMAGE}
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
    external: true
    name: postgres_data

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
      "Inclui a extensão pgvector (necessária para o Evo CRM Community) — mesma base do postgres:16, dados existentes não são afetados.",
    ],
  },
  i18n: {
    en: {
      description:
        "Relational database shared by the stacks that need it (Evolution, N8N, Chatwoot, Directus, Evo CRM). Includes the pgvector extension. Password generated automatically.",
      notes: [
        "Internal host (inside the Swarm): postgres_postgres:5432",
        "User: postgres",
        "Password generated automatically — see the Audit log",
        "Port 5432 is not exposed externally for security",
        "Includes the pgvector extension (required by Evo CRM Community) — same base as postgres:16, existing data is not affected.",
      ],
    },
    es: {
      description:
        "Base de datos relacional compartida por las stacks que la necesitan (Evolution, N8N, Chatwoot, Directus, Evo CRM). Incluye la extensión pgvector. Contraseña generada automáticamente.",
      notes: [
        "Host interno (dentro del Swarm): postgres_postgres:5432",
        "Usuario: postgres",
        "Contraseña generada automáticamente — vea el registro de auditoría",
        "El puerto 5432 no está expuesto externamente por seguridad",
        "Incluye la extensión pgvector (necesaria para Evo CRM Community) — misma base que postgres:16, los datos existentes no se ven afectados.",
      ],
    },
  },
};
