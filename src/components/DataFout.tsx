"use client";

import { WifiOff } from "lucide-react";
import { useDataFout } from "@/lib/data-client";

/** Melding als de opleidingen niet geladen konden worden (bijv. geen internet) */
export function DataFout() {
  const fout = useDataFout();
  if (!fout) return null;
  return (
    <div
      role="alert"
      className="fixed inset-x-4 top-20 z-[1200] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-card p-4 shadow-groot"
    >
      <WifiOff className="h-5 w-5 shrink-0 text-rood" />
      <p className="flex-1 text-sm">De opleidingen konden niet worden geladen. Check je internetverbinding.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg"
      >
        Opnieuw
      </button>
    </div>
  );
}
