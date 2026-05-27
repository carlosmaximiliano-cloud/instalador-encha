import { z } from "zod";
import type { StackDefinition } from "./types";

export const azuracast: StackDefinition = {
  id: "azuracast",
  repoUrl: "https://github.com/AzuraCast/AzuraCast",
  name: "AzuraCast",
  description: "Rádio web self-hosted (streaming + automação).",
  category: "media",
  icon: "headphones",
  dependsOn: ["traefik-portainer"],
  optionNumber: 57,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
