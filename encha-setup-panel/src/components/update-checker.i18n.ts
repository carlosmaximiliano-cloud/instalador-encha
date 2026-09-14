import type { Locale } from "@/lib/locale-shared";

export type UpdateCheckerText = {
  newVersion: (latest: string) => string;
  updateBtn: string;
  checkForUpdates: string;
  alreadyLatest: string;
  dialogTitle: string;
  descDone: string;
  descScripts: string;
  descPanel: string;
  descConfirm: (current: string, latest: string) => string;
  stepScripts: string;
  stepPanel: string;
  scriptsWarning: (motivo: string) => string;
  scriptsWarningHintPrefix: string;
  scriptsWarningHintSuffix: string;
  timeoutError: string;
  updateFailedFallback: string;
  networkErrorPanel: string;
  scriptsFailedFallback: string;
  networkErrorScripts: string;
  cancel: string;
  updatePanelOnly: string;
  tryAgain: string;
  updateNow: string;
  downloadingScripts: string;
  applyingUpdate: string;
  updatedTo: (latest: string) => string;
};

export const updateCheckerText: Record<Locale, UpdateCheckerText> = {
  pt: {
    newVersion: (latest) => `Nova versão ${latest}`,
    updateBtn: "Atualizar",
    checkForUpdates: "Verificar atualizações",
    alreadyLatest: " — você já está na versão mais recente",
    dialogTitle: "Atualizar Encha Setup",
    descDone: "Atualização concluída.",
    descScripts: "Atualizando os scripts do servidor…",
    descPanel: "Atualizando o painel — ele vai reiniciar.",
    descConfirm: (current, latest) => `Atualizar da versão ${current} para ${latest}?`,
    stepScripts: "Scripts do servidor",
    stepPanel: "Painel",
    scriptsWarning: (motivo) => `Scripts do servidor não atualizados: ${motivo}`,
    scriptsWarningHintPrefix:
      "O painel segue atualizando sozinho — os scripts ficam para trás até a próxima atualização. Alternativa: conecte por SSH e rode a opção 97 do menu (",
    scriptsWarningHintSuffix: ").",
    timeoutError: "A atualização está demorando. Recarregue a página em instantes.",
    updateFailedFallback: "Falha ao atualizar o painel",
    networkErrorPanel: "Erro de rede ao atualizar o painel",
    scriptsFailedFallback: "Falha ao atualizar os scripts do servidor",
    networkErrorScripts: "Erro de rede ao atualizar os scripts do servidor",
    cancel: "Cancelar",
    updatePanelOnly: "Atualizar só o painel",
    tryAgain: "Tentar novamente",
    updateNow: "Atualizar agora",
    downloadingScripts: "Baixando e instalando os scripts atualizados…",
    applyingUpdate: "Aplicando a atualização… aguarde o painel reiniciar.",
    updatedTo: (latest) => `Atualizado para ${latest}. Recarregando…`,
  },
  en: {
    newVersion: (latest) => `New version ${latest}`,
    updateBtn: "Update",
    checkForUpdates: "Check for updates",
    alreadyLatest: " — you're already on the latest version",
    dialogTitle: "Update Encha Setup",
    descDone: "Update complete.",
    descScripts: "Updating server scripts…",
    descPanel: "Updating the panel — it will restart.",
    descConfirm: (current, latest) => `Update from version ${current} to ${latest}?`,
    stepScripts: "Server scripts",
    stepPanel: "Panel",
    scriptsWarning: (motivo) => `Server scripts not updated: ${motivo}`,
    scriptsWarningHintPrefix:
      "The panel keeps updating on its own — the scripts stay behind until the next update. Alternative: connect via SSH and run menu option 97 (",
    scriptsWarningHintSuffix: ").",
    timeoutError: "The update is taking a while. Reload the page in a moment.",
    updateFailedFallback: "Failed to update the panel",
    networkErrorPanel: "Network error while updating the panel",
    scriptsFailedFallback: "Failed to update the server scripts",
    networkErrorScripts: "Network error while updating the server scripts",
    cancel: "Cancel",
    updatePanelOnly: "Update panel only",
    tryAgain: "Try again",
    updateNow: "Update now",
    downloadingScripts: "Downloading and installing the updated scripts…",
    applyingUpdate: "Applying the update… wait for the panel to restart.",
    updatedTo: (latest) => `Updated to ${latest}. Reloading…`,
  },
  es: {
    newVersion: (latest) => `Nueva versión ${latest}`,
    updateBtn: "Actualizar",
    checkForUpdates: "Buscar actualizaciones",
    alreadyLatest: " — ya tiene la versión más reciente",
    dialogTitle: "Actualizar Encha Setup",
    descDone: "Actualización completada.",
    descScripts: "Actualizando los scripts del servidor…",
    descPanel: "Actualizando el panel — se reiniciará.",
    descConfirm: (current, latest) => `¿Actualizar de la versión ${current} a ${latest}?`,
    stepScripts: "Scripts del servidor",
    stepPanel: "Panel",
    scriptsWarning: (motivo) => `Scripts del servidor no actualizados: ${motivo}`,
    scriptsWarningHintPrefix:
      "El panel sigue actualizándose solo — los scripts quedan pendientes hasta la próxima actualización. Alternativa: conéctese por SSH y ejecute la opción 97 del menú (",
    scriptsWarningHintSuffix: ").",
    timeoutError: "La actualización está tardando. Recargue la página en unos instantes.",
    updateFailedFallback: "No se pudo actualizar el panel",
    networkErrorPanel: "Error de red al actualizar el panel",
    scriptsFailedFallback: "No se pudo actualizar los scripts del servidor",
    networkErrorScripts: "Error de red al actualizar los scripts del servidor",
    cancel: "Cancelar",
    updatePanelOnly: "Actualizar solo el panel",
    tryAgain: "Intentar de nuevo",
    updateNow: "Actualizar ahora",
    downloadingScripts: "Descargando e instalando los scripts actualizados…",
    applyingUpdate: "Aplicando la actualización… espere a que el panel se reinicie.",
    updatedTo: (latest) => `Actualizado a ${latest}. Recargando…`,
  },
};
