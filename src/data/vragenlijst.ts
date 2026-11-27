import type { SectorId } from "@/lib/types";
import type { FotoSleutel } from "./fotos";

/**
 * De studietest, opgebouwd als een story:
 *  1. Je kiest eerst een grote richting (of "ik twijfel").
 *  2. Daarna krijg je zes vragen die bij die richting horen, elk met vier antwoorden (A–D).
 * Elk antwoord geeft punten aan één of meer richtingen. Per richting delen we door het maximum
 * dat je in jouw route had kunnen halen, zodat je een percentage krijgt.
 */

type Gewichten = Partial<Record<SectorId, number>>;

export interface Antwoord {
  tekst: string;
  /** Punten per richting (1 = volle punten) */
  punten: Gewichten;
  /** Korte reden voor op de uitslag, bijvoorbeeld "je wilt een ziekte genezen" */
  reden?: string;
}

export interface Vraag {
  vraag: string;
  /** Het woord dat vet wordt in de vraag */
  nadruk?: string;
  foto: FotoSleutel;
  antwoorden: [Antwoord, Antwoord, Antwoord, Antwoord];
}

export type DomeinId = "beta" | "mens" | "cultuur" | "twijfel";

export interface Domein {
  id: DomeinId;
  tekst: string;
  /** Richtingen die bij dit domein horen */
  richtingen: SectorId[];
  foto: FotoSleutel;
}

export const DOMEINEN: Domein[] = [
  {
    id: "beta",
    tekst: "Ik puzzel graag met getallen, techniek, de natuur of het menselijk lichaam.",
    richtingen: ["beta", "techniek", "ict", "zorg", "natuur"],
    foto: "lab",
  },
  {
    id: "mens",
    tekst: "Ik wil snappen hoe mensen, bedrijven en de samenleving werken, en daar iets aan veranderen.",
    richtingen: ["welzijn", "economie", "recht"],
    foto: "collegezaal",
  },
  {
    id: "cultuur",
    tekst: "Ik ben gek op taal, geschiedenis, kunst, media of de grote vragen van het leven.",
    richtingen: ["taal", "creatief"],
    foto: "bibliotheek",
  },
  {
    id: "twijfel",
    tekst: "Eerlijk gezegd: ik twijfel nog tussen van alles.",
    richtingen: [],
    foto: "fietsen",
  },
];

