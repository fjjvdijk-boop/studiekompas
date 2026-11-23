import type { SectorId } from "@/lib/types";

/**
 * De studietest. Vier soorten vragen, die elk punten geven aan richtingen:
 *  1. Favoriete schoolvakken (max. 3)
 *  2. Dit of dat (8 keer kiezen tussen twee activiteiten)
 *  3. Toekomstbeeld: waar zie je jezelf werken? (max. 2)
 *  4. Stellingen, één per richting (schaal 0–4)
 * De punten per richting worden gedeeld door het maximum dat je had kunnen halen: zo krijg je 0–100%.
 */

type Gewichten = Partial<Record<SectorId, number>>;

export const SCHOOLVAKKEN: { naam: string; gewicht: Gewichten }[] = [
  { naam: "Wiskunde B", gewicht: { beta: 1, techniek: 1, ict: 0.8 } },
  { naam: "Wiskunde A", gewicht: { economie: 1, welzijn: 0.5, ict: 0.5 } },
  { naam: "Natuurkunde", gewicht: { beta: 1, techniek: 1 } },
  { naam: "Scheikunde", gewicht: { beta: 1, zorg: 0.6, natuur: 0.6 } },
  { naam: "Biologie", gewicht: { natuur: 1, zorg: 1 } },
  { naam: "Informatica", gewicht: { ict: 1, techniek: 0.4 } },
  { naam: "Economie", gewicht: { economie: 1 } },
  { naam: "Bedrijfseconomie", gewicht: { economie: 1, recht: 0.3 } },
  { naam: "Geschiedenis", gewicht: { taal: 1, recht: 0.5 } },
  { naam: "Aardrijkskunde", gewicht: { natuur: 0.8, welzijn: 0.5 } },
  { naam: "Maatschappijwetenschappen", gewicht: { welzijn: 1, recht: 0.8 } },
  { naam: "Filosofie", gewicht: { taal: 1, welzijn: 0.5 } },
  { naam: "Nederlands", gewicht: { taal: 0.8, creatief: 0.6 } },
  { naam: "Engels", gewicht: { taal: 1, creatief: 0.3 } },
  { naam: "Frans, Duits of Spaans", gewicht: { taal: 1 } },
  { naam: "Latijn of Grieks", gewicht: { taal: 1, recht: 0.3 } },
  { naam: "Kunst of CKV", gewicht: { creatief: 1, taal: 0.4 } },
  { naam: "NLT", gewicht: { beta: 0.6, natuur: 0.6, techniek: 0.6 } },
];

export interface Keuze {
  tekst: string;
  sector: SectorId;
  /** Andere richtingen die ook een beetje meetellen */
  ook?: Gewichten;
}

export const DIT_OF_DAT: [Keuze, Keuze][] = [
  [
    { tekst: "Uitrekenen waarom een brug niet instort", sector: "techniek", ook: { beta: 0.5 } },
    { tekst: "Uitzoeken waarom mensen in een groep anders doen", sector: "welzijn" },
  ],
  [
    { tekst: "Een app bouwen die mensen echt helpt", sector: "ict" },
    { tekst: "Met een arts meedenken over een diagnose", sector: "zorg", ook: { natuur: 0.3 } },
  ],
  [
    { tekst: "Een rechtszaak voorbereiden", sector: "recht" },
    { tekst: "De strategie van een bedrijf bedenken", sector: "economie" },
  ],
  [
    { tekst: "Een brief uit de 17e eeuw ontcijferen", sector: "taal" },
    { tekst: "Een experiment opzetten in een lab", sector: "beta", ook: { zorg: 0.3 } },
  ],
  [
    { tekst: "Onderzoek doen naar het klimaat", sector: "natuur", ook: { beta: 0.4 } },
    { tekst: "Een documentaire of campagne maken", sector: "creatief", ook: { taal: 0.3 } },
  ],
  [
    { tekst: "Een lastig wiskundeprobleem kraken", sector: "beta", ook: { ict: 0.4 } },
    { tekst: "Een debat winnen", sector: "recht", ook: { taal: 0.3 } },
  ],
  [
    { tekst: "Een product ontwerpen en testen", sector: "techniek", ook: { creatief: 0.4 } },
    { tekst: "Een boek of film tot op de bodem uitpluizen", sector: "taal", ook: { creatief: 0.5 } },
  ],
  [
    { tekst: "Met data voorspellen wat er gaat gebeuren", sector: "ict", ook: { economie: 0.5, beta: 0.3 } },
    { tekst: "Jongeren helpen die het moeilijk hebben", sector: "welzijn", ook: { zorg: 0.3 } },
  ],
];

export const TOEKOMST: { titel: string; tekst: string; sector: SectorId }[] = [
  { titel: "In een laboratorium", tekst: "Onderzoek doen en ontdekken", sector: "beta" },
  { titel: "Bij een ingenieursbureau", tekst: "Ontwerpen, bouwen, verbeteren", sector: "techniek" },
  { titel: "Bij een techbedrijf", tekst: "Software, data en AI", sector: "ict" },
  { titel: "In een ziekenhuis", tekst: "Zorg en medisch onderzoek", sector: "zorg" },
  { titel: "Buiten, in de natuur", tekst: "Veldwerk, voeding, klimaat", sector: "natuur" },
  { titel: "Met mensen", tekst: "Als psycholoog of onderzoeker", sector: "welzijn" },
  { titel: "Bij een bedrijf of bank", tekst: "Strategie, markten en geld", sector: "economie" },
  { titel: "Bij de rechtbank of overheid", tekst: "Recht, beleid en politiek", sector: "recht" },
  { titel: "In een museum of archief", tekst: "Talen, cultuur, geschiedenis", sector: "taal" },
  { titel: "Bij de media", tekst: "Verhalen vertellen en maken", sector: "creatief" },
];

