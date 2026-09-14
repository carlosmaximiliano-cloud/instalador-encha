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

export const logsPageText: Record<Locale, LogsPageText> = {
  pt: {
    title: "Log de auditoria",
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
    title: "Registro de auditoría",
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
