import { INSTELLINGEN } from "@/data/instellingen";
import { kamerhuurVan } from "@/data/kamerhuur";
import { SECTOR } from "@/data/sectoren";
import { geldplaatje, type Plaatje } from "./duo";
import { toelating, type Toelating } from "./toelating";
import type { Opleiding, Plaats, Profiel } from "./types";

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
  /** Collegegeld per maand */
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
  const schoolgeld = inst.collegegeld / 12;
  const boeken = inst.boekenHo / 12;
  const uitwonend = huur + inst.leefUitwonend + schoolgeld + boeken;
  const thuis = inst.leefThuis + schoolgeld + boeken;
  const thuisMogelijk = profiel.wonen === "thuis" || (profiel.wonen !== "kamer" && reistijdMin <= profiel.maxReistijd);
  return {
    huur,
    huurSchatting,
    leefUit: inst.leefUitwonend,
    leefThuis: inst.leefThuis,
    schoolgeld,
    schoolgeldLabel: `Collegegeld (${inst.studiejaar})`,
    boeken,
    uitwonend,
    thuis,
    thuisMogelijk,
    advies: thuisMogelijk ? thuis : uitwonend,
  };
}

/** Het geldplaatje met studiefinanciering van DUO, ouders en bijbaan */
export function geldVoor(k: Kosten, profiel: Profiel, thuis = k.thuisMogelijk): Plaatje {
  return geldplaatje(thuis ? k.thuis : k.uitwonend, {
    uitwonend: !thuis,
    ouderInkomen: profiel.ouderInkomen,
    andereKinderen: profiel.andereKinderen,
    ouderBijdrage: profiel.ouderBijdrage,
    bijbaan: profiel.bijbaan,
  });
}

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
  /** false = je kunt er (nog) niet heen met je diploma */
  toelaatbaar: boolean;
  /** Details: ja, deficiëntie (vak ontbreekt), nee of onbekend */
  toelating: Toelating;
}

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const TOELATING_PUNTEN: Record<Toelating["status"], number> = { ja: 10, onbekend: 7, deficientie: 3, nee: 0 };

interface Punten {
  affiniteit: number;
  heeftInteresse: boolean;
  taalMis: boolean;
  toelating: Toelating;
  teLenen: number;
  reisPunten: number;
  score: number;
}

/** Alleen de getallen: snel genoeg om voor alle opleidingen tegelijk uit te rekenen */
function punten(o: Opleiding, profiel: Profiel, r: number, geld: Plaatje): Punten {
  const heeftInteresse = Object.keys(profiel.interesse).length > 0;
  const affiniteit = heeftInteresse ? (profiel.interesse[o.sector] ?? 0) : 0.5;
  const taalMis = (profiel.taal === "nl" && o.taal === "EN") || (profiel.taal === "en" && o.taal === "NL");
  const t = toelating(o, profiel);
  const reisPunten =
    profiel.wonen === "kamer" ? clamp(1 - (r - 120) / 120) : clamp(1 - Math.max(0, r - profiel.maxReistijd) / 90);
  const teVeel = Math.max(0, geld.teLenen - profiel.maxLenen);
  const totaal =
    Math.round(50 * affiniteit) -
    (taalMis ? 10 : 0) +
    TOELATING_PUNTEN[t.status] +
    Math.round(20 * clamp(1 - teVeel / 300)) +
    Math.round(20 * reisPunten);
  const score = Math.max(
    0,
    t.status === "nee" ? Math.min(totaal, 40) : t.status === "deficientie" ? Math.min(totaal, 70) : totaal,
  );
  return { affiniteit, heeftInteresse, taalMis, toelating: t, teLenen: geld.teLenen, reisPunten, score };
}

