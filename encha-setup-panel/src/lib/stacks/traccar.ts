import { z } from "zod";
import type { StackDefinition } from "./types";

export const traccar: StackDefinition = {
  id: "traccar",
  repoUrl: "https://github.com/traccar/traccar",
  name: "Traccar",
  description: "Servidor GPS para rastreamento de veículos.",
  category: "monitoring",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 76,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
