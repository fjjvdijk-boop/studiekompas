import "server-only";
import type { SectorId } from "./types";
import { dataOpServer } from "./data-server";

/** Aantallen die we al op de server uitrekenen, zodat de pagina meteen klopt (en niet verspringt) */
export function statistiek() {
  const data = dataOpServer();
  const perSector: Partial<Record<SectorId, number>> = {};
  const perInstelling = new Map<string, { plaats: string; aantal: number; url: string | null }>();
  for (const o of data.opleidingen) {
    perSector[o.sector] = (perSector[o.sector] ?? 0) + 1;
    const i = perInstelling.get(o.instelling.naam) ?? { plaats: o.plaats.naam, aantal: 0, url: o.instelling.url };
    i.aantal++;
    perInstelling.set(o.instelling.naam, i);
  }
  return {
    totaal: data.opleidingen.length,
    engels: data.opleidingen.filter((o) => o.taal === "EN" || o.taal === "NL/EN").length,
    steden: data.plaatsen.length,
    perSector,
    instellingen: [...perInstelling.entries()].map(([naam, v]) => ({ naam, ...v })).sort((a, b) => b.aantal - a.aantal),
  };
}

export type Statistiek = ReturnType<typeof statistiek>;
