import { z } from "zod";
import type { StackDefinition } from "./types";

export const browserless: StackDefinition = {
  id: "browserless",
  repoUrl: "https://github.com/browserless/browserless",
  name: "Browserless",
  description: "Chrome headless como serviço para automação.",
  category: "monitoring",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 63,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
