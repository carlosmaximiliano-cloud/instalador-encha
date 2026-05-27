import { z } from "zod";
import type { StackDefinition } from "./types";

export const formbricks: StackDefinition = {
  id: "formbricks",
  repoUrl: "https://github.com/formbricks/formbricks",
  name: "Formbricks",
  description: "Pesquisas e formulários in-product orientados a dados.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 35,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
