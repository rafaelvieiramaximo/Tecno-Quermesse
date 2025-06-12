import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/userContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Gestão de Créditos - Fatec Itu",
  description: "Sistema para gerenciar créditos em cartões QR Code para quermesse",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className="h-full  min-h-screen bg-[url('/fundo.jpg')] bg-cover bg-center">
        <UserProvider>
          <ThemeProvider /* ... */>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
              <Toaster />
            </div>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}

