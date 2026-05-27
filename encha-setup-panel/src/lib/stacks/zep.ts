import { z } from "zod";
import type { StackDefinition } from "./types";

export const zep: StackDefinition = {
  id: "zep",
  repoUrl: "https://github.com/getzep/zep",
  name: "Zep",
  description: "Memória de longo prazo e contexto para agentes IA.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer"],
  optionNumber: 49,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
