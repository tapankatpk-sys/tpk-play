import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AudioPlayer from "@/components/audio/AudioPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#000000",
}

export const metadata: Metadata = {
  title: "TPK PLAY - Juegos Lúdicos Deportivos",
  description: "TPK PLAY - Diversión, Competencia y Acción. Juegos lúdicos deportivos con escudos de la Liga BetPlay.",
  keywords: ["TPK PLAY", "juegos", "lúdicos", "deportivos", "diversión", "competencia", "Liga BetPlay", "fútbol colombiano"],
  authors: [{ name: "TPK PLAY" }],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title: "TPK PLAY - Juegos Lúdicos Deportivos",
    description: "Diversión, Competencia y Acción con los escudos de la Liga BetPlay",
    type: "website",
    siteName: "TPK PLAY",
  },
  metadataBase: new URL('https://tpkplay.vercel.app'),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Anti-tracking: no referrer leaked to embedded sites */}
        <meta name="referrer" content="no-referrer-when-downgrade" />
        {/* Anti-content-sniffing protection */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        {/* Prevent search engines from indexing stream pages */}
        <meta name="googlebot" content="noarchive" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-x-hidden`}
      >
        {children}
        <AudioPlayer />
        <Toaster />
      </body>
    </html>
  )
}
