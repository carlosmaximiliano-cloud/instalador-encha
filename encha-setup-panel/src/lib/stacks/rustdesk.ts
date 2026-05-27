import { z } from "zod";
import type { StackDefinition } from "./types";

export const rustdesk: StackDefinition = {
  id: "rustdesk",
  repoUrl: "https://github.com/rustdesk/rustdesk",
  name: "RustDesk",
  description: "TeamViewer open-source em Rust.",
  category: "remote",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 58,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
