import type { SectorId } from "@/lib/types";

/**
 * De studiekeuze-vragenlijst: per interessegebied drie stellingen.
 * Antwoorden: 0 (helemaal niet) t/m 4 (helemaal wel). Het gemiddelde wordt je interesse (0–1) voor dat gebied.
 */
export const STELLINGEN: Record<SectorId, [string, string, string]> = {
  techniek: [
    "Ik wil weten hoe machines en apparaten van binnen werken",
    "Ik bouw, knutsel of repareer graag dingen met mijn handen",
    "Het lijkt me gaaf om iets te ontwerpen dat echt gebouwd wordt",
  ],
  ict: [
    "Ik programmeer, of zou dat graag willen leren",
    "Ik puzzel graag op logische problemen tot het werkt",
    "AI, games of apps: daar ben ik nieuwsgierig naar",
  ],
  zorg: [
    "Ik wil mensen helpen om beter te worden",
    "Het menselijk lichaam vind ik interessant",
    "Ik blijf rustig als iemand zich niet goed voelt",
  ],
  welzijn: [
    "Ik praat graag met mensen over wat hen bezighoudt",
    "Ik wil snappen waarom mensen doen wat ze doen",
    "Ik zet me graag in voor mensen die het moeilijk hebben",
  ],
  onderwijs: [
    "Ik leg graag dingen uit aan anderen",
    "Werken met kinderen of jongeren lijkt me leuk",
    "Ik zie mezelf later wel voor de klas staan",
  ],
  economie: [
    "Geld, bedrijven en ondernemen vind ik interessant",
    "Ik zou best een eigen bedrijf willen beginnen",
    "Ik organiseer en plan graag dingen",
  ],
  recht: [
    "Ik heb een sterk gevoel voor eerlijkheid en regels",
    "Ik discussieer graag en kan goed argumenteren",
    "Politiek en het nieuws volg ik met interesse",
  ],
  natuur: [
    "Ik ben graag buiten in de natuur",
    "Dieren of planten verzorgen lijkt me leuk",
    "Duurzaamheid en het klimaat vind ik belangrijk",
  ],
  beta: [
    "Wiskunde, natuurkunde of scheikunde vind ik leuk",
    "Experimenten doen in een lab lijkt me tof",
    "Ik wil echt snappen hoe de wereld in elkaar zit",
  ],
  creatief: [
    "Ik teken, ontwerp, fotografeer of maak muziek",
    "Ik heb een goed oog voor hoe iets eruitziet",
    "Ik wil iets maken dat mensen raakt",
  ],
  taal: [
    "Ik lees en schrijf graag",
    "Andere talen en culturen interesseren me",
    "Geschiedenis of filosofie vind ik boeiend",
  ],
  horeca: [
    "Ik zorg graag dat gasten het naar hun zin hebben",
    "Koken, bakken of evenementen organiseren lijkt me leuk",
    "Werken in toerisme, reizen of beauty trekt me",
  ],
  sport: [
    "Sport en bewegen zijn een groot deel van mijn leven",
    "Ik help anderen graag om fitter en gezonder te worden",
    "Werken bij de politie, defensie of beveiliging trekt me",
  ],
  logistiek: [
    "Schepen, vliegtuigen of vrachtwagens vind ik interessant",
    "Ik regel graag dat alles op tijd op de juiste plek is",
    "Ik zou best veel onderweg willen zijn voor mijn werk",
  ],
};

export const ANTWOORDEN = [
  { waarde: 0, emoji: "😖", label: "Echt niet" },
  { waarde: 1, emoji: "🙁", label: "Niet zo" },
  { waarde: 2, emoji: "😐", label: "Neutraal" },
  { waarde: 3, emoji: "🙂", label: "Wel leuk" },
  { waarde: 4, emoji: "🤩", label: "Helemaal!" },
] as const;

/** Volgorde in de vragenlijst: afwisselend, zodat het niet saai wordt */
export const VOLGORDE: SectorId[] = [
  "ict",
  "zorg",
  "creatief",
  "economie",
  "techniek",
  "welzijn",
  "natuur",
  "onderwijs",
  "beta",
  "horeca",
  "recht",
  "sport",
  "taal",
  "logistiek",
];

/** Zet antwoorden (0–4 per stelling) om naar interesse per sector (0–1) */
export function interesseUitAntwoorden(antwoorden: Partial<Record<SectorId, (number | null)[]>>) {
  const uit: Partial<Record<SectorId, number>> = {};
  for (const [sector, lijst] of Object.entries(antwoorden) as [SectorId, (number | null)[]][]) {
    const ingevuld = lijst.filter((x): x is number => x !== null);
    if (ingevuld.length) uit[sector] = ingevuld.reduce((a, b) => a + b, 0) / (ingevuld.length * 4);
  }
  return uit;
}
