import type { Locale } from "@/lib/locale-shared";

export type InstallWizardText = {
  defaultGroup: string;
  instalarStack: (nome: string) => string;
  sensivel: string;
  esconder: string;
  mostrar: string;
  cancelar: string;
  instalar: string;
  concluaLicencaParaInstalar: string;
  ajudaAntesDeInstalar: string;
  implantandoNoSwarm: string;
  stackImplantada: string;
  copiarAgoraAviso: string;
  copiar: string;
  linkPrimeiroAcesso: string;
  linkPrimeiroAcessoNota: string;
  abrirPrimeiroAcesso: string;
  fechar: string;
  abrirStack: (nome: string) => string;
  falhaNaInstalacao: string;
  copiarDetalhes: string;
  tentarDeNovo: string;
  falarComSuporte: string;
  detalheStack: string;
  detalheMensagem: string;
  detalheCausa: string;
  corrijaCamposParaInstalar: string;
  servidorRecusouDados: string;
  erroDeRede: string;
  dnsNaoResolve: string;
  dnsNaoAponta: string;
  lembreteDnsHttps: (dominios: string) => string;
};

export const installWizardText: Record<Locale, InstallWizardText> = {
  pt: {
    defaultGroup: "Configuração",
    instalarStack: (nome) => `Instalar ${nome}`,
    sensivel: "sensível",
    esconder: "Esconder",
    mostrar: "Mostrar",
    cancelar: "Cancelar",
    instalar: "Instalar",
    concluaLicencaParaInstalar: "Conclua o pareamento da licença acima, ou informe uma chave, para poder instalar.",
    ajudaAntesDeInstalar: "Precisa de ajuda antes de instalar? Fale com o suporte",
    implantandoNoSwarm: "Implantando no Swarm via Portainer API...",
    stackImplantada: "Stack implantada!",
    copiarAgoraAviso: "⚠ Copie agora — não será mostrado de novo nesta tela.",
    copiar: "Copiar",
    linkPrimeiroAcesso: "Link de primeiro acesso (criar o administrador)",
    linkPrimeiroAcessoNota:
      "Use uma vez para criar o administrador; se esta licença já tinha um administrador, o link abre o login.",
    abrirPrimeiroAcesso: "Abrir link",
    fechar: "Fechar",
    abrirStack: (nome) => `Abrir ${nome}`,
    falhaNaInstalacao: "Falha na instalação",
    copiarDetalhes: "Copiar detalhes",
    tentarDeNovo: "Tentar de novo",
    falarComSuporte: "Falar com o suporte",
    detalheStack: "Stack",
    detalheMensagem: "Mensagem",
    detalheCausa: "Causa",
    corrijaCamposParaInstalar: "Preencha e corrija os campos acima para poder instalar.",
    servidorRecusouDados: "O servidor recusou estes dados:",
    erroDeRede: "Erro de rede",
    dnsNaoResolve:
      "O DNS deste domínio ainda não resolve. O certificado HTTPS vai falhar até o DNS apontar para esta VPS; se acabou de criar o registro, aguarde a propagação.",
    dnsNaoAponta:
      "Este domínio não aponta para esta VPS. O certificado HTTPS vai falhar até o DNS apontar para cá; confira os registros A e AAAA.",
    lembreteDnsHttps: (dominios) =>
      `O DNS de ${dominios} não apontava para esta VPS quando a instalação foi enviada. O HTTPS só vai funcionar depois que o DNS apontar e o certificado for emitido.`,
  },
  en: {
    defaultGroup: "Settings",
    instalarStack: (nome) => `Install ${nome}`,
    sensivel: "sensitive",
    esconder: "Hide",
    mostrar: "Show",
    cancelar: "Cancel",
    instalar: "Install",
    concluaLicencaParaInstalar: "Finish the license pairing above, or enter a key, to be able to install.",
    ajudaAntesDeInstalar: "Need help before installing? Talk to support",
    implantandoNoSwarm: "Deploying to Swarm via Portainer API...",
    stackImplantada: "Stack deployed!",
    copiarAgoraAviso: "⚠ Copy now — it won't be shown again on this screen.",
    copiar: "Copy",
    linkPrimeiroAcesso: "First-access link (create the administrator)",
    linkPrimeiroAcessoNota:
      "Use it once to create the administrator; if this license already had an administrator, the link opens the login page.",
    abrirPrimeiroAcesso: "Open link",
    fechar: "Close",
    abrirStack: (nome) => `Open ${nome}`,
    falhaNaInstalacao: "Installation failed",
    copiarDetalhes: "Copy details",
    tentarDeNovo: "Try again",
    falarComSuporte: "Talk to support",
    detalheStack: "Stack",
    detalheMensagem: "Message",
    detalheCausa: "Cause",
    corrijaCamposParaInstalar: "Fill in and fix the fields above to be able to install.",
    servidorRecusouDados: "The server rejected this data:",
    erroDeRede: "Network error",
    dnsNaoResolve:
      "This domain's DNS doesn't resolve yet. The HTTPS certificate will fail until the DNS points to this VPS; if you just created the record, wait for propagation.",
    dnsNaoAponta:
      "This domain doesn't point to this VPS. The HTTPS certificate will fail until the DNS points here; check the A and AAAA records.",
    lembreteDnsHttps: (dominios) =>
      `The DNS for ${dominios} did not point to this VPS when the installation was sent. HTTPS will only work after the DNS points here and the certificate is issued.`,
  },
  es: {
    defaultGroup: "Configuración",
    instalarStack: (nome) => `Instalar ${nome}`,
    sensivel: "sensible",
    esconder: "Ocultar",
    mostrar: "Mostrar",
    cancelar: "Cancelar",
    instalar: "Instalar",
    concluaLicencaParaInstalar: "Complete el emparejamiento de la licencia arriba, o ingrese una clave, para poder instalar.",
    ajudaAntesDeInstalar: "¿Necesita ayuda antes de instalar? Hable con soporte",
    implantandoNoSwarm: "Implementando en Swarm vía Portainer API...",
    stackImplantada: "¡Stack implementado!",
    copiarAgoraAviso: "⚠ Copie ahora — no se mostrará de nuevo en esta pantalla.",
    copiar: "Copiar",
    linkPrimeiroAcesso: "Enlace de primer acceso (crear el administrador)",
    linkPrimeiroAcessoNota:
      "Úselo una vez para crear el administrador; si esta licencia ya tenía un administrador, el enlace abre el inicio de sesión.",
    abrirPrimeiroAcesso: "Abrir enlace",
    fechar: "Cerrar",
    abrirStack: (nome) => `Abrir ${nome}`,
    falhaNaInstalacao: "Error en la instalación",
    copiarDetalhes: "Copiar detalles",
    tentarDeNovo: "Intentar de nuevo",
    falarComSuporte: "Hablar con soporte",
    detalheStack: "Stack",
    detalheMensagem: "Mensaje",
    detalheCausa: "Causa",
    corrijaCamposParaInstalar: "Complete y corrija los campos de arriba para poder instalar.",
    servidorRecusouDados: "El servidor rechazó estos datos:",
    erroDeRede: "Error de red",
    dnsNaoResolve:
      "El DNS de este dominio aún no resuelve. El certificado HTTPS fallará hasta que el DNS apunte a esta VPS; si acaba de crear el registro, espere la propagación.",
    dnsNaoAponta:
      "Este dominio no apunta a esta VPS. El certificado HTTPS fallará hasta que el DNS apunte aquí; revise los registros A y AAAA.",
    lembreteDnsHttps: (dominios) =>
      `El DNS de ${dominios} no apuntaba a esta VPS cuando se envió la instalación. El HTTPS solo funcionará después de que el DNS apunte aquí y se emita el certificado.`,
  },
};
