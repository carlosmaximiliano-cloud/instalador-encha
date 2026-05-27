import { z } from "zod";
import type { StackDefinition } from "./types";

export const docuseal: StackDefinition = {
  id: "docuseal",
  repoUrl: "https://github.com/docusealco/docuseal",
  name: "DocuSeal",
  description: "Assinatura eletrônica em documentos PDF.",
  category: "marketing",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 37,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
