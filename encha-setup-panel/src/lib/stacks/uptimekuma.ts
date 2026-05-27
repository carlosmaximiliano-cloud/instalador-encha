import { z } from "zod";
import type { StackDefinition } from "./types";

export const uptimekuma: StackDefinition = {
  id: "uptimekuma",
  repoUrl: "https://github.com/louislam/uptime-kuma",
  name: "Uptime Kuma",
  description: "Monitoramento de uptime bonito e simples.",
  category: "monitoring",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 17,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
