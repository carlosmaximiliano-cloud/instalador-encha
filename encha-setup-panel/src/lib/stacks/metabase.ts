import { z } from "zod";
import type { StackDefinition } from "./types";

export const metabase: StackDefinition = {
  id: "metabase",
  repoUrl: "https://github.com/metabase/metabase",
  name: "Metabase",
  description: "BI open-source — gráficos e dashboards em minutos.",
  category: "analytics",
  icon: "table-properties",
  dependsOn: ["traefik-portainer"],
  optionNumber: 36,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
