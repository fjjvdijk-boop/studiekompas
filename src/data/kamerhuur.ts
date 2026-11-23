/**
 * Gemiddelde kamerhuur per maand (€), INDICATIEF.
 * Gebaseerd op de orde van grootte uit de Kamernet Huurmonitor. Vervang door de nieuwste cijfers.
 * Voor plaatsen die hier niet staan gebruikt de app een schatting per provincie.
 */
export const KAMERHUUR: Record<string, number> = {
  Amsterdam: 1000,
  Amstelveen: 900,
  Diemen: 900,
  Haarlem: 750,
  Utrecht: 720,
  "'s-Gravenhage": 700,
  Leiden: 690,
  Delft: 680,
  Eindhoven: 660,
  Rotterdam: 650,
  Amersfoort: 650,
  Almere: 650,
  Alkmaar: 650,
  Zoetermeer: 650,
  Rijswijk: 650,
  "'s-Hertogenbosch": 620,
  Breda: 600,
  Maastricht: 600,
  Tilburg: 560,
  Nijmegen: 560,
  Ede: 550,
  Dordrecht: 550,
  Helmond: 550,
  Arnhem: 540,
  Zwolle: 540,
  Groningen: 520,
  Deventer: 520,
  Apeldoorn: 520,
  Wageningen: 500,
  Leeuwarden: 480,
  Venlo: 480,
  Enschede: 470,
  Hengelo: 470,
  Almelo: 450,
  Heerlen: 450,
  Sittard: 450,
  Vlissingen: 450,
  Middelburg: 450,
  Assen: 450,
  Emmen: 420,
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
  if (plaats.naam in KAMERHUUR) return { bedrag: KAMERHUUR[plaats.naam], schatting: false };
  return { bedrag: KAMERHUUR_PROVINCIE[plaats.provincie] ?? 500, schatting: true };
}
