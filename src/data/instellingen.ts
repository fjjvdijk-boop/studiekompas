import type { Profiel } from "@/lib/types";

/**
 * Rekenparameters. Pas deze aan als de bedragen veranderen.
 * Bronnen: duo.nl en rijksoverheid.nl (collegegeld en lesgeld 2026/2027), Nibud (leefkosten, schatting).
 */
export const INSTELLINGEN = {
  studiejaar: "2026/2027",
  /** Wettelijk collegegeld hbo/wo per jaar */
  collegegeld: 2694,
  /** Lesgeld mbo per jaar (alleen BOL en alleen als je 18 of ouder bent) */
  lesgeldMbo: 1511,
  boekenHo: 600,
  boekenMbo: 400,
  /** Leefkosten per maand zonder huur: eten, zorgverzekering, telefoon, kleding, uitgaan */
  leefUitwonend: 550,
  /** Leefkosten per maand als je thuis woont */
  leefThuis: 250,
  /** Stoplicht-grenzen in minuten (enkele reis) */
  groenTot: 45,
  oranjeTot: 75,
} as const;

export const WIERDEN = { naam: "Wierden", gemeente: "Wierden", lat: 52.3592, lng: 6.5928 };

export const STANDAARD_PROFIEL: Profiel = {
  versie: 2,
  naam: "",
  woonplaats: WIERDEN,
  interesse: {},
  vooropleiding: null,
  leerweg: null,
  profielen: [],
  vakken: [],
  soorten: ["mbo", "hbo", "wo"],
  leerstijl: 0.5,
  wonen: "allebei",
  budget: 800,
  maxReistijd: 45,
  vragenlijstKlaar: false,
};