export const VRAGEN: Record<DomeinId, Vraag[]> = {
  beta: [
    {
      vraag: "Waar word je het meest nieuwsgierig van?",
      nadruk: "nieuwsgierig",
      foto: "heelal",
      antwoorden: [
        { tekst: "Hoe het heelal is begonnen", punten: { beta: 1 }, reden: "het heelal maakt je nieuwsgierig" },
        {
          tekst: "Hoe een zelfrijdende auto werkt",
          punten: { techniek: 1, ict: 0.4 },
          reden: "je wilt weten hoe machines werken",
        },
        {
          tekst: "Hoe je hersenen iets onthouden",
          punten: { zorg: 1, beta: 0.3 },
          reden: "het menselijk lichaam boeit je",
        },
        { tekst: "Hoe een bos herstelt na een brand", punten: { natuur: 1 }, reden: "de natuur boeit je" },
      ],
    },
    {
      vraag: "Wat zou je het liefst een dag doen?",
      nadruk: "een dag",
      foto: "code",
      antwoorden: [
        { tekst: "Een app programmeren", punten: { ict: 1 }, reden: "je zou graag een dag programmeren" },
        { tekst: "Meelopen met een chirurg", punten: { zorg: 1 }, reden: "je wilt meelopen in het ziekenhuis" },
        { tekst: "Een robot of brug ontwerpen", punten: { techniek: 1 }, reden: "je wilt iets ontwerpen en bouwen" },
        { tekst: "Proeven doen in een lab", punten: { beta: 1, natuur: 0.3 }, reden: "je staat graag in het lab" },
      ],
    },
    {
      vraag: "Welk YouTube-konijnenhol is voor jou?",
      nadruk: "YouTube-konijnenhol",
      foto: "studeren",
      antwoorden: [
        { tekst: "Wiskundige raadsels en paradoxen", punten: { beta: 1, ict: 0.3 } },
        { tekst: "Medische mysteries", punten: { zorg: 1 } },
        { tekst: "Megabouwprojecten", punten: { techniek: 1 } },
        { tekst: "Natuurdocumentaires", punten: { natuur: 1 } },
      ],
    },
    {
      vraag: "Welk probleem wil jij oplossen?",
      nadruk: "jij",
      foto: "ziekenhuis",
      antwoorden: [
        {
          tekst: "Een medicijn vinden tegen een ziekte",
          punten: { zorg: 1, beta: 0.4 },
          reden: "je wilt een ziekte helpen genezen",
        },
        {
          tekst: "Genoeg eten voor tien miljard mensen",
          punten: { natuur: 1 },
          reden: "je wilt het voedselprobleem oplossen",
        },
        {
          tekst: "Schone energie voor iedereen",
          punten: { techniek: 1, beta: 0.3 },
          reden: "je wilt werken aan schone energie",
        },
        { tekst: "Hackers buiten de deur houden", punten: { ict: 1 }, reden: "je wilt systemen beveiligen" },
      ],
    },
    {
      vraag: "Welke zin past het best bij jou?",
      nadruk: "past",
      foto: "techniek",
      antwoorden: [
        {
          tekst: "Ik wil snappen waarom, tot op de formule",
          punten: { beta: 1 },
          reden: "je wilt alles tot op de formule snappen",
        },
        {
          tekst: "Ik wil iets bouwen dat het gewoon doet",
          punten: { techniek: 1 },
          reden: "je wilt dingen maken die werken",
        },
        { tekst: "Ik vind patronen in data", punten: { ict: 1, beta: 0.3 }, reden: "je zoekt graag patronen in data" },
        {
          tekst: "Ik wil iets betekenen voor patiënten",
          punten: { zorg: 1 },
          reden: "je wilt iets betekenen voor patiënten",
        },
      ],
    },
    {
      vraag: "Waar zie je jezelf over tien jaar?",
      nadruk: "over tien jaar",
      foto: "natuur",
      antwoorden: [
        { tekst: "In een ziekenhuis", punten: { zorg: 1 }, reden: "je ziet jezelf in een ziekenhuis" },
        {
          tekst: "Bij een techbedrijf",
          punten: { ict: 1, techniek: 0.3 },
          reden: "je ziet jezelf bij een techbedrijf",
        },
        { tekst: "Buiten, in het veld", punten: { natuur: 1 }, reden: "je ziet jezelf buiten aan het werk" },
        { tekst: "In een onderzoekslab", punten: { beta: 1 }, reden: "je ziet jezelf in een onderzoekslab" },
      ],
    },
  ],
  mens: [
    {
      vraag: "Je hebt een vrije middag. Wat lees je?",
      nadruk: "Wat lees je?",
      foto: "collegezaal",
      antwoorden: [
        {
          tekst: "Waarom we ons zo makkelijk laten beïnvloeden",
          punten: { welzijn: 1 },
          reden: "je wilt weten waarom mensen doen wat ze doen",
        },
        {
          tekst: "Hoe een startup zo snel kon groeien",
          punten: { economie: 1 },
          reden: "bedrijven en groei boeien je",
        },
        { tekst: "Een longread over een grote rechtszaak", punten: { recht: 1 }, reden: "rechtszaken boeien je" },
        {
          tekst: "Nieuws over een verkiezing ver weg",
          punten: { recht: 0.6, taal: 0.4, welzijn: 0.3 },
          reden: "je volgt wat er in de wereld gebeurt",
        },
      ],
    },
    {
      vraag: "In een groepsopdracht ben jij degene die…",
      nadruk: "jij",
      foto: "samenwerken",
      antwoorden: [
        {
          tekst: "zorgt dat iedereen zich gehoord voelt",
          punten: { welzijn: 1 },
          reden: "je let op hoe het met de groep gaat",
        },
        {
          tekst: "de planning en het budget bewaakt",
          punten: { economie: 1 },
          reden: "je houdt van plannen en cijfers",
        },
        { tekst: "de argumenten scherp maakt", punten: { recht: 1 }, reden: "je maakt argumenten graag scherp" },
        { tekst: "het onderwerp in een groter verband zet", punten: { taal: 0.5, welzijn: 0.5 } },
      ],
    },
    {
      vraag: "Welke vraag zou jij willen beantwoorden?",
      nadruk: "beantwoorden",
      foto: "studeren",
      antwoorden: [
        { tekst: "Waarom voelen zoveel jongeren zich eenzaam?", punten: { welzijn: 1 } },
        { tekst: "Waarom worden huizen steeds duurder?", punten: { economie: 1 } },
        { tekst: "Mag de overheid in je telefoon kijken?", punten: { recht: 1 } },
        { tekst: "Waarom voeren landen oorlog?", punten: { recht: 0.5, taal: 0.5 } },
      ],
    },
    {
      vraag: "Welke baan klinkt het leukst?",
      nadruk: "baan",
      foto: "economie",
      antwoorden: [
        {
          tekst: "Psycholoog of onderzoeker",
          punten: { welzijn: 1, zorg: 0.2 },
          reden: "je ziet jezelf als psycholoog of onderzoeker",
        },
        {
          tekst: "Consultant of ondernemer",
          punten: { economie: 1 },
          reden: "je ziet jezelf als consultant of ondernemer",
        },
        { tekst: "Advocaat of rechter", punten: { recht: 1 }, reden: "je ziet jezelf als advocaat of rechter" },
        {
          tekst: "Diplomaat of beleidsmaker",
          punten: { recht: 0.7, economie: 0.3 },
          reden: "je ziet jezelf in de politiek of diplomatie",
        },
      ],
    },
    {
      vraag: "Welke podcast zet je aan?",
      nadruk: "podcast",
      foto: "recht",
      antwoorden: [
        { tekst: "Over het brein en gedrag", punten: { welzijn: 1, zorg: 0.3 } },
        { tekst: "Over geld en ondernemen", punten: { economie: 1 } },
        { tekst: "True crime", punten: { recht: 1 } },
        { tekst: "Over geschiedenis en politiek", punten: { taal: 0.6, recht: 0.4 } },
      ],
    },
    {
      vraag: "Wat drijft jou?",
      nadruk: "drijft",
      foto: "fietsen",
      antwoorden: [
        { tekst: "Mensen verder helpen", punten: { welzijn: 1 }, reden: "je wilt mensen verder helpen" },
        { tekst: "Iets opbouwen dat groeit", punten: { economie: 1 }, reden: "je wilt iets opbouwen" },
        { tekst: "Opkomen voor wat eerlijk is", punten: { recht: 1 }, reden: "je komt op voor wat eerlijk is" },
        { tekst: "Snappen hoe de samenleving in elkaar zit", punten: { welzijn: 0.6, recht: 0.4 } },
      ],
    },
  ],
  cultuur: [
    {
      vraag: "Wat doe je het liefst in je vrije tijd?",
      nadruk: "vrije tijd",
      foto: "bibliotheek",
      antwoorden: [
        {
          tekst: "Lezen, het liefst in een andere taal",
          punten: { taal: 1 },
          reden: "je leest graag, ook in andere talen",
        },
        {
          tekst: "Films en series uitpluizen",
          punten: { creatief: 0.7, taal: 0.3 },
          reden: "je pluist films en series uit",
        },
        { tekst: "Musea en oude steden bezoeken", punten: { taal: 1 }, reden: "je houdt van musea en geschiedenis" },
        {
          tekst: "Iets maken: schrijven, fotograferen, video",
          punten: { creatief: 1 },
          reden: "je maakt graag zelf iets",
        },
      ],
    },
    {
      vraag: "Welke vraag laat je niet los?",
      nadruk: "niet los",
      foto: "studeren",
      antwoorden: [
        { tekst: "Hoe ontstaat een taal?", punten: { taal: 1 }, reden: "je wilt weten hoe taal werkt" },
        {
          tekst: "Waarom gaat iets viral?",
          punten: { creatief: 1, welzijn: 0.3 },
          reden: "je wilt weten waarom iets viral gaat",
        },
        {
          tekst: "Wat is een goed leven?",
          punten: { taal: 0.7, welzijn: 0.3 },
          reden: "je denkt na over de grote vragen",
        },
        { tekst: "Hoe leefden de Romeinen?", punten: { taal: 1 }, reden: "het verleden boeit je" },
      ],
    },
    {
      vraag: "Je mag een jaar weg. Wat ga je doen?",
      nadruk: "een jaar",
      foto: "museum",
      antwoorden: [
        { tekst: "In Japan de taal leren", punten: { taal: 1 } },
        { tekst: "Stage lopen bij een omroep of krant", punten: { creatief: 1 } },
        { tekst: "Opgravingen doen in Griekenland", punten: { taal: 1 } },
        { tekst: "Werken bij een museum in Parijs", punten: { creatief: 0.5, taal: 0.5 } },
      ],
    },
    {
      vraag: "Welke rol past bij jou?",
      nadruk: "rol",
      foto: "theater",
      antwoorden: [
        {
          tekst: "Vertaler of schrijver",
          punten: { taal: 1, creatief: 0.3 },
          reden: "je ziet jezelf als schrijver of vertaler",
        },
        {
          tekst: "Journalist of programmamaker",
          punten: { creatief: 1, recht: 0.2 },
          reden: "je ziet jezelf in de journalistiek of media",
        },
        { tekst: "Onderzoeker in een archief", punten: { taal: 1 }, reden: "je ziet jezelf als onderzoeker" },
        {
          tekst: "Curator of cultuurmaker",
          punten: { creatief: 1 },
          reden: "je ziet jezelf in de kunst- en cultuurwereld",
        },
      ],
    },
    {
      vraag: "Waar ben je goed in?",
      nadruk: "goed",
      foto: "samenwerken",
      antwoorden: [
        { tekst: "Talen oppikken", punten: { taal: 1 } },
        { tekst: "Een verhaal vertellen", punten: { creatief: 1 } },
        { tekst: "Een betoog opbouwen", punten: { recht: 0.5, taal: 0.5 } },
        { tekst: "Aanvoelen wat iemand bedoelt", punten: { welzijn: 0.6, creatief: 0.4 } },
      ],
    },
    {
      vraag: "Welk vak ga je straks het meest missen?",
      nadruk: "missen",
      foto: "collegezaal",
      antwoorden: [
        { tekst: "Engels of een andere taal", punten: { taal: 1 }, reden: "je mist straks je talenvakken" },
        { tekst: "Geschiedenis", punten: { taal: 1 }, reden: "je mist straks geschiedenis" },
        { tekst: "Filosofie", punten: { taal: 0.7, welzijn: 0.3 }, reden: "je mist straks filosofie" },
        { tekst: "Kunst of CKV", punten: { creatief: 1 }, reden: "je mist straks kunst" },
      ],
    },
  ],
  twijfel: [
    {
      vraag: "Op welke kop klik je het eerst?",
      nadruk: "het eerst",
      foto: "heelal",
      antwoorden: [
        {
          tekst: "“Nieuwe planeet ontdekt die op de aarde lijkt”",
          punten: { beta: 1 },
          reden: "nieuws over ontdekkingen trekt je",
        },
        {
          tekst: "“Rechter zet streep door nieuwe wet”",
          punten: { recht: 1 },
          reden: "nieuws over recht en politiek trekt je",
        },
        {
          tekst: "“Waarom we steeds slechter slapen”",
          punten: { welzijn: 1, zorg: 0.4 },
          reden: "je wilt weten hoe mensen werken",
        },
        {
          tekst: "“Studenten-startup haalt miljoenen op”",
          punten: { economie: 1, ict: 0.3 },
          reden: "ondernemen trekt je",
        },
      ],
    },
    {
      vraag: "Wat zou je een dag willen doen?",
      nadruk: "een dag",
      foto: "ziekenhuis",
      antwoorden: [
        { tekst: "Een robot programmeren", punten: { ict: 1, techniek: 0.5 }, reden: "je zou graag iets programmeren" },
        { tekst: "Meekijken in een ziekenhuis", punten: { zorg: 1 }, reden: "je wilt meekijken in de zorg" },
        {
          tekst: "Een tentoonstelling inrichten",
          punten: { creatief: 1, taal: 0.3 },
          reden: "je wilt iets creatiefs maken",
        },
        { tekst: "Veldwerk doen in een natuurgebied", punten: { natuur: 1 }, reden: "je bent graag buiten" },
      ],
    },
    {
      vraag: "Welk vak vind je het leukst?",
      nadruk: "het leukst",
      foto: "collegezaal",
      antwoorden: [
        {
          tekst: "Wiskunde of natuurkunde",
          punten: { beta: 1, techniek: 0.5 },
          reden: "wiskunde en natuurkunde zijn je favoriet",
        },
        { tekst: "Biologie", punten: { natuur: 0.6, zorg: 0.6 }, reden: "biologie is je favoriete vak" },
        { tekst: "Economie", punten: { economie: 1 }, reden: "economie is je favoriete vak" },
        { tekst: "Een taal of geschiedenis", punten: { taal: 1 }, reden: "talen of geschiedenis zijn je favoriet" },
      ],
    },
    {
      vraag: "Wat wil je later vooral doen?",
      nadruk: "later",
      foto: "techniek",
      antwoorden: [
        { tekst: "Iets ontwerpen en bouwen", punten: { techniek: 1 }, reden: "je wilt later ontwerpen en bouwen" },
        { tekst: "Mensen begrijpen en helpen", punten: { welzijn: 1 }, reden: "je wilt later mensen helpen" },
        { tekst: "Discussiëren en overtuigen", punten: { recht: 1 }, reden: "je wilt later overtuigen" },
        {
          tekst: "Iets maken dat mensen raakt",
          punten: { creatief: 1 },
          reden: "je wilt later iets maken dat mensen raakt",
        },
      ],
    },
    {
      vraag: "Welk probleem wil jij oplossen?",
      nadruk: "jij",
      foto: "natuur",
      antwoorden: [
        {
          tekst: "Klimaatverandering",
          punten: { natuur: 1, techniek: 0.4 },
          reden: "je wilt iets doen aan het klimaat",
        },
        { tekst: "Een ziekte genezen", punten: { zorg: 1, beta: 0.4 }, reden: "je wilt een ziekte helpen genezen" },
        { tekst: "Nepnieuws tegengaan", punten: { creatief: 0.5, ict: 0.5 } },
        { tekst: "Armoede verminderen", punten: { economie: 0.6, welzijn: 0.5 } },
      ],
    },
    {
      vraag: "Hoe werk je het liefst?",
      nadruk: "het liefst",
      foto: "code",
      antwoorden: [
        { tekst: "Met data en computers", punten: { ict: 1 }, reden: "je werkt graag met data en computers" },
        { tekst: "In een lab, met proeven", punten: { beta: 1 }, reden: "je werkt graag in een lab" },
        { tekst: "Met teksten en bronnen", punten: { taal: 1 }, reden: "je werkt graag met teksten" },
        { tekst: "Met cijfers en plannen", punten: { economie: 1 }, reden: "je werkt graag met cijfers" },
      ],
    },
  ],
};

