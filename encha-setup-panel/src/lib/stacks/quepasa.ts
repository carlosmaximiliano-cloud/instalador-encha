import { z } from "zod";
import type { StackDefinition } from "./types";

export const quepasa: StackDefinition = {
  id: "quepasa",
  repoUrl: "https://github.com/nocodeleaks/quepasa",
  name: "QuePasa",
  description: "API WhatsApp simples e estável usando Baileys.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer"],
  optionNumber: 68,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
