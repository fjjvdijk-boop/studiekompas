export const SECTOR_IDS = [
  "techniek",
  "ict",
  "zorg",
  "welzijn",
  "onderwijs",
  "economie",
  "recht",
  "natuur",
  "beta",
  "creatief",
  "taal",
  "horeca",
  "sport",
  "logistiek",
] as const;
export type SectorId = (typeof SECTOR_IDS)[number];

/** Onderwijssoort */
export type Soort = "mbo" | "hbo" | "wo";
/** Precies niveau: mbo 1–4, associate degree, hbo-bachelor, wo-bachelor */
export type Niveau = "mbo1" | "mbo2" | "mbo3" | "mbo4" | "ad" | "hbo" | "wo";

export interface Plaats {
  naam: string;
  provincie: string;
  lat: number;
  lng: number;
}

export interface Instelling {
  naam: string;
  soort: Soort;
  url: string | null;
}

export interface Opleiding {
  id: string;
  naam: string;
  /** Naam die de school zelf gebruikt, als die anders is */
  eigenNaam: string | null;
  instelling: Instelling;
  niveau: Niveau;
  soort: Soort;
  sector: SectorId;
  plaats: Plaats;
  /** Eerstejaars in het laatste studiejaar (alleen hbo/wo) */
  instroom: number | null;
  /** Duur in jaren */
  duur: number | null;
  /** BOL, BBL of BBL/BOL (alleen mbo) */
  leerwegen: string | null;
  url: string | null;
  /** CREBO- (mbo) of CROHO-code (hbo/wo) */
  code: string;
}

export interface Woonplaats {
  naam: string;
  gemeente: string;
  lat: number;
  lng: number;
}

export type Vooropleiding = "vmbo" | "havo" | "vwo" | "mbo4";
/** Leerweg op het vmbo */
export type Leerweg = "basis" | "kader" | "gl" | "tl";
/** Profiel op havo of vwo */
export type ProfielNaam = "NT" | "NG" | "EM" | "CM";
export const VAKKEN = [
  "wiskunde A",
  "wiskunde B",
  "wiskunde C",
  "natuurkunde",
  "scheikunde",
  "biologie",
  "economie",
  "bedrijfseconomie",
  "geschiedenis",
  "aardrijkskunde",
  "informatica",
  "NLT",
  "kunst",
  "Frans",
  "Duits",
  "Spaans",
] as const;
export type Vak = (typeof VAKKEN)[number];
export type Wonen = "thuis" | "kamer" | "allebei";

export interface Profiel {
  versie: 2;
  naam: string;
  woonplaats: Woonplaats;
  /** Interesse per sector, 0 (niks) tot 1 (helemaal mijn ding). Komt uit de vragenlijst. */
  interesse: Partial<Record<SectorId, number>>;
  vooropleiding: Vooropleiding | null;
  /** Alleen bij vmbo */
  leerweg: Leerweg | null;
  /** Alleen bij havo/vwo: je profiel(en), bijvoorbeeld NG en NT */
  profielen: ProfielNaam[];
  /** Alleen bij havo/vwo: je examenvakken die ertoe doen voor toelating */
  vakken: Vak[];
  /** Welke soorten onderwijs je wilt zien */
  soorten: Soort[];
  /** 0 = liever doen (praktijk), 1 = liever theorie */
  leerstijl: number;
  wonen: Wonen;
  budget: number;
  maxReistijd: number;
  vragenlijstKlaar: boolean;
}

export interface Favoriet {
  opleidingId: string;
  toegevoegd: string;
  /** Datum van de open dag die je wilt bezoeken (YYYY-MM-DD) */
  openDag: string | null;
  bezocht: boolean;
  cijfer: number | null;
  notitie: string;
}
