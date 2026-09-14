import type { Locale } from "@/lib/locale-shared";

export type SidebarText = {
  catalog: string;
  installed: string;
  auditLog: string;
  categories: string;
  signOut: string;
};

export const sidebarText: Record<Locale, SidebarText> = {
  pt: {
    catalog: "Catálogo",
    installed: "Instaladas",
    auditLog: "Audit log",
    categories: "Categorias",
    signOut: "Sair",
  },
  en: {
    catalog: "Catalog",
    installed: "Installed",
    auditLog: "Audit log",
    categories: "Categories",
    signOut: "Sign out",
  },
  es: {
    catalog: "Catálogo",
    installed: "Instaladas",
    auditLog: "Audit log",
    categories: "Categorías",
    signOut: "Cerrar sesión",
  },
};
