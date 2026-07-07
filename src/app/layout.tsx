import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { prisma } from '@/lib/prisma';

export async function generateMetadata(): Promise<Metadata> {
  let appName = "Ligas Menores";
  let subtitle = "Plataforma integral para gestionar torneos, equipos, calendarios y estadísticas de ligas menores.";
  
  try {
    const settings = await prisma.systemSettings.findFirst();
    if (settings) {
      appName = settings.appName;
      if (settings.heroSubtitle) subtitle = settings.heroSubtitle;
    }
  } catch (e) {
    console.error("Error fetching settings for metadata", e);
  }

  return {
    title: `${appName} | Plataforma de Torneos`,
    description: subtitle,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
