import type { Locale } from "@/lib/locale-shared";

export type StackCardText = {
  repoLinkTitle: string;
  installed: string;
  installing: string;
  updateAvailable: string;
  comingSoon: string;
  installFirst: (deps: string) => string;
  updateImageOnly: string;
  btnInstall: string;
  btnAlreadyInstalled: string;
  btnInstalling: string;
  btnWaitingDeps: string;
  btnInstallViaSsh: string;
  btnUpdating: string;
  btnUpdate: string;
};

export const stackCardText: Record<Locale, StackCardText> = {
  pt: {
    repoLinkTitle: "Abrir repositório no GitHub",
    installed: "Instalado",
    installing: "Instalando...",
    updateAvailable: "Atualização disponível",
    comingSoon: "Em breve",
    installFirst: (deps) => `Instale primeiro: ${deps}`,
    updateImageOnly: "Atualiza só a imagem — volumes e banco de dados são preservados.",
    btnInstall: "Instalar",
    btnAlreadyInstalled: "Já instalado",
    btnInstalling: "Instalando...",
    btnWaitingDeps: "Aguardando dependências",
    btnInstallViaSsh: "Instalar via SSH",
    btnUpdating: "Atualizando...",
    btnUpdate: "Atualizar",
  },
  en: {
    repoLinkTitle: "Open repository on GitHub",
    installed: "Installed",
    installing: "Installing...",
    updateAvailable: "Update available",
    comingSoon: "Coming soon",
    installFirst: (deps) => `Install first: ${deps}`,
    updateImageOnly: "Updates only the image — volumes and database are preserved.",
    btnInstall: "Install",
    btnAlreadyInstalled: "Already installed",
    btnInstalling: "Installing...",
    btnWaitingDeps: "Waiting for dependencies",
    btnInstallViaSsh: "Install via SSH",
    btnUpdating: "Updating...",
    btnUpdate: "Update",
  },
  es: {
    repoLinkTitle: "Abrir repositorio en GitHub",
    installed: "Instalado",
    installing: "Instalando...",
    updateAvailable: "Actualización disponible",
    comingSoon: "Próximamente",
    installFirst: (deps) => `Instale primero: ${deps}`,
    updateImageOnly: "Actualiza solo la imagen — los volúmenes y la base de datos se conservan.",
    btnInstall: "Instalar",
    btnAlreadyInstalled: "Ya instalado",
    btnInstalling: "Instalando...",
    btnWaitingDeps: "Esperando dependencias",
    btnInstallViaSsh: "Instalar vía SSH",
    btnUpdating: "Actualizando...",
    btnUpdate: "Actualizar",
  },
};
