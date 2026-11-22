"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Columns3, Home, MapPinned, Search, UserRound } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Home", icoon: Home },
  { href: "/zoeken", label: "Zoeken", icoon: Search },
  { href: "/steden", label: "Steden", icoon: MapPinned },
  { href: "/vergelijken", label: "Vergelijken", icoon: Columns3 },
  { href: "/open-dagen", label: "Open dagen", icoon: CalendarDays },
];

function actief(pad: string, href: string) {
  if (href === "/") return pad === "/";
  return pad.startsWith(href) || (href === "/zoeken" && pad.startsWith("/opleiding"));
}

export function Navigatie() {
  const pad = usePathname();
  const { favorieten, profiel, heeftProfiel, geladen } = useStore();
  const aantal = favorieten.length;
  const initiaal = profiel.naam.trim().charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-[1000] border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6 md:h-16">
          <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-lg font-semibold tracking-tight">
            <Logo />
            <span className="text-[17px]">StudieKompas</span>
          </Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Hoofdmenu">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={actief(pad, href) ? "page" : undefined}
                className={`focus-ring relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  actief(pad, href) ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"
                }`}
              >
                {label}
                {href === "/vergelijken" && aantal > 0 && (
                  <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink tabular">
                    {aantal}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <Link
            href="/profiel"
            aria-label="Mijn profiel"
            className={`focus-ring ml-auto flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              pad === "/profiel"
                ? "border-brand bg-brand text-brand-ink"
                : "border-line bg-card text-ink hover:border-brand"
            }`}
          >
            {geladen && heeftProfiel && initiaal ? (
              <span className="text-sm font-semibold">{initiaal}</span>
            ) : (
              <UserRound className="h-[18px] w-[18px]" />
            )}
          </Link>
        </div>
      </header>

      <nav
        aria-label="Hoofdmenu"
        className="fixed inset-x-0 bottom-0 z-[1000] border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-5">
          {LINKS.map(({ href, label, icoon: Icoon }) => {
            const is = actief(pad, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={is ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${is ? "text-brand" : "text-muted"}`}
                >
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${is ? "bg-brand-soft" : ""}`}
                  >
                    <Icoon className="h-5 w-5" strokeWidth={is ? 2.4 : 2} />
                  </span>
                  {label}
                  {href === "/vergelijken" && aantal > 0 && (
                    <span className="absolute right-[18%] top-1.5 min-w-4 rounded-full bg-brand px-1 text-center text-[10px] font-semibold leading-4 text-brand-ink tabular">
                      {aantal}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
