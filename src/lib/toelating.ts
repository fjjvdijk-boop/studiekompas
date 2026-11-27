/**
 * Toelatingseisen: mag je met jouw vwo-profiel en vakken naar deze bachelor?
 *
 * Bron: de officiële "nadere vooropleidingseisen" voor het wetenschappelijk onderwijs, uit bijlage A van de
 * Regeling aanmelding en toelating hoger onderwijs (BWBR0035059). Die tabel staat in src/data/toelating-wo.json
 * en wordt opgehaald met scripts/toelating-wo.py.
 *
 * Staat een opleiding niet in de tabel, dan zijn er geen extra eisen: met elk vwo-profiel mag je erin.
 * Een ontbrekend vak (een "deficiëntie") kun je vaak nog wegwerken; selectie of een numerus fixus staat hier los van.
 */
import tabel from "@/data/toelating-wo.json";
import type { Opleiding, Profiel, ProfielNaam, Vak } from "./types";

export type Eis =
  | { vrij: true }
  | { geen: true }
  | { vak: Vak }
  | { en: Eis[] }
  | { of: Eis[] }
  | { min: number; uit: Eis[] };
/** Per profiel wat je naast je profiel nodig hebt */
export type Eisen = Record<ProfielNaam, Eis>;

export type ToelatingStatus = "ja" | "deficientie" | "nee" | "onbekend";

export interface Toelating {
  status: ToelatingStatus;
  /** Wat je mist, leesbaar: ["natuurkunde", "wiskunde A of B"] */
  mist: string[];
  reden: string;
  /** De officiële eisen per profiel, of null als er geen extra eisen zijn */
  eisen: Eisen | null;
}

export const PROFIELEN: ProfielNaam[] = ["NT", "NG", "EM", "CM"];

export const PROFIEL_LABEL: Record<ProfielNaam, string> = {
  NT: "Natuur & Techniek",
  NG: "Natuur & Gezondheid",
  EM: "Economie & Maatschappij",
  CM: "Cultuur & Maatschappij",
};

/** Vakken die altijd in een profiel zitten (het "profieldeel") */
export const PROFIEL_VAKKEN: Record<ProfielNaam, Vak[]> = {
  NT: ["wiskunde B", "natuurkunde", "scheikunde"],
  NG: ["biologie", "scheikunde"],
  EM: ["economie", "geschiedenis"],
  CM: ["geschiedenis"],
};

export const TOELATING_BRON = {
  naam: "Regeling aanmelding en toelating hoger onderwijs, bijlage A",
  url: "https://wetten.overheid.nl/BWBR0035059",
  geldigVanaf: tabel.geldigVanaf,
};

/** Namen vergelijken zonder accenten, leestekens en hoofdletters ("Actuariële" = "Actuariele", "&" = "and") */
export const normaliseer = (n: string) =>
  n
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");

const PER_NAAM = new Map<string, Eisen>(
  Object.entries(tabel.opleidingen).map(([naam, eisen]) => [normaliseer(naam), eisen as Eisen]),
);

/** De officiële eisen voor deze opleiding, of null als er geen extra eisen zijn */
export function eisenVoor(o: Pick<Opleiding, "naam">): Eisen | null {
  return PER_NAAM.get(normaliseer(o.naam)) ?? null;
}

const wiskunde = (a: string, b: string) => a.startsWith("wiskunde ") && b.startsWith("wiskunde ");

/** Leesbare tekst van een eis: "biologie", "wiskunde A of B", "twee van: biologie, natuurkunde, scheikunde" */
export function eisTekst(e: Eis): string {
  if ("vrij" in e) return "geen extra vakken";
  if ("geen" in e) return "geen toelatingsrecht";
  if ("vak" in e) return e.vak;
  if ("of" in e) {
    const delen = e.of.map(eisTekst);
    if (delen.length === 2 && wiskunde(delen[0], delen[1])) return `${delen[0]} of ${delen[1].slice(-1)}`;
    return delen.map((d) => ("en" in e.of[0] && delen.length > 1 ? `(${d})` : d)).join(" of ");
  }
  if ("en" in e) return e.en.map((x) => ("of" in x && x.of.length > 2 ? `(${eisTekst(x)})` : eisTekst(x))).join(" + ");
  return `${e.min === 2 ? "twee" : e.min} van: ${e.uit.map(eisTekst).join(", ")}`;
}

