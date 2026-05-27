import { z } from "zod";
import type { StackDefinition } from "./types";

export const flowise: StackDefinition = {
  id: "flowise",
  repoUrl: "https://github.com/FlowiseAI/Flowise",
  name: "Flowise",
  description: "Construa agentes LLM com fluxos visuais drag-and-drop.",
  category: "ai",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 28,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
