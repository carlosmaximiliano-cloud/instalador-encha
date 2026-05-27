import { z } from "zod";
import type { StackDefinition } from "./types";

export const shlink: StackDefinition = {
  id: "shlink",
  repoUrl: "https://github.com/shlinkio/shlink",
  name: "Shlink",
  description: "Encurtador de URLs com analytics open-source.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 80,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
