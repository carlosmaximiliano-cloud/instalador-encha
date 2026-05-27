import { z } from "zod";
import type { StackDefinition } from "./types";

export const stirling: StackDefinition = {
  id: "stirling",
  repoUrl: "https://github.com/Stirling-Tools/Stirling-PDF",
  name: "Stirling PDF",
  description: "Suíte web de manipulação de PDFs (merge, split, OCR).",
  category: "monitoring",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 74,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
