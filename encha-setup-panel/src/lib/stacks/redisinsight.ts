import { z } from "zod";
import type { StackDefinition } from "./types";

export const redisinsight: StackDefinition = {
  id: "redisinsight",
  repoUrl: "https://github.com/RedisInsight/RedisInsight",
  name: "RedisInsight",
  description: "UI oficial para inspecionar e gerenciar instâncias Redis.",
  category: "database",
  icon: "table-properties",
  dependsOn: ["traefik-portainer","redis"],
  optionNumber: 75,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
