import { z } from "zod";
import type { StackDefinition } from "./types";

export const odoo: StackDefinition = {
  id: "odoo",
  repoUrl: "https://github.com/odoo/odoo",
  name: "Odoo",
  description: "ERP completo (vendas, estoque, contabilidade, RH).",
  category: "erp",
  icon: "layout-dashboard",
  dependsOn: ["traefik-portainer"],
  optionNumber: 10,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
