import { z } from "zod";
import type { StackDefinition } from "./types";

export const mautic: StackDefinition = {
  id: "mautic",
  repoUrl: "https://github.com/mautic/mautic",
  name: "Mautic",
  description: "Automação de marketing open-source enterprise.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 19,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
