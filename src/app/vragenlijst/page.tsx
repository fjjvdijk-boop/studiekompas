"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Home as HomeIcon,
  RotateCcw,
  Share2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SECTOR } from "@/data/sectoren";
import { ANTWOORDEN, STELLINGEN, VOLGORDE, interesseUitAntwoorden } from "@/data/vragenlijst";
import { bereken, euro, reistijdTekst, TOELATING } from "@/lib/bereken";
import { useData } from "@/lib/data-client";
import { useStore } from "@/lib/store";
import type { Profiel, SectorId, Soort, Vooropleiding, Wonen } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { OpleidingKaart, KaartSkelet } from "@/components/OpleidingKaart";
import { Schuif } from "@/components/ui";
import { WoonplaatsKiezer } from "@/components/WoonplaatsKiezer";

const KompasRadar = dynamic(() => import("@/components/KompasRadar"), {
  ssr: false,
  loading: () => <div className="h-[340px] animate-pulse rounded-3xl bg-card-2" />,
});

type Stap = "intro" | "jij" | "school" | `s:${SectorId}` | "leren" | "wonen" | "geld" | "resultaat";
const STAPPEN: Stap[] = [
  "intro",
  "jij",
  "school",
  ...VOLGORDE.map((s) => `s:${s}` as const),
  "leren",
  "wonen",
  "geld",
  "resultaat",
];
const VRAGEN_STAPPEN = STAPPEN.length - 2; // zonder intro en resultaat

type Antwoorden = Partial<Record<SectorId, (number | null)[]>>;
const TUSSENSTAND = "studiekompas:test-tussenstand";

/** Zet bestaande interesse terug naar ongeveer dezelfde antwoorden, zodat je de test kunt aanpassen */
function antwoordenUitProfiel(p: Profiel): Antwoorden {
  if (!p.vragenlijstKlaar) return {};
  const uit: Antwoorden = {};
  for (const s of VOLGORDE)
    if (p.interesse[s] !== undefined) uit[s] = Array(3).fill(Math.round((p.interesse[s] ?? 0) * 4));
  return uit;
}

