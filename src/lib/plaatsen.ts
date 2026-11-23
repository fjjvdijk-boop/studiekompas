import { kosten, plaatsSlug, reistijd, stoplicht, type Kosten, type Stoplicht } from "./bereken";
import type { Data } from "./data";
import type { Instelling, Opleiding, Plaats, Profiel, SectorId, Soort } from "./types";

export interface PlaatsInfo {
  plaats: Plaats;
  slug: string;
  aantal: number;
  perSoort: Record<Soort, number>;
  perSector: Partial<Record<SectorId, number>>;
  instellingen: { instelling: Instelling; aantal: number }[];
  reistijd: number;
  reistijdSchatting: boolean;
  licht: Stoplicht;
  /** Maandlasten voor een hbo-student (of mbo als je alleen mbo zoekt) */
  kosten: Kosten;
}

export function plaatsOverzicht(
  data: Data,
  profiel: Profiel,
  filter: (o: Opleiding) => boolean = () => true,
  kostenSoort: Soort = "hbo",
): PlaatsInfo[] {
  const groepen = new Map<string, Opleiding[]>();
  for (const o of data.opleidingen) {
    if (!filter(o)) continue;
    const l = groepen.get(o.plaats.naam);
    if (l) l.push(o);
    else groepen.set(o.plaats.naam, [o]);
  }
  return [...groepen.values()]
    .map((lijst) => {
      const plaats = lijst[0].plaats;
      const perSoort: Record<Soort, number> = { mbo: 0, hbo: 0, wo: 0 };
      const perSector: Partial<Record<SectorId, number>> = {};
      const inst = new Map<Instelling, number>();
      for (const o of lijst) {
        perSoort[o.soort]++;
        perSector[o.sector] = (perSector[o.sector] ?? 0) + 1;
        inst.set(o.instelling, (inst.get(o.instelling) ?? 0) + 1);
      }
      const r = reistijd(profiel.woonplaats, plaats);
      return {
        plaats,
        slug: plaatsSlug(plaats.naam),
        aantal: lijst.length,
        perSoort,
        perSector,
        instellingen: [...inst.entries()]
          .map(([instelling, aantal]) => ({ instelling, aantal }))
          .sort((a, b) => b.aantal - a.aantal),
        reistijd: r.minuten,
        reistijdSchatting: r.schatting,
        licht: stoplicht(r.minuten),
        kosten: kosten({ soort: kostenSoort, leerwegen: null }, plaats, r.minuten, profiel),
      };
    })
    .sort((a, b) => b.aantal - a.aantal);
}
