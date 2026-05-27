import { z } from "zod";
import type { StackDefinition } from "./types";

export const anythingllm: StackDefinition = {
  id: "anythingllm",
  repoUrl: "https://github.com/Mintplex-Labs/anything-llm",
  name: "AnythingLLM",
  description: "Cliente LLM all-in-one com RAG sobre seus documentos.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer"],
  optionNumber: 31,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
