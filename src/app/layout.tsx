import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import PWAInstallBanner from "../components/ui/PWAInstallBanner";
import PWALoadingScreen from "../components/ui/PWALoadingScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sistem RAB Leora",
  description:
    "Sistem RAB Panel untuk kalkulasi dan manajemen proyek konstruksi",
  keywords: ["RAB", "panel", "konstruksi", "kalkulasi", "proyek"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='id' suppressHydrationWarning={true}>
      <head>
        <link rel='manifest' href='/manifest.json' />
        <meta name='theme-color' content='#1e293b' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <meta name='apple-mobile-web-app-title' content='Sistem RAB Leora' />
        <link rel='apple-touch-startup-image' href='/icon-512x512.png' media='(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' />
        <link rel='apple-touch-startup-image' href='/icon-512x512.png' media='(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' />
        <link rel='apple-touch-startup-image' href='/icon-512x512.png' media='(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' />
        <link rel='apple-touch-startup-image' href='/icon-512x512.png' media='(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' />
        <link rel='apple-touch-icon' sizes='72x72' href='/icon-72x72.png' />
        <link rel='apple-touch-icon' sizes='96x96' href='/icon-96x96.png' />
        <link rel='apple-touch-icon' sizes='128x128' href='/icon-128x128.png' />
        <link rel='apple-touch-icon' sizes='144x144' href='/icon-144x144.png' />
        <link rel='apple-touch-icon' sizes='152x152' href='/icon-144x144.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='/icon-192x192.png' />
        <link rel='apple-touch-icon' sizes='192x192' href='/icon-192x192.png' />
        <link rel='apple-touch-icon' sizes='512x512' href='/icon-512x512.png' />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <PWALoadingScreen />
        <PWAInstallBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
