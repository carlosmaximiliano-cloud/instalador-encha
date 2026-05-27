import { z } from "zod";
import type { StackDefinition } from "./types";

export const affine: StackDefinition = {
  id: "affine",
  repoUrl: "https://github.com/toeverything/AFFiNE",
  name: "AFFiNE",
  description: "Notion + Miro all-in-one com blocos editáveis.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 40,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
