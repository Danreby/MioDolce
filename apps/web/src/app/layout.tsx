import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

// next/font baixa as fontes no build e serve do próprio domínio (sem layout shift).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Almoxarife", template: "%s | Almoxarife" },
  description: "Controle de estoque: projeto de estudo com Next.js e NestJS",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh md:grid md:grid-cols-[232px_1fr]">
        <Sidebar />
        <main className="min-w-0 px-4 pt-6 pb-16 md:px-10 md:pt-10">
          <div className="mx-auto max-w-[1180px]">{children}</div>
        </main>
      </body>
    </html>
  );
}
