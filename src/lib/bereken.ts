import { INSTELLINGEN } from "@/data/instellingen";
import { kamerhuurVan } from "@/data/kamerhuur";
import { SECTOR } from "@/data/sectoren";
import type { Opleiding, Plaats, Profiel, Soort, Vooropleiding } from "./types";

export type Stoplicht = "groen" | "oranje" | "rood";

// ------------------------------------------------------------ reistijd

/** Afstand in km hemelsbreed (haversine) */
export function afstandKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const r = (x: number) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Gecontroleerde reistijden met de trein vanaf Wierden (NS-reisplanner, indicatief) */
const VANAF_WIERDEN: Record<string, number> = {
  Wierden: 10,
  Almelo: 10,
  Hengelo: 20,
  Enschede: 22,
  Deventer: 22,
  Zwolle: 40,
  Apeldoorn: 40,
  Arnhem: 80,
  Groningen: 105,
  Utrecht: 100,
  Amersfoort: 75,
  Amsterdam: 115,
  Nijmegen: 110,
  Delft: 145,
  "'s-Gravenhage": 140,
  Leiden: 135,
  Rotterdam: 140,
  Eindhoven: 155,
};

/**
 * Geschatte reistijd met het OV (enkele reis, minuten).
 * Vanaf Wierden naar bekende steden: gecontroleerde tijd. Anders: schatting op basis van de afstand.
 */
export function reistijd(
  van: { naam: string; lat: number; lng: number },
  naar: Plaats,
): { minuten: number; schatting: boolean } {
  if (van.naam === "Wierden" && naar.naam in VANAF_WIERDEN)
    return { minuten: VANAF_WIERDEN[naar.naam], schatting: false };
  if (van.naam === naar.naam) return { minuten: 15, schatting: true };
  const km = afstandKm(van, naar);
  return { minuten: Math.max(10, Math.round((12 + km * 0.8) / 5) * 5), schatting: true };
}

export function stoplicht(minuten: number, inst = INSTELLINGEN): Stoplicht {
  if (minuten <= inst.groenTot) return "groen";
  if (minuten <= inst.oranjeTot) return "oranje";
  return "rood";
}

// ------------------------------------------------------------ kosten

export interface Kosten {
  huur: number;
  huurSchatting: boolean;
  leefUit: number;
  leefThuis: number;
  /** Collegegeld of lesgeld per maand */
  schoolgeld: number;
  schoolgeldLabel: string;
  boeken: number;
  uitwonend: number;
  thuis: number;
  /** Thuis blijven wonen is te doen (reistijd binnen je maximum, of je wilt sowieso thuis wonen) */
  thuisMogelijk: boolean;
  advies: number;
}

export function kosten(
  o: Pick<Opleiding, "soort" | "leerwegen">,
  plaats: Plaats,
  reistijdMin: number,
  profiel: Pick<Profiel, "maxReistijd" | "wonen">,
  inst = INSTELLINGEN,
): Kosten {
  const { bedrag: huur, schatting: huurSchatting } = kamerhuurVan(plaats);
  const bbl = o.soort === "mbo" && o.leerwegen === "BBL";
  const schoolgeldJaar = o.soort === "mbo" ? (bbl ? 0 : inst.lesgeldMbo) : inst.collegegeld;
  const schoolgeld = schoolgeldJaar / 12;
  const boeken = (o.soort === "mbo" ? inst.boekenMbo : inst.boekenHo) / 12;
  const uitwonend = huur + inst.leefUitwonend + schoolgeld + boeken;
  const thuis = inst.leefThuis + schoolgeld + boeken;
  const thuisMogelijk = profiel.wonen === "thuis" || (profiel.wonen !== "kamer" && reistijdMin <= profiel.maxReistijd);
  return {
    huur,
    huurSchatting,
    leefUit: inst.leefUitwonend,
    leefThuis: inst.leefThuis,
    schoolgeld,
    schoolgeldLabel: o.soort === "mbo" ? (bbl ? "Lesgeld (geen bij BBL)" : "Lesgeld (vanaf 18 jaar)") : "Collegegeld",
    boeken,
    uitwonend,
    thuis,
    thuisMogelijk,
    advies: thuisMogelijk ? thuis : uitwonend,
  };
}

// ------------------------------------------------------------ toelating

/** Met welke vooropleiding kun je (zonder extra eisen) naar welk soort onderwijs? */
export const TOELATING: Record<Vooropleiding, Soort[]> = {
  vmbo: ["mbo"],
  havo: ["mbo", "hbo"],
  vwo: ["mbo", "hbo", "wo"],
  mbo4: ["mbo", "hbo"],
};

export const VOOROPLEIDING_LABEL: Record<Vooropleiding, string> = {
  vmbo: "vmbo",
  havo: "havo",
  vwo: "vwo",
  mbo4: "mbo 4",
};

// ------------------------------------------------------------ match-score

export interface ScoreOnderdeel {
  label: string;
  uitleg: string;
  punten: number;
  max: number;
}

export interface Match {
  score: number;
  onderdelen: ScoreOnderdeel[];
  toelaatbaar: boolean;
}

const LEERSTIJL_DOEL: Record<Soort, number> = { mbo: 0.15, hbo: 0.5, wo: 0.85 };
const clamp = (x: number) => Math.max(0, Math.min(1, x));

