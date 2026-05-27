import { z } from "zod";
import type { StackDefinition } from "./types";

export const lowcoder: StackDefinition = {
  id: "lowcoder",
  repoUrl: "https://github.com/lowcoder-org/lowcoder",
  name: "Lowcoder",
  description: "Retool open-source — apps low-code colaborativos.",
  category: "cms",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 47,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
