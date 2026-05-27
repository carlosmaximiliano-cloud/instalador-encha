import { z } from "zod";
import type { StackDefinition } from "./types";

export const botpress: StackDefinition = {
  id: "botpress",
  repoUrl: "https://github.com/botpress/botpress",
  name: "Botpress",
  description: "Plataforma de chatbots conversacionais com IA.",
  category: "chatbot",
  icon: "bot",
  dependsOn: ["traefik-portainer"],
  optionNumber: 13,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
