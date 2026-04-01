import "./globals.css";
import { Instrument_Sans } from "next/font/google";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Mock Interview",
  description: "Practice interviews with AI-powered feedback",
  icons: {
    icon: "/logo.png",          // browser tab
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};


const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>

      </head>
      <body className={instrumentSans.className}>
        <div className="global-bg"></div>
        {children}
      </body>
    </html>
  );
}
