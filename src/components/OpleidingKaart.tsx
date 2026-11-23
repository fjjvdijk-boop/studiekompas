"use client";

import Link from "next/link";
import { Home as HomeIcon, MapPin, Building2 } from "lucide-react";
import { euro, plaatsNaam } from "@/lib/bereken";
import type { Resultaat } from "@/lib/resultaten";
import { FavorietKnop, NiveauChip, ScoreRing, SectorIcoon, SectorLabel, StoplichtBadge } from "./ui";

export function OpleidingKaart({
  r,
  toonScore = true,
  index = 0,
  extra = 0,
}: {
  r: Resultaat;
  toonScore?: boolean;
  index?: number;
  /** Aantal andere plekken waar je deze opleiding ook kunt doen */
  extra?: number;
}) {
  const { opleiding: o, kosten: k, match, licht, reistijd, reistijdSchatting } = r;
  return (
    <Link
      href={`/opleiding/${o.id}`}
      className="kaart focus-ring group binnenkomen relative flex flex-col gap-4 overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-groot sm:p-5"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <div className="flex items-start gap-3">
        <SectorIcoon sector={o.sector} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <NiveauChip niveau={o.niveau} />
            <SectorLabel sector={o.sector} />
          </div>
          <h3 className="display text-[17px] font-bold leading-tight group-hover:text-brand">{o.naam}</h3>
        </div>
        {toonScore && <ScoreRing score={match.score} maat={46} dik={4} />}
      </div>
      <div className="space-y-1 text-sm text-muted">
        <p className="flex items-start gap-1.5">
          <Building2 className="mt-[3px] h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{o.instelling.naam}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {plaatsNaam(o.plaats.naam)}
          {o.leerwegen && <span className="text-xs opacity-75">· {o.leerwegen}</span>}
          {extra > 0 && (
            <span className="ml-auto shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
              + {extra} {extra === 1 ? "plek" : "plekken"}
            </span>
          )}
        </p>
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
        <div className="min-w-0 flex-1">
          <div className="display text-lg font-bold tabular leading-none">
            {euro(k.advies)}
            <span className="font-sans text-xs font-normal text-muted"> /mnd</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted">
            {k.thuisMogelijk ? (
              <>
                <HomeIcon className="h-3 w-3" /> thuis wonen
              </>
            ) : (
              "op kamer"
            )}
          </div>
        </div>
        <StoplichtBadge licht={licht} minuten={reistijd} schatting={reistijdSchatting} />
        <FavorietKnop opleidingId={o.id} />
      </div>
    </Link>
  );
}

export function KaartSkelet({ aantal = 6 }: { aantal?: number }) {
  return (
    <>
      {Array.from({ length: aantal }, (_, i) => (
        <div key={i} className="h-[214px] animate-pulse rounded-3xl bg-card-2" />
      ))}
    </>
  );
}
