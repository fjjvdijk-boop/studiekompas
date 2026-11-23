import { KAMER_PER_PLAATS } from "./kamers";

/**
 * Gemiddelde kamerhuur per maand (€).
 * Waar bekend: Kamernet Huurmonitor Q1 2025. Anders een schatting.
 */
const SCHATTING: Record<string, number> = {
  Rotterdam: 650,
  "'s-Gravenhage": 700,
  Breda: 569,
  Leeuwarden: 480,
  Middelburg: 450,
  Venlo: 480,
  Apeldoorn: 520,
};

export const KAMERHUUR_PROVINCIE: Record<string, number> = {
  "Noord-Holland": 750,
  "Zuid-Holland": 620,
  Utrecht: 650,
  Flevoland: 600,
  "Noord-Brabant": 560,
  Gelderland: 520,
  Overijssel: 480,
  Limburg: 470,
  Groningen: 470,
  Zeeland: 450,
  Friesland: 450,
  Fryslân: 450,
  Drenthe: 440,
};

export function kamerhuurVan(plaats: { naam: string; provincie: string }): { bedrag: number; schatting: boolean } {
  const k = KAMER_PER_PLAATS.get(plaats.naam)?.kamernet;
  if (k) return { bedrag: k, schatting: false };
  return { bedrag: SCHATTING[plaats.naam] ?? KAMERHUUR_PROVINCIE[plaats.provincie] ?? 550, schatting: true };
}