/** Voldoe je met deze vakken aan de eis? Zo nee: wat mis je (per onderdeel van een "en") */
function check(e: Eis, vakken: Set<Vak>): { ok: boolean; mist: string[] } {
  if ("vrij" in e) return { ok: true, mist: [] };
  if ("geen" in e) return { ok: false, mist: [] };
  if ("vak" in e) return vakken.has(e.vak) ? { ok: true, mist: [] } : { ok: false, mist: [e.vak] };
  if ("of" in e)
    return e.of.some((x) => check(x, vakken).ok) ? { ok: true, mist: [] } : { ok: false, mist: [eisTekst(e)] };
  if ("en" in e) {
    const mist = e.en.flatMap((x) => check(x, vakken).mist);
    return { ok: mist.length === 0, mist };
  }
  const gehaald = e.uit.filter((x) => check(x, vakken).ok).length;
  return gehaald >= e.min ? { ok: true, mist: [] } : { ok: false, mist: [eisTekst(e)] };
}

/** Jouw vakken, aangevuld met de vaste vakken van je profiel(en) */
export function jouwVakken(p: Pick<Profiel, "profielen" | "vakken">): Set<Vak> {
  return new Set<Vak>([...p.vakken, ...p.profielen.flatMap((x) => PROFIEL_VAKKEN[x])]);
}

/** Mag je met jouw profiel naar deze opleiding? */
export function toelating(
  o: Pick<Opleiding, "naam">,
  p: Pick<Profiel, "vooropleiding" | "profielen" | "vakken">,
): Toelating {
  const eisen = eisenVoor(o);
  const v = p.vooropleiding;
  if (!v) return { status: "onbekend", mist: [], reden: "Vul je diploma in om je toelating te checken", eisen };
  if (v === "vmbo")
    return { status: "nee", mist: [], reden: "Met vmbo kun je niet direct naar de universiteit.", eisen };
  if (v !== "vwo")
    return {
      status: "onbekend",
      mist: [],
      reden: eisen
        ? "Met een hbo-propedeuse mag je naar de universiteit, maar voor deze opleiding moet je misschien nog een vak bijspijkeren. Check de eisen bij de opleiding."
        : "Met een hbo-propedeuse mag je naar de universiteit. Er gelden voor deze opleiding geen extra vakeisen.",
      eisen,
    };
  if (!eisen)
    return { status: "ja", mist: [], reden: "Geen extra vakken nodig: met elk vwo-profiel mag je erin.", eisen };
  if (!p.profielen.length)
    return { status: "onbekend", mist: [], reden: "Kies je profiel om te checken of je toelaatbaar bent.", eisen };

  const vakken = jouwVakken(p);
  const uitslagen = p.profielen.map((pr) => ({ pr, eis: eisen[pr], ...check(eisen[pr], vakken) }));
  const goed = uitslagen.find((u) => u.ok);
  if (goed)
    return {
      status: "ja",
      mist: [],
      reden:
        "vrij" in goed.eis
          ? `Je profiel ${goed.pr} geeft toegang.`
          : `Met profiel ${goed.pr} heb je ${eisTekst(goed.eis)} nodig, en dat heb je.`,
      eisen,
    };
  const bijna = uitslagen.filter((u) => !("geen" in u.eis)).sort((a, b) => a.mist.length - b.mist.length)[0];
  if (bijna)
    return {
      status: "deficientie",
      mist: bijna.mist,
      reden: `Met profiel ${bijna.pr} mis je ${bijna.mist.join(" en ")}. Dat heet een deficiëntie: vaak kun je het nog wegwerken met een toets of cursus vóór de start.`,
      eisen,
    };
  const pr = p.profielen.join(" of ");
  return {
    status: "nee",
    mist: [],
    reden: `Profiel ${pr} geeft geen toelatingsrecht voor deze opleiding. De universiteit kan je wel toelaten als je met een toets laat zien dat je de vakken van een passend profiel beheerst (bijvoorbeeld als je ze als extra vak hebt gedaan).`,
    eisen,
  };
}
