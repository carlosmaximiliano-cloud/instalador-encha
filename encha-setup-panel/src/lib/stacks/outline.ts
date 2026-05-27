import { z } from "zod";
import type { StackDefinition } from "./types";

export const outline: StackDefinition = {
  id: "outline",
  repoUrl: "https://github.com/outline/outline",
  name: "Outline",
  description: "Wiki de conhecimento bonita para times modernos.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 25,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
