"use client";

import Link from "next/link";
import { euro, plaatsNaam } from "@/lib/bereken";
import type { Resultaat } from "@/lib/resultaten";
import { FavorietKnop, ScoreRing, SectorLabel, StoplichtBadge, TaalChip } from "./ui";

export function OpleidingKaart({
  r,
  toonScore = true,
  index = 0,
  extra = 0,
}: {
  r: Resultaat;
  toonScore?: boolean;
  index?: number;
  /** Aantal andere universiteiten met dezelfde opleiding */
  extra?: number;
}) {
  const { opleiding: o, kosten: k, geld, match, licht, reistijd, reistijdSchatting } = r;
  return (
    <Link
      href={`/opleiding/${o.id}`}
      className="kaart focus-ring group binnenkomen flex flex-col gap-4 p-5 transition-colors hover:border-ink/40"
      style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <SectorLabel sector={o.sector} />
            <TaalChip taal={o.taal} />
          </div>
          <h3 className="display text-[21px] leading-[1.15] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
            {o.naam}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {o.instelling.naam} · {plaatsNaam(o.plaats.naam)}
            {extra > 0 && <span> · ook bij {extra} andere</span>}
          </p>
        </div>
        {toonScore && <ScoreRing score={match.score} maat={44} />}
      </div>
      {match.toelating.status === "deficientie" && (
        <p className="text-xs text-oranje">Je mist {match.toelating.mist.join(" en ")}</p>
      )}
      {match.toelating.status === "nee" && <p className="text-xs text-rood">Niet direct toelaatbaar met je diploma</p>}
      <div className="mt-auto grid grid-cols-[1fr_1fr_auto] items-end gap-3 border-t border-line pt-3">
        <div>
          <p className="bovenschrift">{k.thuisMogelijk ? "Thuis wonend" : "Op kamer"}</p>
          <p className="display text-lg tabular">{euro(k.advies)}</p>
        </div>
        <div>
          <p className="bovenschrift">Zelf lenen</p>
          <p className={`display text-lg tabular ${geld.teLenen > 0 ? "" : "text-groen"}`}>
            {geld.teLenen > 0 ? euro(geld.teLenen) : "€ 0"}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <StoplichtBadge licht={licht} minuten={reistijd} schatting={reistijdSchatting} />
          <FavorietKnop opleidingId={o.id} />
        </div>
      </div>
    </Link>
  );
}

export function KaartSkelet({ aantal = 6 }: { aantal?: number }) {
  return (
    <>
      {Array.from({ length: aantal }, (_, i) => (
        <div key={i} className="h-[200px] animate-pulse rounded-2xl bg-card-2" />
      ))}
    </>
  );
}
