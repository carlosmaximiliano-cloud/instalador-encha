import type { Locale } from "@/lib/locale-shared";

export type StacksPageText = {
  title: string;
  subtitle: string;
  editHint: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  external: string;
  active: string;
  installedAt: (when: string) => string;
};

export const stacksPageText: Record<Locale, StacksPageText> = {
  pt: {
    title: "Stacks instaladas",
    subtitle: "Lista do que está rodando no Swarm.",
    editHint: "Edição e remoção devem ser feitas pelo Portainer. O painel é exclusivo para instalação.",
    loading: "Carregando...",
    emptyTitle: "Nenhuma stack ainda",
    emptyDescription: "Vá ao Catálogo para instalar sua primeira stack.",
    external: "externa",
    active: "ativa",
    installedAt: (when) => `Instalada em ${when}`,
  },
  en: {
    title: "Installed stacks",
    subtitle: "List of what's running on the Swarm.",
    editHint: "Editing and removal must be done through Portainer. The panel is install-only.",
    loading: "Loading...",
    emptyTitle: "No stacks yet",
    emptyDescription: "Go to the Catalog to install your first stack.",
    external: "external",
    active: "active",
    installedAt: (when) => `Installed on ${when}`,
  },
  es: {
    title: "Stacks instaladas",
    subtitle: "Lista de lo que está corriendo en el Swarm.",
    editHint: "La edición y eliminación deben hacerse por Portainer. El panel es exclusivo para instalación.",
    loading: "Cargando...",
    emptyTitle: "Ninguna stack todavía",
    emptyDescription: "Vaya al Catálogo para instalar su primera stack.",
    external: "externa",
    active: "activa",
    installedAt: (when) => `Instalada el ${when}`,
  },
};
