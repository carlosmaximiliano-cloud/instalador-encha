import { z } from "zod";
import type { StackDefinition } from "./types";

export const calcom: StackDefinition = {
  id: "calcom",
  repoUrl: "https://github.com/calcom/cal.com",
  name: "Cal.com",
  description: "Calendly open-source — agendamento de reuniões.",
  category: "scheduling",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 18,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
