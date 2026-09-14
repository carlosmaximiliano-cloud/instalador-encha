import type { Locale } from "@/lib/locale-shared";

export type LogsPageText = {
  title: string;
  subtitle: string;
  loading: string;
  empty: string;
  colWhen: string;
  colUser: string;
  colIp: string;
  colAction: string;
  colTarget: string;
  colResult: string;
};

// title fica "Audit log" nos 3 idiomas de propósito: é o mesmo rótulo do
// link na sidebar (sidebar.i18n.ts, decisão da Fase 2), e era o título que o
// pt-BR já mostrava antes — traduzir só aqui deixaria link e página com
// nomes diferentes.
export const logsPageText: Record<Locale, LogsPageText> = {
  pt: {
    title: "Audit log",
    subtitle: "Toda ação relevante registrada (append-only).",
    loading: "Carregando...",
    empty: "Sem registros ainda.",
    colWhen: "Quando",
    colUser: "Usuário",
    colIp: "IP",
    colAction: "Ação",
    colTarget: "Alvo",
    colResult: "Resultado",
  },
  en: {
    title: "Audit log",
    subtitle: "Every relevant action recorded (append-only).",
    loading: "Loading...",
    empty: "No records yet.",
    colWhen: "When",
    colUser: "User",
    colIp: "IP",
    colAction: "Action",
    colTarget: "Target",
    colResult: "Result",
  },
  es: {
    title: "Audit log",
    subtitle: "Toda acción relevante registrada (append-only).",
    loading: "Cargando...",
    empty: "Sin registros todavía.",
    colWhen: "Cuándo",
    colUser: "Usuario",
    colIp: "IP",
    colAction: "Acción",
    colTarget: "Objetivo",
    colResult: "Resultado",
  },
};
