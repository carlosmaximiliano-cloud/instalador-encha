import { z } from "zod";
import type { StackDefinition } from "./types";

export const evoai: StackDefinition = {
  id: "evoai",
  repoUrl: "https://github.com/EvolutionAPI/evo-ai",
  name: "EvoAI",
  description: "Camada de IA conversacional sobre Evolution API.",
  category: "messaging",
  icon: "bot",
  dependsOn: ["traefik-portainer","evolution"],
  optionNumber: 52,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
