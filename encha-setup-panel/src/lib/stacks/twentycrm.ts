import { z } from "zod";
import type { StackDefinition } from "./types";

export const twentycrm: StackDefinition = {
  id: "twentycrm",
  repoUrl: "https://github.com/twentyhq/twenty",
  name: "Twenty CRM",
  description: "CRM moderno open-source com UI estilo Notion.",
  category: "crm",
  icon: "headphones",
  dependsOn: ["traefik-portainer"],
  optionNumber: 23,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
