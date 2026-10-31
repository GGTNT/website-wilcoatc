import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

// Self-hosted at build time, so the page makes no request to Google.
// Manrope covers Latin, Greek and Cyrillic; every other script falls back to the system font.
const sans = Manrope({ subsets: ["latin", "latin-ext", "greek", "cyrillic", "cyrillic-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext", "greek", "cyrillic"], weight: ["500", "600", "700"], variable: "--font-mono" });

// The title and description are rendered by I18nProvider, in the reader's language.
export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
};

// Runs before the first paint, so a reader who chose dark never sees the light page flash.
// Light is the default, as in the design; the choice is kept by ThemeToggle.
const THEME = `try{var t=localStorage.getItem("wilcoatc.theme")}catch(e){}document.documentElement.dataset.theme=t==="dark"?"dark":"light"`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The script sets data-theme before React hydrates, so the attribute differs from the server's.
    <html lang="en" className={`${sans.variable} ${mono.variable}`} data-theme="light" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME }} /></head>
      <body>{children}</body>
    </html>
  );
}
