import { z } from "zod";

export type FieldKind = "text" | "domain" | "email" | "password" | "username" | "port" | "checkbox" | "slug";

export type StackField = {
  name: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  helpText?: string;
  sensitive?: boolean;
  optional?: boolean;
  default?: string | boolean;
  group?: string;
};

export type SwarmContext = {
  networkName: string;
  serverName: string;
  email: string;
};

export type GeneratedSecret = {
  name: string;
  value: string;
};

export type StackDefinition = {
  id: string;
  name: string;
  description: string;
  category:
    | "infra"
    | "database"
    | "messaging"
    | "automation"
    | "ai"
    | "crm"
    | "cms"
    | "communication"
    | "marketing"
    | "scheduling"
    | "storage"
    | "monitoring"
    | "erp"
    | "analytics"
    | "auth"
    | "chatbot"
    | "media"
    | "remote"
    | "design"
    | "admin";
  icon: string;
  dependsOn: string[];
  optionNumber: number;
  fields: StackField[];
  schema: z.ZodTypeAny;
  swarmStackNames?: string[];
  repoUrl?: string;
  logoUrl?: string;
  installVia?: "panel" | "bash";
  generateSecrets?: (values: Record<string, unknown>) => GeneratedSecret[];
  generateYaml: (
    values: Record<string, unknown>,
    secrets: Record<string, string>,
    ctx: SwarmContext
  ) => string;
  postInstall?: {
    accessUrl?: (values: Record<string, unknown>) => string;
    notes?: string[];
  };
};

export function expectedStackNames(def: StackDefinition): string[] {
  return def.swarmStackNames ?? [def.id.replace(/-/g, "_")];
}

export const fqdn = z
  .string()
  .min(3)
  .max(253)
  .regex(
    /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
    "Domínio inválido (use formato: ex.dominio.com)"
  );

export const slug = z.string().min(2).max(40).regex(/^[a-zA-Z0-9-]+$/, "Use apenas letras, números e hifens");

export const strongPassword = z
  .string()
  .min(12, "Mínimo 12 caracteres")
  .regex(/[A-Z]/, "Inclua uma letra maiúscula")
  .regex(/[a-z]/, "Inclua uma letra minúscula")
  .regex(/[0-9]/, "Inclua um número")
  .regex(/[^A-Za-z0-9]/, "Inclua um símbolo");

export const username = z.string().min(3).max(40).regex(/^[a-zA-Z0-9_-]+$/);

export const email = z.string().email();

export const portNum = z.coerce.number().int().min(1).max(65535);
