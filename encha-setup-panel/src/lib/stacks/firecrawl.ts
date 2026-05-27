import { z } from "zod";
import type { StackDefinition } from "./types";

export const firecrawl: StackDefinition = {
  id: "firecrawl",
  repoUrl: "https://github.com/mendableai/firecrawl",
  name: "Firecrawl",
  description: "Crawler que transforma sites em markdown pronto para LLM.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer"],
  optionNumber: 77,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
