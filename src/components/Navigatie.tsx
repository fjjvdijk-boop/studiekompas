"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Heart, Home, Map, Search, Sparkles, UserRound } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { ThemaKnop } from "./ThemaKnop";

const DESKTOP = [
  { href: "/", label: "Home" },
  { href: "/vragenlijst", label: "Studietest" },
  { href: "/zoeken", label: "Zoeken" },
  { href: "/kaart", label: "Kaart" },
  { href: "/vergelijken", label: "Mijn lijst" },
  { href: "/open-dagen", label: "Open dagen" },
];

const MOBIEL = [
  { href: "/", label: "Home", icoon: Home },
  { href: "/zoeken", label: "Zoeken", icoon: Search },
  { href: "/vragenlijst", label: "Test", icoon: Sparkles },
  { href: "/kaart", label: "Kaart", icoon: Map },
  { href: "/vergelijken", label: "Mijn lijst", icoon: Heart },
];

function actief(pad: string, href: string) {
  if (href === "/") return pad === "/";
  if (href === "/zoeken") return pad.startsWith("/zoeken") || pad.startsWith("/opleiding");
  if (href === "/kaart") return pad.startsWith("/kaart") || pad.startsWith("/plaats");
  if (href === "/vergelijken") return pad.startsWith("/vergelijken") || pad.startsWith("/open-dagen");
  return pad.startsWith(href);
}

export function Navigatie() {
  const pad = usePathname();
  const { favorieten, profiel, heeftProfiel, geladen } = useStore();
  const aantal = favorieten.length;
  const initiaal = profiel.naam.trim().charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-[1000] border-b border-line/60 bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="focus-ring group flex items-center gap-2.5 rounded-xl">
            <Logo className="h-9 w-9 transition-transform group-hover:rotate-[-8deg]" />
            <span className="display text-xl font-bold">StudieKompas</span>
          </Link>
          <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Hoofdmenu">
            {DESKTOP.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={actief(pad, href) ? "page" : undefined}
                className={`focus-ring relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  actief(pad, href) ? "bg-ink text-bg" : "text-muted hover:bg-card-2 hover:text-ink"
                }`}
              >
                {label}
                {href === "/vergelijken" && aantal > 0 && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular ${
                      actief(pad, href) ? "bg-bg text-ink" : "bg-brand text-brand-ink"
                    }`}
                  >
                    {aantal}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemaKnop />
            <Link
              href="/open-dagen"
              aria-label="Open dagen"
              className="focus-ring hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-ink hover:border-brand sm:flex lg:hidden"
            >
              <CalendarDays className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/profiel"
              aria-label="Mijn profiel"
              className={`focus-ring flex h-10 items-center gap-2 rounded-full border pl-1 pr-1 transition-colors sm:pr-3.5 ${
                pad === "/profiel" ? "border-ink bg-ink text-bg" : "border-line bg-card text-ink hover:border-brand"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7c6cff] to-[#4f39f6] text-sm font-semibold text-white">
                {geladen && heeftProfiel && initiaal ? initiaal : <UserRound className="h-4 w-4" />}
              </span>
              <span className="hidden text-sm font-medium sm:inline">
                {geladen && profiel.naam ? profiel.naam : "Profiel"}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <nav
        aria-label="Hoofdmenu"
        className="fixed inset-x-3 bottom-3 z-[1000] rounded-[1.75rem] border border-line bg-card/90 pb-[env(safe-area-inset-bottom)] shadow-groot backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {MOBIEL.map(({ href, label, icoon: Icoon }) => {
            const is = actief(pad, href);
            const test = href === "/vragenlijst";
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={is ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${is ? "text-ink" : "text-muted"}`}
                >
                  <span
                    className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${
                      test
                        ? "bg-gradient-to-br from-[#7c6cff] to-[#4f39f6] text-white shadow-[0_6px_16px_-6px_rgba(79,57,246,.8)]"
                        : is
                          ? "bg-brand-soft text-brand"
                          : ""
                    }`}
                  >
                    <Icoon className="h-5 w-5" strokeWidth={is ? 2.4 : 2} />
                  </span>
                  {label}
                  {href === "/vergelijken" && aantal > 0 && (
                    <span className="absolute right-[16%] top-1 min-w-4 rounded-full bg-rood px-1 text-center text-[10px] font-semibold leading-4 text-white tabular">
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
