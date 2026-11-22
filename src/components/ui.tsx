"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Stoplicht } from "@/lib/bereken";
import { euro, reistijdTekst } from "@/lib/bereken";
import type { Kosten } from "@/lib/bereken";
import { useStore } from "@/lib/store";

const LICHT_STIJL: Record<Stoplicht, string> = {
  groen: "bg-groen-soft text-groen",
  oranje: "bg-oranje-soft text-oranje",
  rood: "bg-rood-soft text-rood",
};
const LICHT_LABEL: Record<Stoplicht, string> = {
  groen: "Goed te reizen",
  oranje: "Pittige reis",
  rood: "Te ver om te reizen",
};

export function StoplichtBadge({
  licht,
  minuten,
  groot = false,
}: {
  licht: Stoplicht;
  minuten: number;
  groot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tabular ${LICHT_STIJL[licht]} ${
        groot ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs"
      }`}
      title={`${LICHT_LABEL[licht]} – ${minuten} min enkele reis`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-current opacity-30 blur-[2px]" />
        <span className="relative h-2 w-2 rounded-full bg-current" />
      </span>
      {reistijdTekst(minuten)}
      {groot && <span className="font-normal opacity-80">· {LICHT_LABEL[licht]}</span>}
    </span>
  );
}

export function ScoreRing({ score, maat = 52 }: { score: number; maat?: number }) {
  const r = maat / 2 - 4;
  const omtrek = 2 * Math.PI * r;
  const kleur = score >= 75 ? "var(--groen)" : score >= 50 ? "var(--brand)" : "var(--muted)";
  return (
    <div
      className="relative shrink-0"
      style={{ width: maat, height: maat }}
      role="img"
      aria-label={`Match-score ${score} van 100`}
    >
      <svg width={maat} height={maat} className="-rotate-90">
        <circle cx={maat / 2} cy={maat / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={4} />
        <circle
          cx={maat / 2}
          cy={maat / 2}
          r={r}
          fill="none"
          stroke={kleur}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={omtrek}
          strokeDashoffset={omtrek * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-semibold tabular"
        style={{ fontSize: maat * 0.3 }}
      >
        {score}
      </span>
    </div>
  );
}

export function NiveauChip({ niveau }: { niveau: "hbo" | "wo" }) {
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        niveau === "wo" ? "bg-brand-soft text-brand" : "bg-card-2 text-muted"
      }`}
    >
      {niveau}
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
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full border font-medium transition-all active:scale-95 ${
        groot ? "h-11 px-5 text-sm" : "h-9 w-9"
      } ${
        is
          ? "border-transparent bg-rood-soft text-rood"
          : "border-line bg-card text-muted hover:border-rood hover:text-rood"
      }`}
    >
      <Heart className={groot ? "h-[18px] w-[18px]" : "h-4 w-4"} fill={is ? "currentColor" : "none"} />
      {groot && (is ? "Bewaard" : "Bewaar als favoriet")}
    </button>
  );
}

export function Kop({ titel, sub, actie }: { titel: string; sub?: string; actie?: { href: string; label: string } }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{titel}</h2>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
      {actie && (
        <Link href={actie.href} className="focus-ring shrink-0 rounded text-sm font-medium text-brand hover:underline">
          {actie.label}
        </Link>
      )}
    </div>
  );
}

export function PaginaKop({ titel, sub, children }: { titel: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{titel}</h1>
        {sub && <p className="mt-1 max-w-2xl text-muted">{sub}</p>}
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
    <div className="kaart flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        {icoon}
      </div>
      <h2 className="text-lg font-semibold">{titel}</h2>
      <p className="mt-1 max-w-sm text-muted">{tekst}</p>
      {actie && (
        <Link
          href={actie.href}
          className="focus-ring mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-ink hover:opacity-90"
        >
          {actie.label}
        </Link>
      )}
    </div>
  );
}

export const KOSTEN_KLEUREN = {
  huur: "var(--c-huur)",
  leef: "var(--c-leef)",
  collegegeld: "var(--c-college)",
  boeken: "var(--c-boeken)",
};

export function kostenDelen(k: Kosten, thuis: boolean) {
  return [
    ...(thuis ? [] : [{ naam: "Kamerhuur", bedrag: k.huur, kleur: KOSTEN_KLEUREN.huur }]),
    {
      naam: thuis ? "Leefkosten thuis" : "Leefkosten",
      bedrag: thuis ? k.leefThuis : k.leefUit,
      kleur: KOSTEN_KLEUREN.leef,
    },
    { naam: "Collegegeld", bedrag: k.collegegeld, kleur: KOSTEN_KLEUREN.collegegeld },
    { naam: "Boeken en materiaal", bedrag: k.boeken, kleur: KOSTEN_KLEUREN.boeken },
  ];
}

/** Gestapelde balk met de opbouw van de maandlasten */
export function KostenBalk({ kosten: k, thuis, schaal }: { kosten: Kosten; thuis: boolean; schaal?: number }) {
  const delen = kostenDelen(k, thuis);
  const totaal = delen.reduce((s, d) => s + d.bedrag, 0);
  const max = schaal ?? totaal;
  return (
    <div
      className="flex h-3 w-full overflow-hidden rounded-full bg-card-2"
      role="img"
      aria-label={`Totaal ${euro(totaal)} per maand`}
    >
      {delen.map((d) => (
        <div
          key={d.naam}
          className="h-full transition-[width] duration-500 first:rounded-l-full last:rounded-r-full [&:not(:last-child)]:border-r-2 [&:not(:last-child)]:border-card"
          style={{ width: `${(d.bedrag / max) * 100}%`, background: d.kleur }}
          title={`${d.naam}: ${euro(d.bedrag)}`}
        />
      ))}
    </div>
  );
}
