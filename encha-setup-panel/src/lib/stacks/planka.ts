import { z } from "zod";
import type { StackDefinition } from "./types";

export const planka: StackDefinition = {
  id: "planka",
  repoUrl: "https://github.com/plankanban/planka",
  name: "Planka",
  description: "Kanban Trello-like minimalista e rápido.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 61,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
