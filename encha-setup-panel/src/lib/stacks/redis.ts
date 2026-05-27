import { z } from "zod";
import { type StackDefinition } from "./types";

const schema = z.object({});

export const redis: StackDefinition = {
  id: "redis",
  repoUrl: "https://github.com/redis/redis",
  name: "Redis (interno)",
  description: "Cache em memória usado por várias stacks (Chatwoot, Typebot, Evolution). Sem porta exposta — comunicação interna.",
  category: "database",
  icon: "database",
  dependsOn: ["traefik-portainer"],
  optionNumber: -1,
  installVia: "panel",
  fields: [],
  schema,
  generateYaml(_v, _s, ctx) {
    const net = ctx.networkName;
    return `version: "3.7"
services:
  redis:
    image: redis:latest
    command:
      - redis-server
      - --appendonly
      - "yes"
      - --port
      - "6379"
    volumes:
      - redis_data:/data
    networks:
      - ${net}
    deploy:
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 2048M

volumes:
  redis_data:
    external: true
    name: redis_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
};
