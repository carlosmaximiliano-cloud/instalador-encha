import { z } from "zod";
import type { StackDefinition } from "./types";

export const keycloak: StackDefinition = {
  id: "keycloak",
  repoUrl: "https://github.com/keycloak/keycloak",
  name: "Keycloak",
  description: "Identity Provider (SSO, OAuth, SAML) enterprise.",
  category: "auth",
  icon: "shield",
  dependsOn: ["traefik-portainer"],
  optionNumber: 53,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
