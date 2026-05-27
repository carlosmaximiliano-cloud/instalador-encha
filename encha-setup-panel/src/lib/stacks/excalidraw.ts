import { z } from "zod";
import type { StackDefinition } from "./types";

export const excalidraw: StackDefinition = {
  id: "excalidraw",
  repoUrl: "https://github.com/excalidraw/excalidraw",
  name: "Excalidraw",
  description: "Whiteboard virtual estilo lápis para diagramas rápidos.",
  category: "design",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 69,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
