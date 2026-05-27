import { z } from "zod";
import type { StackDefinition } from "./types";

export const langflow: StackDefinition = {
  id: "langflow",
  repoUrl: "https://github.com/logspace-ai/langflow",
  name: "Langflow",
  description: "Editor visual para fluxos LangChain e agentes IA.",
  category: "ai",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 29,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