export interface Antwoorden {
  domein: DomeinId | null;
  /** Per vraag in de route: 0–3 (A–D) of null */
  keuzes: (number | null)[];
}

export const LEGE_ANTWOORDEN: Antwoorden = { domein: null, keuzes: [] };

const ALLE: SectorId[] = [
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

/** Gewicht van de eerste keuze (domein) tegenover de zes vragen */
const DOMEIN_GEWICHT = 0.3;

export interface Uitslag {
  interesse: Partial<Record<SectorId, number>>;
  redenen: Partial<Record<SectorId, string[]>>;
}

export function berekenUitslag(a: Antwoorden): Uitslag {
  const interesse: Partial<Record<SectorId, number>> = {};
  const redenen: Partial<Record<SectorId, string[]>> = {};
  if (!a.domein) {
    for (const s of ALLE) interesse[s] = 0;
    return { interesse, redenen };
  }
  const domein = DOMEINEN.find((d) => d.id === a.domein)!;
  const vragen = VRAGEN[a.domein];

  const punten: Partial<Record<SectorId, number>> = {};
  const max: Partial<Record<SectorId, number>> = {};
  vragen.forEach((v, i) => {
    // Maximum: het hoogste wat je bij deze vraag voor een richting kon halen
    for (const s of ALLE) {
      const hoogste = Math.max(...v.antwoorden.map((x) => x.punten[s] ?? 0));
      if (hoogste) max[s] = (max[s] ?? 0) + hoogste;
    }
    const k = a.keuzes[i];
    if (k === null || k === undefined) return;
    const gekozen = v.antwoorden[k];
    for (const [s, w] of Object.entries(gekozen.punten) as [SectorId, number][]) {
      punten[s] = (punten[s] ?? 0) + w;
      if (gekozen.reden && w >= 0.5) (redenen[s] ??= []).push(gekozen.reden);
    }
  });

  for (const s of ALLE) {
    const uitVragen = max[s] ? (punten[s] ?? 0) / max[s]! : 0;
    const uitDomein = domein.richtingen.length === 0 ? 0.5 : domein.richtingen.includes(s) ? 1 : 0;
    interesse[s] = Math.min(1, DOMEIN_GEWICHT * uitDomein + (1 - DOMEIN_GEWICHT) * uitVragen);
  }
  // Kleine richtingen afleiden van verwante hoofdrichtingen
  interesse.sport = ((interesse.zorg ?? 0) + (interesse.welzijn ?? 0)) / 2;
  interesse.onderwijs = interesse.welzijn ?? 0;
  interesse.horeca = (interesse.economie ?? 0) * 0.8;
  interesse.logistiek = (interesse.techniek ?? 0) * 0.9;
  return { interesse, redenen };
}
