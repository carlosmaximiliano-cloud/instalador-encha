import { z } from "zod";
import type { StackDefinition } from "./types";

export const ntfy: StackDefinition = {
  id: "ntfy",
  repoUrl: "https://github.com/binwiederhier/ntfy",
  name: "Ntfy",
  description: "Notificações push HTTP simples para qualquer device.",
  category: "monitoring",
  icon: "message-circle",
  dependsOn: ["traefik-portainer"],
  optionNumber: 46,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
