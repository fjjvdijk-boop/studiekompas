import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Navigatie } from "@/components/Navigatie";
import { Voettekst } from "@/components/Voettekst";
import { DataFout } from "@/components/DataFout";
import { THEMA_SCRIPT } from "@/lib/thema-script";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { type: "website", locale: "nl_NL", siteName: "StudieKompas" },
  title: { default: "StudieKompas – kies je universitaire studie", template: "%s · StudieKompas" },
  description:
    "Alle universitaire bachelors van Nederland. Doe de studiekeuzetest, reken je studiefinanciering uit en vind een kamer.",
  applicationName: "StudieKompas",
  appleWebApp: { capable: true, title: "StudieKompas", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#12110d" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEMA_SCRIPT }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <StoreProvider>
          <Navigatie />
          <DataFout />
          <main className="mx-auto min-h-[100dvh] w-full max-w-7xl px-4 pb-32 pt-5 sm:px-6 md:pb-20 md:pt-8">
            {children}
          </main>
          <Voettekst />
        </StoreProvider>
      </body>
    </html>
  );
}
