"use client";

import Link from "next/link";
import { Foto, FotoBron } from "@/components/Foto";
import type { FotoSleutel } from "@/data/fotos";
import { ArrowRight, Heart } from "lucide-react";
import { SECTOR } from "@/data/sectoren";
import type { Kosten, Stoplicht } from "@/lib/bereken";
import { euro, reistijdTekst } from "@/lib/bereken";
import { useStore } from "@/lib/store";
import type { Opleiding, SectorId } from "@/lib/types";

const LICHT_KLEUR: Record<Stoplicht, string> = { groen: "text-groen", oranje: "text-oranje", rood: "text-rood" };
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
      className={`inline-flex shrink-0 items-center gap-1.5 text-xs tabular ${LICHT_KLEUR[licht]}`}
      title={`${LICHT_LABEL[licht]}: ${schatting ? "± " : ""}${minuten} min enkele reis`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {schatting ? "±" : ""}
      {reistijdTekst(minuten)}
    </span>
  );
}

/** Rustige scoremeter: getal in schreefletter met een dunne ring */
export function ScoreRing({ score, maat = 52, dik = 3 }: { score: number; maat?: number; dik?: number }) {
  const r = maat / 2 - dik;
  const omtrek = 2 * Math.PI * r;
  const kleur = score >= 75 ? "var(--brand)" : score >= 50 ? "var(--ink)" : "var(--muted)";
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
        className="display absolute inset-0 flex items-center justify-center tabular"
        style={{ fontSize: maat * 0.34 }}
      >
        {score}
      </span>
    </div>
  );
}

export function TaalChip({ taal }: { taal: Opleiding["taal"] }) {
  if (!taal) return null;
  const label = taal === "EN" ? "Engels" : taal === "NL" ? "Nederlands" : "NL + EN";
  return <span className="rounded border border-line px-1.5 py-0.5 text-[11px] font-medium text-muted">{label}</span>;
}

export function SectorLabel({ sector }: { sector: SectorId }) {
  const s = SECTOR[sector];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: s.kleur }}>
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
      className={`focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-full border font-medium transition-colors active:scale-95 ${
        groot ? "h-11 px-5 text-sm" : "h-9 w-9"
      } ${is ? "border-accent bg-accent text-brand-ink" : "border-line bg-card text-muted hover:border-ink hover:text-ink"}`}
    >
      <Heart className={groot ? "h-4 w-4" : "h-4 w-4"} fill={is ? "currentColor" : "none"} strokeWidth={1.75} />
      {groot && (is ? "Bewaard" : "Bewaar")}
    </button>
  );
}

export function Kop({
  titel,
  sub,
  actie,
  label,
}: {
  titel: React.ReactNode;
  sub?: string;
  actie?: { href: string; label: string };
  label?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {label && <p className="bovenschrift mb-1">{label}</p>}
        <h2 className="kop text-[26px] leading-tight sm:text-[34px]">{titel}</h2>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actie && (
        <Link
          href={actie.href}
          className="focus-ring group inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-brand"
        >
          <span className="group-hover:underline">{actie.label}</span>{" "}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
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
  foto,
}: {
  titel: React.ReactNode;
  sub?: React.ReactNode;
  label?: string;
  children?: React.ReactNode;
  /** Op mobiel kleiner, zodat de inhoud sneller in beeld is */
  compact?: boolean;
  /** Met een foto wordt de kop een grote fotokop over de hele breedte */
  foto?: FotoSleutel;
}) {
  if (foto)
    return (
      <section className="volle-breedte relative -mt-5 mb-10 overflow-hidden bg-black text-white sm:-mt-8 sm:mb-14">
        <Foto
          sleutel={foto}
          className="kenburns absolute inset-0 h-full w-full object-cover"
          sizes="100vw"
          prioriteit
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" aria-hidden />
        <div className="relative mx-auto flex min-h-[380px] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[440px] sm:px-6">
          {label && <p className="text-sm font-semibold text-white/80">{label}</p>}
          <h1 className="mt-2 max-w-3xl text-[40px] font-bold leading-[1.02] tracking-tight sm:text-[64px] [&_em]:not-italic [&_em]:text-[#9fb0ff]">
            {titel}
          </h1>
          {sub && <p className="mt-4 max-w-2xl text-[15px] text-white/85 sm:text-[17px]">{sub}</p>}
          {children}
          <FotoBron sleutel={foto} className="mt-6 block text-[11px] text-white/60" />
        </div>
      </section>
    );
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 ${compact ? "mb-4 sm:mb-8" : "mb-8"}`}>
      <div className="binnenkomen max-w-3xl">
        {label && <p className={`bovenschrift mb-3 ${compact ? "hidden sm:block" : ""}`}>{label}</p>}
        <h1 className={`display leading-[1.02] sm:text-[56px] ${compact ? "text-[32px]" : "text-[40px]"}`}>{titel}</h1>
        {sub && (
          <p className={`mt-3 max-w-2xl text-[15px] text-muted sm:text-[17px] ${compact ? "hidden sm:block" : ""}`}>
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
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line text-muted">
        {icoon}
      </div>
      <h2 className="display text-2xl">{titel}</h2>
      <p className="mt-2 max-w-sm text-muted">{tekst}</p>
      {actie && (
        <Link
          href={actie.href}
          className="focus-ring mt-6 rounded-md bg-brand px-6 py-3 text-sm font-medium text-white hover:opacity-90"
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
    <div className="inline-flex rounded-full border border-line bg-card p-0.5" role="group">
      {opties.map((o) => (
        <button
          key={o.waarde}
          type="button"
          aria-pressed={waarde === o.waarde}
          onClick={() => kies(o.waarde)}
          className={`focus-ring rounded-full font-medium transition-colors ${klein ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"} ${
            waarde === o.waarde ? "bg-brand text-white" : "text-muted hover:text-ink"
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
          {
            naam: k.huurSchatting ? "Kamerhuur (schatting)" : "Kamerhuur (Kamernet)",
            bedrag: k.huur,
            kleur: KOSTEN_KLEUREN.huur,
          },
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

/** Dunne gestapelde balk */
export function Balk({
  delen,
  hoogte = 10,
}: {
  delen: { naam: string; bedrag: number; kleur: string }[];
  hoogte?: number;
}) {
  const totaal = delen.reduce((s, d) => s + d.bedrag, 0) || 1;
  return (
    <div
      className="flex w-full gap-[2px] overflow-hidden rounded-sm"
      style={{ height: hoogte }}
      role="img"
      aria-label={`Totaal ${euro(totaal)}`}
    >
      {delen.map((d) => (
        <div
          key={d.naam}
          className="h-full transition-[width] duration-700"
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

/** Knop in de huisstijl */
export function Knop({
  href,
  children,
  soort = "vol",
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  soort?: "vol" | "rand" | "tekst";
  onClick?: () => void;
}) {
  const stijl =
    soort === "vol"
      ? "bg-brand text-white hover:bg-brand-2"
      : soort === "rand"
        ? "border border-ink text-ink hover:bg-brand hover:border-brand hover:text-white"
        : "text-ink underline underline-offset-4 decoration-line hover:decoration-ink";
  const klasse = `focus-ring inline-flex items-center gap-2 rounded-md ${soort === "tekst" ? "" : "px-5 py-3"} text-sm font-semibold transition-colors ${stijl}`;
  return href ? (
    <Link href={href} className={klasse}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={klasse}>
      {children}
    </button>
  );
}
