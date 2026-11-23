import type { SectorId } from "@/lib/types";

export interface SectorInfo {
  id: SectorId;
  naam: string;
  kort: string;
  /** Rustige kleur voor labels, grafieken en de kaart */
  kleur: string;
  tekst: string;
  /** Voorbeelden van opleidingen, voor bij de studietest */
  voorbeelden: string;
}

export const SECTOREN: SectorInfo[] = [
  {
    id: "beta",
    naam: "Natuurwetenschap & Wiskunde",
    kort: "Bèta",
    kleur: "#2e6e7a",
    tekst: "Natuurkunde, scheikunde, wiskunde en sterrenkunde: snappen hoe de wereld werkt.",
    voorbeelden: "Natuurkunde, Scheikunde, Wiskunde, Econometrie",
  },
  {
    id: "techniek",
    naam: "Techniek & Ontwerp",
    kort: "Techniek",
    kleur: "#3c5a73",
    tekst: "Bouwen, ontwerpen en uitvinden: van bruggen tot robots.",
    voorbeelden: "Werktuigbouwkunde, Bouwkunde, Industrieel Ontwerpen",
  },
  {
    id: "ict",
    naam: "Informatica & Data",
    kort: "Informatica",
    kleur: "#4a4e8c",
    tekst: "Software, data, AI en de digitale samenleving.",
    voorbeelden: "Informatica, Kunstmatige Intelligentie, Data Science",
  },
  {
    id: "zorg",
    naam: "Geneeskunde & Gezondheid",
    kort: "Gezondheid",
    kleur: "#a3443a",
    tekst: "Het menselijk lichaam, ziekte en gezondheid.",
    voorbeelden: "Geneeskunde, Biomedische Wetenschappen, Farmacie",
  },
  {
    id: "natuur",
    naam: "Leven & Aarde",
    kort: "Leven & Aarde",
    kleur: "#5e7d3a",
    tekst: "Biologie, voeding, klimaat, dieren en de aarde zelf.",
    voorbeelden: "Biologie, Aardwetenschappen, Voeding en Gezondheid",
  },
  {
    id: "welzijn",
    naam: "Gedrag & Maatschappij",
    kort: "Gedrag",
    kleur: "#8a4f6e",
    tekst: "Hoe mensen denken, leren en samenleven.",
    voorbeelden: "Psychologie, Sociologie, Pedagogische Wetenschappen",
  },
  {
    id: "economie",
    naam: "Economie & Bedrijf",
    kort: "Economie",
    kleur: "#2f6b53",
    tekst: "Markten, bedrijven, geld en strategie.",
    voorbeelden: "Economie, Bedrijfskunde, International Business",
  },
  {
    id: "recht",
    naam: "Recht & Bestuur",
    kort: "Recht",
    kleur: "#5b5346",
    tekst: "Wetten, rechtspraak, politiek en bestuur.",
    voorbeelden: "Rechtsgeleerdheid, Bestuurskunde, Criminologie",
  },
  {
    id: "taal",
    naam: "Taal, Cultuur & Geschiedenis",
    kort: "Cultuur",
    kleur: "#6b4e8c",
    tekst: "Talen, literatuur, geschiedenis, filosofie en religie.",
    voorbeelden: "Geschiedenis, Filosofie, Engelse Taal en Cultuur",
  },
  {
    id: "creatief",
    naam: "Kunst, Media & Communicatie",
    kort: "Media",
    kleur: "#8c4f2b",
    tekst: "Media, kunst, communicatie en de wereld van ideeën.",
    voorbeelden: "Media en Cultuur, Communicatiewetenschap, Kunstgeschiedenis",
  },
  {
    id: "onderwijs",
    naam: "Onderwijs",
    kort: "Onderwijs",
    kleur: "#a17322",
    tekst: "Leren en lesgeven.",
    voorbeelden: "Onderwijswetenschappen",
  },
  {
    id: "sport",
    naam: "Sport & Bewegen",
    kort: "Sport",
    kleur: "#3f7d5c",
    tekst: "Beweging, prestatie en gezondheid.",
    voorbeelden: "Bewegingswetenschappen",
  },
  {
    id: "horeca",
    naam: "Toerisme & Vrije tijd",
    kort: "Toerisme",
    kleur: "#a0522d",
    tekst: "Toerisme, vrije tijd en gastvrijheid.",
    voorbeelden: "Vrijetijdwetenschappen, Tourism",
  },
  {
    id: "logistiek",
    naam: "Zee & Ruimte",
    kort: "Zee & Ruimte",
    kleur: "#3b6e8f",
    tekst: "Scheepvaart, luchtvaart en ruimtevaart.",
    voorbeelden: "Maritieme Techniek",
  },
];

/** De tien hoofdrichtingen waar de studietest over gaat */
export const HOOFDRICHTINGEN: SectorId[] = [
  "beta",
  "techniek",
  "ict",
  "zorg",
  "natuur",
  "welzijn",
  "economie",
  "recht",
  "taal",
  "creatief",
];

export const SECTOR: Record<SectorId, SectorInfo> = Object.fromEntries(SECTOREN.map((s) => [s.id, s])) as Record<
  SectorId,
  SectorInfo
>;

export const NIVEAU_LABEL: Record<string, string> = {
  mbo1: "mbo 1",
  mbo2: "mbo 2",
  mbo3: "mbo 3",
  mbo4: "mbo 4",
  ad: "Ad",
  hbo: "hbo",
  wo: "Bachelor",
};

export const NIVEAU_UITLEG: Record<string, string> = {
  wo: "Universitaire bachelor, daarna meestal een master",
  hbo: "Hbo-bachelor",
  ad: "Associate degree",
  mbo1: "Entree",
  mbo2: "Basisberoepsopleiding",
  mbo3: "Vakopleiding",
  mbo4: "Middenkaderopleiding",
};
