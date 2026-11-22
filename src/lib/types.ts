export type Niveau = "hbo" | "wo";

export const SECTOREN = [
  "Economie",
  "Gedrag en Maatschappij",
  "Gezondheidszorg",
  "Natuur",
  "Onderwijs",
  "Recht",
  "Taal en Cultuur",
  "Techniek",
] as const;
export type Sector = (typeof SECTOREN)[number];

export interface Stad {
  id: string;
  naam: string;
  provincie: string;
  lat: number;
  lng: number;
  /** Gemiddelde kamerhuur per maand (€), indicatief – Kamernet Huurmonitor */
  kamerhuur: number;
  /** Reistijd met de trein vanaf de thuisstad, enkele reis (min), indicatief – NS */
  reistijd: number;
  overstappen: number;
}

export interface Opleiding {
  id: string;
  naam: string;
  instelling: string;
  niveau: Niveau;
  sector: Sector;
  stadId: string;
  /** Eerstejaars per jaar, indicatief – DUO */
  instroom: number;
  duur: number;
  selectie: boolean;
  website: string;
  omschrijving: string;
}

export type OpenDagSoort = "Open dag" | "Meeloopdag" | "Proefstuderen";

export interface OpenDag {
  id: string;
  opleidingId: string;
  /** YYYY-MM-DD */
  datum: string;
  start: string;
  eind: string;
  soort: OpenDagSoort;
  link: string;
}

export interface Profiel {
  naam: string;
  interesses: Sector[];
  niveau: Niveau | "beide";
  /** Maximaal budget per maand (€) */
  budget: number;
  /** Maximale reistijd enkele reis (min) om thuis te blijven wonen */
  maxReistijd: number;
}

export interface Favoriet {
  opleidingId: string;
  toegevoegd: string;
  bezocht: boolean;
  cijfer: number | null;
  notitie: string;
}
