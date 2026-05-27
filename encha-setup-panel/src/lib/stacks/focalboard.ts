import { z } from "zod";
import type { StackDefinition } from "./types";

export const focalboard: StackDefinition = {
  id: "focalboard",
  repoUrl: "https://github.com/mattermost-community/focalboard",
  name: "Focalboard",
  description: "Trello/Notion open-source para gestão de projetos.",
  category: "communication",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 26,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
