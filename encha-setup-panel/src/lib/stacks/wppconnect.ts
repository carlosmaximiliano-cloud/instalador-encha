import { z } from "zod";
import type { StackDefinition } from "./types";

export const wppconnect: StackDefinition = {
  id: "wppconnect",
  repoUrl: "https://github.com/wppconnect-team/wppconnect-server",
  name: "WPPConnect",
  description: "API multi-sessão para WhatsApp baseada em puppeteer.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer"],
  optionNumber: 62,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
