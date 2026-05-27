import { z } from "zod";
import type { StackDefinition } from "./types";

export const wisemapping: StackDefinition = {
  id: "wisemapping",
  repoUrl: "https://github.com/wisemapping/wisemapping-open-source",
  name: "WiseMapping",
  description: "Editor de mapas mentais colaborativo open-source.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 51,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