/**
 * Match-score van 0 tot 100:
 *  - 45 punten: hoe goed de sector past bij je antwoorden in de vragenlijst
 *  - 15 punten: soort onderwijs (mbo/hbo/wo) en of het past bij hoe je graag leert
 *  - 20 punten: maandlasten binnen je budget
 *  - 20 punten: reistijd
 */
export function matchScore(o: Opleiding, profiel: Profiel, r: number, k: Kosten): Match {
  const sector = SECTOR[o.sector];
  const heeftInteresse = Object.keys(profiel.interesse).length > 0;
  const affiniteit = heeftInteresse ? (profiel.interesse[o.sector] ?? 0) : 0.5;

  const toelaatbaar = !profiel.vooropleiding || TOELATING[profiel.vooropleiding].includes(o.soort);
  const gekozen = profiel.soorten.includes(o.soort);
  const stijl = 1 - Math.abs(profiel.leerstijl - LEERSTIJL_DOEL[o.soort]);

  const teDuur = Math.max(0, k.advies - profiel.budget);
  const reisPunten =
    profiel.wonen === "kamer" ? clamp(1 - (r - 120) / 120) : clamp(1 - Math.max(0, r - profiel.maxReistijd) / 90);

  const onderdelen: ScoreOnderdeel[] = [
    {
      label: "Interesse",
      uitleg: !heeftInteresse
        ? "Doe de vragenlijst voor een persoonlijke score"
        : affiniteit >= 0.75
          ? `${sector.naam} past heel goed bij jou`
          : affiniteit >= 0.5
            ? `${sector.naam} vind je best interessant`
            : `${sector.naam} is niet echt jouw ding`,
      punten: Math.round(45 * affiniteit),
      max: 45,
    },
    {
      label: "Niveau",
      uitleg: !toelaatbaar
        ? `Met ${VOOROPLEIDING_LABEL[profiel.vooropleiding!]} kun je niet direct naar het ${o.soort}`
        : !gekozen
          ? `Je zoekt nu niet naar ${o.soort}`
          : stijl > 0.7
            ? `${o.soort.toUpperCase()} past bij hoe jij graag leert`
            : `${o.soort.toUpperCase()} is ${o.soort === "wo" ? "theoretischer" : "praktischer"} dan je voorkeur`,
      punten: toelaatbaar && gekozen ? Math.round(8 + 7 * stijl) : 0,
      max: 15,
    },
    {
      label: "Budget",
      uitleg: teDuur === 0 ? "Binnen je budget" : `${euro(teDuur)} per maand boven je budget`,
      punten: Math.round(20 * clamp(1 - teDuur / 300)),
      max: 20,
    },
    {
      label: "Reistijd",
      uitleg:
        profiel.wonen === "kamer"
          ? r <= 120
            ? "Je gaat op kamer; goed bereikbaar voor het weekend"
            : "Je gaat op kamer, maar het is ver van huis"
          : r <= profiel.maxReistijd
            ? "Je kunt thuis blijven wonen"
            : `${r - profiel.maxReistijd} min verder dan je maximum`,
      punten: Math.round(20 * reisPunten),
      max: 20,
    },
  ];
  const totaal = onderdelen.reduce((s, x) => s + x.punten, 0);
  return { score: toelaatbaar ? totaal : Math.min(totaal, 40), onderdelen, toelaatbaar };
}

// ------------------------------------------------------------ alles samen

export interface Resultaat {
  opleiding: Opleiding;
  reistijd: number;
  reistijdSchatting: boolean;
  licht: Stoplicht;
  kosten: Kosten;
  match: Match;
}

export function bereken(o: Opleiding, profiel: Profiel): Resultaat {
  const r = reistijd(profiel.woonplaats, o.plaats);
  const k = kosten(o, o.plaats, r.minuten, profiel);
  return {
    opleiding: o,
    reistijd: r.minuten,
    reistijdSchatting: r.schatting,
    licht: stoplicht(r.minuten),
    kosten: k,
    match: matchScore(o, profiel, r.minuten, k),
  };
}

// ------------------------------------------------------------ opmaak

export function vandaag(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(d);
}

export function dagenTot(datum: string, van = vandaag()): number {
  return Math.round((Date.parse(datum) - Date.parse(van)) / 86_400_000);
}

export function telDagenOp(datum: string, n: number): string {
  return new Date(Date.parse(datum) + n * 86_400_000).toISOString().slice(0, 10);
}

const EURO = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const euro = (n: number) => EURO.format(Math.round(n));
const GETAL = new Intl.NumberFormat("nl-NL");
export const getal = (n: number) => GETAL.format(n);

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

export function duurTekst(jaar: number | null): string {
  if (!jaar) return "–";
  if (jaar < 1) return `${Math.round(jaar * 12)} maanden`;
  return `${String(jaar).replace(".", ",")} jaar`;
}

/** Plaatsnamen zoals DUO ze schrijft, leesbaar gemaakt */
export function plaatsNaam(naam: string): string {
  if (naam === "'s-Gravenhage") return "Den Haag";
  if (naam === "'s-Hertogenbosch") return "Den Bosch";
  return naam;
}

/** URL-vriendelijke naam voor een plaats */
export function plaatsSlug(naam: string): string {
  return naam
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