export const STELLINGEN: Record<string, string> = {
  beta: "Ik wil echt snappen waarom iets werkt, tot op de formule.",
  techniek: "Ik wil dingen maken die echt gebouwd of gebruikt worden.",
  ict: "Programmeren of met data werken lijkt me leuk.",
  zorg: "Het menselijk lichaam en ziektes vind ik interessant.",
  natuur: "Klimaat, natuur of voedsel: daar wil ik iets mee.",
  welzijn: "Ik denk vaak na over waarom mensen doen wat ze doen.",
  economie: "Ik ben benieuwd hoe bedrijven en markten werken.",
  recht: "Regels, rechtvaardigheid en politiek houden me bezig.",
  taal: "Ik lees veel, en ben nieuwsgierig naar talen, culturen of vroeger.",
  creatief: "Ik wil iets maken of vertellen dat mensen raakt.",
};

export const SCHAAL = ["Helemaal niet", "Niet echt", "Neutraal", "Wel", "Helemaal"] as const;

export const PUNTEN = { vak: 3, keuze: 4, allebei: 2, toekomst: 5, stelling: 2 } as const;

export interface Antwoorden {
  vakken: string[];
  /** Per dit-of-dat-vraag: 0 = links, 1 = rechts, 2 = allebei, 3 = geen van beide */
  keuzes: (0 | 1 | 2 | 3 | null)[];
  toekomst: SectorId[];
  /** Per richting: 0–4 */
  stellingen: Partial<Record<SectorId, number>>;
}

export const LEGE_ANTWOORDEN: Antwoorden = {
  vakken: [],
  keuzes: Array(DIT_OF_DAT.length).fill(null),
  toekomst: [],
  stellingen: {},
};

const telOp = (t: Partial<Record<SectorId, number>>, g: Gewichten, factor: number) => {
  for (const [s, w] of Object.entries(g) as [SectorId, number][]) t[s] = (t[s] ?? 0) + w * factor;
};

/** Maximaal haalbare punten per richting */
function maxima(): Partial<Record<SectorId, number>> {
  const m: Partial<Record<SectorId, number>> = {};
  // vakken: de 3 vakken die het meest opleveren voor deze richting
  for (const s of Object.keys(STELLINGEN) as SectorId[]) {
    const vak =
      SCHOOLVAKKEN.map((v) => v.gewicht[s] ?? 0)
        .sort((a, b) => b - a)
        .slice(0, 3)
        .reduce((a, b) => a + b, 0) * PUNTEN.vak;
    let keuze = 0;
    for (const paar of DIT_OF_DAT)
      keuze += Math.max(...paar.map((k) => (k.sector === s ? 1 : (k.ook?.[s] ?? 0)))) * PUNTEN.keuze;
    m[s] = vak + keuze + PUNTEN.toekomst + 4 * PUNTEN.stelling;
  }
  return m;
}
const MAX = maxima();

export interface Uitslag {
  interesse: Partial<Record<SectorId, number>>;
  /** Waarom een richting hoog scoort */
  redenen: Partial<Record<SectorId, string[]>>;
}

/** Zet de antwoorden om naar interesse per richting (0–1), met redenen */
export function berekenUitslag(a: Antwoorden): Uitslag {
  const punten: Partial<Record<SectorId, number>> = {};
  const redenen: Partial<Record<SectorId, string[]>> = {};
  const reden = (s: SectorId, r: string) => (redenen[s] ??= []).push(r);

  for (const naam of a.vakken) {
    const vak = SCHOOLVAKKEN.find((v) => v.naam === naam);
    if (!vak) continue;
    telOp(punten, vak.gewicht, PUNTEN.vak);
    for (const [s, w] of Object.entries(vak.gewicht) as [SectorId, number][])
      if (w >= 0.8) reden(s, `Je vindt ${naam.toLowerCase()} leuk`);
  }
  a.keuzes.forEach((k, i) => {
    if (k === null || k === 3) return;
    const paar = DIT_OF_DAT[i];
    const gekozen = k === 2 ? paar : [paar[k]];
    for (const c of gekozen) {
      const f = k === 2 ? PUNTEN.allebei : PUNTEN.keuze;
      telOp(punten, { [c.sector]: 1, ...c.ook }, f);
      if (k !== 2) reden(c.sector, `Je koos: “${c.tekst.toLowerCase()}”`);
    }
  });
  for (const s of a.toekomst) {
    telOp(punten, { [s]: 1 }, PUNTEN.toekomst);
    const t = TOEKOMST.find((x) => x.sector === s);
    if (t) reden(s, `Je ziet jezelf werken ${t.titel.toLowerCase()}`);
  }
  for (const [s, w] of Object.entries(a.stellingen) as [SectorId, number][]) {
    telOp(punten, { [s]: 1 }, w * PUNTEN.stelling);
    if (w >= 3) reden(s, `Je bent het eens met: “${STELLINGEN[s].replace(/\.$/, "").toLowerCase()}”`);
  }

  const interesse: Partial<Record<SectorId, number>> = {};
  for (const s of Object.keys(MAX) as SectorId[]) interesse[s] = Math.min(1, (punten[s] ?? 0) / (MAX[s] || 1));
  // Kleine richtingen afleiden van verwante hoofdrichtingen
  interesse.sport = ((interesse.zorg ?? 0) + (interesse.welzijn ?? 0)) / 2;
  interesse.onderwijs = interesse.welzijn ?? 0;
  interesse.horeca = (interesse.economie ?? 0) * 0.8;
  interesse.logistiek = (interesse.techniek ?? 0) * 0.9;
  return { interesse, redenen };
}
