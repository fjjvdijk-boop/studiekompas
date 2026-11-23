import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Navigatie } from "@/components/Navigatie";
import { Voettekst } from "@/components/Voettekst";

export const metadata: Metadata = {
  title: { default: "StudieKompas – vind de opleiding die bij je past", template: "%s · StudieKompas" },
  description:
    "Alle mbo-, hbo- en wo-opleidingen van Nederland. Doe de studiekeuzetest, zie wat studeren per maand kost en of je thuis kunt blijven wonen.",
  applicationName: "StudieKompas",
  appleWebApp: { capable: true, title: "StudieKompas", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0a1a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={GeistSans.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <StoreProvider>
          <Navigatie />
          <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-5 sm:px-6 md:pb-20 md:pt-8">{children}</main>
          <Voettekst />
        </StoreProvider>
      </body>
    </html>
  );
}
