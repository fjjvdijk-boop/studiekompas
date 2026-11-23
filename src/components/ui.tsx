"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { SECTOR, NIVEAU_LABEL } from "@/data/sectoren";
import type { Kosten, Stoplicht } from "@/lib/bereken";
import { euro, reistijdTekst } from "@/lib/bereken";
import { useStore } from "@/lib/store";
import type { Niveau, SectorId } from "@/lib/types";

const LICHT_STIJL: Record<Stoplicht, string> = {
  groen: "bg-groen-soft text-groen",
  oranje: "bg-oranje-soft text-oranje",
  rood: "bg-rood-soft text-rood",
};
export const LICHT_LABEL: Record<Stoplicht, string> = {
  groen: "Goed te reizen",
  oranje: "Pittige reis",
  rood: "Te ver om dagelijks te reizen",
};

export function StoplichtBadge({
  licht,
  minuten,
  schatting,
}: {
  licht: Stoplicht;
  minuten: number;
  schatting?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular ${LICHT_STIJL[licht]}`}
      title={`${LICHT_LABEL[licht]}: ${schatting ? "± " : ""}${minuten} min enkele reis`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {schatting ? "± " : ""}
      {reistijdTekst(minuten)}
    </span>
  );
}

export function ScoreRing({ score, maat = 52, dik = 5 }: { score: number; maat?: number; dik?: number }) {
  const r = maat / 2 - dik;
  const omtrek = 2 * Math.PI * r;
  const kleur = score >= 75 ? "var(--groen)" : score >= 50 ? "var(--brand)" : "var(--muted)";
  return (
    <div
      className="relative shrink-0"
      style={{ width: maat, height: maat }}
      role="img"
      aria-label={`Match ${score} van 100`}
    >
      <svg width={maat} height={maat} className="-rotate-90">
        <circle cx={maat / 2} cy={maat / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={dik} />
        <circle
          cx={maat / 2}
          cy={maat / 2}
          r={r}
          fill="none"
          stroke={kleur}
          strokeWidth={dik}
          strokeLinecap="round"
          strokeDasharray={omtrek}
          strokeDashoffset={omtrek * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <span
        className="display absolute inset-0 flex items-center justify-center font-bold tabular"
        style={{ fontSize: maat * 0.3 }}
      >
        {score}
      </span>
    </div>
  );
}

const NIVEAU_STIJL: Record<string, string> = {
  mbo: "bg-[var(--mbo-bg)] text-[var(--mbo-ink)]",
  hbo: "bg-[var(--hbo-bg)] text-[var(--hbo-ink)]",
  ad: "bg-[var(--hbo-bg)] text-[var(--hbo-ink)]",
  wo: "bg-brand-soft text-brand",
};

export function NiveauChip({ niveau }: { niveau: Niveau }) {
  const soort = niveau.startsWith("mbo") ? "mbo" : niveau;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${NIVEAU_STIJL[soort]}`}
    >
      {NIVEAU_LABEL[niveau]}
    </span>
  );
}

export function SectorIcoon({ sector, maat = 44 }: { sector: SectorId; maat?: number }) {
  const s = SECTOR[sector];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{
        width: maat,
        height: maat,
        fontSize: maat * 0.5,
        background: `color-mix(in oklab, ${s.kleur} 16%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${s.kleur} 22%, transparent)`,
      }}
      aria-hidden
    >
      {s.emoji}
    </span>
  );
}

export function SectorLabel({ sector }: { sector: SectorId }) {
  const s = SECTOR[sector];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium"
      style={{ color: `color-mix(in oklab, ${s.kleur} 55%, var(--ink))` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.kleur }} />
      {s.kort}
    </span>
  );
}

export function FavorietKnop({ opleidingId, groot = false }: { opleidingId: string; groot?: boolean }) {
  const { isFavoriet, wisselFavoriet, geladen } = useStore();
  const is = geladen && isFavoriet(opleidingId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void wisselFavoriet(opleidingId);
      }}
      aria-pressed={is}
      aria-label={is ? "Verwijder uit favorieten" : "Bewaar als favoriet"}
      className={`focus-ring group/hart inline-flex shrink-0 items-center justify-center gap-2 rounded-full border font-semibold transition-all active:scale-90 ${
        groot ? "h-12 px-5 text-sm" : "h-9 w-9"
      } ${is ? "border-transparent bg-rood text-white shadow-[0_6px_16px_-6px_var(--rood)]" : "border-line bg-card text-muted hover:border-rood hover:text-rood"}`}
    >
      <Heart
        className={`${groot ? "h-[18px] w-[18px]" : "h-4 w-4"} transition-transform group-active/hart:scale-125`}
        fill={is ? "currentColor" : "none"}
      />
      {groot && (is ? "Bewaard" : "Bewaar")}
    </button>
  );
}

