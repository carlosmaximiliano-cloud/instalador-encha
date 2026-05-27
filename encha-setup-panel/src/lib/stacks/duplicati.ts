import { z } from "zod";
import type { StackDefinition } from "./types";

export const duplicati: StackDefinition = {
  id: "duplicati",
  repoUrl: "https://github.com/duplicati/duplicati",
  name: "Duplicati",
  description: "Backup automático criptografado para nuvem.",
  category: "storage",
  icon: "hard-drive",
  dependsOn: ["traefik-portainer"],
  optionNumber: 81,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
