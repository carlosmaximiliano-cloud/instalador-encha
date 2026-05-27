import { z } from "zod";
import type { StackDefinition } from "./types";

export const baserow: StackDefinition = {
  id: "baserow",
  repoUrl: "https://github.com/bram2w/baserow",
  name: "Baserow",
  description: "Airtable open-source colaborativo.",
  category: "cms",
  icon: "table-properties",
  dependsOn: ["traefik-portainer"],
  optionNumber: 14,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
