import { z } from "zod";
import type { StackDefinition } from "./types";

export const wordpress: StackDefinition = {
  id: "wordpress",
  repoUrl: "https://github.com/WordPress/WordPress",
  name: "WordPress",
  description: "Plataforma de blogs e sites mais popular do mundo.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 34,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
