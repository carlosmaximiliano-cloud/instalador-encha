import { z } from "zod";
import type { StackDefinition } from "./types";

export const nocobase: StackDefinition = {
  id: "nocobase",
  repoUrl: "https://github.com/nocobase/nocobase",
  name: "NocoBase",
  description: "Plataforma low-code para apps internos sobre Postgres.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 12,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
