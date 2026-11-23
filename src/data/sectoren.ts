import type { SectorId } from "@/lib/types";

export interface SectorInfo {
  id: SectorId;
  naam: string;
  kort: string;
  emoji: string;
  /** Kleur (hex) voor badges, grafieken en de kaart */
  kleur: string;
  tekst: string;
}

export const SECTOREN: SectorInfo[] = [
  {
    id: "techniek",
    naam: "Techniek & Bouw",
    kort: "Techniek",
    emoji: "🛠️",
    kleur: "#f97316",
    tekst: "Bouwen, maken, repareren en ontwerpen: van elektrotechniek tot werktuigbouwkunde.",
  },
  {
    id: "ict",
    naam: "ICT & Data",
    kort: "ICT",
    emoji: "💻",
    kleur: "#6366f1",
    tekst: "Software, data, AI, netwerken en cybersecurity.",
  },
  {
    id: "zorg",
    naam: "Zorg & Gezondheid",
    kort: "Zorg",
    emoji: "🩺",
    kleur: "#ef4444",
    tekst: "Mensen beter maken en gezond houden: verpleegkunde, geneeskunde, fysiotherapie.",
  },
  {
    id: "welzijn",
    naam: "Mens & Maatschappij",
    kort: "Mens",
    emoji: "🤝",
    kleur: "#ec4899",
    tekst: "Psychologie, sociaal werk, begeleiding en HR.",
  },
  {
    id: "onderwijs",
    naam: "Onderwijs & Kinderen",
    kort: "Onderwijs",
    emoji: "🍎",
    kleur: "#f59e0b",
    tekst: "Lesgeven, kinderopvang en jongeren begeleiden.",
  },
  {
    id: "economie",
    naam: "Economie & Business",
    kort: "Business",
    emoji: "📈",
    kleur: "#0ea5e9",
    tekst: "Ondernemen, marketing, finance, management en handel.",
  },
  {
    id: "recht",
    naam: "Recht & Bestuur",
    kort: "Recht",
    emoji: "⚖️",
    kleur: "#64748b",
    tekst: "Rechten, bestuurskunde, criminologie en politiek.",
  },
  {
    id: "natuur",
    naam: "Natuur, Dieren & Voeding",
    kort: "Natuur",
    emoji: "🌱",
    kleur: "#22c55e",
    tekst: "Dieren, planten, landbouw, voeding en duurzaamheid.",
  },
  {
    id: "beta",
    naam: "Wetenschap & Lab",
    kort: "Bèta",
    emoji: "🔬",
    kleur: "#14b8a6",
    tekst: "Wiskunde, natuurkunde, scheikunde en laboratoriumwerk.",
  },
  {
    id: "creatief",
    naam: "Kunst, Media & Design",
    kort: "Creatief",
    emoji: "🎨",
    kleur: "#a855f7",
    tekst: "Ontwerpen, muziek, film, mode, fotografie en podium.",
  },
  {
    id: "taal",
    naam: "Taal, Cultuur & Communicatie",
    kort: "Taal",
    emoji: "🌍",
    kleur: "#8b5cf6",
    tekst: "Talen, geschiedenis, filosofie, journalistiek en communicatie.",
  },
  {
    id: "horeca",
    naam: "Horeca, Toerisme & Beauty",
    kort: "Horeca",
    emoji: "🍽️",
    kleur: "#e11d48",
    tekst: "Koken, gastvrijheid, evenementen, reizen en uiterlijke verzorging.",
  },
  {
    id: "sport",
    naam: "Sport & Veiligheid",
    kort: "Sport",
    emoji: "🏃",
    kleur: "#10b981",
    tekst: "Sport en bewegen, politie, defensie en beveiliging.",
  },
  {
    id: "logistiek",
    naam: "Transport & Logistiek",
    kort: "Logistiek",
    emoji: "🚢",
    kleur: "#0891b2",
    tekst: "Scheepvaart, luchtvaart, vervoer en logistiek.",
  },
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
  wo: "wo",
};

export const NIVEAU_UITLEG: Record<string, string> = {
  mbo1: "Entree-opleiding, toegang tot mbo 2",
  mbo2: "Basisberoepsopleiding",
  mbo3: "Vakopleiding",
  mbo4: "Middenkader- of specialistenopleiding, toegang tot hbo",
  ad: "Associate degree: 2-jarige hbo-opleiding",
  hbo: "Hbo-bachelor",
  wo: "Wo-bachelor (universiteit)",
};
