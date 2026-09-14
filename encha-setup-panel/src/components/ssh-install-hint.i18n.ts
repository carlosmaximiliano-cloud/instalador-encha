import type { Locale } from "@/lib/locale-shared";

export type SshInstallHintText = {
  title: (stackName: string) => string;
  description: string;
  chooseOptionComment: (optionNumber: number) => string;
  copy: string;
  menuInstructions: (optionNumber: number) => string;
  fallbackInstructions: string;
  comingSoonLabel: string;
  comingSoonText: string;
  gotIt: string;
};

export const sshInstallHintText: Record<Locale, SshInstallHintText> = {
  pt: {
    title: (stackName) => `Instalar ${stackName} via SSH`,
    description:
      "Esta stack ainda não tem instalação visual pelo painel. Conecte na VPS e rode o instalador interativo:",
    chooseOptionComment: (optionNumber) => `# Escolha a opção ${optionNumber}`,
    copy: "Copiar",
    menuInstructions: (optionNumber) => `No menu interativo, digite ${optionNumber} e siga as instruções.`,
    fallbackInstructions:
      "Esta stack normalmente é instalada como dependência de outra ou diretamente no menu principal.",
    comingSoonLabel: "Em breve:",
    comingSoonText: "instalação direta pelo painel — formulário visual sem terminal.",
    gotIt: "Entendi",
  },
  en: {
    title: (stackName) => `Install ${stackName} via SSH`,
    description:
      "This stack doesn't have a visual install in the panel yet. Connect to the VPS and run the interactive installer:",
    chooseOptionComment: (optionNumber) => `# Choose option ${optionNumber}`,
    copy: "Copy",
    menuInstructions: (optionNumber) => `In the interactive menu, type ${optionNumber} and follow the instructions.`,
    fallbackInstructions:
      "This stack is usually installed as a dependency of another one, or directly from the main menu.",
    comingSoonLabel: "Coming soon:",
    comingSoonText: "direct install from the panel — a visual form, no terminal needed.",
    gotIt: "Got it",
  },
  es: {
    title: (stackName) => `Instalar ${stackName} vía SSH`,
    description:
      "Esta stack todavía no tiene instalación visual desde el panel. Conéctese a la VPS y ejecute el instalador interactivo:",
    chooseOptionComment: (optionNumber) => `# Elija la opción ${optionNumber}`,
    copy: "Copiar",
    menuInstructions: (optionNumber) => `En el menú interactivo, escriba ${optionNumber} y siga las instrucciones.`,
    fallbackInstructions:
      "Esta stack normalmente se instala como dependencia de otra o directamente desde el menú principal.",
    comingSoonLabel: "Próximamente:",
    comingSoonText: "instalación directa desde el panel — formulario visual, sin terminal.",
    gotIt: "Entendido",
  },
};
