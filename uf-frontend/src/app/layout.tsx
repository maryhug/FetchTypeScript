import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universal Data Fetcher",
  description: "Frontend Next.js — consume backend Express via ngrok",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Fuentes cargadas desde Google Fonts en runtime (no en build) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
