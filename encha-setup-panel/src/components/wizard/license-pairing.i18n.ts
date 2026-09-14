import type { Locale } from "@/lib/locale-shared";

// Textos do fluxo de pareamento self-service de licença (LicensePairing).
// mensagemRecusa/mensagemAviso reimplementam, por idioma, os mesmos
// switch/mapas que existiam hardcoded no componente — os `case` (códigos
// vindos do Console) NÃO mudam entre idiomas, só o texto de cada um.
export type LicensePairingText = {
  preparando: string;
  tentarDeNovo: string;
  informeChaveExistente: string;
  migrandoLicenca: string;
  trocarTelefoneDesc: string;
  emailLabel: string;
  emailPlaceholder: string;
  senhaLabel: string;
  trocarNumeroBotao: string;
  migrarDesc: string;
  migrarPrimeiraVez: string;
  instalacaoAnteriorPrefixo: string;
  migrarLicencaBotao: string;
  expiradoMensagem: string;
  migrarLicencaEstaMinha: string;
  trocarCpfMeu: string;
  gerarOutroCodigo: string;
  migrarDialogTitle: string;
  migrarDialogDescPrefix: string;
  migrarDialogDescSuffix: string;
  cancelar: string;
  continuar: string;
  licencaPareada: (cliente?: string, plano?: string) => string;
  recebemosCodigo: (remetente?: string) => string;
  cpfTitularLabel: string;
  cpfPlaceholder: string;
  erroCpfObrigatorio: string;
  cpfNaoConfereComTentativas: (restantes: number) => string;
  cpfNaoConfere: string;
  erroConfirmarCpf: string;
  naoDeuCpfDesc: string;
  erroCredencialObrigatoria: string;
  erroConfirmarCredencial: string;
  erroMigrarLicenca: string;
  erroTrocarNumero: string;
  entrarBotao: string;
  encontramosVariasLicencas: string;
  licencaFallback: (id: number) => string;
  vitaliciaSufixo: string;
  jaAtivadaAquiSufixo: string;
  mandarPrefixo: string;
  mandarSufixo: (numero?: string) => string;
  abrirWhatsappBotao: string;
  qrAltText: string;
  aindaNaoTenhoConta: string;
  expiraEm: (mm: string, ss: string) => string;
  sinalNuncaVerificou: string;
  sinalAtivaMenos2Min: string;
  sinalAtivaMinutos: (n: number) => string;
  sinalAtivaHoras: (n: number) => string;
  sinalSemSinalDias: (n: number) => string;
  // Mesma taxonomia de AtivacaoScreen.tsx (repo ENCHAT, mensagemDeErro) —
  // copiada de propósito, não importada. Se um motivo novo aparecer lá,
  // replicar aqui também (nos 3 idiomas).
  mensagemRecusa: (motivo?: string) => string;
  // Fallback genérico pra qualquer erro de pair/start que não seja um dos
  // `motivo` conhecidos de mensagemRecusa — nunca mostra o código cru
  // (ex.: "cpf_obrigatorio", "invalid_fingerprint") na tela.
  erroGenericoPareamento: string;
  mensagemAviso: (codigo: string) => string;
};

