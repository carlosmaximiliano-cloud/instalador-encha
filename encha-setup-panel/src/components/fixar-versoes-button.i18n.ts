import type { Locale } from "@/lib/locale-shared";

export type FixarVersoesText = {
  btn: string;
  title: string;
  intro: string;
  loading: string;
  edicao: (e: string) => string;
  versao: (v: string) => string;
  changes: string;
  addsAdmin: string;
  nothing: string;
  protectedOk: string;
  notProtected: (v: string) => string;
  mayRestart: string;
  noCredentialWarn: string;
  cancel: string;
  confirm: string;
  applying: string;
  done: string;
  doneNothing: string;
  close: string;
  networkError: string;
  genericError: string;
};

const FULL_PT = "CRM/Tráfego";

export const fixarVersoesText: Record<Locale, FixarVersoesText> = {
  pt: {
    btn: "Fixar versões da stack",
    title: "Fixar a stack nas versões em execução",
    intro:
      "Grava no arquivo da stack (Portainer) as versões do EnchaT, do Pinfy e do atualizador que estão rodando agora. Assim, salvar a stack no Portainer (\"Update the stack\") não volta mais a versão nem a edição. Segredos e variáveis que você editou não são alterados.",
    loading: "Lendo a stack…",
    edicao: (e) => `Edição em execução: ${e === "full" ? FULL_PT : "Grátis"}`,
    versao: (v) => `Versão em execução: ${v}`,
    changes: "Linhas que serão trocadas:",
    addsAdmin: "Também serão acrescentadas as variáveis ENCHAT_ADMIN_EMAIL e ENCHAT_ADMIN_SENHA (vazias), usadas para redefinir a senha do administrador.",
    nothing: "Esta stack já está fixada nas versões em execução. Nada a fazer.",
    protectedOk: "O atualizador instalado já tem a proteção automática (0.4.7 ou superior).",
    notProtected: (v) =>
      `Atenção: o atualizador instalado (${v}) é anterior à 0.4.7 e ainda não repõe a versão sozinho. Fixar agora evita a regressão de hoje, mas depois da próxima atualização pelo botão do EnchaT será preciso rodar esta ação de novo.`,
    mayRestart: "Os serviços podem reiniciar brevemente durante a aplicação.",
    noCredentialWarn: "Não foi possível renovar o acesso às imagens automaticamente (a licença não está legível); seguiremos com o acesso já registrado.",
    cancel: "Cancelar",
    confirm: "Fixar agora",
    applying: "Aplicando…",
    done: "Pronto: a stack agora está fixada nas versões em execução.",
    doneNothing: "Nada foi alterado: já estava fixada.",
    close: "Fechar",
    networkError: "Erro de rede. Nada foi alterado.",
    genericError: "Não foi possível concluir. Nada foi alterado.",
  },
  en: {
    btn: "Pin stack versions",
    title: "Pin the stack to the running versions",
    intro:
      "Writes the EnchaT, Pinfy and updater versions that are running right now into the stack file (Portainer). Afterwards, saving the stack in Portainer (\"Update the stack\") no longer rolls back the version or edition. Secrets and variables you edited are not changed.",
    loading: "Reading the stack…",
    edicao: (e) => `Running edition: ${e === "full" ? "CRM/Traffic" : "Free"}`,
    versao: (v) => `Running version: ${v}`,
    changes: "Lines that will be changed:",
    addsAdmin: "The variables ENCHAT_ADMIN_EMAIL and ENCHAT_ADMIN_SENHA (empty) will also be added; they are used to reset the administrator password.",
    nothing: "This stack is already pinned to the running versions. Nothing to do.",
    protectedOk: "The installed updater already has the automatic protection (0.4.7 or later).",
    notProtected: (v) =>
      `Heads up: the installed updater (${v}) predates 0.4.7 and does not restore the version by itself yet. Pinning now prevents today's rollback, but after the next update from the EnchaT button you will need to run this action again.`,
    mayRestart: "Services may restart briefly while this is applied.",
    noCredentialWarn: "Could not refresh image access automatically (the license is not readable); we will continue with the access already registered.",
    cancel: "Cancel",
    confirm: "Pin now",
    applying: "Applying…",
    done: "Done: the stack is now pinned to the running versions.",
    doneNothing: "Nothing changed: it was already pinned.",
    close: "Close",
    networkError: "Network error. Nothing was changed.",
    genericError: "Could not complete. Nothing was changed.",
  },
  es: {
    btn: "Fijar versiones de la stack",
    title: "Fijar la stack en las versiones en ejecución",
    intro:
      "Escribe en el archivo de la stack (Portainer) las versiones de EnchaT, Pinfy y del actualizador que están corriendo ahora. Así, guardar la stack en Portainer (\"Update the stack\") ya no revierte la versión ni la edición. Los secretos y las variables que editó no se modifican.",
    loading: "Leyendo la stack…",
    edicao: (e) => `Edición en ejecución: ${e === "full" ? "CRM/Tráfico" : "Gratis"}`,
    versao: (v) => `Versión en ejecución: ${v}`,
    changes: "Líneas que se cambiarán:",
    addsAdmin: "También se agregarán las variables ENCHAT_ADMIN_EMAIL y ENCHAT_ADMIN_SENHA (vacías), usadas para restablecer la contraseña del administrador.",
    nothing: "Esta stack ya está fijada en las versiones en ejecución. Nada que hacer.",
    protectedOk: "El actualizador instalado ya tiene la protección automática (0.4.7 o superior).",
    notProtected: (v) =>
      `Atención: el actualizador instalado (${v}) es anterior a 0.4.7 y aún no repone la versión por sí solo. Fijar ahora evita la regresión de hoy, pero tras la próxima actualización desde el botón de EnchaT habrá que ejecutar esta acción de nuevo.`,
    mayRestart: "Los servicios pueden reiniciarse brevemente durante la aplicación.",
    noCredentialWarn: "No se pudo renovar el acceso a las imágenes automáticamente (la licencia no es legible); seguiremos con el acceso ya registrado.",
    cancel: "Cancelar",
    confirm: "Fijar ahora",
    applying: "Aplicando…",
    done: "Listo: la stack ahora está fijada en las versiones en ejecución.",
    doneNothing: "No se cambió nada: ya estaba fijada.",
    close: "Cerrar",
    networkError: "Error de red. No se cambió nada.",
    genericError: "No se pudo completar. No se cambió nada.",
  },
};
