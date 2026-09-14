import type { Locale } from "@/lib/locale-shared";

export type CatalogErrorText = {
  title: string;
  unknownError: string;
  digest: (digest: string) => string;
  retry: string;
};

export const catalogErrorText: Record<Locale, CatalogErrorText> = {
  pt: {
    title: "Erro ao carregar o catálogo",
    unknownError: "Erro desconhecido",
    digest: (digest) => `Digest: ${digest}`,
    retry: "Tentar novamente",
  },
  en: {
    title: "Error loading the catalog",
    unknownError: "Unknown error",
    digest: (digest) => `Digest: ${digest}`,
    retry: "Try again",
  },
  es: {
    title: "Error al cargar el catálogo",
    unknownError: "Error desconocido",
    digest: (digest) => `Digest: ${digest}`,
    retry: "Intentar de nuevo",
  },
};
