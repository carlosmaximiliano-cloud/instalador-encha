import { z } from "zod";
import type { StackDefinition } from "./types";

export const vaultwarden: StackDefinition = {
  id: "vaultwarden",
  repoUrl: "https://github.com/dani-garcia/vaultwarden",
  name: "Vaultwarden",
  description: "Servidor Bitwarden open-source em Rust.",
  category: "storage",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 41,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
