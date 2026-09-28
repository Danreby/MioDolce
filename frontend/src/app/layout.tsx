import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { AppHeader } from "@/components/layout/app-header";
import "./globals.css";

// next/font baixa as fontes no build e as serve localmente (sem requisição ao Google no navegador).
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: { default: "MioDolce · Estoque", template: "%s · MioDolce" },
  description: "Controle de estoque do almoxarifado da confeitaria.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh font-sans">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-20 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
        >
          Pular para o conteúdo
        </a>
        <AppHeader />
        <main id="conteudo" className="mx-auto w-full max-w-350 px-4 pb-20 pt-8 md:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