export function Kop({
  titel,
  sub,
  actie,
}: {
  titel: React.ReactNode;
  sub?: string;
  actie?: { href: string; label: string };
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="display text-2xl font-bold sm:text-[28px]">{titel}</h2>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {actie && (
        <Link
          href={actie.href}
          className="focus-ring shrink-0 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-medium hover:border-brand"
        >
          {actie.label} →
        </Link>
      )}
    </div>
  );
}

export function PaginaKop({
  titel,
  sub,
  label,
  children,
  compact = false,
}: {
  titel: React.ReactNode;
  sub?: React.ReactNode;
  label?: string;
  children?: React.ReactNode;
  /** Op mobiel kleiner, zodat de inhoud sneller in beeld is */
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 ${compact ? "mb-3 sm:mb-7" : "mb-7"}`}>
      <div className="binnenkomen">
        {label && (
          <p
            className={`mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand ${compact ? "hidden sm:block" : ""}`}
          >
            {label}
          </p>
        )}
        <h1 className={`display font-bold leading-[1.05] sm:text-5xl ${compact ? "text-[28px]" : "text-[34px]"}`}>
          {titel}
        </h1>
        {sub && (
          <p className={`mt-2 max-w-2xl text-[15px] text-muted sm:text-base ${compact ? "hidden sm:block" : ""}`}>
            {sub}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function LeegScherm({
  icoon,
  titel,
  tekst,
  actie,
}: {
  icoon: React.ReactNode;
  titel: string;
  tekst: string;
  actie?: { href: string; label: string };
}) {
  return (
    <div className="kaart flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-soft text-3xl text-brand">
        {icoon}
      </div>
      <h2 className="display text-2xl font-bold">{titel}</h2>
      <p className="mt-2 max-w-sm text-muted">{tekst}</p>
      {actie && (
        <Link
          href={actie.href}
          className="focus-ring mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg hover:opacity-90"
        >
          {actie.label}
        </Link>
      )}
    </div>
  );
}

export function Segment<T extends string>({
  waarde,
  opties,
  kies,
  klein = false,
}: {
  waarde: T;
  opties: { waarde: T; label: React.ReactNode }[];
  kies: (w: T) => void;
  klein?: boolean;
}) {
  return (
    <div className="inline-flex rounded-full bg-card-2 p-1" role="group">
      {opties.map((o) => (
        <button
          key={o.waarde}
          type="button"
          aria-pressed={waarde === o.waarde}
          onClick={() => kies(o.waarde)}
          className={`focus-ring rounded-full font-semibold transition-all ${klein ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"} ${
            waarde === o.waarde ? "bg-card text-ink shadow-zacht" : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const KOSTEN_KLEUREN = {
  huur: "var(--c-huur)",
  leef: "var(--c-leef)",
  schoolgeld: "var(--c-college)",
  boeken: "var(--c-boeken)",
};

export function kostenDelen(k: Kosten, thuis: boolean) {
  return [
    ...(thuis
      ? []
      : [
          { naam: k.huurSchatting ? "Kamerhuur (schatting)" : "Kamerhuur", bedrag: k.huur, kleur: KOSTEN_KLEUREN.huur },
        ]),
    {
      naam: thuis ? "Leefkosten thuis" : "Leefkosten",
      bedrag: thuis ? k.leefThuis : k.leefUit,
      kleur: KOSTEN_KLEUREN.leef,
    },
    { naam: k.schoolgeldLabel, bedrag: k.schoolgeld, kleur: KOSTEN_KLEUREN.schoolgeld },
    { naam: "Boeken en materiaal", bedrag: k.boeken, kleur: KOSTEN_KLEUREN.boeken },
  ].filter((d) => d.bedrag > 0);
}

export function KostenBalk({ kosten: k, thuis }: { kosten: Kosten; thuis: boolean }) {
  const delen = kostenDelen(k, thuis);
  const totaal = delen.reduce((s, d) => s + d.bedrag, 0);
  return (
    <div
      className="flex h-4 w-full gap-1 overflow-hidden rounded-full"
      role="img"
      aria-label={`Totaal ${euro(totaal)} per maand`}
    >
      {delen.map((d) => (
        <div
          key={d.naam}
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${(d.bedrag / totaal) * 100}%`, background: d.kleur }}
          title={`${d.naam}: ${euro(d.bedrag)}`}
        />
      ))}
    </div>
  );
}

/** Schuifregelaar die zijn eigen voortgang inkleurt */
export function Schuif({
  waarde,
  min,
  max,
  stap,
  zet,
  label,
}: {
  waarde: number;
  min: number;
  max: number;
  stap: number;
  zet: (n: number) => void;
  label: string;
}) {
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={stap}
      value={waarde}
      onChange={(e) => zet(Number(e.target.value))}
      className="schuif w-full"
      style={{ "--p": `${((waarde - min) / (max - min)) * 100}%` } as React.CSSProperties}
    />
  );
}
