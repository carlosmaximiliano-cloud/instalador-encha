import { z } from "zod";
import type { StackDefinition } from "./types";

export const gotenberg: StackDefinition = {
  id: "gotenberg",
  repoUrl: "https://github.com/gotenberg/gotenberg",
  name: "Gotenberg",
  description: "API HTTP para gerar PDFs a partir de HTML.",
  category: "monitoring",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 55,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
