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
  /** Voertaal: Nederlands, Engels of allebei (volgens DUO) */
  taal: "NL" | "EN" | "NL/EN" | null;
  /** Is een studiekeuzecheck verplicht? */
  studiekeuzecheck: boolean;
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

export type TaalVoorkeur = "beide" | "nl" | "en";

export interface Profiel {
  versie: 3;
  naam: string;
  woonplaats: Woonplaats;
  /** Interesse per richting, 0 (niks) tot 1 (helemaal mijn ding). Komt uit de studietest. */
  interesse: Partial<Record<SectorId, number>>;
  /** vwo = gewoon toelaatbaar; havo/mbo4 = via een hbo-propedeuse */
  vooropleiding: Vooropleiding | null;
  /** Alleen bij vmbo (niet gebruikt voor de universiteit) */
  leerweg: Leerweg | null;
  /** Je profiel(en) op het vwo, bijvoorbeeld NG en NT */
  profielen: ProfielNaam[];
  /** Je examenvakken die ertoe doen voor toelating */
  vakken: Vak[];
  /** Nederlands- of Engelstalig studeren */
  taal: TaalVoorkeur;
  wonen: Wonen;
  maxReistijd: number;
  /** Bruto inkomen van je ouders samen (2025), voor de aanvullende beurs. null = weet ik niet */
  ouderInkomen: number | null;
  /** Broers/zussen van 12–18 die nog naar school gaan (telt mee voor de aanvullende beurs) */
  andereKinderen: number;
  /** Wat je ouders per maand bijdragen */
  ouderBijdrage: number;
  /** Wat je per maand verdient met een bijbaan */
  bijbaan: number;
  /** Hoeveel je per maand maximaal wilt lenen bij DUO */
  maxLenen: number;
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
