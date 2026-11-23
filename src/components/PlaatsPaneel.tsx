"use client";

import Link from "next/link";
import { ArrowRight, BedDouble, ExternalLink, Users, X } from "lucide-react";
import { SECTOR } from "@/data/sectoren";
import { PER_STAD, SOORT_LABEL } from "@/data/verenigingen";
import { euro, getal, plaatsNaam } from "@/lib/bereken";
import type { PlaatsInfo } from "@/lib/plaatsen";
import type { SectorId } from "@/lib/types";
import { StoplichtBadge } from "./ui";

export function SoortVerdeling({ info }: { info: PlaatsInfo }) {
  const delen = [
    { label: "mbo", n: info.perSoort.mbo, kleur: "#ff9f1c" },
    { label: "hbo", n: info.perSoort.hbo, kleur: "#0ea5e9" },
    { label: "wo", n: info.perSoort.wo, kleur: "var(--brand)" },
  ].filter((d) => d.n > 0);
  return (
    <div>
      <div className="flex h-2.5 gap-1 overflow-hidden rounded-full">
        {delen.map((d) => (
          <div
            key={d.label}
            className="h-full rounded-full"
            style={{ width: `${(d.n / info.aantal) * 100}%`, background: d.kleur }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {delen.map((d) => (
          <span key={d.label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: d.kleur }} />
            <strong className="text-ink tabular">{getal(d.n)}</strong> {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PlaatsPaneel({ info, sluit }: { info: PlaatsInfo; sluit?: () => void }) {
  const vereniging = PER_STAD.get(info.plaats.naam);
  const sectoren = (Object.entries(info.perSector) as [SectorId, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div className="binnenkomen space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">{info.plaats.provincie}</p>
          <h2 className="display text-3xl font-bold">{plaatsNaam(info.plaats.naam)}</h2>
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

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-card-2 p-3">
          <p className="text-[11px] font-medium text-muted">Opleidingen</p>
          <p className="display text-xl font-bold tabular">{getal(info.aantal)}</p>
        </div>
        <div className="rounded-2xl bg-card-2 p-3">
          <p className="text-[11px] font-medium text-muted">Per maand</p>
          <p className="display text-xl font-bold tabular">{euro(info.kosten.advies)}</p>
        </div>
        <div className="rounded-2xl bg-card-2 p-3">
          <p className="text-[11px] font-medium text-muted">Reistijd</p>
          <div className="mt-1">
            <StoplichtBadge licht={info.licht} minuten={info.reistijd} schatting={info.reistijdSchatting} />
          </div>
        </div>
      </div>

      <SoortVerdeling info={info} />

      <p className="flex items-center gap-2 text-sm text-muted">
        <BedDouble className="h-4 w-4" />
        Kamer {info.kosten.huurSchatting ? "± " : ""}
        {euro(info.kosten.huur)} per maand{info.kosten.huurSchatting ? " (schatting)" : ""}
        {info.kosten.thuisMogelijk && <span className="font-medium text-groen">· thuis wonen kan</span>}
      </p>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Meeste opleidingen in</h3>
        <div className="flex flex-wrap gap-1.5">
          {sectoren.map(([s, n]) => (
            <Link
              key={s}
              href={`/zoeken?plaats=${encodeURIComponent(info.plaats.naam)}&sector=${s}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-card-2 px-2.5 py-1 text-xs font-medium hover:bg-brand-soft"
            >
              {SECTOR[s].emoji} {SECTOR[s].kort} <span className="text-muted tabular">{n}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Scholen</h3>
        <ul className="space-y-1 text-sm">
          {info.instellingen.slice(0, 5).map(({ instelling, aantal }) => (
            <li key={instelling.naam} className="flex justify-between gap-3">
              <span className="truncate">{instelling.naam}</span>
              <span className="shrink-0 text-muted tabular">{aantal}</span>
            </li>
          ))}
          {info.instellingen.length > 5 && <li className="text-muted">+ {info.instellingen.length - 5} meer</li>}
        </ul>
      </div>

      {vereniging && (
        <div className="rounded-2xl border border-line p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-brand" /> Studentenleven
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {vereniging.verenigingen.slice(0, 6).map((v) => (
              <span key={v.naam} className="rounded-full bg-card-2 px-2.5 py-1 text-xs">
                {SOORT_LABEL[v.soort].emoji} {v.naam}
              </span>
            ))}
          </div>
          {vereniging.overzichten[0] && (
            <a
              href={vereniging.overzichten[0].url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              {vereniging.overzichten[0].label} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/plaats/${info.slug}`}
          className="focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg hover:opacity-90"
        >
          Alles over {plaatsNaam(info.plaats.naam)} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/zoeken?plaats=${encodeURIComponent(info.plaats.naam)}`}
          className="focus-ring inline-flex flex-1 items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold hover:border-brand"
        >
          Opleidingen
        </Link>
      </div>
    </div>
  );
}
