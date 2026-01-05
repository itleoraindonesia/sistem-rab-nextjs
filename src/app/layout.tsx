import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { MasterDataProvider } from "../context/MasterDataContext";

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
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <MasterDataProvider>
            {children}
          </MasterDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
