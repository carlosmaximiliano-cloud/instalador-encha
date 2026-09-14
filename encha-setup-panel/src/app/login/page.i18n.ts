import type { Locale } from "@/lib/locale-shared";

export type LoginText = {
  heroTitle: string;
  heroSubtitle: string;
  welcome: string;
  welcomeSubtitle: string;
  username: string;
  password: string;
  entering: string;
  enter: string;
  genericError: string;
  defaultError: string;
};

export const loginText: Record<Locale, LoginText> = {
  pt: {
    heroTitle: "Painel visual de instalação",
    heroSubtitle:
      "Configure stacks no seu Portainer Swarm sem terminal. Tudo visual, seguro e com SSL automático.",
    welcome: "Bem-vindo",
    welcomeSubtitle: "Entre com o admin do painel definido na instalação",
    username: "Usuário",
    password: "Senha",
    entering: "Entrando...",
    enter: "Entrar",
    genericError: "Erro desconhecido",
    defaultError: "Falha ao entrar",
  },
  en: {
    heroTitle: "Visual installation panel",
    heroSubtitle:
      "Set up stacks on your Portainer Swarm without a terminal. Fully visual, secure, with automatic SSL.",
    welcome: "Welcome",
    welcomeSubtitle: "Sign in with the panel admin defined during installation",
    username: "Username",
    password: "Password",
    entering: "Signing in...",
    enter: "Sign in",
    genericError: "Unknown error",
    defaultError: "Failed to sign in",
  },
  es: {
    heroTitle: "Panel visual de instalación",
    heroSubtitle:
      "Configure stacks en su Portainer Swarm sin terminal. Todo visual, seguro y con SSL automático.",
    welcome: "Bienvenido",
    welcomeSubtitle: "Ingrese con el admin del panel definido en la instalación",
    username: "Usuario",
    password: "Contraseña",
    entering: "Ingresando...",
    enter: "Ingresar",
    genericError: "Error desconocido",
    defaultError: "No se pudo iniciar sesión",
  },
};
