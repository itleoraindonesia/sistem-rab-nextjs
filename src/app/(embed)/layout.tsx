import { Providers } from "@/components/Providers";
import "@/app/globals.css";

export const metadata = {
  title: "Kalkulator Panel - Leora",
  description: "Kalkulator panel lantai dan dinding",
};

export default function EmbedRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-white min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
