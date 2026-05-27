import { z } from "zod";
import type { StackDefinition } from "./types";

export const dify: StackDefinition = {
  id: "dify",
  repoUrl: "https://github.com/langgenius/dify",
  name: "Dify",
  description: "Plataforma LLMOps para apps e agentes IA em produção.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer"],
  optionNumber: 39,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
