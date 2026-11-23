"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, ExternalLink, Heart } from "lucide-react";
import { dagenTot, datumTekst, plaatsNaam, vandaag } from "@/lib/bereken";
import { useData } from "@/lib/data-client";
import { downloadIcs, maakIcs } from "@/lib/ics";
import { useStore } from "@/lib/store";
import type { Favoriet, Opleiding } from "@/lib/types";
import { MijnLijstTabs } from "@/components/MijnLijstTabs";
import { LeegScherm, PaginaKop, SectorLabel } from "@/components/ui";
import { SectorIcoon } from "@/components/SectorIcoon";
import { SECTOR } from "@/data/sectoren";

const WEEKDAGEN = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const iso = (j: number, m: number, d: number) => `${j}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function OpenDagenPagina() {
  const data = useData();
  const { favorieten, werkFavorietBij, geladen } = useStore();
  const nu = vandaag();
  const [jaar, setJaar] = useState(Number(nu.slice(0, 4)));
  const [maand, setMaand] = useState(Number(nu.slice(5, 7)) - 1);

  const items = useMemo(
    () =>
      data
        ? favorieten
            .map((f) => ({ f, o: data.perId.get(f.opleidingId) }))
            .filter((x): x is { f: Favoriet; o: Opleiding } => !!x.o)
        : null,
    [data, favorieten],
  );
  const gepland = (items ?? [])
    .filter((x) => x.f.openDag && x.f.openDag >= nu)
    .sort((a, b) => a.f.openDag!.localeCompare(b.f.openDag!));
  const ongepland = (items ?? []).filter((x) => !x.f.openDag || x.f.openDag < nu);
  const perDatum = new Map<string, { f: Favoriet; o: Opleiding }[]>();
  for (const x of items ?? []) if (x.f.openDag) perDatum.set(x.f.openDag, [...(perDatum.get(x.f.openDag) ?? []), x]);

  const eerste = new Date(Date.UTC(jaar, maand, 1));
  const start = (eerste.getUTCDay() + 6) % 7;
  const aantal = new Date(Date.UTC(jaar, maand + 1, 0)).getUTCDate();
  const vakjes: (number | null)[] = [...Array(start).fill(null), ...Array.from({ length: aantal }, (_, i) => i + 1)];
  while (vakjes.length % 7) vakjes.push(null);
  const verschuif = (n: number) => {
    const d = new Date(Date.UTC(jaar, maand + n, 1));
    setJaar(d.getUTCFullYear());
    setMaand(d.getUTCMonth());
  };
  const maandNaam = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    eerste,
  );

  const kop = (
    <PaginaKop
      label="Mijn lijst"
      titel="Open dagen"
      sub="Plan bij je favorieten wanneer je gaat kijken. Zet ze in je agenda en geef ze daarna een cijfer."
    >
      <MijnLijstTabs />
    </PaginaKop>
  );

  if (!geladen || !items)
    return (
      <>
        {kop}
        <div className="h-96 animate-pulse rounded-3xl bg-card-2" />
      </>
    );
  if (!items.length)
    return (
      <>
        {kop}
        <LeegScherm
          icoon={<Heart className="h-7 w-7" />}
          titel="Nog geen favorieten"
          tekst="Bewaar eerst opleidingen met het hartje. Daarna plan je hier je open dagen."
          actie={{ href: "/zoeken", label: "Opleidingen zoeken" }}
        />
      </>
    );

  return (
    <>
      {kop}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="kaart h-fit p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-2xl font-medium capitalize">{maandNaam}</h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => verschuif(-1)}
                aria-label="Vorige maand"
                className="rounded-full p-2 hover:bg-card-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => verschuif(1)}
                aria-label="Volgende maand"
                className="rounded-full p-2 hover:bg-card-2"
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
              const op = perDatum.get(datum) ?? [];
              return (
                <div
                  key={i}
                  className={`relative flex aspect-square flex-col items-center rounded-2xl p-1 pt-1.5 text-sm tabular ${
                    op.length ? "bg-ink font-medium text-bg" : datum < nu ? "text-muted/40" : ""
                  } ${datum === nu && !op.length ? "ring-2 ring-brand" : ""}`}
                  title={op.map((x) => x.o.naam).join(", ")}
                >
                  {d}
                  {op.length > 0 && (
                    <span className="mb-1 mt-auto flex gap-0.5">
                      {op.slice(0, 3).map((x) => (
                        <span
                          key={x.o.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: SECTOR[x.o.sector].kleur }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {gepland.length > 0 && (
            <button
              type="button"
              onClick={() =>
                downloadIcs(
                  "studiekompas-open-dagen.ics",
                  maakIcs(gepland.map((x) => ({ datum: x.f.openDag!, opleiding: x.o }))),
                )
              }
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-bg"
            >
              <CalendarPlus className="h-4 w-4" /> Alle {gepland.length} open dagen in mijn agenda
            </button>
          )}
        </section>

        <section className="space-y-6">
          {gepland.length > 0 && (
            <div>
              <h2 className="display mb-3 text-xl font-medium">Gepland</h2>
              <ul className="space-y-2.5">
                {gepland.map(({ f, o }) => {
                  const n = dagenTot(f.openDag!);
                  return (
                    <li key={o.id} className="kaart flex items-center gap-4 p-4">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-ink text-bg">
                        <span className="text-[10px] font-semibold uppercase">
                          {datumTekst(f.openDag!, { month: "short" }).replace(".", "")}
                        </span>
                        <span className="display text-xl font-medium leading-none tabular">
                          {datumTekst(f.openDag!, { day: "numeric" })}
                        </span>
                      </div>
                      <Link href={`/opleiding/${o.id}`} className="min-w-0 flex-1">
                        <p className="display truncate font-medium hover:text-brand">{o.naam}</p>
                        <p className="truncate text-sm text-muted">
                          {o.instelling.naam}, {plaatsNaam(o.plaats.naam)}
                        </p>
                      </Link>
                      <span className={`shrink-0 text-xs font-medium ${n <= 7 ? "text-oranje" : "text-muted"}`}>
                        {n === 0 ? "vandaag" : n === 1 ? "morgen" : `over ${n} d`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {ongepland.length > 0 && (
            <div>
              <h2 className="display mb-1 text-xl font-medium">Nog plannen</h2>
              <p className="mb-3 text-sm text-muted">Zoek de datum op de site van de school en vul hem in.</p>
              <ul className="space-y-2.5">
                {ongepland.map(({ f, o }) => (
                  <li key={o.id} className="kaart flex flex-wrap items-center gap-3 p-4">
                    <SectorIcoon sector={o.sector} maat={40} />
                    <Link href={`/opleiding/${o.id}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <SectorLabel sector={o.sector} />
                        <p className="display truncate font-medium hover:text-brand">{o.naam}</p>
                      </div>
                      <p className="truncate text-sm text-muted">
                        {o.instelling.naam}, {plaatsNaam(o.plaats.naam)}
                      </p>
                    </Link>
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                      {(o.url ?? o.instelling.url) && (
                        <a
                          href={(o.url ?? o.instelling.url)!}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Website"
                          className="rounded-full border border-line p-2 text-muted hover:border-brand hover:text-brand"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <input
                        type="date"
                        min={nu}
                        value={f.openDag ?? ""}
                        aria-label={`Datum open dag ${o.naam}`}
                        onChange={(e) => void werkFavorietBij(o.id, { openDag: e.target.value || null })}
                        className="focus-ring flex-1 rounded-xl border border-line bg-card px-3 py-2 text-sm sm:flex-none"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
