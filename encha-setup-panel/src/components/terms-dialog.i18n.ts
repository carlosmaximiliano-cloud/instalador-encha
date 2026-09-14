import type { Locale } from "@/lib/locale-shared";

export type TermsDialogText = {
  title: string;
  description: (version: string) => string;
  acceptFailedFallback: string;
  acceptFailedHint: string;
  networkError: string;
  registering: string;
  accept: string;
  readAndAccept: string;
};

export const termsDialogText: Record<Locale, TermsDialogText> = {
  pt: {
    title: "Termos de Uso",
    description: (version) =>
      `Os Termos de Uso do Encha Setup foram atualizados (versão ${version}). É preciso aceitar para continuar usando o painel.`,
    acceptFailedFallback: "Falha ao registrar o aceite",
    acceptFailedHint: " — se o problema persistir, use a opção 97 no menu SSH.",
    networkError: "Erro de rede ao registrar o aceite.",
    registering: "Registrando…",
    accept: "Aceitar",
    readAndAccept: "Li e aceito",
  },
  en: {
    title: "Terms of Use",
    description: (version) =>
      `The Encha Setup Terms of Use have been updated (version ${version}). You need to accept them to keep using the panel.`,
    acceptFailedFallback: "Failed to record your acceptance",
    acceptFailedHint: " — if the problem persists, use option 97 in the SSH menu.",
    networkError: "Network error while recording your acceptance.",
    registering: "Recording…",
    accept: "Accept",
    readAndAccept: "I've read and accept",
  },
  es: {
    title: "Términos de Uso",
    description: (version) =>
      `Los Términos de Uso de Encha Setup fueron actualizados (versión ${version}). Es necesario aceptarlos para seguir usando el panel.`,
    acceptFailedFallback: "No se pudo registrar la aceptación",
    acceptFailedHint: " — si el problema persiste, use la opción 97 en el menú SSH.",
    networkError: "Error de red al registrar la aceptación.",
    registering: "Registrando…",
    accept: "Aceptar",
    readAndAccept: "Leí y acepto",
  },
};
