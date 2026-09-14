import type { Locale } from "@/lib/locale-shared";

export type CatalogPageText = {
  loading: string;
  title: string;
  clearFilterTitle: string;
  clearFilterAriaLabel: string;
  stacksInCategory: (count: number, category: string) => string;
  subtitle: string;
  portainerOffline: string;
  searchPlaceholder: string;
  noStacksFound: (category: string | null) => string;
  updateFailedDefault: string;
  updateFailedConsole: string;
};

export const catalogPageText: Record<Locale, CatalogPageText> = {
  pt: {
    loading: "Carregando...",
    title: "Catálogo de Stacks",
    clearFilterTitle: "Limpar filtro",
    clearFilterAriaLabel: "Limpar filtro de categoria",
    stacksInCategory: (count, category) =>
      `${count} stack${count !== 1 ? "s" : ""} em ${category}.`,
    subtitle: "Escolha o que instalar no seu Swarm — tudo via Portainer API.",
    portainerOffline:
      "Portainer não responde — instalações desabilitadas até que a conexão se restabeleça.",
    searchPlaceholder: "Buscar stack...",
    noStacksFound: (category) =>
      `Nenhuma stack encontrada${category ? ` em ${category}` : ""}.`,
    updateFailedDefault: "Falha ao atualizar",
    updateFailedConsole: "Falha ao atualizar — veja o console",
  },
  en: {
    loading: "Loading...",
    title: "Stack Catalog",
    clearFilterTitle: "Clear filter",
    clearFilterAriaLabel: "Clear category filter",
    stacksInCategory: (count, category) =>
      `${count} stack${count !== 1 ? "s" : ""} in ${category}.`,
    subtitle: "Choose what to install on your Swarm — all via the Portainer API.",
    portainerOffline:
      "Portainer isn't responding — installations are disabled until the connection is restored.",
    searchPlaceholder: "Search stacks...",
    noStacksFound: (category) =>
      `No stacks found${category ? ` in ${category}` : ""}.`,
    updateFailedDefault: "Failed to update",
    updateFailedConsole: "Failed to update — check the console",
  },
  es: {
    loading: "Cargando...",
    title: "Catálogo de Stacks",
    clearFilterTitle: "Limpiar filtro",
    clearFilterAriaLabel: "Limpiar filtro de categoría",
    stacksInCategory: (count, category) =>
      `${count} stack${count !== 1 ? "s" : ""} en ${category}.`,
    subtitle: "Elija qué instalar en su Swarm — todo mediante la API de Portainer.",
    portainerOffline:
      "Portainer no responde — las instalaciones están deshabilitadas hasta que se restablezca la conexión.",
    searchPlaceholder: "Buscar stack...",
    noStacksFound: (category) =>
      `No se encontraron stacks${category ? ` en ${category}` : ""}.`,
    updateFailedDefault: "No se pudo actualizar",
    updateFailedConsole: "No se pudo actualizar — vea la consola",
  },
};
