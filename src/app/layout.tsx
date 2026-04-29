import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TPK PLAY - Juegos Lúdicos Deportivos",
  description: "TPK PLAY - Diversión, Competencia y Acción. Juegos lúdicos deportivos para todos.",
  keywords: ["TPK PLAY", "juegos", "lúdicos", "deportivos", "diversión", "competencia"],
  authors: [{ name: "TPK PLAY" }],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title: "TPK PLAY - Juegos Lúdicos Deportivos",
    description: "Diversión, Competencia y Acción",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
