import { z } from "zod";
import type { StackDefinition } from "./types";

export const unoapi: StackDefinition = {
  id: "unoapi",
  repoUrl: "https://github.com/clairton/unoapi-cloud",
  name: "UnoAPI",
  description: "Gateway WhatsApp Cloud + Baileys com fila Redis.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer"],
  optionNumber: 67,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
