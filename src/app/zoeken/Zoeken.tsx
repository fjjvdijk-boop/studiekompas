"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { NIVEAU_LABEL, SECTOR, SECTOREN } from "@/data/sectoren";
import { getal, plaatsNaam, reistijdTekst } from "@/lib/bereken";
import { useData } from "@/lib/data-client";
import { useResultaten, type Resultaat } from "@/lib/resultaten";
import { useStore } from "@/lib/store";
import type { Niveau, SectorId, Soort } from "@/lib/types";
import { KaartSkelet, OpleidingKaart } from "@/components/OpleidingKaart";
import { PaginaKop, Schuif, Segment } from "@/components/ui";

type Sortering = "match" | "kosten" | "reistijd" | "instroom" | "naam";

interface Filters {
  q: string;
  soort: Soort | "alle";
  niveaus: Niveau[];
  sectoren: SectorId[];
  plaats: string;
  maxReistijd: number;
  toelaatbaar: boolean;
  sort: Sortering;
}

const GEEN_LIMIET = 180;
const PER_PAGINA = 24;
const LEEG: Filters = {
  q: "",
  soort: "alle",
  niveaus: [],
  sectoren: [],
  plaats: "",
  maxReistijd: GEEN_LIMIET,
  toelaatbaar: true,
  sort: "match",
};
const MBO_NIVEAUS: Niveau[] = ["mbo1", "mbo2", "mbo3", "mbo4"];
const HBO_NIVEAUS: Niveau[] = ["ad", "hbo"];

const normaal = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function uitUrl(p: URLSearchParams): Filters {
  const sectoren = (p.get("sector") ?? "").split(",").filter((s): s is SectorId => s in SECTOR);
  const soort = p.get("soort");
  return {
    ...LEEG,
    q: p.get("q") ?? "",
    soort: soort === "mbo" || soort === "hbo" || soort === "wo" ? soort : "alle",
    sectoren,
    plaats: p.get("plaats") ?? "",
  };
}

