import { z } from "zod";
import type { StackDefinition } from "./types";

export const passbolt: StackDefinition = {
  id: "passbolt",
  repoUrl: "https://github.com/passbolt/passbolt_api",
  name: "Passbolt",
  description: "Gerenciador de senhas em time open-source.",
  category: "auth",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 54,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
