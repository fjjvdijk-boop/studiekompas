"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BedDouble, Compass, Heart, Home, Search, UserRound, Wallet } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { ThemaKnop } from "./ThemaKnop";

const DESKTOP = [
  { href: "/vragenlijst", label: "Studietest" },
  { href: "/zoeken", label: "Opleidingen" },
  { href: "/kaart", label: "Steden" },
  { href: "/geld", label: "Geld & DUO" },
  { href: "/kamer", label: "Kamer vinden" },
];

const MOBIEL = [
  { href: "/", label: "Home", icoon: Home },
  { href: "/zoeken", label: "Opleidingen", icoon: Search },
  { href: "/vragenlijst", label: "Test", icoon: Compass },
  { href: "/geld", label: "Geld", icoon: Wallet },
  { href: "/kamer", label: "Kamer", icoon: BedDouble },
];

function actief(pad: string, href: string) {
  if (href === "/") return pad === "/";
  if (href === "/zoeken") return pad.startsWith("/zoeken") || pad.startsWith("/opleiding");
  if (href === "/kaart") return pad.startsWith("/kaart") || pad.startsWith("/plaats");
  return pad.startsWith(href);
}

export function Navigatie() {
  const pad = usePathname();
  const { favorieten, profiel, heeftProfiel, geladen } = useStore();
  const aantal = favorieten.length;
  const initiaal = profiel.naam.trim().charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-[1000] border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6">
          <Link href="/" className="focus-ring flex items-center gap-2.5 rounded">
            <Logo className="h-7 w-7 text-ink" />
            <span className="display text-[21px] leading-none">StudieKompas</span>
          </Link>
          <nav className="hidden flex-1 items-center gap-6 lg:flex" aria-label="Hoofdmenu">
            {DESKTOP.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={actief(pad, href) ? "page" : undefined}
                className={`focus-ring relative py-5 text-sm transition-colors ${
                  actief(pad, href)
                    ? "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-ink"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemaKnop />
            <Link
              href="/vergelijken"
              aria-label={`Mijn lijst (${aantal})`}
              className={`focus-ring relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                pad.startsWith("/vergelijken") || pad.startsWith("/open-dagen")
                  ? "border-ink"
                  : "border-line hover:border-ink"
              }`}
            >
              <Heart className="h-[17px] w-[17px]" strokeWidth={1.75} />
              {aantal > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] text-brand-ink">
                  {aantal}
                </span>
              )}
            </Link>
            <Link
              href="/profiel"
              aria-label="Mijn profiel"
              className={`focus-ring flex h-10 items-center gap-2 rounded-full border pl-1 pr-1 transition-colors sm:pr-3.5 ${
                pad === "/profiel" ? "border-ink" : "border-line hover:border-ink"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-medium text-bg">
                {geladen && heeftProfiel && initiaal ? initiaal : <UserRound className="h-4 w-4" />}
              </span>
              <span className="hidden text-sm sm:inline">{geladen && profiel.naam ? profiel.naam : "Profiel"}</span>
            </Link>
          </div>
        </div>
      </header>

      <nav
        aria-label="Hoofdmenu"
        className="fixed inset-x-0 bottom-0 z-[1000] border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {MOBIEL.map(({ href, label, icoon: Icoon }) => {
            const is = actief(pad, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={is ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] ${is ? "text-ink" : "text-muted"}`}
                >
                  {is && <span className="absolute inset-x-6 top-0 h-[2px] bg-ink" />}
                  <Icoon className="h-5 w-5" strokeWidth={is ? 2 : 1.6} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
