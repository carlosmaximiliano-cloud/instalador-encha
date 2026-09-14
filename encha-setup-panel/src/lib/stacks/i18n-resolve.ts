import type { Locale } from "../locale-shared";
import type { StackDefinition, StackField } from "./types";

// Fase 3 de i18n (i18n/GLOSSARY.md) — resolve o conteúdo editorial de uma
// stack (description, campos do formulário, notas, rótulos de segredo) no
// locale pedido, sobrepondo `stack.i18n?.[locale]` ao pt-BR base sempre que
// existir; sem overlay, ou com overlay parcial, cai no original. Funções
// puras — testadas em i18n-resolve.test.ts.

export function stackDescription(stack: StackDefinition, locale: Locale): string {
  if (locale === "pt") return stack.description;
  return stack.i18n?.[locale]?.description ?? stack.description;
}

export type ResolvedFieldText = {
  label: string;
  placeholder?: string;
  helpText?: string;
  group?: string;
};

export function stackFieldText(stack: StackDefinition, field: StackField, locale: Locale): ResolvedFieldText {
  const overlay = locale === "pt" ? undefined : stack.i18n?.[locale]?.fields?.[field.name];
  return {
    label: overlay?.label ?? field.label,
    placeholder: overlay?.placeholder ?? field.placeholder,
    helpText: overlay?.helpText ?? field.helpText,
    group: overlay?.group ?? field.group,
  };
}

export function stackNotes(
  stack: StackDefinition,
  locale: Locale,
  values: Record<string, unknown>
): string[] {
  const rawNotes = stack.postInstall?.notes;
  const resolved = typeof rawNotes === "function" ? rawNotes(values) : (rawNotes ?? []);
  if (locale === "pt") return resolved;
  const overlay = stack.i18n?.[locale]?.notes;
  // Só usa o overlay estático se o tamanho bater com o pt-BR resolvido —
  // protege contra dessincronia quando notes é função (varia por `values`).
  return overlay && overlay.length === resolved.length ? overlay : resolved;
}

export function secretLabel(
  stack: StackDefinition,
  secretName: string,
  fallbackLabel: string | undefined,
  locale: Locale
): string | undefined {
  if (locale === "pt") return fallbackLabel;
  return stack.i18n?.[locale]?.secretLabels?.[secretName] ?? fallbackLabel;
}
