"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Share2 } from "lucide-react";
import { HOOFDRICHTINGEN, SECTOR } from "@/data/sectoren";
import {
  berekenUitslag,
  DIT_OF_DAT,
  LEGE_ANTWOORDEN,
  SCHAAL,
  SCHOOLVAKKEN,
  STELLINGEN,
  TOEKOMST,
  type Antwoorden,
} from "@/data/vragenlijst";
import { bereken, reistijdTekst } from "@/lib/bereken";
import { useData } from "@/lib/data-client";
import { useStore } from "@/lib/store";
import type { Profiel, SectorId, TaalVoorkeur, Wonen } from "@/lib/types";
import { DiplomaKiezer, diplomaCompleet } from "@/components/DiplomaKiezer";
import { Illustratie } from "@/components/Illustratie";
import { KaartSkelet, OpleidingKaart } from "@/components/OpleidingKaart";
import { Schuif } from "@/components/ui";
import { WoonplaatsKiezer } from "@/components/WoonplaatsKiezer";

const KompasRadar = dynamic(() => import("@/components/KompasRadar"), {
  ssr: false,
  loading: () => <div className="h-[320px] animate-pulse rounded-2xl bg-card-2" />,
});

type Stap =
  | "intro"
  | "jij"
  | "diploma"
  | "vakken"
  | `keuze:${number}`
  | "toekomst"
  | `stelling:${SectorId}`
  | "wonen"
  | "taal"
  | "geld"
  | "resultaat";

const STAPPEN: Stap[] = [
  "intro",
  "jij",
  "diploma",
  "vakken",
  ...DIT_OF_DAT.map((_, i) => `keuze:${i}` as const),
  "toekomst",
  ...HOOFDRICHTINGEN.map((s) => `stelling:${s}` as const),
  "wonen",
  "taal",
  "geld",
  "resultaat",
];
const VRAGEN = STAPPEN.length - 2;
const TUSSENSTAND = "studiekompas:test-v3";
const ANTWOORDEN_SLEUTEL = "studiekompas:antwoorden";

const INKOMENS: { label: string; waarde: number | null }[] = [
  { label: "Minder dan € 45.000", waarde: 40000 },
  { label: "€ 45.000 – € 70.000", waarde: 57500 },
  { label: "€ 70.000 – € 100.000", waarde: 85000 },
  { label: "Meer dan € 100.000", waarde: 120000 },
  { label: "Weet ik niet", waarde: null },
];
const LENEN: { label: string; tekst: string; waarde: number }[] = [
  { label: "Liever niet", tekst: "Ik wil zo min mogelijk lenen", waarde: 0 },
  { label: "Een beetje", tekst: "Tot ± € 200 per maand", waarde: 200 },
  { label: "Als het moet", tekst: "Tot ± € 550 per maand", waarde: 550 },
];

function lees<T>(sleutel: string, opslag: Storage): T | null {
  try {
    return JSON.parse(opslag.getItem(sleutel) ?? "null") as T | null;
  } catch {
    return null;
  }
}

