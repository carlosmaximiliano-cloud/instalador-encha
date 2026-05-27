import { z } from "zod";
import type { StackDefinition } from "./types";

export const moodle: StackDefinition = {
  id: "moodle",
  repoUrl: "https://github.com/moodle/moodle",
  name: "Moodle",
  description: "LMS líder mundial para EAD e cursos online.",
  category: "erp",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 72,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
