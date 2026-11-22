"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Heart, Star, Trophy, X } from "lucide-react";
import { datumTekst, euro, openDagenVan, opleidingVan } from "@/lib/bereken";
import { bereken, type Resultaat } from "@/lib/resultaten";
import { useStore } from "@/lib/store";
import type { Favoriet } from "@/lib/types";
import { LeegScherm, NiveauChip, PaginaKop, ScoreRing, StoplichtBadge } from "@/components/ui";

const KostenGrafiek = dynamic(() => import("@/components/KostenGrafiek"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-card-2" />,
});

type Rij = { r: Resultaat; f: Favoriet };

interface Criterium {
  label: string;
  waarde: (x: Rij) => React.ReactNode;
  /** Getal om de beste te bepalen; hoger = beter */
  score?: (x: Rij) => number | null;
}

const CRITERIA: Criterium[] = [
  {
    label: "Match-score",
    waarde: ({ r }) => <ScoreRing score={r.match.score} maat={44} />,
    score: ({ r }) => r.match.score,
  },
  {
    label: "Maandlasten",
    waarde: ({ r }) => (
      <span>
        <span className="font-semibold tabular">{euro(r.kosten.advies)}</span>
        <span className="block text-xs text-muted">{r.kosten.thuisMogelijk ? "thuis wonend" : "op kamer"}</span>
      </span>
    ),
    score: ({ r }) => -r.kosten.advies,
  },
  {
    label: "Op kamer",
    waarde: ({ r }) => <span className="tabular">{euro(r.kosten.uitwonend)}</span>,
    score: ({ r }) => -r.kosten.uitwonend,
  },
  {
    label: "Kamerhuur",
    waarde: ({ r }) => <span className="tabular">{euro(r.stad.kamerhuur)}</span>,
    score: ({ r }) => -r.stad.kamerhuur,
  },
  {
    label: "Reistijd",
    waarde: ({ r }) => <StoplichtBadge licht={r.licht} minuten={r.stad.reistijd} />,
    score: ({ r }) => -r.stad.reistijd,
  },
  { label: "Eerstejaars", waarde: ({ r }) => <span className="tabular">± {r.opleiding.instroom}</span> },
  { label: "Duur", waarde: ({ r }) => `${r.opleiding.duur} jaar` },
  { label: "Selectie", waarde: ({ r }) => (r.opleiding.selectie ? "Ja" : "Nee") },
  {
    label: "Volgende open dag",
    waarde: ({ r }) => {
      const d = openDagenVan(r.opleiding.id)[0];
      return d ? (
        <span className="capitalize">{datumTekst(d.datum, { day: "numeric", month: "short" })}</span>
      ) : (
        <span className="text-muted">–</span>
      );
    },
  },
  {
    label: "Mijn cijfer",
    waarde: ({ f }) =>
      f.cijfer ? (
        <span className="inline-flex items-center gap-1 font-semibold tabular">
          <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" /> {f.cijfer}
        </span>
      ) : (
        <span className="text-muted">–</span>
      ),
    score: ({ f }) => f.cijfer,
  },
  {
    label: "Notitie",
    waarde: ({ f }) =>
      f.notitie ? <span className="line-clamp-3 text-sm">{f.notitie}</span> : <span className="text-muted">–</span>,
  },
];

export default function VergelijkPagina() {
  const { favorieten, profiel, geladen, wisselFavoriet } = useStore();

  if (!geladen) return <div className="h-96 animate-pulse rounded-3xl bg-card-2" />;

  const rijen: Rij[] = favorieten
    .map((f) => {
      const o = opleidingVan(f.opleidingId);
      return o ? { r: bereken(o, profiel), f } : null;
    })
    .filter((x): x is Rij => x !== null)
    .sort((a, b) => b.r.match.score - a.r.match.score);

  if (!rijen.length) {
    return (
      <>
        <PaginaKop titel="Vergelijken" />
        <LeegScherm
          icoon={<Heart className="h-6 w-6" />}
          titel="Nog geen favorieten"
          tekst="Tik op het hartje bij een opleiding om hem te bewaren. Hier zet je ze daarna naast elkaar."
          actie={{ href: "/zoeken", label: "Opleidingen zoeken" }}
        />
      </>
    );
  }

  const beste = (c: Criterium) => {
    if (!c.score || rijen.length < 2) return null;
    const waarden = rijen.map((x) => c.score!(x));
    const geldig = waarden.filter((v): v is number => v !== null);
    if (!geldig.length) return null;
    const max = Math.max(...geldig);
    return waarden.every((v) => v === max) ? null : max;
  };

  return (
    <>
      <PaginaKop
        titel="Vergelijken"
        sub={`Je ${rijen.length} favorieten naast elkaar. De beste waarde per regel is gemarkeerd.`}
      />

      <section className="kaart mb-6 p-4 sm:p-6">
        <h2 className="mb-1 text-lg font-semibold">Maandlasten</h2>
        <p className="mb-4 text-sm text-muted">Opbouw per opleiding, voor jouw situatie (thuis wonen of op kamer).</p>
        <KostenGrafiek items={rijen.map((x) => x.r)} />
      </section>

      <section className="kaart overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="sticky left-0 z-10 w-36 bg-card p-4 text-left align-bottom text-xs font-medium uppercase tracking-wide text-muted">
                  Opleiding
                </th>
                {rijen.map(({ r }) => (
                  <th key={r.opleiding.id} className="w-56 min-w-52 p-4 text-left align-top font-normal">
                    <div className="flex items-start gap-2">
                      <Link
                        href={`/opleiding/${r.opleiding.id}`}
                        className="focus-ring min-w-0 flex-1 rounded hover:text-brand"
                      >
                        <NiveauChip niveau={r.opleiding.niveau} />
                        <span className="mt-1.5 block font-semibold leading-snug">{r.opleiding.naam}</span>
                        <span className="block text-xs text-muted">
                          {r.opleiding.instelling} · {r.stad.naam}
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => void wisselFavoriet(r.opleiding.id)}
                        aria-label={`Verwijder ${r.opleiding.naam} uit favorieten`}
                        className="focus-ring rounded-full p-1 text-muted hover:bg-rood-soft hover:text-rood"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((c) => {
                const b = beste(c);
                return (
                  <tr key={c.label} className="border-b border-line last:border-0">
                    <th scope="row" className="sticky left-0 z-10 bg-card p-4 text-left font-medium text-muted">
                      {c.label}
                    </th>
                    {rijen.map((x) => {
                      const isBeste = b !== null && c.score!(x) === b;
                      return (
                        <td key={x.r.opleiding.id} className={`p-4 align-middle ${isBeste ? "bg-groen-soft/60" : ""}`}>
                          <div className="flex items-center gap-2">
                            {c.waarde(x)}
                            {isBeste && <Trophy className="h-3.5 w-3.5 shrink-0 text-groen" aria-label="Beste" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <p className="mt-3 text-xs text-muted">
        Reistijd is enkele reis vanaf Wierden. Een cijfer en notitie geef je op de pagina van de opleiding, na de open
        dag.
      </p>
    </>
  );
}
