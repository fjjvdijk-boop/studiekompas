import type { Profiel } from "@/lib/types";

/**
 * Rekenparameters. Pas deze aan als de bedragen veranderen.
 * Collegegeld 2027/2028: afgeleid uit het collegegeldkrediet van DUO (€ 230,92 per maand × 12).
 * Leefkosten: schatting op basis van het Nibud Studentenonderzoek.
 */
export const INSTELLINGEN = {
  studiejaar: "2027/2028",
  /** Wettelijk collegegeld per jaar */
  collegegeld: 2771,
  /** Niet meer gebruikt voor de universiteit, maar nodig voor oude code */
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
  versie: 3,
  naam: "",
  woonplaats: WIERDEN,
  interesse: {},
  vooropleiding: "vwo",
  leerweg: null,
  profielen: [],
  vakken: [],
  taal: "beide",
  wonen: "allebei",
  maxReistijd: 45,
  ouderInkomen: null,
  andereKinderen: 0,
  ouderBijdrage: 0,
  bijbaan: 250,
  maxLenen: 200,
  vragenlijstKlaar: false,
};
