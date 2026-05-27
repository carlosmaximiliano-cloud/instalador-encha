import { z } from "zod";
import type { StackDefinition } from "./types";

export const strapi: StackDefinition = {
  id: "strapi",
  repoUrl: "https://github.com/strapi/strapi",
  name: "Strapi",
  description: "Headless CMS líder do mercado em Node.js.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 43,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
