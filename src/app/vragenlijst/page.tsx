"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Share2, X } from "lucide-react";
import { HOOFDRICHTINGEN, SECTOR } from "@/data/sectoren";
import { DOMEINEN, LEGE_ANTWOORDEN, VRAGEN, berekenUitslag, type Antwoorden } from "@/data/vragenlijst";
import { SECTOR_FOTO, type FotoSleutel } from "@/data/fotos";
import { bereken } from "@/lib/bereken";
import { useData } from "@/lib/data-client";
import { useStore } from "@/lib/store";
import type { Profiel, SectorId, TaalVoorkeur, Wonen } from "@/lib/types";
import { DiplomaKiezer, diplomaCompleet } from "@/components/DiplomaKiezer";
import { Foto, FotoBron } from "@/components/Foto";
import { KaartSkelet, OpleidingKaart } from "@/components/OpleidingKaart";
import { WoonplaatsKiezer } from "@/components/WoonplaatsKiezer";

const KompasRadar = dynamic(() => import("@/components/KompasRadar"), {
  ssr: false,
  loading: () => <div className="h-[320px] animate-pulse rounded-2xl bg-card-2" />,
});

type Stap =
  | "intro"
  | "domein"
  | `vraag:${number}`
  | "tussen"
  | "jij"
  | "diploma"
  | "wonen"
  | "taal"
  | "inkomen"
  | "lenen"
  | "rekenen"
  | "resultaat";

const STORY: Stap[] = [
  "intro",
  "domein",
  ...[0, 1, 2, 3, 4, 5].map((i) => `vraag:${i}` as const),
  "tussen",
  "jij",
  "diploma",
  "wonen",
  "taal",
  "inkomen",
  "lenen",
  "rekenen",
];
const TUSSENSTAND = "studiekompas:test-v4";
const ANTWOORDEN_SLEUTEL = "studiekompas:antwoorden-v4";
const LETTERS = ["A", "B", "C", "D", "E"];

