import { z } from "zod";
import type { StackDefinition } from "./types";

export const supabase: StackDefinition = {
  id: "supabase",
  repoUrl: "https://github.com/supabase/supabase",
  name: "Supabase",
  description: "Backend completo open-source (Postgres + Auth + Storage + Realtime).",
  category: "database",
  icon: "database-zap",
  dependsOn: ["traefik-portainer"],
  optionNumber: 45,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
