import { INSTELLINGEN } from "@/data/instellingen";
import { OPLEIDINGEN } from "@/data/opleidingen";
import { OPEN_DAGEN } from "@/data/opendagen";
import { STEDEN } from "@/data/steden";
import type { OpenDag, Opleiding, Profiel, Stad } from "./types";

export type Stoplicht = "groen" | "oranje" | "rood";

export function stadVan(opleiding: Opleiding): Stad {
  const stad = STEDEN.find((s) => s.id === opleiding.stadId);
  if (!stad) throw new Error(`Onbekende stad ${opleiding.stadId}`);
  return stad;
}

export function opleidingVan(id: string): Opleiding | undefined {
  return OPLEIDINGEN.find((o) => o.id === id);
}

export function stoplicht(reistijd: number, inst = INSTELLINGEN): Stoplicht {
  if (reistijd <= inst.groenTot) return "groen";
  if (reistijd <= inst.oranjeTot) return "oranje";
  return "rood";
}

export interface Kosten {
  huur: number;
  leefUit: number;
  leefThuis: number;
  collegegeld: number;
  boeken: number;
  /** Maandlasten als je op kamer gaat */
  uitwonend: number;
  /** Maandlasten als je thuis blijft wonen */
  thuis: number;
  /** Kan ik thuis blijven wonen (reistijd binnen mijn maximum)? */
  thuisMogelijk: boolean;
  /** De maandlasten die bij jouw situatie horen */
  advies: number;
}

/** Maandlasten per maand. Collegegeld en boeken zijn per jaar en worden door 12 gedeeld. */
export function kosten(stad: Stad, maxReistijd: number, inst = INSTELLINGEN): Kosten {
  const collegegeld = inst.collegegeld / 12;
  const boeken = inst.boekenPerJaar / 12;
  const uitwonend = stad.kamerhuur + inst.leefUitwonend + collegegeld + boeken;
  const thuis = inst.leefThuis + collegegeld + boeken;
  const thuisMogelijk = stad.reistijd <= maxReistijd;
  return {
    huur: stad.kamerhuur,
    leefUit: inst.leefUitwonend,
    leefThuis: inst.leefThuis,
    collegegeld,
    boeken,
    uitwonend,
    thuis,
    thuisMogelijk,
    advies: thuisMogelijk ? thuis : uitwonend,
  };
}

export interface ScoreOnderdeel {
  label: string;
  uitleg: string;
  punten: number;
  max: number;
}

export interface Match {
  score: number;
  onderdelen: ScoreOnderdeel[];
}

/**
 * Match-score van 0 tot 100:
 *  - 40 punten: sector past bij je interesses
 *  - 10 punten: niveau (hbo/wo) past bij je voorkeur
 *  - 25 punten: maandlasten binnen je budget (daarboven loopt het af tot 0 bij €300 te veel)
 *  - 25 punten: reistijd binnen je maximum (daarboven loopt het af tot 0 bij 90 min te veel)
 */
export function matchScore(opleiding: Opleiding, profiel: Profiel, inst = INSTELLINGEN): Match {
  const stad = stadVan(opleiding);
  const k = kosten(stad, profiel.maxReistijd, inst);

  const sectorOk = profiel.interesses.includes(opleiding.sector);
  const niveauOk = profiel.niveau === "beide" || profiel.niveau === opleiding.niveau;
  const teDuur = Math.max(0, k.advies - profiel.budget);
  const teVer = Math.max(0, stad.reistijd - profiel.maxReistijd);

  const onderdelen: ScoreOnderdeel[] = [
    {
      label: "Interesse",
      uitleg: sectorOk
        ? `${opleiding.sector} hoort bij je interesses`
        : profiel.interesses.length === 0
          ? "Kies je interesses in je profiel"
          : `${opleiding.sector} staat niet bij je interesses`,
      punten: sectorOk ? 40 : 0,
      max: 40,
    },
    {
      label: "Niveau",
      uitleg: niveauOk ? `${opleiding.niveau} past bij je voorkeur` : `Je voorkeur is ${profiel.niveau}`,
      punten: niveauOk ? 10 : 0,
      max: 10,
    },
    {
      label: "Budget",
      uitleg: teDuur === 0 ? "Binnen je budget" : `${euro(teDuur)} per maand boven je budget`,
      punten: Math.round(25 * Math.max(0, 1 - teDuur / 300)),
      max: 25,
    },
    {
      label: "Reistijd",
      uitleg: teVer === 0 ? "Je kunt thuis blijven wonen" : `${teVer} min verder dan je maximum`,
      punten: Math.round(25 * Math.max(0, 1 - teVer / 90)),
      max: 25,
    },
  ];
  return { score: onderdelen.reduce((s, o) => s + o.punten, 0), onderdelen };
}

export function openDagenVan(opleidingId: string, vanaf = vandaag()): OpenDag[] {
  return OPEN_DAGEN.filter((d) => d.opleidingId === opleidingId && d.datum >= vanaf).sort((a, b) =>
    a.datum.localeCompare(b.datum),
  );
}

/** Datum van vandaag als YYYY-MM-DD in Nederlandse tijd */
export function vandaag(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(d);
}

export function dagenTot(datum: string, van = vandaag()): number {
  return Math.round((Date.parse(datum) - Date.parse(van)) / 86_400_000);
}

export function telDagenOp(datum: string, n: number): string {
  const d = new Date(Date.parse(datum) + n * 86_400_000);
  return d.toISOString().slice(0, 10);
}

const EURO = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const euro = (n: number) => EURO.format(Math.round(n));

export function reistijdTekst(min: number): string {
  if (min < 60) return `${min} min`;
  const u = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${u} uur` : `${u} u ${m} min`;
}

export function datumTekst(
  datum: string,
  opties: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" },
) {
  return new Intl.DateTimeFormat("nl-NL", { ...opties, timeZone: "UTC" }).format(new Date(datum + "T00:00:00Z"));
}