export default function Vragenlijst() {
  const { profiel, geladen, slaProfielOp } = useStore();
  const [stap, setStap] = useState<Stap>("intro");
  const [concept, setConcept] = useState<Profiel>(profiel);
  const [antwoorden, setAntwoorden] = useState<Antwoorden>({});
  const [richting, setRichting] = useState(1);

  useEffect(() => {
    if (geladen) {
      setConcept(profiel);
      setAntwoorden(antwoordenUitProfiel(profiel));
    }
    // alleen bij het laden overnemen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geladen]);

  const nr = STAPPEN.indexOf(stap);
  const ga = (n: number) => {
    setRichting(n > nr ? 1 : -1);
    setStap(STAPPEN[Math.max(0, Math.min(STAPPEN.length - 1, n))]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const volgende = () => ga(nr + 1);
  const vorige = () => ga(nr - 1);

  const zet = <K extends keyof Profiel>(k: K, v: Profiel[K]) => setConcept((c) => ({ ...c, [k]: v }));

  const afronden = async () => {
    const p: Profiel = { ...concept, interesse: interesseUitAntwoorden(antwoorden), vragenlijstKlaar: true };
    setConcept(p);
    await slaProfielOp(p);
    try {
      sessionStorage.removeItem(TUSSENSTAND);
    } catch {}
    ga(STAPPEN.length - 1);
  };

  const sector = stap.startsWith("s:") ? (stap.slice(2) as SectorId) : null;
  const vragen = sector ? (antwoorden[sector] ?? [null, null, null]) : [];
  const magDoor = stap === "school" ? concept.vooropleiding !== null : sector ? vragen.every((v) => v !== null) : true;

  const beantwoord = (i: number, w: number) => {
    if (!sector) return;
    const nieuw = [...vragen];
    nieuw[i] = w;
    setAntwoorden((a) => ({ ...a, [sector]: nieuw }));
    if (nieuw.every((v) => v !== null) && vragen.some((v) => v === null)) setTimeout(volgende, 380);
  };

  // Tussenstand bewaren, zodat je verder kunt na per ongeluk verversen
  const [hersteld, setHersteld] = useState(false);
  useEffect(() => {
    if (!geladen || hersteld) return;
    setHersteld(true);
    try {
      const t = JSON.parse(sessionStorage.getItem(TUSSENSTAND) ?? "null") as {
        stap: Stap;
        concept: Profiel;
        antwoorden: Antwoorden;
      } | null;
      if (t && STAPPEN.includes(t.stap)) {
        setConcept(t.concept);
        setAntwoorden(t.antwoorden);
        setStap(t.stap);
      }
    } catch {}
  }, [geladen, hersteld]);
  useEffect(() => {
    if (!hersteld || stap === "intro" || stap === "resultaat") return;
    try {
      sessionStorage.setItem(TUSSENSTAND, JSON.stringify({ stap, concept, antwoorden }));
    } catch {}
  }, [hersteld, stap, concept, antwoorden]);

  // Toetsenbord: 1–5 beantwoordt de volgende stelling, Enter gaat door
  useEffect(() => {
    const toets = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (sector && /^[1-5]$/.test(e.key)) {
        const i = vragen.findIndex((v) => v === null);
        beantwoord(i === -1 ? 2 : i, Number(e.key) - 1);
      } else if (e.key === "Enter" && magDoor && stap !== "intro" && stap !== "resultaat" && stap !== "geld")
        volgende();
    };
    window.addEventListener("keydown", toets);
    return () => window.removeEventListener("keydown", toets);
  });

  if (stap === "intro")
    return <Intro start={volgende} opnieuw={profiel.vragenlijstKlaar} naarResultaat={() => ga(STAPPEN.length - 1)} />;
  if (stap === "resultaat") return <Resultaat profiel={concept} opnieuw={() => ga(1)} />;

  const kleur = sector ? SECTOR[sector].kleur : "#4f39f6";

  return (
    <div className="mx-auto max-w-2xl">
      {/* Voortgang */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={vorige}
          aria-label="Vorige vraag"
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card hover:border-brand"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="h-2.5 overflow-hidden rounded-full bg-card-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(nr / VRAGEN_STAPPEN) * 100}%`,
                background: `linear-gradient(90deg, #7c6cff, ${kleur})`,
              }}
            />
          </div>
        </div>
        <span className="w-14 text-right text-sm font-semibold text-muted tabular">
          {nr}/{VRAGEN_STAPPEN}
        </span>
      </div>

      <div key={stap} className="binnenkomen" data-richting={richting}>
        {stap === "jij" && (
          <Vraag
            label="Even kennismaken"
            titel="Hoe heet je, en waar woon je?"
            sub="Vanaf je woonplaats rekenen we de reistijd naar elke school uit."
          >
            <div className="space-y-4">
              <input
                value={concept.naam}
                onChange={(e) => zet("naam", e.target.value)}
                placeholder="Je voornaam"
                autoComplete="given-name"
                className="focus-ring w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] font-medium"
              />
              <WoonplaatsKiezer waarde={concept.woonplaats} kies={(w) => zet("woonplaats", w)} />
            </div>
          </Vraag>
        )}

        {stap === "school" && (
          <Vraag
            label="Je diploma"
            titel="Welk diploma haal je (of heb je)?"
            sub="Zo laten we alleen opleidingen zien waar je echt naartoe kunt."
          >
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["vmbo", "vmbo", "🎒", "Door naar het mbo"],
                  ["havo", "havo", "📘", "Door naar mbo of hbo"],
                  ["vwo", "vwo", "🎓", "Door naar mbo, hbo of universiteit"],
                  ["mbo4", "mbo 4", "🛠️", "Door naar het hbo"],
                ] as [Vooropleiding, string, string, string][]
              ).map(([w, label, emoji, tekst]) => (
                <Keuze
                  key={w}
                  gekozen={concept.vooropleiding === w}
                  onClick={() => {
                    setConcept((c) => ({ ...c, vooropleiding: w, soorten: TOELATING[w] }));
                  }}
                  emoji={emoji}
                  titel={label}
                  tekst={tekst}
                />
              ))}
            </div>
          </Vraag>
        )}

        {sector && (
          <SectorVraag sector={sector} nr={VOLGORDE.indexOf(sector) + 1} antwoorden={vragen} kies={beantwoord} />
        )}

        {stap === "leren" && (
          <Vraag
            label="Hoe leer jij?"
            titel="Leer je liever door te doen, of door te snappen?"
            sub="Mbo is het meest praktisch, de universiteit het meest theoretisch."
          >
            <div className="kaart p-6">
              <div className="mb-5 flex justify-between text-sm font-semibold">
                <span>🔧 Lekker doen</span>
                <span>🧠 Diep nadenken</span>
              </div>
              <Schuif
                label="Leerstijl"
                waarde={concept.leerstijl * 100}
                min={0}
                max={100}
                stap={5}
                zet={(n) => zet("leerstijl", n / 100)}
              />
              <p className="mt-5 rounded-2xl bg-card-2 p-4 text-sm text-muted">
                {concept.leerstijl < 0.34
                  ? "Je leert het liefst in de praktijk: met je handen, op stage of in een echt bedrijf. Mbo en praktische hbo-opleidingen passen daar goed bij."
                  : concept.leerstijl < 0.67
                    ? "Je houdt van een mix van theorie en praktijk. Dat is precies wat het hbo doet."
                    : "Je wilt de diepte in: theorieën snappen, onderzoek doen en kritisch nadenken. Dat past bij de universiteit."}
              </p>
            </div>
          </Vraag>
        )}

        {stap === "wonen" && (
          <Vraag
            label="Wonen"
            titel="Blijf je thuis wonen of ga je op kamer?"
            sub="Dit heeft veel invloed op wat studeren je per maand kost."
          >
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ["thuis", "🏠", "Thuis blijven"],
                  ["allebei", "🤷", "Weet ik nog niet"],
                  ["kamer", "🔑", "Op kamer"],
                ] as [Wonen, string, string][]
              ).map(([w, emoji, titel]) => (
                <Keuze
                  key={w}
                  gekozen={concept.wonen === w}
                  onClick={() => zet("wonen", w)}
                  emoji={emoji}
                  titel={titel}
                />
              ))}
            </div>
            <div className="kaart mt-4 p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <Clock className="h-4 w-4 text-brand" /> Max. reistijd per dag (enkele reis)
                </span>
                <span className="display text-2xl font-bold tabular">{reistijdTekst(concept.maxReistijd)}</span>
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

        {stap === "geld" && (
          <Vraag
            label="Geld"
            titel="Hoeveel mag studeren per maand kosten?"
            sub="Alles samen: huur, eten, verzekering, collegegeld of lesgeld, boeken."
          >
            <div className="kaart p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <Wallet className="h-4 w-4 text-brand" /> Budget per maand
                </span>
                <span className="display text-3xl font-bold tabular">{euro(concept.budget)}</span>
              </div>
              <Schuif
                label="Budget"
                waarde={concept.budget}
                min={300}
                max={2000}
                stap={25}
                zet={(n) => zet("budget", n)}
              />
              <p className="mt-5 rounded-2xl bg-card-2 p-4 text-sm text-muted">
                Thuis wonen kost gemiddeld ± €500 per maand, een kamer in een studentenstad € 1.200–1.800. Je kunt dit
                later altijd aanpassen.
              </p>
            </div>
          </Vraag>
        )}
      </div>

      {/* Knoppen */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {sector ? (
          <button
            type="button"
            onClick={volgende}
            className="focus-ring rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink"
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
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#4f39f6] px-7 py-3.5 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(79,57,246,.9)] hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" /> Bekijk mijn matches
          </button>
        ) : (
          <button
            type="button"
            onClick={volgende}
            disabled={!magDoor}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Volgende <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
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
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand">{label}</p>
      <h1 className="display text-3xl font-bold leading-tight sm:text-4xl">{titel}</h1>
      {sub && <p className="mt-2 text-muted">{sub}</p>}
      <div className="mt-7">{children}</div>
    </section>
  );
}

function Keuze({
  gekozen,
  onClick,
  emoji,
  titel,
  tekst,
}: {
  gekozen: boolean;
  onClick: () => void;
  emoji: string;
  titel: string;
  tekst?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={gekozen}
      className={`focus-ring relative flex flex-col items-start gap-2 rounded-3xl border-2 p-4 text-left transition-all active:scale-[.98] sm:p-5 ${
        gekozen ? "border-brand bg-brand-soft shadow-groot" : "border-line bg-card hover:border-brand/50"
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="display text-lg font-bold leading-tight">{titel}</span>
      {tekst && <span className="text-sm text-muted">{tekst}</span>}
      {gekozen && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-ink">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function SectorVraag({
  sector,
  nr,
  antwoorden,
  kies,
}: {
  sector: SectorId;
  nr: number;
  antwoorden: (number | null)[];
  kies: (i: number, w: number) => void;
}) {
  const s = SECTOR[sector];
  return (
    <section>
      <div className="mb-6 flex items-center gap-4">
        <span
          className="zweven flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] text-5xl"
          style={{ background: `color-mix(in oklab, ${s.kleur} 18%, transparent)`, ["--r" as string]: "-4deg" }}
        >
          {s.emoji}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: s.kleur }}>
            Gebied {nr} van 14
          </p>
          <h1 className="display text-3xl font-bold leading-tight sm:text-4xl">{s.naam}</h1>
          <p className="mt-1 text-sm text-muted">{s.tekst}</p>
        </div>
      </div>
      <ol className="space-y-3">
        {STELLINGEN[sector].map((stelling, i) => (
          <li key={i} className="kaart p-4 sm:p-5">
            <p className="mb-3.5 font-semibold sm:text-[17px]">{stelling}</p>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2" role="radiogroup" aria-label={stelling}>
              {ANTWOORDEN.map((a) => {
                const gekozen = antwoorden[i] === a.waarde;
                return (
                  <button
                    key={a.waarde}
                    type="button"
                    role="radio"
                    aria-checked={gekozen}
                    onClick={() => kies(i, a.waarde)}
                    className={`focus-ring flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-2.5 transition-all active:scale-95 ${
                      gekozen ? "scale-[1.04] text-white" : "border-transparent bg-card-2 hover:bg-line"
                    }`}
                    style={
                      gekozen
                        ? { background: s.kleur, borderColor: s.kleur, boxShadow: `0 8px 20px -8px ${s.kleur}` }
                        : undefined
                    }
                  >
                    <span
                      className={`text-2xl transition-transform ${gekozen ? "scale-110" : antwoorden[i] !== null && antwoorden[i] !== undefined ? "opacity-40 grayscale" : ""}`}
                    >
                      {a.emoji}
                    </span>
                    <span
                      className={`text-[10px] font-semibold leading-tight sm:text-[11px] ${gekozen ? "" : "text-muted"}`}
                    >
                      {a.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 hidden text-center text-xs text-muted sm:block">
        Tip: gebruik de toetsen 1 t/m 5 om snel te antwoorden.
      </p>
    </section>
  );
}

function Intro({ start, opnieuw, naarResultaat }: { start: () => void; opnieuw: boolean; naarResultaat: () => void }) {
  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-[#16123a] px-6 py-12 text-white sm:px-12 sm:py-16">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#7c6cff] opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-[#ff9f1c] opacity-25 blur-3xl" />
      <div className="relative">
        <Logo className="h-16 w-16" bewegend />
        <h1 className="display mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl">
          Welke studie
          <br />
          past bij jou?
        </h1>
        <p className="mt-4 max-w-lg text-lg text-white/75">
          Beantwoord 42 korte stellingen over 14 interessegebieden. Daarna zie je meteen je persoonlijke kompas en de
          opleidingen die het best bij je passen, uit alle mbo-, hbo- en wo-opleidingen van Nederland.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {["⏱️ ± 5 minuten", "🎯 14 gebieden", "📚 10.000+ opleidingen", "🔒 Blijft op je eigen apparaat"].map((t) => (
            <span key={t} className="rounded-full bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/15">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={start}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-[#16123a] shadow-[0_10px_40px_-10px_rgba(255,255,255,.6)] hover:bg-white/90"
          >
            {opnieuw ? "Test opnieuw doen" : "Start de test"} <ArrowRight className="h-4 w-4" />
          </button>
          {opnieuw && (
            <button
              type="button"
              onClick={naarResultaat}
              className="focus-ring rounded-full px-6 py-4 font-semibold text-white ring-1 ring-white/30 hover:bg-white/10"
            >
              Mijn resultaat bekijken
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Resultaat({ profiel, opnieuw }: { profiel: Profiel; opnieuw: () => void }) {
  const data = useData();
  const top = useMemo(
    () => (Object.entries(profiel.interesse) as [SectorId, number][]).sort((a, b) => b[1] - a[1]).slice(0, 3),
    [profiel.interesse],
  );
  const matches = useMemo(() => {
    if (!data) return null;
    const alle = data.opleidingen
      .map((o) => bereken(o, profiel))
      .filter((r) => r.match.toelaatbaar && profiel.soorten.includes(r.opleiding.soort));
    alle.sort((a, b) => b.match.score - a.match.score || a.reistijd - b.reistijd);
    // Niet 6 keer dezelfde opleiding in verschillende steden
    const gezien = new Set<string>();
    return alle
      .filter((r) => (gezien.has(r.opleiding.naam) ? false : (gezien.add(r.opleiding.naam), true)))
      .slice(0, 6);
  }, [data, profiel]);

  const advies: Soort =
    profiel.vooropleiding === "vwo" && profiel.leerstijl >= 0.6
      ? "wo"
      : profiel.vooropleiding === "vmbo" || profiel.leerstijl < 0.3
        ? "mbo"
        : "hbo";
  const adviesTekst: Record<Soort, string> = {
    mbo: "Je leert graag in de praktijk. Op het mbo ben je vanaf dag één met je vak bezig, met veel stage of werken naast school (BBL).",
    hbo: "Een hbo-opleiding past goed bij je: een mix van theorie en praktijk, met projecten en stages in echte bedrijven.",
    wo: "Je wilt de diepte in. Aan de universiteit leer je onderzoeken, analyseren en kritisch nadenken.",
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#16123a] px-6 py-10 text-white sm:px-10">
        <div className="pointer-events-none absolute -right-20 -top-28 h-96 w-96 rounded-full bg-[#7c6cff] opacity-40 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_420px]">
          <div className="binnenkomen">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b3a9ff]">Jouw kompas</p>
            <h1 className="display mt-2 text-4xl font-bold leading-[1.05] sm:text-5xl">
              {profiel.naam ? `${profiel.naam}, je` : "Je"} wijst richting{" "}
              <span className="bg-gradient-to-r from-[#b3a9ff] to-[#ffb24d] bg-clip-text text-transparent">
                {top[0] ? SECTOR[top[0][0]].kort : "…"}
              </span>
            </h1>
            <ol className="mt-7 space-y-3">
              {top.map(([s, w], i) => (
                <li key={s} className="flex items-center gap-4 rounded-2xl bg-white/[.07] p-3.5 ring-1 ring-white/10">
                  <span className="display w-6 text-center text-xl font-bold text-white/50">{i + 1}</span>
                  <span className="text-3xl">{SECTOR[s].emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{SECTOR[s].naam}</p>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${w * 100}%`, background: SECTOR[s].kleur }}
                      />
                    </div>
                  </div>
                  <span className="display text-xl font-bold tabular">{Math.round(w * 100)}%</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl bg-white/[.04] p-2 ring-1 ring-white/10 [--line:rgba(255,255,255,.14)] [--muted:rgba(255,255,255,.7)] [--brand:#b3a9ff]">
            <KompasRadar interesse={profiel.interesse} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="kaart p-6 md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Niveau-advies</p>
          <h2 className="display mt-1 text-2xl font-bold">Probeer eens het {advies}</h2>
          <p className="mt-2 text-muted">{adviesTekst[advies]}</p>
        </div>
        <div className="kaart flex flex-col justify-between gap-3 p-6">
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4 text-brand" /> {profiel.woonplaats.naam} · max{" "}
              {reistijdTekst(profiel.maxReistijd)}
            </p>
            <p className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-brand" /> Budget {euro(profiel.budget)} per maand
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DeelKnop profiel={profiel} />
            <button
              type="button"
              onClick={opnieuw}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-brand"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Aanpassen
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="display text-2xl font-bold sm:text-[28px]">Jouw beste matches</h2>
            <p className="text-sm text-muted">
              Uit {data ? data.opleidingen.length.toLocaleString("nl-NL") : "…"} opleidingen
            </p>
          </div>
          <Link
            href="/zoeken"
            className="focus-ring shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg"
          >
            Alle matches →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches ? matches.map((r, i) => <OpleidingKaart key={r.opleiding.id} r={r} index={i} />) : <KaartSkelet />}
        </div>
      </section>
    </div>
  );
}

function DeelKnop({ profiel }: { profiel: Profiel }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  const deel = async () => {
    const top = (Object.entries(profiel.interesse) as [SectorId, number][]).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const tekst = `Mijn StudieKompas 🧭\n${top.map(([s, w], i) => `${i + 1}. ${SECTOR[s].emoji} ${SECTOR[s].naam}: ${Math.round(w * 100)}%`).join("\n")}\nDoe de studietest ook:`;
    const url = `${window.location.origin}/vragenlijst`;
    try {
      if (navigator.share) await navigator.share({ title: "Mijn StudieKompas", text: tekst, url });
      else {
        await navigator.clipboard.writeText(`${tekst} ${url}`);
        setGekopieerd(true);
        setTimeout(() => setGekopieerd(false), 2500);
      }
    } catch {
      /* delen geannuleerd */
    }
  };
  return (
    <button
      type="button"
      onClick={deel}
      className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg hover:opacity-90"
    >
      {gekopieerd ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
      {gekopieerd ? "Gekopieerd!" : "Deel je kompas"}
    </button>
  );
}
