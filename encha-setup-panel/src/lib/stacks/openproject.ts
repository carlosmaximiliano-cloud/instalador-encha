import { z } from "zod";
import type { StackDefinition } from "./types";

export const openproject: StackDefinition = {
  id: "openproject",
  repoUrl: "https://github.com/opf/openproject",
  name: "OpenProject",
  description: "Gestão de projetos enterprise open-source.",
  category: "erp",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 48,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
