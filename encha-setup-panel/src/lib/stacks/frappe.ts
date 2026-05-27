import { z } from "zod";
import type { StackDefinition } from "./types";

export const frappe: StackDefinition = {
  id: "frappe",
  repoUrl: "https://github.com/frappe/frappe",
  name: "Frappe / ERPNext",
  description: "ERP open-source em Python (vendas, estoque, contabilidade).",
  category: "erp",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 64,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
