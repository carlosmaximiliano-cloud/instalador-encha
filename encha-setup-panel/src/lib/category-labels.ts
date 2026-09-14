// Fonte única do rótulo em pt-BR de cada categoria de stack. Antes deste
// módulo, o mesmo mapa slug->rótulo existia duplicado (e DIVERGENTE) em
// catalog/page.tsx, sidebar.tsx e stack-card.tsx — ex.: "monitoring" era
// "Monitoramento & Infra" em dois lugares e só "Monitoramento" no terceiro.
// Import daqui nos três em vez de redefinir localmente.
//
// `Record<StackCategory, string>` obriga o TS a acusar erro se uma categoria
// nova entrar em StackCategory (stacks/types.ts) sem rótulo aqui, ou vice-versa.
//
// i18n (fase futura): por ora só pt-BR, valor é string simples. Quando
// entrarem variantes en/es, trocar o tipo do valor para um objeto por locale
// (ex.: `{ pt: string; en: string; es: string }`) é a extensão natural — os
// 3 call sites já importam `CATEGORY_LABELS` em vez de indexar objeto local,
// então o ponto de mudança fica só aqui.
import type { StackCategory } from "./stacks/types";

export const CATEGORY_LABELS: Record<StackCategory, string> = {
  infra: "Infraestrutura",
  database: "Banco de dados",
  messaging: "Mensageria",
  automation: "Automação",
  ai: "IA",
  crm: "CRM & Suporte",
  cms: "CMS & No-Code",
  communication: "Comunicação",
  marketing: "Marketing & Formulários",
  scheduling: "Agendamento",
  storage: "Armazenamento",
  monitoring: "Monitoramento & Infra",
  erp: "ERP & Negócios",
  analytics: "Analytics & BI",
  auth: "Autenticação",
  chatbot: "Chatbots",
  media: "Mídia & Streaming",
  remote: "Acesso Remoto",
  design: "Design & Whiteboard",
  admin: "Admin",
};

/**
 * Rótulo de uma categoria a partir de um valor "cru" (ex.: `CatalogEntry.category`,
 * que vem tipado como `string` solto porque cruza a fronteira API->UI). Faz o
 * mesmo fallback que os 3 call sites originais já faziam: categoria
 * desconhecida mostra o próprio slug em vez de "undefined".
 */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category as StackCategory] ?? category;
}

/**
 * Ordem de exibição das categorias (ex.: accordion da sidebar). Categorias
 * ausentes do catálogo são filtradas pelo chamador, não aqui.
 */
export const CATEGORY_ORDER: StackCategory[] = [
  "infra",
  "database",
  "messaging",
  "automation",
  "ai",
  "crm",
  "cms",
  "communication",
  "marketing",
  "scheduling",
  "storage",
  "monitoring",
  "erp",
  "analytics",
  "auth",
  "chatbot",
  "media",
  "remote",
  "design",
  "admin",
];
