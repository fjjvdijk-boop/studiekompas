/**
 * Aan een kamer komen, per universiteitsstad.
 * Bronnen: sites van universiteiten (huisvestingspagina's), ROOM.nl via Aedes en DUWO,
 * Kamernet Huurmonitor Q1 2025 (gemiddelde kamerhuur), NU.nl/Kassa 2026 (wachttijden).
 * Alleen informatie die we konden controleren; verder verwijzen we naar de officiële pagina's.
 */

export interface Huisvester {
  naam: string;
  url: string;
  tekst: string;
}

export interface KamerStad {
  /** Plaatsnaam zoals in de DUO-data */
  plaats: string;
  /** Gemiddelde kamerhuur volgens Kamernet (Q1 2025), of null als onbekend */
  kamernet: number | null;
  /** Wachttijd voor een studentenwoning via inschrijving, als die bekend is */
  wachttijd?: string;
  huisvesters: Huisvester[];
  /** Huisvestingspagina van de universiteit */
  uniPagina?: { label: string; url: string };
  tips: string[];
}

export const ROOM: Huisvester = {
  naam: "ROOM.nl",
  url: "https://www.room.nl",
  tekst:
    "Landelijk platform voor studentenwoningen van onder meer DUWO, SSH, Idealis en Lefier. Inschrijven kan vanaf 16 jaar; hoe langer je ingeschreven staat, hoe meer kans.",
};

const DUWO: Huisvester = {
  naam: "DUWO",
  url: "https://www.duwo.nl",
  tekst:
    "Grote studentenhuisvester. Het aanbod staat op ROOM.nl; bij hospiteerkamers kiezen de bewoners zelf hun nieuwe huisgenoot.",
};

export const KAMER_STEDEN: KamerStad[] = [
  {
    plaats: "Amsterdam",
    kamernet: 979,
    wachttijd: "ruim 5 jaar",
    huisvesters: [ROOM, DUWO],
    uniPagina: { label: "Huisvesting UvA", url: "https://www.uva.nl/onderwijs/praktische-informatie/huisvesting" },
    tips: [
      "Duurste studentenstad van Nederland: veel studenten wonen in de omgeving (Diemen, Amstelveen, Haarlem).",
      "VU-studenten: kijk ook op vu.nl/woneninamsterdam.",
    ],
  },
  {
    plaats: "Utrecht",
    kamernet: 803,
    huisvesters: [ROOM],
    tips: [
      "SSH biedt studentenwoningen aan via ROOM.nl.",
      "Veel studenten reizen het eerste jaar vanuit huis: Utrecht is goed bereikbaar met de trein.",
    ],
  },
  {
    plaats: "Leiden",
    kamernet: 638,
    huisvesters: [ROOM, DUWO],
    uniPagina: {
      label: "Op kamers in Leiden",
      url: "https://www.universiteitleiden.nl/onderwijs/bachelors/studentenleven/studentenstad-leiden/op-kamers",
    },
    tips: ["Veel kamers worden via studentenverenigingen en hospiteeravonden verhuurd."],
  },
  {
    plaats: "'s-Gravenhage",
    kamernet: null,
    huisvesters: [ROOM, DUWO],
    uniPagina: {
      label: "Op kamers in Den Haag",
      url: "https://www.universiteitleiden.nl/onderwijs/bachelors/studentenleven/studentenstad-den-haag/op-kamers",
    },
    tips: ["Campus Den Haag van de Universiteit Leiden: kijk ook naar kamers in Leiden of Delft."],
  },
  {
    plaats: "Delft",
    kamernet: 521,
    huisvesters: [ROOM, DUWO],
    tips: ["DUWO heeft veel studentenwoningen in Delft; hospiteren is gebruikelijk."],
  },
  {
    plaats: "Groningen",
    kamernet: 547,
    wachttijd: "ongeveer 3,5 jaar",
    huisvesters: [ROOM],
    tips: [
      "Lefier en SSH bieden woningen aan via ROOM.nl.",
      "Groningen heeft veel particuliere kamers: kijk ook op Kamernet en bij verenigingen.",
    ],
  },
  {
    plaats: "Nijmegen",
    kamernet: 599,
    huisvesters: [
      {
        naam: "SSH&",
        url: "https://www.ru.nl/studenten/nieuwe-studenten/op-kamers",
        tekst:
          "Stichting Studentenhuisvesting Nijmegen en Arnhem, partner van de Radboud Universiteit. Inschrijven is gratis; je betaalt pas als je een woning hebt.",
      },
    ],
    uniPagina: { label: "Een kamer vinden in Nijmegen", url: "https://www.ru.nl/studenten/nieuwe-studenten/op-kamers" },
    tips: ["Commerciële bemiddelaars kunnen ook, maar zijn vaak duurder."],
  },
  {
    plaats: "Enschede",
    kamernet: 397,
    huisvesters: [
      {
        naam: "Roomspot",
        url: "https://www.roomspot.nl",
        tekst:
          "Woonportaal voor Enschede en Hengelo, ook voor de campus. Schrijf je op tijd in: UT-studenten kunnen dan een gegarandeerd aanbod krijgen.",
      },
    ],
    uniPagina: {
      label: "Housing Universiteit Twente",
      url: "https://www.utwente.nl/en/campus/facilities/housing/students/",
    },
    tips: [
      "Voor een gegarandeerd aanbod van de UT schrijf je je in tussen 16 mei en 31 juli (of tussen 16 november en 15 januari).",
      "Goedkoopste studentenstad van Nederland, en je kunt op de campus zelf wonen.",
    ],
  },
  {
    plaats: "Wageningen",
    kamernet: 450,
    wachttijd: "ongeveer 3,5 jaar",
    huisvesters: [
      {
        naam: "Idealis",
        url: "https://www.room.nl",
        tekst: "De grote studentenhuisvester van Wageningen en Ede (± 6.300 woningen). Het aanbod staat op ROOM.nl.",
      },
    ],
    uniPagina: {
      label: "Huisvesting WUR",
      url: "https://www.wur.nl/nl/onderwijs/studeren-wageningen/studentenleven/huisvesting",
    },
    tips: ["Kijk ook naar kamers in Ede of Bennekom."],
  },
  {
    plaats: "Tilburg",
    kamernet: 563,
    wachttijd: "ongeveer 3 jaar",
    huisvesters: [ROOM],
    tips: ["Relatief de kortste wachttijd van de grote studentensteden."],
  },
  { plaats: "Eindhoven", kamernet: 620, huisvesters: [ROOM], tips: [] },
  {
    plaats: "Maastricht",
    kamernet: 511,
    huisvesters: [ROOM],
    tips: ["Maastricht scoort goed in de ranglijst voor studentenhuisvestingsbeleid van de LSVb."],
  },
  { plaats: "Rotterdam", kamernet: null, huisvesters: [ROOM], tips: [] },
];

