import { z } from "zod";
import type { StackDefinition } from "./types";

export const glpi: StackDefinition = {
  id: "glpi",
  repoUrl: "https://github.com/glpi-project/glpi",
  name: "GLPI",
  description: "ITSM/gestão de ativos e suporte técnico.",
  category: "erp",
  icon: "headphones",
  dependsOn: ["traefik-portainer"],
  optionNumber: 27,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
