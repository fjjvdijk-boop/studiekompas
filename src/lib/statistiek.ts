import "server-only";
import type { SectorId } from "./types";
import { dataOpServer } from "./data-server";

/** Aantallen die we al op de server uitrekenen, zodat de pagina meteen klopt (en niet verspringt) */
export function statistiek() {
  const t = { totaal: 0, mbo: 0, hbo: 0, wo: 0, perSector: {} as Partial<Record<SectorId, number>> };
  for (const o of dataOpServer().opleidingen) {
    t[o.soort]++;
    t.totaal++;
    t.perSector[o.sector] = (t.perSector[o.sector] ?? 0) + 1;
  }
  return t;
}