const INKOMENS: { label: string; waarde: number | null }[] = [
  { label: "Minder dan € 45.000", waarde: 40000 },
  { label: "€ 45.000 tot € 70.000", waarde: 57500 },
  { label: "€ 70.000 tot € 100.000", waarde: 85000 },
  { label: "Meer dan € 100.000", waarde: 120000 },
  { label: "Weet ik niet", waarde: null },
];
const LENEN: { label: string; waarde: number }[] = [
  { label: "Liever helemaal niet", waarde: 0 },
  { label: "Een beetje, tot zo'n € 200 per maand", waarde: 200 },
  { label: "Als het moet, tot zo'n € 550 per maand", waarde: 550 },
];
const WONEN: [Wonen, string][] = [
  ["kamer", "Op kamer, in de stad van mijn studie"],
  ["thuis", "Thuis blijven en reizen"],
  ["allebei", "Weet ik nog niet"],
];
const TALEN: [TaalVoorkeur, string][] = [
  ["nl", "Liefst in het Nederlands"],
  ["en", "Juist in het Engels"],
  ["beide", "Maakt me niet uit"],
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
  const [hersteld, setHersteld] = useState(false);

  useEffect(() => {
    if (!geladen || hersteld) return;
    setHersteld(true);
    setConcept(profiel);
    const vorige = lees<Antwoorden>(ANTWOORDEN_SLEUTEL, localStorage);
    if (vorige?.domein) setA(vorige);
    const t = lees<{ stap: Stap; concept: Profiel; a: Antwoorden }>(TUSSENSTAND, sessionStorage);
    if (t && STORY.includes(t.stap) && t.stap !== "rekenen") {
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

  const uitslag = useMemo(() => berekenUitslag(a), [a]);

  const afronden = useCallback(async () => {
    const p: Profiel = { ...concept, interesse: uitslag.interesse, vragenlijstKlaar: true };
    setConcept(p);
    await slaProfielOp(p);
    try {
      localStorage.setItem(ANTWOORDEN_SLEUTEL, JSON.stringify(a));
      sessionStorage.removeItem(TUSSENSTAND);
    } catch {}
    setStap("resultaat");
    window.scrollTo({ top: 0 });
  }, [a, concept, slaProfielOp, uitslag.interesse]);

  if (stap === "resultaat")
    return (
      <Resultaat
        profiel={concept}
        redenen={uitslag.redenen}
        opnieuw={() => {
          setA(LEGE_ANTWOORDEN);
          setStap("domein");
        }}
      />
    );

  return (
    <Story
      stap={stap}
      setStap={setStap}
      a={a}
      setA={setA}
      concept={concept}
      setConcept={setConcept}
      afronden={afronden}
      eerderGedaan={profiel.vragenlijstKlaar}
    />
  );
}

/* ------------------------------------------------------------------ */
/* De story: schermvullende foto, vraag in een wolkje, antwoorden A–D  */
/* ------------------------------------------------------------------ */

interface StoryProps {
  stap: Stap;
  setStap: (s: Stap) => void;
  a: Antwoorden;
  setA: React.Dispatch<React.SetStateAction<Antwoorden>>;
  concept: Profiel;
  setConcept: React.Dispatch<React.SetStateAction<Profiel>>;
  afronden: () => void;
  eerderGedaan: boolean;
}

function Story({ stap, setStap, a, setA, concept, setConcept, afronden, eerderGedaan }: StoryProps) {
  const router = useRouter();
  const nr = STORY.indexOf(stap);
  const [gekozen, setGekozen] = useState<number | null>(null);
  const bezig = useRef(false);
  const vragen = a.domein ? VRAGEN[a.domein] : VRAGEN.twijfel;
  const vraagNr = stap.startsWith("vraag:") ? Number(stap.slice(6)) : null;
  const zet = <K extends keyof Profiel>(k: K, v: Profiel[K]) => setConcept((c) => ({ ...c, [k]: v }));

  const ga = useCallback(
    (n: number) => {
      setGekozen(null);
      bezig.current = false;
      setStap(STORY[Math.max(0, Math.min(STORY.length - 1, n))]);
    },
    [setStap],
  );
  const volgende = useCallback(() => ga(nr + 1), [ga, nr]);
  const vorige = useCallback(() => ga(nr - 1), [ga, nr]);

  /** Eén tik: kort laten zien wat je koos, dan door */
  const kies = useCallback(
    (i: number, actie: () => void) => {
      if (bezig.current) return;
      bezig.current = true;
      setGekozen(i);
      actie();
      setTimeout(() => ga(nr + 1), 380);
    },
    [ga, nr],
  );

  // Berekenen-scherm: even laten zien, dan de uitslag
  useEffect(() => {
    if (stap !== "rekenen") return;
    const t = setTimeout(afronden, 1800);
    return () => clearTimeout(t);
  }, [stap, afronden]);

  // Geen scrollen van de pagina eronder zolang de story open is
  useEffect(() => {
    const oud = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = oud;
    };
  }, []);

  // Wat zijn de antwoorden op dit scherm?
  let foto: FotoSleutel = "campus";
  let vraag: React.ReactNode = null;
  let opties: { tekst: string; aan: boolean; actie: () => void }[] = [];
  let inhoud: React.ReactNode = null;
  let knop: { tekst: string; actie: () => void; uit?: boolean } | null = null;

  if (stap === "intro") {
    foto = "campus";
    vraag = (
      <>
        <p>
          Twijfel je over je <b>studiekeuze</b>? Je bent niet de enige.
        </p>
        <p className="mt-3">
          Beantwoord zeven vragen en ontdek welke richting bij je past. Daarna nog een paar korte vragen, zodat we uit
          alle 433 universitaire bachelors jouw <b>beste matches</b> kunnen halen.
        </p>
        <p className="mt-3 text-[15px] opacity-70">Duurt zo&apos;n vier minuten.</p>
      </>
    );
    knop = { tekst: eerderGedaan ? "Opnieuw beginnen" : "Start", actie: volgende };
  } else if (stap === "domein") {
    foto = a.domein ? DOMEINEN.find((d) => d.id === a.domein)!.foto : "collegezaal";
    vraag = (
      <>
        Welke zin past het <b>best</b> bij jou?
      </>
    );
    opties = DOMEINEN.map((d) => ({
      tekst: d.tekst,
      aan: a.domein === d.id,
      actie: () =>
        setA((x) => (x.domein === d.id ? x : { domein: d.id, keuzes: Array(VRAGEN[d.id].length).fill(null) })),
    }));
  } else if (vraagNr !== null) {
    const v = vragen[vraagNr];
    foto = v.foto;
    vraag = <Nadruk tekst={v.vraag} nadruk={v.nadruk} />;
    opties = v.antwoorden.map((x, i) => ({
      tekst: x.tekst,
      aan: a.keuzes[vraagNr] === i,
      actie: () =>
        setA((y) => {
          const keuzes = [...y.keuzes];
          keuzes[vraagNr] = i;
          return { ...y, keuzes };
        }),
    }));
  } else if (stap === "tussen") {
    const top = HOOFDRICHTINGEN.map((s) => [s, berekenUitslag(a).interesse[s] ?? 0] as const).sort(
      (x, y) => y[1] - x[1],
    )[0][0];
    foto = SECTOR_FOTO[top];
    vraag = (
      <>
        <p>
          Je kompas begint al ergens naartoe te wijzen. <b>Mooi.</b>
        </p>
        <p className="mt-3">
          Nog een paar korte vragen over je diploma, wonen en geld. Dan rekenen we per studie uit of je toelaatbaar
          bent, wat het kost en wat DUO betaalt.
        </p>
      </>
    );
    knop = { tekst: "Verder", actie: volgende };
  } else if (stap === "jij") {
    foto = "fietsen";
    vraag = (
      <>
        Hoe heet je, en <b>waar woon je</b>? Dan rekenen we de reistijd naar elke universiteit uit.
      </>
    );
    inhoud = (
      <div className="space-y-3">
        <input
          value={concept.naam}
          onChange={(e) => zet("naam", e.target.value)}
          placeholder="Je voornaam (mag leeg blijven)"
          autoComplete="given-name"
          className="focus-ring w-full rounded-lg border border-line bg-card px-4 py-3 text-[15px]"
        />
        <WoonplaatsKiezer waarde={concept.woonplaats} kies={(w) => zet("woonplaats", w)} />
      </div>
    );
    knop = { tekst: "Verder", actie: volgende };
  } else if (stap === "diploma") {
    foto = "studeren";
    vraag = (
      <>
        Wat is jouw <b>route</b> naar de universiteit? Dan checken we per studie of je profiel en vakken kloppen.
      </>
    );
    inhoud = <DiplomaKiezer waarde={concept} zet={(w) => setConcept((c) => ({ ...c, ...w }))} />;
    knop = { tekst: "Verder", actie: volgende, uit: !diplomaCompleet(concept) };
  } else if (stap === "wonen") {
    foto = "kamer";
    vraag = (
      <>
        Ga je <b>op kamer</b>, of blijf je thuis wonen?
      </>
    );
    opties = WONEN.map(([w, t]) => ({ tekst: t, aan: concept.wonen === w, actie: () => zet("wonen", w) }));
  } else if (stap === "taal") {
    foto = "collegezaal";
    vraag = (
      <>
        Veel bachelors zijn (ook) Engelstalig. In welke <b>taal</b> wil jij studeren?
      </>
    );
    opties = TALEN.map(([w, t]) => ({ tekst: t, aan: concept.taal === w, actie: () => zet("taal", w) }));
  } else if (stap === "inkomen") {
    foto = "studeren";
    vraag = (
      <>
        Wat verdienen je ouders <b>samen</b>, ongeveer per jaar? Daarmee schatten we je aanvullende beurs van DUO.
      </>
    );
    opties = INKOMENS.map((i) => ({
      tekst: i.label,
      aan: concept.ouderInkomen === i.waarde,
      actie: () => zet("ouderInkomen", i.waarde),
    }));
  } else if (stap === "lenen") {
    foto = "fietsen";
    vraag = (
      <>
        Hoe sta je tegenover <b>lenen</b> bij DUO?
      </>
    );
    opties = LENEN.map((l) => ({
      tekst: l.label,
      aan: concept.maxLenen === l.waarde,
      actie: () => zet("maxLenen", l.waarde),
    }));
  } else if (stap === "rekenen") {
    foto = "campus";
    vraag = (
      <>
        <p>
          Bedankt! We zoeken nu jouw <b>beste matches</b> uit 433 bachelors.
        </p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/10">
          <div className="laadbalk h-full bg-brand" />
        </div>
      </>
    );
  }

  // Toetsenbord: A–E of 1–5 kiest, pijltjes bladeren
  useEffect(() => {
    const toets = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const i = "abcde".indexOf(e.key.toLowerCase());
      const n = /^[1-5]$/.test(e.key) ? Number(e.key) - 1 : i;
      if (n >= 0 && n < opties.length) kies(n, opties[n].actie);
      else if (e.key === "ArrowLeft" && nr > 0) vorige();
      else if ((e.key === "ArrowRight" || e.key === "Enter") && knop && !knop.uit) knop.actie();
      else if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", toets);
    return () => window.removeEventListener("keydown", toets);
  });

  const segmenten = STORY.length - 1;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#07080b] licht-thema">
      {/* Op een groot scherm: dezelfde foto, vervaagd, als achtergrond */}
      <div className="absolute inset-0 hidden overflow-hidden sm:block" aria-hidden>
        <Foto
          key={foto}
          sleutel={foto}
          className="h-full w-full scale-110 object-cover opacity-50 blur-2xl fade-in"
          sizes="50vw"
        />
      </div>

      <div className="relative flex h-full w-full flex-col overflow-hidden bg-black text-[#0b0d12] sm:h-[min(92vh,880px)] sm:w-[min(460px,94vw)] sm:rounded-[22px] sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]">
        <Foto
          key={foto + "-scherp"}
          sleutel={foto}
          className="kenburns absolute inset-0 h-full w-full object-cover"
          sizes="(min-width: 640px) 460px, 100vw"
          prioriteit
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/55" aria-hidden />

        {/* Voortgang in segmenten, zoals bij een story */}
        <div className="relative z-10 flex gap-1 px-3 pt-3" aria-hidden>
          {Array.from({ length: segmenten }, (_, i) => (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
              <div
                className="h-full bg-white transition-[width] duration-500"
                style={{ width: i < nr ? "100%" : i === nr ? "45%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <div className="relative z-10 flex items-center gap-2 px-3 pt-3 text-white">
          {nr > 0 && stap !== "rekenen" ? (
            <button
              type="button"
              onClick={vorige}
              aria-label="Vorige vraag"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[13px] font-bold text-brand">
              SK
            </span>
          )}
          <p className="flex-1 text-sm font-semibold drop-shadow">
            Studietest
            <span className="ml-2 font-normal opacity-80">
              {Math.min(nr + 1, segmenten)} / {segmenten}
            </span>
          </p>
          <Link
            href="/"
            aria-label="Test sluiten"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        {/* Inhoud */}
        <div key={stap} className="story-in relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-5">
          <div className="wolkje relative rounded-md bg-white/88 px-5 py-4 text-[17px] leading-relaxed shadow-lg backdrop-blur-md">
            {vraag}
          </div>

          {inhoud && (
            <div className="mt-6 rounded-md bg-white/92 p-4 text-[15px] shadow-lg backdrop-blur-md">{inhoud}</div>
          )}

          {opties.length > 0 && (
            <ul className="mt-6 space-y-2.5" role="list">
              {opties.map((o, i) => {
                const aan = gekozen === i || (gekozen === null && o.aan);
                return (
                  <li key={o.tekst} style={{ animationDelay: `${120 + i * 60}ms` }} className="story-in">
                    <button
                      type="button"
                      aria-pressed={aan}
                      onClick={() => kies(i, o.actie)}
                      className={`group flex w-full items-stretch overflow-hidden rounded-md text-left shadow-md backdrop-blur-md transition-all active:scale-[.985] ${
                        aan ? "bg-brand text-white" : "bg-white/82 hover:bg-white"
                      }`}
                    >
                      <span
                        className={`flex w-12 shrink-0 items-center justify-center text-[15px] font-bold ${
                          aan ? "bg-black/15 text-white" : "bg-brand text-white"
                        }`}
                      >
                        {aan ? <Check className="h-4 w-4" strokeWidth={3} /> : LETTERS[i]}
                      </span>
                      <span className="flex-1 px-4 py-3.5 text-[15.5px] leading-snug">{o.tekst}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 pt-6">
            <FotoBron sleutel={foto} className="text-[10.5px] text-white/75" />
            {knop && (
              <button
                type="button"
                onClick={knop.actie}
                disabled={knop.uit}
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white px-5 py-3 font-semibold shadow-lg transition-opacity hover:bg-white/90 disabled:opacity-50"
              >
                {knop.tekst}
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Vraagtekst met één vetgedrukt stuk */
function Nadruk({ tekst, nadruk }: { tekst: string; nadruk?: string }) {
  if (!nadruk || !tekst.includes(nadruk)) return <>{tekst}</>;
  const [voor, na] = tekst.split(nadruk);
  return (
    <>
      {voor}
      <b>{nadruk}</b>
      {na}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Uitslag                                                              */
/* ------------------------------------------------------------------ */

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
  const [eerste] = top;

  return (
    <div className="space-y-14">
      {eerste && (
        <section className="volle-breedte relative -mt-5 overflow-hidden bg-black text-white sm:-mt-8">
          <Foto
            sleutel={SECTOR_FOTO[eerste[0]]}
            className="kenburns absolute inset-0 h-full w-full object-cover opacity-80"
            sizes="100vw"
            prioriteit
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" aria-hidden />
          <div className="relative mx-auto flex min-h-[440px] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:min-h-[520px] sm:px-6">
            <p className="text-sm font-semibold text-white/80">
              {profiel.naam ? `${profiel.naam}, jouw` : "Jouw"} richting
            </p>
            <h1 className="mt-2 max-w-3xl text-[42px] font-bold leading-[1.02] tracking-tight sm:text-7xl">
              {SECTOR[eerste[0]].naam}
            </h1>
            <p className="mt-3 max-w-xl text-lg text-white/85">{SECTOR[eerste[0]].tekst}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold tabular">
                {Math.round(eerste[1] * 100)}% match
              </span>
              {top.slice(1).map(([s, w]) => (
                <span key={s} className="rounded-md bg-white/15 px-3 py-1.5 text-sm backdrop-blur tabular">
                  {SECTOR[s].naam} · {Math.round(w * 100)}%
                </span>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <DeelKnop profiel={profiel} />
              <button
                type="button"
                onClick={opnieuw}
                className="inline-flex items-center gap-2 rounded-md bg-white/15 px-4 py-2.5 text-sm font-medium backdrop-blur hover:bg-white/25"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Test opnieuw doen
              </button>
            </div>
            <FotoBron sleutel={SECTOR_FOTO[eerste[0]]} className="mt-6 text-[11px] text-white/60" />
          </div>
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="kop text-3xl">Waarom deze richtingen?</h2>
          <p className="mt-1 text-muted">Op basis van wat je antwoordde.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {top.map(([s, w], i) => (
              <article key={s} className="kaart overflow-hidden">
                <Foto sleutel={SECTOR_FOTO[s]} className="aspect-[4/3] w-full object-cover" sizes="300px" />
                <div className="p-4">
                  <p className="text-sm font-semibold text-brand tabular">
                    {i + 1}. {Math.round(w * 100)}%
                  </p>
                  <h3 className="kop mt-0.5 text-lg leading-tight">{SECTOR[s].naam}</h3>
                  {(redenen[s] ?? []).length > 0 ? (
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {[...new Set(redenen[s])].slice(0, 3).map((r) => (
                        <li key={r} className="flex gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={3} />
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-muted">{SECTOR[s].tekst}</p>
                  )}
                  <Link
                    href={`/zoeken?sector=${s}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                  >
                    Bekijk bachelors <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="kaart p-3">
          <p className="px-2 pt-2 text-sm font-semibold">Je hele kompas</p>
          <KompasRadar interesse={profiel.interesse} />
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="kop text-3xl">Je beste matches</h2>
            <p className="mt-1 text-muted">
              Uit {data ? data.opleidingen.length : "…"} bachelors, met toelating, kosten en reistijd erbij.
            </p>
          </div>
          <Link href="/zoeken" className="shrink-0 text-sm font-semibold text-brand hover:underline">
            Alle matches
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches ? matches.map((r, i) => <OpleidingKaart key={r.opleiding.id} r={r} index={i} />) : <KaartSkelet />}
        </div>
        <p className="mt-6 text-sm text-muted">
          Je match-score rekent ook met geld, op basis van een schatting van je studiefinanciering.{" "}
          <Link href="/geld" className="font-medium text-brand hover:underline">
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
      className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#0b0d12] hover:bg-white/90"
    >
      {gekopieerd ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
      {gekopieerd ? "Gekopieerd" : "Deel je uitslag"}
    </button>
  );
}
