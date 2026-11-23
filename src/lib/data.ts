import type { Instelling, Niveau, Opleiding, Plaats, SectorId, Soort } from "./types";

/** Het compacte formaat van public/data/opleidingen.json (gemaakt door scripts/bouw-data.py) */
export interface RuweData {
  versie: number;
  gegenereerd: string;
  bron: string;
  sectoren: SectorId[];
  plaatsen: Plaats[];
  instellingen: Instelling[];
  opleidingen: [
    string,
    string,
    string | null,
    number,
    Niveau,
    number,
    number,
    number | null,
    number | null,
    string | null,
    string | null,
    string,
    ("NL" | "EN" | "NL/EN" | null)?,
    boolean?,
  ][];
}

export interface Data {
  gegenereerd: string;
  opleidingen: Opleiding[];
  plaatsen: Plaats[];
  instellingen: Instelling[];
  perId: Map<string, Opleiding>;
}

export const soortVan = (n: Niveau): Soort => (n.startsWith("mbo") ? "mbo" : n === "wo" ? "wo" : "hbo");

export function decodeer(ruw: RuweData): Data {
  const opleidingen = ruw.opleidingen.map(
    ([
      id,
      naam,
      eigenNaam,
      inst,
      niveau,
      sector,
      plaats,
      instroom,
      duur,
      leerwegen,
      url,
      code,
      taal,
      check,
    ]): Opleiding => ({
      id,
      naam,
      eigenNaam,
      instelling: ruw.instellingen[inst],
      niveau,
      soort: soortVan(niveau),
      sector: ruw.sectoren[sector],
      plaats: ruw.plaatsen[plaats],
      instroom,
      duur,
      leerwegen,
      url,
      code,
      taal: taal ?? null,
      studiekeuzecheck: check ?? false,
    }),
  );
  return {
    gegenereerd: ruw.gegenereerd,
    opleidingen,
    plaatsen: ruw.plaatsen,
    instellingen: ruw.instellingen,
    perId: new Map(opleidingen.map((o) => [o.id, o])),
  };
}
