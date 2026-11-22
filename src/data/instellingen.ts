/**
 * Rekenparameters. Pas deze aan als de bedragen veranderen.
 * Bronnen: duo.nl (collegegeld), Nibud Studentenonderzoek (leefkosten).
 */
export const INSTELLINGEN = {
  thuisstad: "Wierden",
  /** Wettelijk collegegeld per jaar (2025-2026: €2.601) */
  collegegeld: 2601,
  boekenPerJaar: 600,
  /** Leefkosten per maand zonder huur: eten, verzekering, telefoon, kleding, uitgaan */
  leefUitwonend: 550,
  /** Leefkosten per maand als je thuis woont (bijdrage, eten buiten de deur, telefoon) */
  leefThuis: 250,
  /** Stoplicht-grenzen in minuten (enkele reis) */
  groenTot: 45,
  oranjeTot: 75,
} as const;

export const STANDAARD_PROFIEL = {
  naam: "",
  interesses: [],
  niveau: "beide",
  budget: 800,
  maxReistijd: 45,
} as const;
