import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import PWAInstallBanner from "../components/ui/PWAInstallBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sistem RAB Leora - Next.js",
  description: "Sistem RAB Panel untuk kalkulasi dan manajemen proyek konstruksi",
  keywords: ["RAB", "panel", "konstruksi", "kalkulasi", "proyek"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sistem RAB" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icon-128x128.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <PWAInstallBanner />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
