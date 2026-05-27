import { z } from "zod";
import type { StackDefinition } from "./types";

export const hoppscotch: StackDefinition = {
  id: "hoppscotch",
  repoUrl: "https://github.com/hoppscotch/hoppscotch",
  name: "Hoppscotch",
  description: "Postman alternativo, leve e web-based.",
  category: "communication",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 59,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
