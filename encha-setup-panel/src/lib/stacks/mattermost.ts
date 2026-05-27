import { z } from "zod";
import type { StackDefinition } from "./types";

export const mattermost: StackDefinition = {
  id: "mattermost",
  repoUrl: "https://github.com/mattermost/mattermost",
  name: "Mattermost",
  description: "Slack self-hosted para times técnicos e seguros.",
  category: "communication",
  icon: "message-circle",
  dependsOn: ["traefik-portainer"],
  optionNumber: 24,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