export default function Vragenlijst() {
  const { profiel, geladen, slaProfielOp } = useStore();
  const [stap, setStap] = useState<Stap>("intro");
  const [concept, setConcept] = useState<Profiel>(profiel);
  const [a, setA] = useState<Antwoorden>(LEGE_ANTWOORDEN);
  const [richting, setRichting] = useState(1);
  const [hersteld, setHersteld] = useState(false);

  useEffect(() => {
    if (!geladen || hersteld) return;
    setHersteld(true);
    setConcept(profiel);
    const vorige = typeof window !== "undefined" ? lees<Antwoorden>(ANTWOORDEN_SLEUTEL, localStorage) : null;
    if (vorige) setA({ ...LEGE_ANTWOORDEN, ...vorige });
    const t = lees<{ stap: Stap; concept: Profiel; a: Antwoorden }>(TUSSENSTAND, sessionStorage);
    if (t && STAPPEN.includes(t.stap) && t.stap !== "resultaat") {
      setConcept(t.concept);
      setA(t.a);
      setStap(t.stap);
    }
  }, [geladen, hersteld, profiel]);

  useEffect(() => {
    if (!hersteld || stap === "intro" || stap === "resultaat") return;
    try {
      sessionStorage.setItem(TUSSENSTAND, JSON.stringify({ stap, concept, a }));
    } catch {}
  }, [hersteld, stap, concept, a]);

  const nr = STAPPEN.indexOf(stap);
  const ga = (n: number) => {
    setRichting(n > nr ? 1 : -1);
    setStap(STAPPEN[Math.max(0, Math.min(STAPPEN.length - 1, n))]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const volgende = () => ga(nr + 1);
  const vorige = () => ga(nr - 1);
  const later = () => setTimeout(volgende, 320);
  const zet = <K extends keyof Profiel>(k: K, v: Profiel[K]) => setConcept((c) => ({ ...c, [k]: v }));

  const uitslag = useMemo(() => berekenUitslag(a), [a]);

  const afronden = async () => {
    const p: Profiel = { ...concept, interesse: uitslag.interesse, vragenlijstKlaar: true };
    setConcept(p);
    await slaProfielOp(p);
    try {
      localStorage.setItem(ANTWOORDEN_SLEUTEL, JSON.stringify(a));
      sessionStorage.removeItem(TUSSENSTAND);
    } catch {}
    ga(STAPPEN.length - 1);
  };

  const keuzeNr = stap.startsWith("keuze:") ? Number(stap.slice(6)) : null;
  const stellingSector = stap.startsWith("stelling:") ? (stap.slice(9) as SectorId) : null;

  // Toetsenbord: 1–5 bij stellingen, 1/2 bij dit-of-dat, Enter = volgende
  useEffect(() => {
    const toets = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      if (stellingSector && /^[1-5]$/.test(e.key)) {
        setA((x) => ({ ...x, stellingen: { ...x.stellingen, [stellingSector]: Number(e.key) - 1 } }));
        later();
      } else if (keuzeNr !== null && (e.key === "1" || e.key === "2")) {
        kiesKeuze(keuzeNr, (Number(e.key) - 1) as 0 | 1);
      }
    };
    window.addEventListener("keydown", toets);
    return () => window.removeEventListener("keydown", toets);
  });

  const kiesKeuze = (i: number, k: 0 | 1 | 2 | 3) => {
    setA((x) => {
      const keuzes = [...x.keuzes];
      keuzes[i] = k;
      return { ...x, keuzes };
    });
    later();
  };

  if (stap === "intro")
    return <Intro start={volgende} opnieuw={profiel.vragenlijstKlaar} naarResultaat={() => ga(STAPPEN.length - 1)} />;
  if (stap === "resultaat") return <Resultaat profiel={concept} redenen={uitslag.redenen} opnieuw={() => ga(1)} />;

  const magDoor =
    stap === "diploma"
      ? diplomaCompleet(concept)
      : stap === "vakken"
        ? a.vakken.length > 0
        : stap === "toekomst"
          ? a.toekomst.length > 0
          : true;
  const autoStap = keuzeNr !== null || stellingSector !== null;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={vorige}
            aria-label="Vorige vraag"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-[3px] flex-1 overflow-hidden bg-line">
            <div className="h-full bg-ink transition-all duration-500" style={{ width: `${(nr / VRAGEN) * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-muted tabular">
            {String(nr).padStart(2, "0")} / {VRAGEN}
          </span>
        </div>

        <div key={stap} className="inschuiven" style={{ ["--richting" as string]: richting }}>
          {stap === "jij" && (
            <Vraag
              label="Even kennismaken"
              titel="Hoe heet je, en waar woon je?"
              sub="Vanaf je woonplaats rekenen we de reistijd naar elke universiteit uit."
            >
              <div className="space-y-3">
                <input
                  value={concept.naam}
                  onChange={(e) => zet("naam", e.target.value)}
                  placeholder="Je voornaam"
                  autoComplete="given-name"
                  className="focus-ring w-full rounded-xl border border-line bg-card px-4 py-3.5 text-[15px]"
                />
                <WoonplaatsKiezer waarde={concept.woonplaats} kies={(w) => zet("woonplaats", w)} />
              </div>
            </Vraag>
          )}

          {stap === "diploma" && (
            <Vraag
              label="Toelating"
              titel="Wat is jouw route naar de universiteit?"
              sub="Met je profiel en vakken checken we straks per studie of je toelaatbaar bent."
            >
              <DiplomaKiezer waarde={concept} zet={(w) => setConcept((c) => ({ ...c, ...w }))} />
            </Vraag>
          )}

          {stap === "vakken" && (
            <Vraag
              label="Op school"
              titel="Welke vakken vind je het leukst?"
              sub={`Kies er maximaal drie. ${a.vakken.length}/3 gekozen.`}
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SCHOOLVAKKEN.map((v) => {
                  const aan = a.vakken.includes(v.naam);
                  const vol = !aan && a.vakken.length >= 3;
                  return (
                    <button
                      key={v.naam}
                      type="button"
                      aria-pressed={aan}
                      disabled={vol}
                      onClick={() =>
                        setA((x) => ({
                          ...x,
                          vakken: aan ? x.vakken.filter((n) => n !== v.naam) : [...x.vakken, v.naam],
                        }))
                      }
                      className={`focus-ring flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:opacity-35 ${
                        aan ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-ink/40"
                      }`}
                    >
                      {v.naam}
                      {aan && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </Vraag>
          )}

          {keuzeNr !== null && (
            <Vraag label={`Dit of dat · ${keuzeNr + 1} van ${DIT_OF_DAT.length}`} titel="Wat zou je liever doen?">
              <div className="grid grid-cols-2 gap-3">
                {DIT_OF_DAT[keuzeNr].map((k, i) => {
                  const gekozen = a.keuzes[keuzeNr] === i || a.keuzes[keuzeNr] === 2;
                  return (
                    <button
                      key={k.tekst}
                      type="button"
                      aria-pressed={gekozen}
                      onClick={() => kiesKeuze(keuzeNr, i as 0 | 1)}
                      className={`focus-ring group overflow-hidden rounded-2xl border text-left transition-all active:scale-[.98] ${
                        gekozen ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink/50"
                      }`}
                    >
                      <Illustratie
                        sector={k.sector}
                        className="block aspect-[3/2] w-full transition-transform duration-500 group-hover:scale-[1.03]"
                        tekenen
                      />
                      <span className="block bg-card p-4">
                        <span className="bovenschrift">{i === 0 ? "A" : "B"}</span>
                        <span className="display mt-1 block text-lg leading-snug sm:text-xl">{k.tekst}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-center gap-2 text-sm">
                {(
                  [
                    [2, "Allebei leuk"],
                    [3, "Geen van beide"],
                  ] as const
                ).map(([w, label]) => (
                  <button
                    key={w}
                    type="button"
                    aria-pressed={a.keuzes[keuzeNr] === w}
                    onClick={() => kiesKeuze(keuzeNr, w)}
                    className={`rounded-full border px-4 py-2 transition-colors ${a.keuzes[keuzeNr] === w ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Vraag>
          )}

          {stap === "toekomst" && (
            <Vraag
              label="Over tien jaar"
              titel="Waar zie je jezelf werken?"
              sub={`Kies er één of twee. ${a.toekomst.length}/2 gekozen.`}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {TOEKOMST.map((t) => {
                  const aan = a.toekomst.includes(t.sector);
                  const vol = !aan && a.toekomst.length >= 2;
                  return (
                    <button
                      key={t.sector}
                      type="button"
                      aria-pressed={aan}
                      disabled={vol}
                      onClick={() =>
                        setA((x) => ({
                          ...x,
                          toekomst: aan ? x.toekomst.filter((s) => s !== t.sector) : [...x.toekomst, t.sector],
                        }))
                      }
                      className={`focus-ring relative overflow-hidden rounded-xl border text-left transition-all disabled:opacity-40 ${
                        aan ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink/50"
                      }`}
                    >
                      <Illustratie sector={t.sector} className="block aspect-[3/2] w-full" />
                      <span className="block bg-card p-3">
                        <span className="block text-sm font-medium leading-tight">{t.titel}</span>
                        <span className="text-xs text-muted">{t.tekst}</span>
                      </span>
                      {aan && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-bg">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Vraag>
          )}

          {stellingSector && (
            <section>
              <p className="bovenschrift mb-6">
                Stelling {HOOFDRICHTINGEN.indexOf(stellingSector) + 1} van {HOOFDRICHTINGEN.length}
              </p>
              <blockquote className="display text-[32px] leading-[1.15] sm:text-[44px]">
                &ldquo;{STELLINGEN[stellingSector]}&rdquo;
              </blockquote>
              <div
                className="mt-10 grid grid-cols-5 border border-line"
                role="radiogroup"
                aria-label={STELLINGEN[stellingSector]}
              >
                {SCHAAL.map((label, w) => {
                  const gekozen = a.stellingen[stellingSector] === w;
                  return (
                    <button
                      key={label}
                      type="button"
                      role="radio"
                      aria-checked={gekozen}
                      onClick={() => {
                        setA((x) => ({ ...x, stellingen: { ...x.stellingen, [stellingSector]: w } }));
                        later();
                      }}
                      className={`focus-ring flex flex-col items-center gap-2 border-r border-line px-1 py-4 text-center transition-colors last:border-r-0 ${
                        gekozen ? "bg-ink text-bg" : "bg-card hover:bg-card-2"
                      }`}
                    >
                      <span className="display text-2xl tabular">{w + 1}</span>
                      <span className={`text-[11px] leading-tight sm:text-xs ${gekozen ? "" : "text-muted"}`}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 hidden text-center text-xs text-muted sm:block">Tip: toets 1 t/m 5</p>
            </section>
          )}

          {stap === "wonen" && (
            <Vraag
              label="Wonen"
              titel="Ga je op kamer, of blijf je thuis wonen?"
              sub="Dit maakt een groot verschil in wat je per maand kwijt bent."
            >
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["thuis", "Thuis blijven"],
                    ["allebei", "Weet ik nog niet"],
                    ["kamer", "Op kamer"],
                  ] as [Wonen, string][]
                ).map(([w, titel]) => (
                  <button
                    key={w}
                    type="button"
                    aria-pressed={concept.wonen === w}
                    onClick={() => zet("wonen", w)}
                    className={`rounded-xl border px-3 py-4 text-sm transition-colors ${concept.wonen === w ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-ink/40"}`}
                  >
                    {titel}
                  </button>
                ))}
              </div>
              <div className="mt-8">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="bovenschrift">Maximaal reizen per dag (enkele reis)</span>
                  <span className="display text-2xl tabular">{reistijdTekst(concept.maxReistijd)}</span>
                </div>
                <Schuif
                  label="Maximale reistijd"
                  waarde={concept.maxReistijd}
                  min={15}
                  max={150}
                  stap={5}
                  zet={(n) => zet("maxReistijd", n)}
                />
              </div>
            </Vraag>
          )}

          {stap === "taal" && (
            <Vraag
              label="Taal"
              titel="Wil je in het Nederlands of in het Engels studeren?"
              sub="Een groot deel van de universitaire bachelors is (ook) Engelstalig."
            >
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["nl", "Nederlands", "Liefst in het Nederlands"],
                    ["en", "Engels", "Ik wil juist in het Engels"],
                    ["beide", "Maakt niet uit", "Allebei prima"],
                  ] as [TaalVoorkeur, string, string][]
                ).map(([w, titel, tekst]) => (
                  <button
                    key={w}
                    type="button"
                    aria-pressed={concept.taal === w}
                    onClick={() => {
                      zet("taal", w);
                      later();
                    }}
                    className={`rounded-xl border p-4 text-left transition-colors ${concept.taal === w ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-ink/40"}`}
                  >
                    <span className="display block text-xl">{titel}</span>
                    <span className={`text-sm ${concept.taal === w ? "opacity-80" : "text-muted"}`}>{tekst}</span>
                  </button>
                ))}
              </div>
            </Vraag>
          )}

          {stap === "geld" && (
            <Vraag
              label="Geld"
              titel="Nog twee vragen over geld"
              sub="Hiermee schatten we je studiefinanciering van DUO. Precies uitrekenen kan later bij Geld & DUO."
            >
              <p className="bovenschrift mb-2">Wat verdienen je ouders samen, ongeveer per jaar?</p>
              <div className="flex flex-wrap gap-2">
                {INKOMENS.map((i) => (
                  <button
                    key={i.label}
                    type="button"
                    aria-pressed={concept.ouderInkomen === i.waarde}
                    onClick={() => zet("ouderInkomen", i.waarde)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${concept.ouderInkomen === i.waarde ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-ink/40"}`}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
              <p className="bovenschrift mb-2 mt-8">Hoe sta je tegenover lenen bij DUO?</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {LENEN.map((l) => (
                  <button
                    key={l.label}
                    type="button"
                    aria-pressed={concept.maxLenen === l.waarde}
                    onClick={() => zet("maxLenen", l.waarde)}
                    className={`rounded-xl border p-4 text-left transition-colors ${concept.maxLenen === l.waarde ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-ink/40"}`}
                  >
                    <span className="display block text-lg">{l.label}</span>
                    <span className={`text-sm ${concept.maxLenen === l.waarde ? "opacity-80" : "text-muted"}`}>
                      {l.tekst}
                    </span>
                  </button>
                ))}
              </div>
            </Vraag>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          {autoStap ? (
            <button
              type="button"
              onClick={volgende}
              className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Sla over
            </button>
          ) : (
            <span />
          )}
          {stap === "geld" ? (
            <button
              type="button"
              onClick={afronden}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-medium text-bg hover:opacity-90"
            >
              Bekijk mijn uitslag <ArrowRight className="h-4 w-4" />
            </button>
          ) : !autoStap ? (
            <button
              type="button"
              onClick={volgende}
              disabled={!magDoor}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-25"
            >
              Volgende <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <LiveKompas interesse={uitslag.interesse} />
    </div>
  );
}

/** Zijkolom op de laptop: je kompas groeit mee terwijl je antwoordt */
function LiveKompas({ interesse }: { interesse: Partial<Record<SectorId, number>> }) {
  const lijst = HOOFDRICHTINGEN.map((s) => [s, interesse[s] ?? 0] as const).sort((x, y) => y[1] - x[1]);
  const leeg = lijst.every(([, w]) => w === 0);
  return (
    <aside className="sticky top-24 hidden h-fit lg:block">
      <p className="bovenschrift mb-4">Je kompas tot nu toe</p>
      {leeg ? (
        <p className="text-sm text-muted">Begin met antwoorden, dan zie je hier welke richtingen opvallen.</p>
      ) : (
        <ul className="space-y-3">
          {lijst.map(([s, w]) => (
            <li key={s}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{SECTOR[s].naam}</span>
                <span className="font-mono text-xs text-muted tabular">{Math.round(w * 100)}</span>
              </div>
              <div className="h-[3px] bg-line">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${w * 100}%`, background: SECTOR[s].kleur }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function Vraag({
  label,
  titel,
  sub,
  children,
}: {
  label: string;
  titel: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="bovenschrift mb-3">{label}</p>
      <h1 className="display text-[32px] leading-[1.1] sm:text-5xl">{titel}</h1>
      {sub && <p className="mt-3 text-muted">{sub}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Intro({ start, opnieuw, naarResultaat }: { start: () => void; opnieuw: boolean; naarResultaat: () => void }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
      <div className="binnenkomen">
        <p className="bovenschrift mb-4">Studietest · ± 6 minuten</p>
        <h1 className="display text-[44px] leading-[1.02] sm:text-7xl">
          Welke studie <em className="italic">past</em> bij jou?
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted">
          Geen saaie vragenlijst: je kiest je favoriete vakken, maakt acht keer een keuze tussen twee dingen, kiest waar
          je jezelf ziet werken en reageert op tien stellingen. Daarna zie je je kompas, waarom het zo uitvalt, en de
          bachelors die het beste bij je passen.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={start}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-medium text-bg hover:opacity-90"
          >
            {opnieuw ? "Test opnieuw doen" : "Begin de test"} <ArrowRight className="h-4 w-4" />
          </button>
          {opnieuw && (
            <button
              type="button"
              onClick={naarResultaat}
              className="text-sm underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              Mijn vorige uitslag bekijken
            </button>
          )}
        </div>
        <dl className="mt-10 grid max-w-md grid-cols-3 border-t border-line pt-5">
          {[
            ["4", "soorten vragen"],
            ["10", "richtingen"],
            ["433", "bachelors"],
          ].map(([g, t]) => (
            <div key={t}>
              <dt className="display text-3xl tabular">{g}</dt>
              <dd className="text-sm text-muted">{t}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="grid grid-cols-2 gap-3" aria-hidden>
        {(["beta", "taal", "zorg", "economie"] as SectorId[]).map((s, i) => (
          <div
            key={s}
            className={`overflow-hidden rounded-2xl border border-line binnenkomen ${i % 2 ? "mt-8" : ""}`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <Illustratie sector={s} className="block aspect-[3/2] w-full" tekenen />
            <p className="bg-card px-3 py-2 text-sm">{SECTOR[s].naam}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Resultaat({
  profiel,
  redenen,
  opnieuw,
}: {
  profiel: Profiel;
  redenen: Partial<Record<SectorId, string[]>>;
  opnieuw: () => void;
}) {
  const data = useData();
  const top = useMemo(
    () =>
      HOOFDRICHTINGEN.map((s) => [s, profiel.interesse[s] ?? 0] as const)
        .sort((x, y) => y[1] - x[1])
        .slice(0, 3),
    [profiel.interesse],
  );
  const matches = useMemo(() => {
    if (!data) return null;
    const alle = data.opleidingen.map((o) => bereken(o, profiel)).filter((r) => r.match.toelaatbaar);
    alle.sort((x, y) => y.match.score - x.match.score || x.reistijd - y.reistijd);
    const gezien = new Set<string>();
    return alle
      .filter((r) => (gezien.has(r.opleiding.naam) ? false : (gezien.add(r.opleiding.naam), true)))
      .slice(0, 6);
  }, [data, profiel]);

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div className="binnenkomen">
          <p className="bovenschrift mb-4">Jouw uitslag</p>
          <h1 className="display text-[40px] leading-[1.05] sm:text-6xl">
            {profiel.naam ? `${profiel.naam}, je` : "Je"} kompas wijst naar{" "}
            <em className="italic">{top[0] ? SECTOR[top[0][0]].naam.toLowerCase() : "…"}</em>
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <DeelKnop profiel={profiel} />
            <button
              type="button"
              onClick={opnieuw}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm hover:border-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Antwoorden aanpassen
            </button>
          </div>
        </div>
        <div className="kaart p-3">
          <KompasRadar interesse={profiel.interesse} />
        </div>
      </section>

      <section>
        <p className="bovenschrift mb-2">Je top 3</p>
        <h2 className="display mb-6 text-3xl">Waarom deze richtingen?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {top.map(([s, w], i) => (
            <article key={s} className="kaart overflow-hidden">
              <Illustratie sector={s} className="block aspect-[3/2] w-full" tekenen />
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="bovenschrift">Nummer {i + 1}</p>
                  <p className="display text-2xl tabular">{Math.round(w * 100)}%</p>
                </div>
                <h3 className="display mt-1 text-2xl">{SECTOR[s].naam}</h3>
                <p className="mt-1 text-sm text-muted">{SECTOR[s].tekst}</p>
                {(redenen[s] ?? []).length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                    {(redenen[s] ?? []).slice(0, 3).map((r) => (
                      <li key={r} className="flex gap-2">
                        <span className="text-muted">–</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs text-muted">Bijvoorbeeld: {SECTOR[s].voorbeelden}</p>
                <Link href={`/zoeken?sector=${s}`} className="mt-3 inline-block text-sm streep">
                  Bekijk deze bachelors
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-line pb-3">
          <div>
            <p className="bovenschrift mb-1">Uit {data ? data.opleidingen.length : "…"} bachelors</p>
            <h2 className="display text-3xl">Je beste matches</h2>
          </div>
          <Link href="/zoeken" className="text-sm streep">
            Alle matches
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches ? matches.map((r, i) => <OpleidingKaart key={r.opleiding.id} r={r} index={i} />) : <KaartSkelet />}
        </div>
        <p className="mt-6 text-sm text-muted">
          Je match-score rekent ook met geld, op basis van een schatting van je studiefinanciering.{" "}
          <Link href="/geld" className="streep text-ink">
            Reken het precies uit bij Geld & DUO
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

function DeelKnop({ profiel }: { profiel: Profiel }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  const deel = async () => {
    const top = HOOFDRICHTINGEN.map((s) => [s, profiel.interesse[s] ?? 0] as const)
      .sort((x, y) => y[1] - x[1])
      .slice(0, 3);
    const tekst = `Mijn StudieKompas:\n${top.map(([s, w], i) => `${i + 1}. ${SECTOR[s].naam} (${Math.round(w * 100)}%)`).join("\n")}\nDoe de studietest ook:`;
    const url = `${window.location.origin}/vragenlijst`;
    try {
      if (navigator.share) await navigator.share({ title: "Mijn StudieKompas", text: tekst, url });
      else {
        await navigator.clipboard.writeText(`${tekst} ${url}`);
        setGekopieerd(true);
        setTimeout(() => setGekopieerd(false), 2500);
      }
    } catch {
      /* geannuleerd */
    }
  };
  return (
    <button
      type="button"
      onClick={deel}
      className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-bg hover:opacity-90"
    >
      {gekopieerd ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
      {gekopieerd ? "Gekopieerd" : "Deel je uitslag"}
    </button>
  );
}
