import type { ReactNode } from "react";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}
