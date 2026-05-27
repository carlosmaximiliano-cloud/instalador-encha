import { z } from "zod";
import type { StackDefinition } from "./types";

export const documenso: StackDefinition = {
  id: "documenso",
  repoUrl: "https://github.com/documenso/documenso",
  name: "Documenso",
  description: "DocuSign open-source — assinatura digital de PDFs.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 71,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
