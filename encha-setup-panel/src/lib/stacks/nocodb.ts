import { z } from "zod";
import type { StackDefinition } from "./types";

export const nocodb: StackDefinition = {
  id: "nocodb",
  repoUrl: "https://github.com/nocodb/nocodb",
  name: "NocoDB",
  description: "Airtable open-source — turn any DB into a spreadsheet.",
  category: "cms",
  icon: "table-properties",
  dependsOn: ["traefik-portainer"],
  optionNumber: 32,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
