import { z } from "zod";
import type { StackDefinition } from "./types";

export const wiki: StackDefinition = {
  id: "wiki",
  repoUrl: "https://github.com/requarks/wiki",
  name: "Wiki.js",
  description: "Documentação corporativa moderna com markdown e Git.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 56,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
