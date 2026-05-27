import { z } from "zod";
import type { StackDefinition } from "./types";

export const appsmith: StackDefinition = {
  id: "appsmith",
  repoUrl: "https://github.com/appsmithorg/appsmith",
  name: "Appsmith",
  description: "Builder visual de painéis e ferramentas internas.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 20,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
