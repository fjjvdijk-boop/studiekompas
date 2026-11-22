"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { STEDEN } from "@/data/steden";
import { SECTOREN, type Niveau, type Sector } from "@/lib/types";
import { useResultaten } from "@/lib/resultaten";
import { reistijdTekst } from "@/lib/bereken";
import { useStore } from "@/lib/store";
import { OpleidingKaart } from "@/components/OpleidingKaart";
import { PaginaKop } from "@/components/ui";

type Sortering = "match" | "kosten" | "reistijd" | "instroom" | "naam";

interface Filters {
  tekst: string;
  niveau: Niveau | "alle";
  sectoren: Sector[];
  stad: string;
  maxReistijd: number;
  sort: Sortering;
}

const GEEN_LIMIET = 160;
const LEEG: Filters = { tekst: "", niveau: "alle", sectoren: [], stad: "", maxReistijd: GEEN_LIMIET, sort: "match" };
const SLEUTEL = "studiekompas:zoekfilters";

export default function ZoekPagina() {
  const resultaten = useResultaten();
  const { geladen } = useStore();
  const [f, setF] = useState<Filters>(LEEG);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const ruw = sessionStorage.getItem(SLEUTEL);
      if (ruw) setF({ ...LEEG, ...JSON.parse(ruw) });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(SLEUTEL, JSON.stringify(f));
    } catch {}
  }, [f]);

  const zet = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((oud) => ({ ...oud, [k]: v }));

  const gefilterd = useMemo(() => {
    const q = f.tekst.trim().toLowerCase();
    const lijst = resultaten.filter(({ opleiding: o, stad }) => {
      if (q && !`${o.naam} ${o.instelling} ${stad.naam} ${o.sector}`.toLowerCase().includes(q)) return false;
      if (f.niveau !== "alle" && o.niveau !== f.niveau) return false;
      if (f.sectoren.length && !f.sectoren.includes(o.sector)) return false;
      if (f.stad && o.stadId !== f.stad) return false;
      if (f.maxReistijd < GEEN_LIMIET && stad.reistijd > f.maxReistijd) return false;
      return true;
    });
    const sorteer: Record<Sortering, (a: (typeof lijst)[0], b: (typeof lijst)[0]) => number> = {
      match: (a, b) => b.match.score - a.match.score || a.kosten.advies - b.kosten.advies,
      kosten: (a, b) => a.kosten.advies - b.kosten.advies,
      reistijd: (a, b) => a.stad.reistijd - b.stad.reistijd,
      instroom: (a, b) => b.opleiding.instroom - a.opleiding.instroom,
      naam: (a, b) => a.opleiding.naam.localeCompare(b.opleiding.naam, "nl"),
    };
    return [...lijst].sort(sorteer[f.sort]);
  }, [resultaten, f]);

  const aantalFilters =
    (f.niveau !== "alle" ? 1 : 0) + f.sectoren.length + (f.stad ? 1 : 0) + (f.maxReistijd < GEEN_LIMIET ? 1 : 0);

  const paneel = (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Niveau</legend>
        <div className="grid grid-cols-3 gap-1 rounded-full bg-card-2 p-1">
          {(["alle", "hbo", "wo"] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => zet("niveau", n)}
              aria-pressed={f.niveau === n}
              className={`focus-ring rounded-full py-1.5 text-sm font-medium uppercase transition-colors ${
                f.niveau === n ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {n === "alle" ? <span className="normal-case">Alle</span> : n}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Sector</legend>
        <div className="flex flex-wrap gap-1.5">
          {SECTOREN.map((s) => {
            const aan = f.sectoren.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={aan}
                onClick={() => zet("sectoren", aan ? f.sectoren.filter((x) => x !== s) : [...f.sectoren, s])}
                className={`focus-ring rounded-full border px-3 py-1 text-sm transition-colors ${
                  aan ? "border-brand bg-brand text-brand-ink" : "border-line bg-card text-ink hover:border-brand"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">Stad</span>
        <select
          value={f.stad}
          onChange={(e) => zet("stad", e.target.value)}
          className="focus-ring w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm"
        >
          <option value="">Alle steden</option>
          {[...STEDEN]
            .sort((a, b) => a.naam.localeCompare(b.naam))
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.naam}
              </option>
            ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 flex justify-between text-sm font-medium">
          Max. reistijd vanaf Wierden
          <span className="font-normal text-muted tabular">
            {f.maxReistijd >= GEEN_LIMIET ? "Geen limiet" : reistijdTekst(f.maxReistijd)}
          </span>
        </span>
        <input
          type="range"
          min={15}
          max={GEEN_LIMIET}
          step={5}
          value={f.maxReistijd}
          onChange={(e) => zet("maxReistijd", Number(e.target.value))}
          className="w-full accent-[var(--brand)]"
        />
      </label>

      {aantalFilters > 0 && (
        <button
          type="button"
          onClick={() => setF({ ...LEEG, tekst: f.tekst, sort: f.sort })}
          className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-medium text-brand"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Filters wissen
        </button>
      )}
    </div>
  );

  return (
    <>
      <PaginaKop
        titel="Zoeken"
        sub="Filter op niveau, sector, stad en reistijd. De match-score past zich aan je profiel aan."
      />

      <div className="mb-5 flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Zoek op opleiding, instelling of stad</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={f.tekst}
            onChange={(e) => zet("tekst", e.target.value)}
            placeholder="Zoek op opleiding, instelling of stad"
            className="focus-ring w-full rounded-full border border-line bg-card py-3 pl-10 pr-4 text-[15px] placeholder:text-muted"
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring relative inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-medium lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {aantalFilters > 0 && (
            <span className="rounded-full bg-brand px-1.5 text-xs font-semibold text-brand-ink tabular">
              {aantalFilters}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="kaart sticky top-24 hidden h-fit p-5 lg:block">{paneel}</aside>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              <span className="font-semibold text-ink tabular">{gefilterd.length}</span>{" "}
              {gefilterd.length === 1 ? "opleiding" : "opleidingen"}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sorteer</span>
              <select
                value={f.sort}
                onChange={(e) => zet("sort", e.target.value as Sortering)}
                className="focus-ring rounded-lg border border-line bg-card px-2 py-1.5"
              >
                <option value="match">Beste match</option>
                <option value="kosten">Laagste maandlasten</option>
                <option value="reistijd">Kortste reistijd</option>
                <option value="instroom">Meeste studenten</option>
                <option value="naam">Naam (A–Z)</option>
              </select>
            </label>
          </div>
          {!geladen ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-[1.25rem] bg-card-2" />
              ))}
            </div>
          ) : gefilterd.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {gefilterd.map((r) => (
                <OpleidingKaart key={r.opleiding.id} r={r} />
              ))}
            </div>
          ) : (
            <div className="kaart px-6 py-14 text-center">
              <p className="font-semibold">Niets gevonden</p>
              <p className="mt-1 text-sm text-muted">Probeer minder filters of een ruimere reistijd.</p>
              <button
                type="button"
                onClick={() => setF(LEEG)}
                className="focus-ring mt-4 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-ink"
              >
                Alles tonen
              </button>
            </div>
          )}
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-[1100] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="binnenkomen absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-card p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluiten"
                className="focus-ring rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {paneel}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring mt-6 w-full rounded-full bg-brand py-3 font-semibold text-brand-ink"
            >
              Toon {gefilterd.length} opleidingen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