export const licensePairingText: Record<Locale, LicensePairingText> = {
  pt: {
    preparando: "Preparando pareamento de licença...",
    tentarDeNovo: "Tentar de novo",
    informeChaveExistente: "Ou informe uma chave de licença já existente no campo abaixo.",
    migrandoLicenca: "Migrando a licença para esta instalação...",
    trocarTelefoneDesc:
      "Confirme com o email e a senha do Super Admin da sua conta EnchaT — isso troca o celular cadastrado pelo número que você acabou de confirmar aqui.",
    emailLabel: "Email",
    emailPlaceholder: "voce@empresa.com",
    senhaLabel: "Senha",
    trocarNumeroBotao: "Trocar número",
    migrarDesc:
      "Confirme com o email e a senha do Super Admin da sua conta EnchaT — isso move a licença desta conta pra ESTA VPS.",
    migrarPrimeiraVez:
      "Primeira vez migrando? Se sua conta ainda não tem uma senha cadastrada, o que você digitar aqui vira a senha do Super Admin (mínimo 10 caracteres).",
    instalacaoAnteriorPrefixo: "Instalação anterior: ",
    migrarLicencaBotao: "Migrar licença",
    expiradoMensagem: "O tempo para confirmar o pareamento acabou.",
    migrarLicencaEstaMinha: "Esta licença é minha — migrar para esta instalação",
    trocarCpfMeu: "Este CPF é meu — trocar meu número",
    gerarOutroCodigo: "Gerar outro código",
    migrarDialogTitle: "Migrar esta licença para esta instalação?",
    migrarDialogDescPrefix: "A instalação anterior está ",
    migrarDialogDescSuffix:
      ". Migrar vincula a licença a ESTA VPS — a instalação anterior vai parar de funcionar assim que ela verificar a licença de novo (em até algumas horas).",
    cancelar: "Cancelar",
    continuar: "Continuar",
    licencaPareada: (cliente, plano) =>
      `Licença pareada${cliente ? ` — ${cliente}` : ""}${plano ? ` (${plano})` : ""}. Pronto para instalar.`,
    recebemosCodigo: (remetente) =>
      `Recebemos o código${remetente ? ` do número ${remetente}` : ""}. Agora informe o CPF do titular da conta EnchaT para concluir.`,
    cpfTitularLabel: "CPF do titular",
    cpfPlaceholder: "000.000.000-00",
    erroCpfObrigatorio: "Informe o CPF do titular da conta (11 dígitos).",
    cpfNaoConfereComTentativas: (restantes) =>
      `CPF não confere — resta ${restantes} tentativa${restantes === 1 ? "" : "s"}.`,
    cpfNaoConfere: "CPF não confere.",
    erroConfirmarCpf: "Não foi possível confirmar com este CPF — confira os dados e tente de novo.",
    naoDeuCpfDesc:
      "Não deu pra confirmar pelo CPF. Entre com o email e a senha do Super Admin da sua conta EnchaT pra continuar.",
    erroCredencialObrigatoria: "Informe o email e a senha do Super Admin do seu EnchaT.",
    erroConfirmarCredencial: "Não foi possível entrar com essas credenciais — confira e tente de novo.",
    erroMigrarLicenca: "Não foi possível migrar a licença — confira as credenciais e tente de novo.",
    erroTrocarNumero: "Não foi possível trocar o número — confira as credenciais e tente de novo.",
    entrarBotao: "Entrar",
    encontramosVariasLicencas: "Encontramos mais de uma licença para este CPF — escolha qual ativar:",
    licencaFallback: (id) => `Licença #${id}`,
    vitaliciaSufixo: " · vitalícia",
    jaAtivadaAquiSufixo: " · já ativada nesta VPS",
    mandarPrefixo: "Mande ",
    mandarSufixo: (numero) => ` pelo WhatsApp${numero ? ` para ${numero}` : ""}.`,
    abrirWhatsappBotao: "Abrir WhatsApp",
    qrAltText: "QR code para abrir o WhatsApp",
    aindaNaoTenhoConta: "Ainda não tenho conta",
    expiraEm: (mm, ss) => `expira em ${mm}:${ss}`,
    sinalNuncaVerificou: "nunca fez uma verificação de licença",
    sinalAtivaMenos2Min: "ativa há menos de 2 minutos",
    sinalAtivaMinutos: (n) => `ativa há ${n} minutos`,
    sinalAtivaHoras: (n) => `ativa há ${n} hora(s)`,
    sinalSemSinalDias: (n) => `sem sinal há ${n} dia(s)`,
    mensagemRecusa: (motivo) => {
      switch (motivo) {
        case "cpf_sem_licenca":
        case "sem_licenca":
        case "sem_licenca_disponivel":
        case "licenca_nao_encontrada":
          return "Não encontramos uma licença disponível para esta ativação.";
        case "ja_ativada_em_outra_vps":
          return "Esta licença já está ativada em outra VPS.";
        case "licenca_revogada":
          return "Esta licença foi cancelada — fale com o suporte para liberar um novo cadastro.";
        case "ja_tem_conta_gratis":
          return "Este CPF já tem uma conta grátis — ative pelo portal ou contate o suporte.";
        case "cpf_ja_cadastrado":
          return "Este CPF já tem cadastro — entre pelo portal em vez de criar uma conta nova.";
        case "celular_ja_cadastrado":
          return "Este celular já está em uso por outra conta.";
        case "excesso_tentativas_cpf":
          return "Muitas tentativas de CPF nesta sessão — gere um novo código.";
        default:
          return motivo ? "Não foi possível concluir agora — contate o suporte EnchaT." : "Não foi possível concluir o pareamento.";
      }
    },
    erroGenericoPareamento: "Não foi possível iniciar o pareamento. Tente novamente.",
    mensagemAviso: (codigo) => {
      switch (codigo) {
        case "numero_sem_licenca":
          return "O número que enviou a mensagem não tem uma licença vinculada.";
        case "numero_nao_identificado":
          return "Não conseguimos identificar o número que enviou a mensagem.";
        case "codigo_desconhecido":
          return "O código enviado não foi reconhecido.";
        case "excesso_tentativas":
          return "Muitas tentativas — aguarde um pouco antes de tentar de novo.";
        default:
          return "Ainda não recebemos uma mensagem válida — confira o número e o código enviados.";
      }
    },
  },
  en: {
    preparando: "Preparing license pairing...",
    tentarDeNovo: "Try again",
    informeChaveExistente: "Or enter an existing license key in the field below.",
    migrandoLicenca: "Migrating the license to this installation...",
    trocarTelefoneDesc:
      "Confirm with the email and password of your EnchaT account's Super Admin — this swaps the registered phone number for the one you just confirmed here.",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    senhaLabel: "Password",
    trocarNumeroBotao: "Swap number",
    migrarDesc:
      "Confirm with the email and password of your EnchaT account's Super Admin — this moves the license from this account to THIS VPS.",
    migrarPrimeiraVez:
      "Migrating for the first time? If your account doesn't have a password set yet, whatever you type here becomes the Super Admin password (minimum 10 characters).",
    instalacaoAnteriorPrefixo: "Previous installation: ",
    migrarLicencaBotao: "Migrate license",
    expiradoMensagem: "Time to confirm the pairing ran out.",
    migrarLicencaEstaMinha: "This license is mine — migrate it to this installation",
    trocarCpfMeu: "This CPF is mine — swap my number",
    gerarOutroCodigo: "Generate another code",
    migrarDialogTitle: "Migrate this license to this installation?",
    migrarDialogDescPrefix: "The previous installation is ",
    migrarDialogDescSuffix:
      ". Migrating binds the license to THIS VPS — the previous installation will stop working as soon as it checks the license again (within a few hours).",
    cancelar: "Cancel",
    continuar: "Continue",
    licencaPareada: (cliente, plano) =>
      `License paired${cliente ? ` — ${cliente}` : ""}${plano ? ` (${plano})` : ""}. Ready to install.`,
    recebemosCodigo: (remetente) =>
      `We received the code${remetente ? ` from number ${remetente}` : ""}. Now enter the CPF of the EnchaT account holder to finish.`,
    cpfTitularLabel: "Account holder's CPF",
    cpfPlaceholder: "000.000.000-00",
    erroCpfObrigatorio: "Enter the account holder's CPF (11 digits).",
    cpfNaoConfereComTentativas: (restantes) =>
      `CPF doesn't match — ${restantes} attempt${restantes === 1 ? "" : "s"} left.`,
    cpfNaoConfere: "CPF doesn't match.",
    erroConfirmarCpf: "We couldn't confirm this CPF — check the details and try again.",
    naoDeuCpfDesc:
      "Couldn't confirm with the CPF. Sign in with the email and password of your EnchaT account's Super Admin to continue.",
    erroCredencialObrigatoria: "Enter your EnchaT Super Admin's email and password.",
    erroConfirmarCredencial: "We couldn't sign in with those credentials — check them and try again.",
    erroMigrarLicenca: "We couldn't migrate the license — check the credentials and try again.",
    erroTrocarNumero: "We couldn't swap the number — check the credentials and try again.",
    entrarBotao: "Sign in",
    encontramosVariasLicencas: "We found more than one license for this CPF — choose which one to activate:",
    licencaFallback: (id) => `License #${id}`,
    vitaliciaSufixo: " · lifetime",
    jaAtivadaAquiSufixo: " · already activated on this VPS",
    mandarPrefixo: "Send ",
    mandarSufixo: (numero) => ` on WhatsApp${numero ? ` to ${numero}` : ""}.`,
    abrirWhatsappBotao: "Open WhatsApp",
    qrAltText: "QR code to open WhatsApp",
    aindaNaoTenhoConta: "I don't have an account yet",
    expiraEm: (mm, ss) => `expires in ${mm}:${ss}`,
    sinalNuncaVerificou: "never checked in for a license",
    sinalAtivaMenos2Min: "active less than 2 minutes ago",
    sinalAtivaMinutos: (n) => `active ${n} minute${n === 1 ? "" : "s"} ago`,
    sinalAtivaHoras: (n) => `active ${n} hour${n === 1 ? "" : "s"} ago`,
    sinalSemSinalDias: (n) => `no signal for ${n} day${n === 1 ? "" : "s"}`,
    mensagemRecusa: (motivo) => {
      switch (motivo) {
        case "cpf_sem_licenca":
        case "sem_licenca":
        case "sem_licenca_disponivel":
        case "licenca_nao_encontrada":
          return "We couldn't find an available license for this activation.";
        case "ja_ativada_em_outra_vps":
          return "This license is already active on another VPS.";
        case "licenca_revogada":
          return "This license was canceled — contact support to unlock a new registration.";
        case "ja_tem_conta_gratis":
          return "This CPF already has a free account — activate it from the portal or contact support.";
        case "cpf_ja_cadastrado":
          return "This CPF is already registered — sign in from the portal instead of creating a new account.";
        case "celular_ja_cadastrado":
          return "This phone number is already in use by another account.";
        case "excesso_tentativas_cpf":
          return "Too many CPF attempts in this session — generate a new code.";
        default:
          return motivo ? "We couldn't complete this right now — contact EnchaT support." : "We couldn't complete the pairing.";
      }
    },
    erroGenericoPareamento: "We couldn't start the pairing. Please try again.",
    mensagemAviso: (codigo) => {
      switch (codigo) {
        case "numero_sem_licenca":
          return "The number that sent the message doesn't have a license linked to it.";
        case "numero_nao_identificado":
          return "We couldn't identify the number that sent the message.";
        case "codigo_desconhecido":
          return "The code you sent wasn't recognized.";
        case "excesso_tentativas":
          return "Too many attempts — wait a moment before trying again.";
        default:
          return "We haven't received a valid message yet — check the number and code you sent.";
      }
    },
  },
  es: {
    preparando: "Preparando el emparejamiento de la licencia...",
    tentarDeNovo: "Intentar de nuevo",
    informeChaveExistente: "O ingrese una clave de licencia existente en el campo de abajo.",
    migrandoLicenca: "Migrando la licencia a esta instalación...",
    trocarTelefoneDesc:
      "Confirme con el email y la contraseña del Super Admin de su cuenta EnchaT — esto cambia el celular registrado por el número que acaba de confirmar aquí.",
    emailLabel: "Email",
    emailPlaceholder: "usted@empresa.com",
    senhaLabel: "Contraseña",
    trocarNumeroBotao: "Cambiar número",
    migrarDesc:
      "Confirme con el email y la contraseña del Super Admin de su cuenta EnchaT — esto mueve la licencia de esta cuenta a ESTA VPS.",
    migrarPrimeiraVez:
      "¿Primera vez migrando? Si su cuenta todavía no tiene una contraseña registrada, lo que escriba aquí se convierte en la contraseña del Super Admin (mínimo 10 caracteres).",
    instalacaoAnteriorPrefixo: "Instalación anterior: ",
    migrarLicencaBotao: "Migrar licencia",
    expiradoMensagem: "Se acabó el tiempo para confirmar el emparejamiento.",
    migrarLicencaEstaMinha: "Esta licencia es mía — migrarla a esta instalación",
    trocarCpfMeu: "Este CPF es mío — cambiar mi número",
    gerarOutroCodigo: "Generar otro código",
    migrarDialogTitle: "¿Migrar esta licencia a esta instalación?",
    migrarDialogDescPrefix: "La instalación anterior está ",
    migrarDialogDescSuffix:
      ". Migrar vincula la licencia a ESTA VPS — la instalación anterior dejará de funcionar en cuanto vuelva a verificar la licencia (en cuestión de horas).",
    cancelar: "Cancelar",
    continuar: "Continuar",
    licencaPareada: (cliente, plano) =>
      `Licencia emparejada${cliente ? ` — ${cliente}` : ""}${plano ? ` (${plano})` : ""}. Lista para instalar.`,
    recebemosCodigo: (remetente) =>
      `Recibimos el código${remetente ? ` del número ${remetente}` : ""}. Ahora ingrese el CPF del titular de la cuenta EnchaT para terminar.`,
    cpfTitularLabel: "CPF del titular",
    cpfPlaceholder: "000.000.000-00",
    erroCpfObrigatorio: "Ingrese el CPF del titular de la cuenta (11 dígitos).",
    cpfNaoConfereComTentativas: (restantes) =>
      `El CPF no coincide — quedan ${restantes} intento${restantes === 1 ? "" : "s"}.`,
    cpfNaoConfere: "El CPF no coincide.",
    erroConfirmarCpf: "No pudimos confirmar con este CPF — revise los datos e intente de nuevo.",
    naoDeuCpfDesc:
      "No se pudo confirmar con el CPF. Ingrese con el email y la contraseña del Super Admin de su cuenta EnchaT para continuar.",
    erroCredencialObrigatoria: "Ingrese el email y la contraseña del Super Admin de su EnchaT.",
    erroConfirmarCredencial: "No pudimos iniciar sesión con esas credenciales — revíselas e intente de nuevo.",
    erroMigrarLicenca: "No pudimos migrar la licencia — revise las credenciales e intente de nuevo.",
    erroTrocarNumero: "No pudimos cambiar el número — revise las credenciales e intente de nuevo.",
    entrarBotao: "Ingresar",
    encontramosVariasLicencas: "Encontramos más de una licencia para este CPF — elija cuál activar:",
    licencaFallback: (id) => `Licencia #${id}`,
    vitaliciaSufixo: " · vitalicia",
    jaAtivadaAquiSufixo: " · ya activada en esta VPS",
    mandarPrefixo: "Envíe ",
    mandarSufixo: (numero) => ` por WhatsApp${numero ? ` al ${numero}` : ""}.`,
    abrirWhatsappBotao: "Abrir WhatsApp",
    qrAltText: "Código QR para abrir WhatsApp",
    aindaNaoTenhoConta: "Todavía no tengo una cuenta",
    expiraEm: (mm, ss) => `expira en ${mm}:${ss}`,
    sinalNuncaVerificou: "nunca hizo una verificación de licencia",
    sinalAtivaMenos2Min: "activa hace menos de 2 minutos",
    sinalAtivaMinutos: (n) => `activa hace ${n} minutos`,
    sinalAtivaHoras: (n) => `activa hace ${n} hora(s)`,
    sinalSemSinalDias: (n) => `sin señal hace ${n} día(s)`,
    mensagemRecusa: (motivo) => {
      switch (motivo) {
        case "cpf_sem_licenca":
        case "sem_licenca":
        case "sem_licenca_disponivel":
        case "licenca_nao_encontrada":
          return "No encontramos una licencia disponible para esta activación.";
        case "ja_ativada_em_outra_vps":
          return "Esta licencia ya está activada en otra VPS.";
        case "licenca_revogada":
          return "Esta licencia fue cancelada — contacte al soporte para habilitar un nuevo registro.";
        case "ja_tem_conta_gratis":
          return "Este CPF ya tiene una cuenta gratuita — actívela desde el portal o contacte al soporte.";
        case "cpf_ja_cadastrado":
          return "Este CPF ya tiene un registro — ingrese desde el portal en vez de crear una cuenta nueva.";
        case "celular_ja_cadastrado":
          return "Este celular ya está en uso por otra cuenta.";
        case "excesso_tentativas_cpf":
          return "Demasiados intentos de CPF en esta sesión — genere un nuevo código.";
        default:
          return motivo ? "No pudimos completar esto ahora — contacte al soporte de EnchaT." : "No pudimos completar el emparejamiento.";
      }
    },
    erroGenericoPareamento: "No pudimos iniciar el emparejamiento. Intente de nuevo.",
    mensagemAviso: (codigo) => {
      switch (codigo) {
        case "numero_sem_licenca":
          return "El número que envió el mensaje no tiene una licencia vinculada.";
        case "numero_nao_identificado":
          return "No pudimos identificar el número que envió el mensaje.";
        case "codigo_desconhecido":
          return "El código enviado no fue reconocido.";
        case "excesso_tentativas":
          return "Demasiados intentos — espere un momento antes de intentar de nuevo.";
        default:
          return "Todavía no recibimos un mensaje válido — revise el número y el código enviados.";
      }
    },
  },
};
