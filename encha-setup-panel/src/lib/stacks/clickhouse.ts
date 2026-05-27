import { z } from "zod";
import type { StackDefinition } from "./types";

export const clickhouse: StackDefinition = {
  id: "clickhouse",
  repoUrl: "https://github.com/ClickHouse/ClickHouse",
  name: "ClickHouse",
  description: "Banco colunar analítico para queries OLAP em bilhões de linhas.",
  category: "database",
  icon: "database-zap",
  dependsOn: ["traefik-portainer"],
  optionNumber: 65,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
