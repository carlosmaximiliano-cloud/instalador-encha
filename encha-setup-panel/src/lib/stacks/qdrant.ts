import { z } from "zod";
import type { StackDefinition } from "./types";

export const qdrant: StackDefinition = {
  id: "qdrant",
  repoUrl: "https://github.com/qdrant/qdrant",
  name: "Qdrant",
  description: "Banco de vetores para busca semântica e RAG.",
  category: "database",
  icon: "database-zap",
  dependsOn: ["traefik-portainer"],
  optionNumber: 21,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
