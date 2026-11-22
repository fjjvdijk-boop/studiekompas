"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, Clock, Heart } from "lucide-react";
import { OPEN_DAGEN } from "@/data/opendagen";
import { dagenTot, datumTekst, opleidingVan, stadVan, vandaag } from "@/lib/bereken";
import { downloadIcs, maakIcs } from "@/lib/ics";
import { useStore } from "@/lib/store";
import type { OpenDag } from "@/lib/types";
import { PaginaKop } from "@/components/ui";

const WEEKDAGEN = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const SOORT_KLEUR: Record<OpenDag["soort"], string> = {
  "Open dag": "var(--brand)",
  Meeloopdag: "var(--c-leef)",
  Proefstuderen: "var(--accent)",
};

const iso = (j: number, m: number, d: number) => `${j}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function OpenDagenPagina() {
  const { favorieten, geladen } = useStore();
  const favIds = useMemo(() => new Set(favorieten.map((f) => f.opleidingId)), [favorieten]);
  const [alleen, setAlleen] = useState<"fav" | "alle">("fav");
  const [gezet, setGezet] = useState(false);
  useEffect(() => {
    if (geladen && !gezet) {
      setAlleen(favorieten.length ? "fav" : "alle");
      setGezet(true);
    }
  }, [geladen, gezet, favorieten.length]);

  const nu = vandaag();
  const [jaar, setJaar] = useState(Number(nu.slice(0, 4)));
  const [maand, setMaand] = useState(Number(nu.slice(5, 7)) - 1);
  const [dag, setDag] = useState<string | null>(null);

  const dagen = useMemo(
    () =>
      OPEN_DAGEN.filter((d) => d.datum >= nu && (alleen === "alle" || favIds.has(d.opleidingId))).sort((a, b) =>
        a.datum.localeCompare(b.datum),
      ),
    [alleen, favIds, nu],
  );
  const perDatum = useMemo(() => {
    const m = new Map<string, OpenDag[]>();
    for (const d of dagen) m.set(d.datum, [...(m.get(d.datum) ?? []), d]);
    return m;
  }, [dagen]);

  const eersteDag = new Date(Date.UTC(jaar, maand, 1));
  const start = (eersteDag.getUTCDay() + 6) % 7;
  const aantalDagen = new Date(Date.UTC(jaar, maand + 1, 0)).getUTCDate();
  const vakjes: (number | null)[] = [
    ...Array(start).fill(null),
    ...Array.from({ length: aantalDagen }, (_, i) => i + 1),
  ];
  while (vakjes.length % 7) vakjes.push(null);

  const verschuif = (n: number) => {
    const d = new Date(Date.UTC(jaar, maand + n, 1));
    setJaar(d.getUTCFullYear());
    setMaand(d.getUTCMonth());
    setDag(null);
  };

  const lijst = dag ? (perDatum.get(dag) ?? []) : dagen;
  const maandNaam = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    eersteDag,
  );

  return (
    <>
      <PaginaKop
        titel="Open dagen"
        sub="Alle open dagen, meeloopdagen en proefstudeerdagen. Zet ze met één tik in je agenda."
      >
        <div className="grid grid-cols-2 gap-1 rounded-full bg-card-2 p-1 text-sm">
          {(
            [
              ["fav", `Mijn favorieten`],
              ["alle", "Alle"],
            ] as const
          ).map(([w, label]) => (
            <button
              key={w}
              type="button"
              aria-pressed={alleen === w}
              onClick={() => {
                setAlleen(w);
                setDag(null);
              }}
              className={`focus-ring rounded-full px-4 py-1.5 font-medium transition-colors ${
                alleen === w ? "bg-card text-ink shadow-sm" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </PaginaKop>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="kaart h-fit p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize">{maandNaam}</h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => verschuif(-1)}
                aria-label="Vorige maand"
                className="focus-ring rounded-full p-2 hover:bg-card-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => verschuif(1)}
                aria-label="Volgende maand"
                className="focus-ring rounded-full p-2 hover:bg-card-2"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase text-muted">
            {WEEKDAGEN.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {vakjes.map((d, i) => {
              if (d === null) return <div key={i} />;
              const datum = iso(jaar, maand, d);
              const items = perDatum.get(datum) ?? [];
              const isVandaag = datum === nu;
              const gekozen = dag === datum;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!items.length}
                  onClick={() => setDag(gekozen ? null : datum)}
                  aria-label={`${datumTekst(datum)}${items.length ? `, ${items.length} open dag(en)` : ""}`}
                  aria-pressed={gekozen}
                  className={`focus-ring relative flex aspect-square flex-col items-center justify-start rounded-xl p-1 pt-1.5 text-sm tabular transition-colors sm:aspect-[1/0.9] ${
                    gekozen
                      ? "bg-brand text-brand-ink"
                      : items.length
                        ? "bg-brand-soft font-semibold text-brand hover:ring-1 hover:ring-brand"
                        : datum < nu
                          ? "text-muted/50"
                          : "text-ink"
                  } ${isVandaag && !gekozen ? "ring-1 ring-ink/30" : ""}`}
                >
                  {d}
                  {items.length > 0 && (
                    <span className="mt-auto mb-1 flex gap-0.5">
                      {items.slice(0, 3).map((it) => (
                        <span
                          key={it.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: gekozen ? "currentColor" : SOORT_KLEUR[it.soort] }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
            {Object.entries(SOORT_KLEUR).map(([s, k]) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: k }} /> {s}
              </span>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {dag ? <span className="capitalize">{datumTekst(dag)}</span> : "Binnenkort"}
            </h2>
            {lijst.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  downloadIcs(
                    "studiekompas-open-dagen.ics",
                    maakIcs(lijst.map((d) => ({ dag: d, opleiding: opleidingVan(d.opleidingId)! }))),
                  )
                }
                className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-medium text-brand"
              >
                <CalendarPlus className="h-4 w-4" /> Alles in agenda
              </button>
            )}
          </div>
          {!geladen ? (
            <div className="h-64 animate-pulse rounded-[1.25rem] bg-card-2" />
          ) : lijst.length ? (
            <ul className="space-y-2.5">
              {lijst.map((d) => {
                const o = opleidingVan(d.opleidingId)!;
                const n = dagenTot(d.datum);
                return (
                  <li key={d.id} className="kaart flex items-center gap-4 p-3.5">
                    <div
                      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white"
                      style={{ background: SOORT_KLEUR[d.soort] }}
                    >
                      <span className="text-[10px] font-semibold uppercase opacity-90">
                        {datumTekst(d.datum, { month: "short" }).replace(".", "")}
                      </span>
                      <span className="text-xl font-semibold leading-none tabular">
                        {datumTekst(d.datum, { day: "numeric" })}
                      </span>
                    </div>
                    <Link href={`/opleiding/${o.id}`} className="focus-ring min-w-0 flex-1 rounded">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        {d.soort}
                        {favIds.has(o.id) && (
                          <Heart className="h-3 w-3 fill-[var(--rood)] text-rood" aria-label="Favoriet" />
                        )}
                      </p>
                      <p className="truncate font-semibold hover:text-brand">{o.naam}</p>
                      <p className="flex items-center gap-1 truncate text-sm text-muted">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {d.start}–{d.eind} · {o.instelling}, {stadVan(o).naam}
                      </p>
                    </Link>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`text-xs font-medium tabular ${n <= 7 ? "text-oranje" : "text-muted"}`}>
                        {n === 0 ? "vandaag" : n === 1 ? "morgen" : `over ${n} d`}
                      </span>
                      <button
                        type="button"
                        onClick={() => downloadIcs(`${d.soort}-${o.naam}.ics`, maakIcs([{ dag: d, opleiding: o }]))}
                        aria-label="Zet in je agenda"
                        className="focus-ring rounded-full p-1.5 text-muted hover:bg-card-2 hover:text-brand"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="kaart px-6 py-10 text-center">
              <p className="font-semibold">Geen open dagen van je favorieten</p>
              <p className="mt-1 text-sm text-muted">Bewaar opleidingen als favoriet of bekijk alle open dagen.</p>
              <button
                type="button"
                onClick={() => setAlleen("alle")}
                className="focus-ring mt-4 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-ink"
              >
                Toon alle open dagen
              </button>
            </div>
          )}
          <p className="mt-3 text-xs text-muted">Datums zijn voorbeelden. Check altijd de website van de instelling.</p>
        </section>
      </div>
    </>
  );
}