export const KAMER_PER_PLAATS = new Map(KAMER_STEDEN.map((k) => [k.plaats, k]));

export const KAMER_LINKS = {
  kamernet: "https://kamernet.nl",
  studiekeuze123: "https://www.studiekeuze123.nl/op-kamers",
  huurcommissie: "https://www.huurcommissie.nl",
  belastingdienst: "https://www.belastingdienst.nl",
};

/** Stappenplan om aan een kamer te komen, voor wie in september 2027 begint */
export const KAMER_STAPPEN: { wanneer: string; titel: string; tekst: string }[] = [
  {
    wanneer: "Nu",
    titel: "Schrijf je in bij ROOM.nl",
    tekst:
      "Inschrijven kan vanaf 16 jaar, ook als je nog niet weet waar je gaat studeren. Bij veel woningen telt hoe lang je ingeschreven staat, dus elke maand eerder helpt.",
  },
  {
    wanneer: "Nu",
    titel: "En bij de huisvester van je stad",
    tekst:
      "Sommige steden hebben een eigen portaal, zoals Roomspot in Enschede of SSH& in Nijmegen. Kijk op de huisvestingspagina van je universiteit.",
  },
  {
    wanneer: "Voor 1 mei 2027",
    titel: "Meld je aan in Studielink",
    tekst:
      "Voor de meeste opleidingen is 1 mei de deadline, voor opleidingen met een numerus fixus 15 januari. Sommige huisvesters vragen een bewijs van inschrijving.",
  },
  {
    wanneer: "Mei – augustus",
    titel: "Zoek actief",
    tekst:
      "Reageer op hospiteerkamers, kijk op Kamernet, bij studentenverenigingen en in groepen van je stad. Hospiteren (kennismaken met huisgenoten) is heel gewoon.",
  },
  {
    wanneer: "Altijd",
    titel: "Pas op voor oplichting",
    tekst:
      "Betaal nooit voordat je de kamer hebt gezien en een contract hebt. Check met de puntentelling van de Huurcommissie of de huur redelijk is.",
  },
  {
    wanneer: "Als je verhuist",
    titel: "Schrijf je in bij de gemeente",
    tekst:
      "Pas als je op je kameradres staat ingeschreven, krijg je de uitwonende basisbeurs van DUO (€ 335,10 in plaats van € 134,45 per maand). Geef het ook door in Mijn DUO.",
  },
  {
    wanneer: "Goed om te weten",
    titel: "Huurtoeslag krijg je meestal niet",
    tekst:
      "Huurtoeslag is alleen voor een zelfstandige woonruimte met eigen voordeur, keuken en wc. Voor een studentenkamer met gedeelde voorzieningen meestal niet.",
  },
  {
    wanneer: "Plan B",
    titel: "Het eerste jaar thuis wonen",
    tekst:
      "Met het studentenreisproduct reis je gratis met het OV. Veel studenten wonen het eerste jaar thuis en zoeken ondertussen een kamer.",
  },
];
