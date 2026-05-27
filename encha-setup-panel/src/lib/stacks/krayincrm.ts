import { z } from "zod";
import type { StackDefinition } from "./types";

export const krayincrm: StackDefinition = {
  id: "krayincrm",
  repoUrl: "https://github.com/krayin/laravel-crm",
  name: "Krayin CRM",
  description: "CRM Laravel completo com pipeline de vendas e leads.",
  category: "crm",
  icon: "headphones",
  dependsOn: ["traefik-portainer"],
  optionNumber: 79,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
