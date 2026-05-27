import { z } from "zod";
import type { StackDefinition } from "./types";

export const phpmyadmin: StackDefinition = {
  id: "phpmyadmin",
  repoUrl: "https://github.com/phpmyadmin/phpmyadmin",
  name: "phpMyAdmin",
  description: "Interface web para administrar bancos MySQL/MariaDB.",
  category: "database",
  icon: "table-properties",
  dependsOn: ["traefik-portainer","mysql"],
  optionNumber: 44,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
