import { z } from "zod";
import type { StackDefinition } from "./types";

export const mysql: StackDefinition = {
  id: "mysql",
  repoUrl: "https://github.com/mysql/mysql-server",
  name: "MySQL",
  description: "Banco relacional clássico para aplicações web e CMS.",
  category: "database",
  icon: "database",
  dependsOn: ["traefik-portainer"],
  optionNumber: 0,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
