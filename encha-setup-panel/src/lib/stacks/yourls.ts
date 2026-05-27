import { z } from "zod";
import type { StackDefinition } from "./types";

export const yourls: StackDefinition = {
  id: "yourls",
  repoUrl: "https://github.com/YOURLS/YOURLS",
  name: "YOURLS",
  description: "Encurtador de URLs PHP simples e auto-hospedado.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 50,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
