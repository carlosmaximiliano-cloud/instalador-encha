import { z } from "zod";
import type { StackDefinition } from "./types";

export const woofedcrm: StackDefinition = {
  id: "woofedcrm",
  repoUrl: "https://github.com/woofedcrm/woofedcrm",
  name: "WooFed CRM",
  description: "CRM open-source brasileiro focado em WhatsApp.",
  category: "crm",
  icon: "headphones",
  dependsOn: ["traefik-portainer"],
  optionNumber: 22,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
