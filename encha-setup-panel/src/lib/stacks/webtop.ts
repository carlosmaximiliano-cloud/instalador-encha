import { z } from "zod";
import type { StackDefinition } from "./types";

export const webtop: StackDefinition = {
  id: "webtop",
  repoUrl: "https://github.com/linuxserver/docker-webtop",
  name: "Webtop",
  description: "Desktop Linux completo via navegador (Linuxserver.io).",
  category: "monitoring",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 82,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
