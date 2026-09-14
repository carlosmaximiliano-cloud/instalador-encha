// Fonte única do rótulo de cada categoria de stack, nos 3 idiomas. Antes
// deste módulo, o mesmo mapa slug->rótulo existia duplicado (e DIVERGENTE)
// em catalog/page.tsx, sidebar.tsx e stack-card.tsx — ex.: "monitoring" era
// "Monitoramento & Infra" em dois lugares e só "Monitoramento" no terceiro.
// Import daqui nos três em vez de redefinir localmente.
//
// `Record<StackCategory, Record<Locale, string>>` obriga o TS a acusar erro
// se uma categoria nova entrar em StackCategory (stacks/types.ts) sem rótulo
// aqui, ou vice-versa — e a exigir os 3 idiomas em toda entrada.
//
// Achado ao vivo no teste end-to-end da Fase 4: isso ficou só em pt-BR até
// aqui porque não é nem "UI chrome" (Fase 2) nem faz parte do overlay
// StackDefinition.i18n (Fase 3) — é um módulo próprio que nenhuma das duas
// fases tinha no radar.
import type { StackCategory } from "./stacks/types";
import type { Locale } from "./locale-shared";

export const CATEGORY_LABELS: Record<StackCategory, Record<Locale, string>> = {
  infra: { pt: "Infraestrutura", en: "Infrastructure", es: "Infraestructura" },
  database: { pt: "Banco de dados", en: "Database", es: "Base de datos" },
  messaging: { pt: "Mensageria", en: "Messaging", es: "Mensajería" },
  automation: { pt: "Automação", en: "Automation", es: "Automatización" },
  ai: { pt: "IA", en: "AI", es: "IA" },
  crm: { pt: "CRM & Suporte", en: "CRM & Support", es: "CRM y Soporte" },
  cms: { pt: "CMS & No-Code", en: "CMS & No-Code", es: "CMS y No-Code" },
  communication: { pt: "Comunicação", en: "Communication", es: "Comunicación" },
  marketing: { pt: "Marketing & Formulários", en: "Marketing & Forms", es: "Marketing y Formularios" },
  scheduling: { pt: "Agendamento", en: "Scheduling", es: "Agendamiento" },
  storage: { pt: "Armazenamento", en: "Storage", es: "Almacenamiento" },
  monitoring: { pt: "Monitoramento & Infra", en: "Monitoring & Infra", es: "Monitoreo e Infra" },
  erp: { pt: "ERP & Negócios", en: "ERP & Business", es: "ERP y Negocios" },
  analytics: { pt: "Analytics & BI", en: "Analytics & BI", es: "Analytics y BI" },
  auth: { pt: "Autenticação", en: "Authentication", es: "Autenticación" },
  chatbot: { pt: "Chatbots", en: "Chatbots", es: "Chatbots" },
  media: { pt: "Mídia & Streaming", en: "Media & Streaming", es: "Medios y Streaming" },
  remote: { pt: "Acesso Remoto", en: "Remote Access", es: "Acceso Remoto" },
  design: { pt: "Design & Whiteboard", en: "Design & Whiteboard", es: "Diseño y Whiteboard" },
  admin: { pt: "Admin", en: "Admin", es: "Admin" },
};

/**
 * Rótulo de uma categoria a partir de um valor "cru" (ex.: `CatalogEntry.category`,
 * que vem tipado como `string` solto porque cruza a fronteira API->UI). Faz o
 * mesmo fallback que os 3 call sites originais já faziam: categoria
 * desconhecida mostra o próprio slug em vez de "undefined".
 */
export function getCategoryLabel(category: string, locale: Locale): string {
  return CATEGORY_LABELS[category as StackCategory]?.[locale] ?? category;
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