/** De uitleg per onderdeel (alleen nodig op de detailpagina) */
function onderdelen(o: Opleiding, profiel: Profiel, r: number, p: Punten): ScoreOnderdeel[] {
  const sector = SECTOR[o.sector];
  const teVeel = Math.max(0, p.teLenen - profiel.maxLenen);
  return [
    {
      label: "Interesse",
      uitleg: !p.heeftInteresse
        ? "Doe de studietest voor een persoonlijke score"
        : (p.affiniteit >= 0.7
            ? `${sector.naam} past heel goed bij jou`
            : p.affiniteit >= 0.45
              ? `${sector.naam} vind je best interessant`
              : `${sector.naam} is niet echt jouw richting`) +
          (p.taalMis ? `, maar de opleiding is ${o.taal === "EN" ? "Engelstalig" : "Nederlandstalig"}` : ""),
      punten: Math.max(0, Math.round(50 * p.affiniteit) - (p.taalMis ? 10 : 0)),
      max: 50,
    },
    {
      label: "Toelating",
      uitleg: p.toelating.status === "deficientie" ? `Je mist ${p.toelating.mist.join(" en ")}` : p.toelating.reden,
      punten: TOELATING_PUNTEN[p.toelating.status],
      max: 10,
    },
    {
      label: "Geld",
      uitleg:
        p.teLenen <= 0
          ? "Je redt het zonder te lenen"
          : teVeel === 0
            ? `Je leent ${euro(p.teLenen)} per maand, binnen wat je wilt`
            : `Je moet ${euro(teVeel)} per maand meer lenen dan je wilt`,
      punten: Math.round(20 * clamp(1 - teVeel / 300)),
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
      punten: Math.round(20 * p.reisPunten),
      max: 20,
    },
  ];
}

/**
 * Match-score van 0 tot 100:
 *  - 50 punten: hoe goed de richting past bij je studietest (−10 als de taal niet past)
 *  - 10 punten: toelating met jouw profiel en vakken
 *  - 20 punten: geld: hoeveel je moet lenen tegenover wat je maximaal wilt lenen
 *  - 20 punten: reistijd
 * Kun je er niet heen: maximaal 40 punten. Mis je een vak: maximaal 70.
 */
export function matchScore(o: Opleiding, profiel: Profiel, r: number, k: Kosten): Match {
  const p = punten(o, profiel, r, geldVoor(k, profiel));
  return {
    score: p.score,
    toelaatbaar: p.toelating.status !== "nee",
    toelating: p.toelating,
    onderdelen: onderdelen(o, profiel, r, p),
  };
}

// ------------------------------------------------------------ alles samen

export interface Resultaat {
  opleiding: Opleiding;
  reistijd: number;
  reistijdSchatting: boolean;
  licht: Stoplicht;
  kosten: Kosten;
  geld: Plaatje;
  match: Match;
}

/** Reistijd, kosten en geld hangen alleen af van de plaats: die rekenen we per profiel één keer uit. */
const tussen = new WeakMap<
  Profiel,
  Map<string, { r: { minuten: number; schatting: boolean }; k: Kosten; g: Plaatje }>
>();

export function bereken(o: Opleiding, profiel: Profiel): Resultaat {
  let cache = tussen.get(profiel);
  if (!cache) tussen.set(profiel, (cache = new Map()));
  let rk = cache.get(o.plaats.naam);
  if (!rk) {
    const r = reistijd(profiel.woonplaats, o.plaats);
    const k = kosten(o, o.plaats, r.minuten, profiel);
    rk = { r, k, g: geldVoor(k, profiel) };
    cache.set(o.plaats.naam, rk);
  }
  const p = punten(o, profiel, rk.r.minuten, rk.g);
  let uitleg: ScoreOnderdeel[] | null = null;
  const minuten = rk.r.minuten;
  return {
    opleiding: o,
    reistijd: minuten,
    reistijdSchatting: rk.r.schatting,
    licht: stoplicht(minuten),
    kosten: rk.k,
    geld: rk.g,
    match: {
      score: p.score,
      toelaatbaar: p.toelating.status !== "nee",
      toelating: p.toelating,
      get onderdelen() {
        return (uitleg ??= onderdelen(o, profiel, minuten, p));
      },
    },
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
