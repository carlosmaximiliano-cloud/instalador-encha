import { z } from "zod";
import type { StackDefinition } from "./types";

export const nextcloud: StackDefinition = {
  id: "nextcloud",
  repoUrl: "https://github.com/nextcloud/server",
  name: "Nextcloud",
  description: "Cloud privado completo — arquivos, calendário, chat.",
  category: "storage",
  icon: "hard-drive",
  dependsOn: ["traefik-portainer"],
  optionNumber: 42,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
