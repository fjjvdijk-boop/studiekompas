import type { SectorId } from "@/lib/types";
import meta from "./fotos.json";

/**
 * Alle foto's in de app. Ze komen van Wikimedia Commons, met een vrije licentie (CC0, CC BY of CC BY-SA).
 * De bestanden staan in /public/fotos als WebP (800 en 1600 pixels breed); maker, licentie en bron staan in
 * fotos.json en worden bij elke foto vermeld. Bijwerken en volledige verantwoording: zie scripts/fotos.md.
 */
export interface FotoInfo {
  alt: string;
  maker: string;
  licentie: string;
  bron: string;
  titel: string;
  /** Gemiddelde kleur, zichtbaar terwijl de foto laadt */
  kleur: string;
  /** Uitsnede, als CSS object-position */
  positie?: string;
}

export type FotoSleutel = keyof typeof meta;
export const FOTOS: Record<FotoSleutel, FotoInfo> = meta;

/** Foto per richting */
export const SECTOR_FOTO: Record<SectorId, FotoSleutel> = {
  beta: "lab",
  techniek: "techniek",
  ict: "code",
  zorg: "ziekenhuis",
  natuur: "natuur",
  welzijn: "samenwerken",
  economie: "economie",
  recht: "recht",
  taal: "bibliotheek",
  creatief: "theater",
  sport: "fietsen",
  onderwijs: "collegezaal",
  horeca: "economie",
  logistiek: "techniek",
};

/** Foto per universiteitsstad (DUO-plaatsnaam) */
export const STAD_FOTO: Record<string, FotoSleutel> = {
  Amsterdam: "stad-amsterdam",
  Groningen: "stad-groningen",
  Utrecht: "stad-utrecht",
  Leiden: "stad-leiden",
  Rotterdam: "stad-rotterdam",
  Delft: "stad-delft",
  Nijmegen: "stad-nijmegen",
  Tilburg: "stad-tilburg",
  Eindhoven: "stad-eindhoven",
  Enschede: "stad-enschede",
  Maastricht: "stad-maastricht",
  Wageningen: "stad-wageningen",
};
