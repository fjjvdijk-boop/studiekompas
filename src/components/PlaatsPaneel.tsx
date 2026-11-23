"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { SECTOR } from "@/data/sectoren";
import { KAMER_PER_PLAATS } from "@/data/kamers";
import { PER_STAD } from "@/data/verenigingen";
import { euro, plaatsNaam } from "@/lib/bereken";
import type { PlaatsInfo } from "@/lib/plaatsen";
import type { SectorId } from "@/lib/types";
import { StoplichtBadge } from "./ui";

export function PlaatsPaneel({ info, sluit }: { info: PlaatsInfo; sluit?: () => void }) {
  const kamer = KAMER_PER_PLAATS.get(info.plaats.naam);
  const ver = PER_STAD.get(info.plaats.naam);
  const sectoren = (Object.entries(info.perSector) as [SectorId, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div className="binnenkomen space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="bovenschrift">{info.plaats.provincie}</p>
          <h2 className="display text-4xl">{plaatsNaam(info.plaats.naam)}</h2>
        </div>
        {sluit && (
          <button
            type="button"
            onClick={sluit}
            aria-label="Sluiten"
            className="focus-ring rounded-full p-2 hover:bg-card-2"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <dl className="grid grid-cols-3 border-y border-line">
        <div className="py-3 pr-3">
          <dt className="bovenschrift">Bachelors</dt>
          <dd className="display text-2xl tabular">{info.aantal}</dd>
        </div>
        <div className="border-l border-line py-3 pl-3">
          <dt className="bovenschrift">Kamer</dt>
          <dd className="display text-2xl tabular">
            {kamer?.kamernet ? euro(kamer.kamernet) : `± ${euro(info.kosten.huur)}`}
          </dd>
        </div>
        <div className="border-l border-line py-3 pl-3">
          <dt className="bovenschrift">Reizen</dt>
          <dd className="mt-1.5">
            <StoplichtBadge licht={info.licht} minuten={info.reistijd} schatting={info.reistijdSchatting} />
          </dd>
        </div>
      </dl>

      <div>
        <p className="bovenschrift mb-2">Universiteiten</p>
        <ul className="space-y-1 text-sm">
          {info.instellingen.map(({ instelling, aantal }) => (
            <li key={instelling.naam} className="flex justify-between gap-3">
              <span>{instelling.naam}</span>
              <span className="font-mono text-xs text-muted tabular">{aantal}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="bovenschrift mb-2">Meeste bachelors in</p>
        <div className="flex flex-wrap gap-1.5">
          {sectoren.map(([s, n]) => (
            <Link
              key={s}
              href={`/zoeken?plaats=${encodeURIComponent(info.plaats.naam)}&sector=${s}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs hover:border-ink"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: SECTOR[s].kleur }} />
              {SECTOR[s].kort} <span className="text-muted tabular">{n}</span>
            </Link>
          ))}
        </div>
      </div>

      {kamer?.wachttijd && <p className="text-sm">Wachttijd voor een studentenwoning: {kamer.wachttijd}.</p>}
      {ver && (
        <p className="text-sm text-muted">
          Studentenleven:{" "}
          {ver.verenigingen
            .slice(0, 4)
            .map((v) => v.naam)
            .join(", ")}{" "}
          en meer.
        </p>
      )}

      <Link
        href={`/plaats/${info.slug}`}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-bg hover:opacity-90"
      >
        Alles over studeren in {plaatsNaam(info.plaats.naam)} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