export function Zoeken() {
  const params = useSearchParams();
  const router = useRouter();
  const data = useData();
  const resultaten = useResultaten();
  const { profiel, geladen } = useStore();
  const [f, setF] = useState<Filters>(() => uitUrl(params));
  const [aantal, setAantal] = useState(PER_PAGINA);
  const [paneel, setPaneel] = useState(false);
  const einde = useRef<HTMLDivElement>(null);

  // Filters in de URL houden, zodat je een zoekopdracht kunt delen of terug kunt gaan
  useEffect(() => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.soort !== "alle") p.set("soort", f.soort);
    if (f.sectoren.length) p.set("sector", f.sectoren.join(","));
    if (f.plaats) p.set("plaats", f.plaats);
    const nieuw = p.toString();
    if (nieuw !== params.toString()) router.replace(nieuw ? `/zoeken?${nieuw}` : "/zoeken", { scroll: false });
    setAantal(PER_PAGINA);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f]);

  const zet = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((oud) => ({ ...oud, [k]: v }));
  const wissel = <T,>(lijst: T[], x: T) => (lijst.includes(x) ? lijst.filter((y) => y !== x) : [...lijst, x]);

  const plaatsen = useMemo(() => {
    if (!data) return [];
    const tel = new Map<string, number>();
    for (const o of data.opleidingen) tel.set(o.plaats.naam, (tel.get(o.plaats.naam) ?? 0) + 1);
    return [...tel.entries()].sort((a, b) => plaatsNaam(a[0]).localeCompare(plaatsNaam(b[0]), "nl"));
  }, [data]);

  const gefilterd = useMemo(() => {
    if (!resultaten) return null;
    const woorden = normaal(f.q).split(/\s+/).filter(Boolean);
    const lijst = resultaten.filter(({ opleiding: o, reistijd, match }) => {
      if (f.soort !== "alle" && o.soort !== f.soort) return false;
      if (f.niveaus.length && !f.niveaus.includes(o.niveau)) return false;
      if (f.sectoren.length && !f.sectoren.includes(o.sector)) return false;
      if (f.plaats && o.plaats.naam !== f.plaats) return false;
      if (f.maxReistijd < GEEN_LIMIET && reistijd > f.maxReistijd) return false;
      if (f.toelaatbaar && !match.toelaatbaar) return false;
      if (woorden.length) {
        const tekst = normaal(
          `${o.naam} ${o.eigenNaam ?? ""} ${o.instelling.naam} ${plaatsNaam(o.plaats.naam)} ${o.plaats.naam} ${SECTOR[o.sector].naam}`,
        );
        if (!woorden.every((w) => tekst.includes(w))) return false;
      }
      return true;
    });
    const sorteer: Record<Sortering, (a: Resultaat, b: Resultaat) => number> = {
      match: (a, b) => b.match.score - a.match.score || a.reistijd - b.reistijd,
      kosten: (a, b) => a.kosten.advies - b.kosten.advies,
      reistijd: (a, b) => a.reistijd - b.reistijd,
      instroom: (a, b) => (b.opleiding.instroom ?? -1) - (a.opleiding.instroom ?? -1),
      naam: (a, b) => a.opleiding.naam.localeCompare(b.opleiding.naam, "nl"),
    };
    return lijst.sort(sorteer[f.sort]);
  }, [resultaten, f]);

  // Meer laden als je onderaan bent
  useEffect(() => {
    const el = einde.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setAantal((a) => a + PER_PAGINA), {
      rootMargin: "600px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [gefilterd]);

  const actieveFilters: { label: string; weg: () => void }[] = [
    ...(f.soort !== "alle"
      ? [{ label: f.soort.toUpperCase(), weg: () => setF((o) => ({ ...o, soort: "alle", niveaus: [] })) }]
      : []),
    ...f.niveaus.map((n) => ({
      label: NIVEAU_LABEL[n],
      weg: () =>
        zet(
          "niveaus",
          f.niveaus.filter((x) => x !== n),
        ),
    })),
    ...f.sectoren.map((s) => ({
      label: `${SECTOR[s].emoji} ${SECTOR[s].kort}`,
      weg: () =>
        zet(
          "sectoren",
          f.sectoren.filter((x) => x !== s),
        ),
    })),
    ...(f.plaats ? [{ label: `📍 ${plaatsNaam(f.plaats)}`, weg: () => zet("plaats", "") }] : []),
    ...(f.maxReistijd < GEEN_LIMIET
      ? [{ label: `≤ ${reistijdTekst(f.maxReistijd)}`, weg: () => zet("maxReistijd", GEEN_LIMIET) }]
      : []),
  ];

  const niveauKeuzes = f.soort === "mbo" ? MBO_NIVEAUS : f.soort === "hbo" ? HBO_NIVEAUS : [];

  const filterPaneel = (
    <div className="space-y-7">
      <div>
        <p className="mb-2.5 text-sm font-semibold">Soort onderwijs</p>
        <Segment
          waarde={f.soort}
          kies={(s) => setF((o) => ({ ...o, soort: s, niveaus: [] }))}
          opties={[
            { waarde: "alle", label: "Alles" },
            { waarde: "mbo", label: "mbo" },
            { waarde: "hbo", label: "hbo" },
            { waarde: "wo", label: "wo" },
          ]}
        />
        {niveauKeuzes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {niveauKeuzes.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={f.niveaus.includes(n)}
                onClick={() => zet("niveaus", wissel(f.niveaus, n))}
                className={`rounded-full border px-3 py-1 text-sm font-medium ${f.niveaus.includes(n) ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-brand"}`}
              >
                {NIVEAU_LABEL[n]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2.5 text-sm font-semibold">Richting</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SECTOREN.map((s) => {
            const aan = f.sectoren.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={aan}
                onClick={() => zet("sectoren", wissel(f.sectoren, s.id))}
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${
                  aan ? "border-transparent text-white" : "border-line bg-card hover:border-brand"
                }`}
                style={aan ? { background: s.kleur } : undefined}
              >
                <span className="text-base">{s.emoji}</span>
                <span className="truncate">{s.kort}</span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="mb-2.5 block text-sm font-semibold">Plaats</span>
        <select
          value={f.plaats}
          onChange={(e) => zet("plaats", e.target.value)}
          className="focus-ring w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm"
        >
          <option value="">Heel Nederland</option>
          {plaatsen.map(([p, n]) => (
            <option key={p} value={p}>
              {plaatsNaam(p)} ({n})
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="mb-3 flex justify-between text-sm font-semibold">
          Max. reistijd
          <span className="font-normal text-muted tabular">
            {f.maxReistijd >= GEEN_LIMIET ? "Geen limiet" : reistijdTekst(f.maxReistijd)}
          </span>
        </span>
        <Schuif
          label="Maximale reistijd"
          waarde={f.maxReistijd}
          min={15}
          max={GEEN_LIMIET}
          stap={5}
          zet={(n) => zet("maxReistijd", n)}
        />
        <p className="mt-2 text-xs text-muted">Vanaf {profiel.woonplaats.naam}, enkele reis met het OV</p>
      </div>

      {profiel.vooropleiding && (
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-sm">
            <span className="block font-semibold">Alleen wat ik mag doen</span>
            <span className="text-xs text-muted">Past bij je diploma</span>
          </span>
          <input
            type="checkbox"
            checked={f.toelaatbaar}
            onChange={(e) => zet("toelaatbaar", e.target.checked)}
            className="peer sr-only"
          />
          <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5" />
        </label>
      )}

      {actieveFilters.length > 0 && (
        <button
          type="button"
          onClick={() => setF({ ...LEEG, q: f.q, sort: f.sort })}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Alle filters wissen
        </button>
      )}
    </div>
  );

  return (
    <>
      <PaginaKop
        label="Zoeken"
        titel="Alle opleidingen"
        sub={`${data ? getal(data.opleidingen.length) : "Ruim 10.000"} mbo-, hbo- en wo-opleidingen. Gesorteerd op hoe goed ze bij jou passen.`}
      />

      <div className="sticky top-16 z-30 -mx-4 mb-5 bg-bg/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Zoek op opleiding, school of plaats</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={f.q}
              onChange={(e) => zet("q", e.target.value)}
              placeholder="Zoek op opleiding, school of plaats…"
              className="focus-ring w-full rounded-full border border-line bg-card py-3.5 pl-12 pr-4 text-[15px] shadow-zacht placeholder:text-muted"
            />
          </label>
          <button
            type="button"
            onClick={() => setPaneel(true)}
            className="focus-ring relative inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 font-semibold shadow-zacht lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {actieveFilters.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-brand-ink">
                {actieveFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <aside className="kaart sticky top-36 hidden h-fit max-h-[calc(100dvh-10rem)] overflow-y-auto p-5 lg:block">
          {filterPaneel}
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              <span className="display text-lg font-bold text-ink tabular">
                {gefilterd ? getal(gefilterd.length) : "…"}
              </span>{" "}
              opleidingen
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sorteer op</span>
              <select
                value={f.sort}
                onChange={(e) => zet("sort", e.target.value as Sortering)}
                className="focus-ring rounded-full border border-line bg-card px-3 py-1.5 font-medium"
              >
                <option value="match">Beste match</option>
                <option value="kosten">Laagste maandlasten</option>
                <option value="reistijd">Kortste reistijd</option>
                <option value="instroom">Meeste eerstejaars</option>
                <option value="naam">Naam (A–Z)</option>
              </select>
            </label>
          </div>
          {actieveFilters.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {actieveFilters.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.weg}
                  className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-sm font-medium text-bg"
                >
                  {a.label} <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}

          {!gefilterd || !geladen ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KaartSkelet />
            </div>
          ) : gefilterd.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {gefilterd.slice(0, aantal).map((r, i) => (
                  <OpleidingKaart key={r.opleiding.id} r={r} index={i % PER_PAGINA} />
                ))}
              </div>
              <div ref={einde} className="h-10" />
              {aantal < gefilterd.length && (
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setAantal((a) => a + PER_PAGINA)}
                    className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold hover:border-brand"
                  >
                    Toon meer ({getal(gefilterd.length - aantal)} over)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="kaart px-6 py-16 text-center">
              <p className="text-4xl">🧭</p>
              <p className="display mt-3 text-2xl font-bold">Niets gevonden</p>
              <p className="mt-1 text-muted">Probeer andere woorden, minder filters of een ruimere reistijd.</p>
              <button
                type="button"
                onClick={() => setF(LEEG)}
                className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg"
              >
                Alles tonen
              </button>
            </div>
          )}
        </section>
      </div>

      {paneel && (
        <div className="fixed inset-0 z-[1100] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPaneel(false)} />
          <div className="binnenkomen absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[2rem] bg-card p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line" />
            <div className="mb-6 flex items-center justify-between">
              <h2 className="display text-2xl font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setPaneel(false)}
                aria-label="Sluiten"
                className="rounded-full p-1.5 hover:bg-card-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPaneel}
            <button
              type="button"
              onClick={() => setPaneel(false)}
              className="mt-7 w-full rounded-full bg-ink py-4 font-semibold text-bg"
            >
              Toon {gefilterd ? getal(gefilterd.length) : ""} opleidingen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
