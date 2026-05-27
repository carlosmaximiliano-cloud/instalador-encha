import { z } from "zod";
import type { StackDefinition } from "./types";

export const bolt: StackDefinition = {
  id: "bolt",
  repoUrl: "https://github.com/stackblitz-labs/bolt.diy",
  name: "Bolt.diy",
  description: "IDE web open-source para gerar apps com LLM.",
  category: "ai",
  icon: "brain",
  dependsOn: ["traefik-portainer"],
  optionNumber: 60,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
