import type { Locale } from "@/lib/locale-shared";

export type SuportePanelText = {
  assuntoErroInstalacao: string;
  limiteImagem: string;
  limiteVideo: string;
  apenasImagemOuVideo: string;
  preencherCampos: string;
  naoFoiPossivelAbrirChamado: string;
  erroCampoObrigatorio: string;
  erroTicketFechado: string;
  erroLimiteAnexos: string;
  erroTipoNaoPermitido: string;
  naoFoiPossivelAnexar: string;
  erroDeRede: string;
  voltar: string;
  falarComSuporte: string;
  assunto: string;
  mensagem: string;
  descrevaOQueAconteceu: string;
  enviar: string;
  tentarDeNovo: string;
  chamadoAberto: (ticketId: number) => string;
  anexarImagemOuVideo: string;
  anexoEnviado: string;
  enviarAnexo: string;
  fechar: string;
};

export const suportePanelText: Record<Locale, SuportePanelText> = {
  pt: {
    assuntoErroInstalacao: "Erro na instalação",
    limiteImagem: "Imagens têm limite de 10MB.",
    limiteVideo: "Vídeos têm limite de 50MB.",
    apenasImagemOuVideo: "Só é possível anexar imagem ou vídeo.",
    preencherCampos: "Preencha o assunto e a mensagem.",
    naoFoiPossivelAbrirChamado: "Não foi possível abrir o chamado agora.",
    erroCampoObrigatorio: "Preencha os campos obrigatórios do chamado.",
    erroTicketFechado: "Este chamado já foi encerrado.",
    erroLimiteAnexos: "Limite de anexos atingido para este chamado.",
    erroTipoNaoPermitido: "Tipo de arquivo não permitido.",
    naoFoiPossivelAnexar: "Não foi possível anexar o arquivo.",
    erroDeRede: "Erro de rede.",
    voltar: "Voltar",
    falarComSuporte: "Falar com o suporte",
    assunto: "Assunto",
    mensagem: "Mensagem",
    descrevaOQueAconteceu: "Descreva o que aconteceu...",
    enviar: "Enviar",
    tentarDeNovo: "Tentar de novo",
    chamadoAberto: (ticketId) =>
      `Chamado #${ticketId} aberto — nossa equipe vai analisar e entrar em contato.`,
    anexarImagemOuVideo: "Anexar imagem ou vídeo (opcional)",
    anexoEnviado: "Anexo enviado.",
    enviarAnexo: "Enviar anexo",
    fechar: "Fechar",
  },
  en: {
    assuntoErroInstalacao: "Installation error",
    limiteImagem: "Images have a 10MB limit.",
    limiteVideo: "Videos have a 50MB limit.",
    apenasImagemOuVideo: "Only images or videos can be attached.",
    preencherCampos: "Fill in the subject and message.",
    naoFoiPossivelAbrirChamado: "Could not open the ticket right now.",
    erroCampoObrigatorio: "Fill in the required ticket fields.",
    erroTicketFechado: "This ticket has already been closed.",
    erroLimiteAnexos: "Attachment limit reached for this ticket.",
    erroTipoNaoPermitido: "File type not allowed.",
    naoFoiPossivelAnexar: "Could not attach the file.",
    erroDeRede: "Network error.",
    voltar: "Back",
    falarComSuporte: "Talk to support",
    assunto: "Subject",
    mensagem: "Message",
    descrevaOQueAconteceu: "Describe what happened...",
    enviar: "Send",
    tentarDeNovo: "Try again",
    chamadoAberto: (ticketId) =>
      `Ticket #${ticketId} opened — our team will review it and get in touch.`,
    anexarImagemOuVideo: "Attach image or video (optional)",
    anexoEnviado: "Attachment sent.",
    enviarAnexo: "Send attachment",
    fechar: "Close",
  },
  es: {
    assuntoErroInstalacao: "Error en la instalación",
    limiteImagem: "Las imágenes tienen un límite de 10MB.",
    limiteVideo: "Los videos tienen un límite de 50MB.",
    apenasImagemOuVideo: "Solo se puede adjuntar imagen o video.",
    preencherCampos: "Complete el asunto y el mensaje.",
    naoFoiPossivelAbrirChamado: "No fue posible abrir el ticket en este momento.",
    erroCampoObrigatorio: "Complete los campos obligatorios del ticket.",
    erroTicketFechado: "Este ticket ya fue cerrado.",
    erroLimiteAnexos: "Se alcanzó el límite de archivos adjuntos para este ticket.",
    erroTipoNaoPermitido: "Tipo de archivo no permitido.",
    naoFoiPossivelAnexar: "No fue posible adjuntar el archivo.",
    erroDeRede: "Error de red.",
    voltar: "Volver",
    falarComSuporte: "Hablar con soporte",
    assunto: "Asunto",
    mensagem: "Mensaje",
    descrevaOQueAconteceu: "Describa lo que sucedió...",
    enviar: "Enviar",
    tentarDeNovo: "Intentar de nuevo",
    chamadoAberto: (ticketId) =>
      `Ticket #${ticketId} abierto — nuestro equipo lo revisará y se pondrá en contacto.`,
    anexarImagemOuVideo: "Adjuntar imagen o video (opcional)",
    anexoEnviado: "Archivo adjunto enviado.",
    enviarAnexo: "Enviar adjunto",
    fechar: "Cerrar",
  },
};
