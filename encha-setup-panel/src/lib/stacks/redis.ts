import { z } from "zod";
import type { StackDefinition } from "./types";

export const redis: StackDefinition = {
  id: "redis",
  repoUrl: "https://github.com/redis/redis",
  name: "Redis",
  description: "Banco em memória (cache, fila, pub/sub) ultra-rápido.",
  category: "database",
  icon: "database",
  dependsOn: ["traefik-portainer"],
  optionNumber: 0,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
