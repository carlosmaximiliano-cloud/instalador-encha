import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { resolveLocale, htmlLang } from "@/lib/locale";
import "./globals.css";

const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const DESCRIPTIONS = {
  pt: "Painel visual para instalação de stacks no Portainer Swarm",
  en: "Visual panel for installing stacks on Portainer Swarm",
  es: "Panel visual para instalar stacks en Portainer Swarm",
};

// generateMetadata (não `export const metadata` estático) porque a descrição
// precisa do locale resolvido em runtime (cookie/arquivo/Accept-Language) —
// um objeto estático é avaliado no carregamento do módulo, antes de
// resolveLocale() rodar.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  return {
    title: "Encha Setup Panel",
    description: DESCRIPTIONS[locale],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale();
  return (
    <html lang={htmlLang(locale)} className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-screen text-foreground antialiased">
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
