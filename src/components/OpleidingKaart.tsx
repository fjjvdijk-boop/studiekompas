"use client";

import Link from "next/link";
import { Home as HomeIcon, MapPin } from "lucide-react";
import { euro } from "@/lib/bereken";
import type { Resultaat } from "@/lib/resultaten";
import { FavorietKnop, NiveauChip, ScoreRing, StoplichtBadge } from "./ui";

export function OpleidingKaart({ r, toonScore = true }: { r: Resultaat; toonScore?: boolean }) {
  const { opleiding: o, stad, kosten: k, match, licht } = r;
  return (
    <Link
      href={`/opleiding/${o.id}`}
      className="kaart focus-ring group flex flex-col gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_30px_-12px_rgba(67,56,202,.35)] sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <NiveauChip niveau={o.niveau} />
            <span className="truncate text-xs text-muted">{o.sector}</span>
          </div>
          <h3 className="font-semibold leading-snug tracking-tight group-hover:text-brand">{o.naam}</h3>
          <p className="mt-0.5 flex items-start gap-1 text-sm text-muted">
            <MapPin className="mt-[3px] h-3.5 w-3.5 shrink-0" />
            {o.instelling} · {stad.naam}
          </p>
        </div>
        {toonScore && <ScoreRing score={match.score} maat={48} />}
      </div>
      <div className="mt-auto flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-semibold tabular">
            {euro(k.advies)}
            <span className="text-sm font-normal text-muted"> /mnd</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            {k.thuisMogelijk ? (
              <>
                <HomeIcon className="h-3 w-3" /> thuis wonen
              </>
            ) : (
              "op kamer"
            )}
          </div>
        </div>
        <StoplichtBadge licht={licht} minuten={stad.reistijd} />
        <FavorietKnop opleidingId={o.id} />
      </div>
    </Link>
  );
}
