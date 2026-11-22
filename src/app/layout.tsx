import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Navigatie } from "@/components/Navigatie";

export const metadata: Metadata = {
  title: { default: "StudieKompas", template: "%s · StudieKompas" },
  description:
    "Zoek, vergelijk en bewaar opleidingen. Zie wat studeren per maand kost en of je thuis kunt blijven wonen.",
  applicationName: "StudieKompas",
  appleWebApp: { capable: true, title: "StudieKompas", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1f" },
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
          <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 md:pb-16 md:pt-8">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
