import { z } from "zod";
import type { StackDefinition } from "./types";

export const humhub: StackDefinition = {
  id: "humhub",
  repoUrl: "https://github.com/humhub/humhub",
  name: "HumHub",
  description: "Rede social privada para comunidades e empresas.",
  category: "communication",
  icon: "message-circle",
  dependsOn: ["traefik-portainer"],
  optionNumber: 33,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
