import { z } from "zod";
import type { StackDefinition } from "./types";

export const monitor: StackDefinition = {
  id: "monitor",
  repoUrl: "https://github.com/louislam/uptime-kuma",
  name: "Monitor",
  description: "Painel agregado de saúde do servidor (CPU, RAM, disco).",
  category: "monitoring",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 38,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
