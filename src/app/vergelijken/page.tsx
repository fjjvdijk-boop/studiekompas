"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import { Heart, Star, Trophy, X } from "lucide-react";
import { datumTekst, euro, getal, plaatsNaam } from "@/lib/bereken";
import { studieschuld } from "@/lib/duo";
import { bereken } from "@/lib/bereken";
import { useData } from "@/lib/data-client";
import type { Resultaat } from "@/lib/resultaten";
import { useStore } from "@/lib/store";
import type { Favoriet } from "@/lib/types";
import { MijnLijstTabs } from "@/components/MijnLijstTabs";
import { LeegScherm, PaginaKop, ScoreRing, SectorLabel, StoplichtBadge, TaalChip } from "@/components/ui";

const KostenGrafiek = dynamic(() => import("@/components/KostenGrafiek"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-card-2" />,
});

type Rij = { r: Resultaat; f: Favoriet };
interface Criterium {
  label: string;
  waarde: (x: Rij) => React.ReactNode;
  /** Hoger = beter; null = niet vergelijken */
  score?: (x: Rij) => number | null;
}

const CRITERIA: Criterium[] = [
  { label: "Match", waarde: ({ r }) => <ScoreRing score={r.match.score} maat={44} />, score: ({ r }) => r.match.score },
  {
    label: "Toelating",
    waarde: ({ r }) => {
      const t = r.match.toelating;
      return t.status === "ja" ? (
        <span className="text-groen">Toelaatbaar</span>
      ) : t.status === "deficientie" ? (
        <span className="text-sm text-oranje">Mist {t.mist.join(" en ")}</span>
      ) : t.status === "nee" ? (
        <span className="text-sm text-rood">Niet direct</span>
      ) : (
        <span className="text-muted">Onbekend</span>
      );
    },
    score: ({ r }) => ({ ja: 2, onbekend: 1, deficientie: 1, nee: 0 })[r.match.toelating.status],
  },
  { label: "Voertaal", waarde: ({ r }) => <TaalChip taal={r.opleiding.taal} /> },
  {
    label: "Kosten per maand",
    waarde: ({ r }) => (
      <span>
        <span className="display text-lg tabular">{euro(r.kosten.advies)}</span>
        <span className="block text-xs text-muted">{r.kosten.thuisMogelijk ? "thuis wonend" : "op kamer"}</span>
      </span>
    ),
    score: ({ r }) => -r.kosten.advies,
  },
  {
    label: "Zelf lenen",
    waarde: ({ r }) => <span className="display text-lg tabular">{euro(r.geld.teLenen)}</span>,
    score: ({ r }) => -r.geld.teLenen,
  },
  {
    label: "Schuld na studie",
    waarde: ({ r }) => <span className="tabular">{euro(studieschuld(r.geld.teLenen, r.opleiding.duur ?? 3))}</span>,
    score: ({ r }) => -r.geld.teLenen,
  },
  {
    label: "Reistijd",
    waarde: ({ r }) => <StoplichtBadge licht={r.licht} minuten={r.reistijd} schatting={r.reistijdSchatting} />,
    score: ({ r }) => -r.reistijd,
  },
  {
    label: "Eerstejaars",
    waarde: ({ r }) =>
      r.opleiding.instroom !== null ? (
        <span className="tabular">{getal(r.opleiding.instroom)}</span>
      ) : (
        <span className="text-muted">–</span>
      ),
  },
  { label: "Studiekeuzecheck", waarde: ({ r }) => (r.opleiding.studiekeuzecheck ? "Verplicht" : "Niet verplicht") },
  {
    label: "Open dag",
    waarde: ({ f }) =>
      f.openDag ? (
        <span>{datumTekst(f.openDag, { day: "numeric", month: "short" })}</span>
      ) : (
        <span className="text-muted">nog plannen</span>
      ),
  },
  {
    label: "Mijn cijfer",
    waarde: ({ f }) =>
      f.cijfer ? (
        <span className="inline-flex items-center gap-1 tabular">
          <Star className="h-4 w-4" /> {f.cijfer}
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
  const data = useData();
  const { favorieten, profiel, geladen, wisselFavoriet } = useStore();

  const rijen = useMemo<Rij[] | null>(() => {
    if (!data) return null;
    return favorieten
      .map((f) => {
        const o = data.perId.get(f.opleidingId);
        return o ? { r: bereken(o, profiel), f } : null;
      })
      .filter((x): x is Rij => x !== null)
      .sort((a, b) => b.r.match.score - a.r.match.score);
  }, [data, favorieten, profiel]);

  const kop = (
    <PaginaKop
      label="Mijn lijst"
      titel="Vergelijken"
      sub="Je favorieten naast elkaar. De beste waarde per regel is gemarkeerd."
    >
      <MijnLijstTabs />
    </PaginaKop>
  );

  if (!geladen || !rijen)
    return (
      <>
        {kop}
        <div className="h-96 animate-pulse rounded-3xl bg-card-2" />
      </>
    );

  if (!rijen.length)
    return (
      <>
        {kop}
        <LeegScherm
          icoon={<Heart className="h-7 w-7" />}
          titel="Nog geen favorieten"
          tekst="Tik op het hartje bij een opleiding om hem te bewaren. Hier zet je ze daarna naast elkaar."
          actie={{ href: "/zoeken", label: "Opleidingen zoeken" }}
        />
      </>
    );

  const beste = (c: Criterium) => {
    if (!c.score || rijen.length < 2) return null;
    const waarden = rijen.map((x) => c.score!(x)).filter((v): v is number => v !== null);
    if (!waarden.length) return null;
    const max = Math.max(...waarden);
    return waarden.every((v) => v === max) ? null : max;
  };

  return (
    <>
      {kop}
      <section className="kaart mb-6 p-5 sm:p-7">
        <h2 className="display text-2xl">Maandlasten</h2>
        <p className="mb-5 text-sm text-muted">Opbouw per opleiding, voor jouw situatie.</p>
        <KostenGrafiek items={rijen.map((x) => x.r)} />
      </section>

      <section className="kaart overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="sticky left-0 z-10 w-32 bg-card p-4" />
                {rijen.map(({ r }) => (
                  <th key={r.opleiding.id} className="w-60 min-w-56 p-4 text-left align-top font-normal">
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/opleiding/${r.opleiding.id}`}
                        className="min-w-0 flex-1 hover:underline hover:underline-offset-4"
                      >
                        <SectorLabel sector={r.opleiding.sector} />
                        <span className="display mt-1 block text-lg leading-snug">{r.opleiding.naam}</span>
                        <span className="block text-xs text-muted">
                          {r.opleiding.instelling.naam} · {plaatsNaam(r.opleiding.plaats.naam)}
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => void wisselFavoriet(r.opleiding.id)}
                        aria-label={`Verwijder ${r.opleiding.naam}`}
                        className="rounded-full p-1 text-muted hover:bg-rood-soft hover:text-rood"
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
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-card p-4 text-left text-xs font-bold uppercase tracking-wide text-muted"
                    >
                      {c.label}
                    </th>
                    {rijen.map((x) => {
                      const is = b !== null && c.score!(x) === b;
                      return (
                        <td key={x.r.opleiding.id} className={`p-4 align-middle ${is ? "bg-groen-soft/70" : ""}`}>
                          <div className="flex items-center gap-2">
                            {c.waarde(x)}
                            {is && <Trophy className="h-3.5 w-3.5 shrink-0 text-groen" aria-label="Beste" />}
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
    </>
  );
}
