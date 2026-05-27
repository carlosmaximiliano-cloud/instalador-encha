import { z } from "zod";
import type { StackDefinition } from "./types";

export const easyappointments: StackDefinition = {
  id: "easyappointments",
  repoUrl: "https://github.com/alextselegidis/easyappointments",
  name: "Easy Appointments",
  description: "Sistema PHP de agendamento de horários.",
  category: "scheduling",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 70,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
