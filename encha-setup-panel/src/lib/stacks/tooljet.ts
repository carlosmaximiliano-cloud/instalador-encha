import { z } from "zod";
import type { StackDefinition } from "./types";

export const tooljet: StackDefinition = {
  id: "tooljet",
  repoUrl: "https://github.com/ToolJet/ToolJet",
  name: "ToolJet",
  description: "Construa apps internos low-code com drag-and-drop.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 73,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
