import { z } from "zod";
import type { StackDefinition } from "./types";

export const langfuse: StackDefinition = {
  id: "langfuse",
  repoUrl: "https://github.com/langfuse/langfuse",
  name: "Langfuse",
  description: "Observabilidade e analytics para aplicações LLM.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer"],
  optionNumber: 66,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
