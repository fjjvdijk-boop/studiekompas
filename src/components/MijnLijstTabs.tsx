"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MijnLijstTabs() {
  const pad = usePathname();
  return (
    <div className="inline-flex rounded-full bg-card-2 p-1">
      {[
        ["/vergelijken", "Vergelijken"],
        ["/open-dagen", "Open dagen"],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${pad === href ? "bg-card text-ink shadow-zacht" : "text-muted hover:text-ink"}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
