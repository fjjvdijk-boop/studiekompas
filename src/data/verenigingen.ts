/**
 * Studenten- en studieverenigingen.
 * Alleen verenigingen die we konden controleren via de officiële sites van universiteiten en hogescholen.
 * Bij elke stad staat een link naar het officiële, volledige overzicht.
 */

export type VerenigingSoort = "gezelligheid" | "christelijk" | "internationaal" | "sport" | "cultuur" | "lhbti";

export interface Vereniging {
  naam: string;
  soort: VerenigingSoort;
  tekst: string;
  /** Eigen website, alleen als die is gecontroleerd */
  url?: string;
}

export interface StadVerenigingen {
  /** Plaatsnaam zoals in de DUO-data */
  plaats: string;
  intro: string;
  verenigingen: Vereniging[];
  overzichten: { label: string; url: string }[];
}

export const SOORT_LABEL: Record<VerenigingSoort, { label: string; emoji: string }> = {
  gezelligheid: { label: "Gezelligheid", emoji: "" },
  christelijk: { label: "Christelijk", emoji: "" },
  internationaal: { label: "Internationaal", emoji: "" },
  sport: { label: "Sport", emoji: "" },
  cultuur: { label: "Cultuur", emoji: "" },
  lhbti: { label: "LHBTI+", emoji: "" },
};

export const STUDENTENVERENIGINGEN: StadVerenigingen[] = [
  {
    plaats: "Enschede",
    intro: "Studentenleven rond de Oude Markt en op de campus van de UT. Tientallen sport- en cultuurverenigingen.",
    verenigingen: [
      {
        naam: "A.S.V. Taste",
        soort: "gezelligheid",
        tekst:
          "Grootste studentenvereniging van Enschede, met jaarclubs, disputen en ruim 30 commissies. Sociëteit in de Pakkerij aan de Oude Markt.",
        url: "https://asvtaste.utwente.nl",
      },
      { naam: "Alpha", soort: "christelijk", tekst: "Grootste christelijke studentenvereniging van Enschede." },
      {
        naam: "Navigators Studentenvereniging Enschede",
        soort: "christelijk",
        tekst: "Christelijke studentenvereniging met kleine disputen.",
      },
      {
        naam: "AEGEE-Enschede",
        soort: "internationaal",
        tekst: "Open, Europese studentenvereniging voor alle studenten in de stad.",
      },
      {
        naam: "ESN Enschede",
        soort: "internationaal",
        tekst: "Helpt internationale en uitwisselingsstudenten op weg.",
      },
      { naam: "Exaltio", soort: "lhbti", tekst: "Vereniging voor LHBTI+-studenten en -jongeren." },
    ],
    overzichten: [
      {
        label: "Verenigingen Universiteit Twente",
        url: "https://www.utwente.nl/onderwijs/bachelor/studentenleven/verenigingen/",
      },
      {
        label: "Student associations Saxion",
        url: "https://www.saxion.edu/studying-in-the-netherlands/life-in-the-nl/student-associations",
      },
    ],
  },
  {
    plaats: "Deventer",
    intro: "Compacte studentenstad met Saxion als grootste hogeschool.",
    verenigingen: [
      {
        naam: "Nescio",
        soort: "gezelligheid",
        tekst:
          "Grootste studentenvereniging van Deventer (± 150 leden): broederschap, gelijkwaardigheid en diversiteit.",
      },
      { naam: "S.V. Pro Deo", soort: "christelijk", tekst: "Voor christelijke hbo-studenten in Deventer en omgeving." },
    ],
    overzichten: [
      {
        label: "Student associations Saxion",
        url: "https://www.saxion.edu/studying-in-the-netherlands/life-in-the-nl/student-associations",
      },
    ],
  },
  {
    plaats: "Zwolle",
    intro: "Studentenstad van Windesheim en hogeschool Viaa, met algemene, studie- en geloofsverenigingen.",
    verenigingen: [
      {
        naam: "Oikos Nomos",
        soort: "gezelligheid",
        tekst: "Gezellige studentenvereniging die staat voor plezier, diversiteit en solidariteit.",
      },
      { naam: "ESN Zwolle", soort: "internationaal", tekst: "Inclusieve activiteiten voor internationale studenten." },
    ],
    overzichten: [
      {
        label: "Student life in Zwolle (Windesheim)",
        url: "https://www.windesheim.com/practical-information/student-life-in-zwolle",
      },
    ],
  },
  {
    plaats: "Groningen",
    intro: "Een van de grootste studentensteden van Nederland, met de oudste studentenvereniging van het land.",
    verenigingen: [
      {
        naam: "G.S.C. Vindicat atque Polit",
        soort: "gezelligheid",
        tekst: "Opgericht in 1815: de oudste studentenvereniging van Nederland.",
      },
      {
        naam: "R.K.S.V. Albertus Magnus",
        soort: "gezelligheid",
        tekst: "Grote, traditionele vereniging met een open karakter (opgericht 1896).",
      },
      {
        naam: "A.S.V. Dizkartes",
        soort: "gezelligheid",
        tekst: "Ongeveer 1000 leden; eerstejaars en ouderejaars worden gelijk behandeld.",
      },
      { naam: "Cleopatra A.S.G.", soort: "gezelligheid", tekst: "Algemene studentenvereniging in Groningen." },
      { naam: "Unitas S.G.", soort: "gezelligheid", tekst: "Algemene studentenvereniging in Groningen." },
      { naam: "F.F.J. Bernlef", soort: "gezelligheid", tekst: "Vereniging voor Friese studenten in Groningen." },
      {
        naam: "Navigators S.G.",
        soort: "christelijk",
        tekst: "Een van de grootste christelijke studentenverenigingen van Groningen (± 350 leden).",
      },
      { naam: "GSV Groningen", soort: "christelijk", tekst: "Christelijke studentenvereniging." },
    ],
    overzichten: [
      {
        label: "Studentenverenigingen RUG",
        url: "https://www.rug.nl/education/bachelor/nederlandse-studenten/studeren-in-groningen/verenigingen/studentenverenigingen?lang=nl",
      },
    ],
  },
  {
    plaats: "Utrecht",
    intro: "Ruim 100 erkende studentenorganisaties. Zeven grote gezelligheidsverenigingen werken samen in de F.U.G.",
    verenigingen: [
      {
        naam: "Utrechtsch Studenten Corps",
        soort: "gezelligheid",
        tekst: "Traditionele studentenvereniging, lid van de F.U.G.",
      },
      { naam: "UVSV", soort: "gezelligheid", tekst: "Vrouwenvereniging met ruim 1500 leden." },
      { naam: "Veritas", soort: "gezelligheid", tekst: "Bijna 1900 leden; vroeger katholiek, nu algemeen." },
      { naam: "SSR-NU", soort: "gezelligheid", tekst: "Gezelligheidsvereniging, lid van de F.U.G." },
      { naam: "UMTC", soort: "gezelligheid", tekst: "Gezelligheidsvereniging, lid van de F.U.G." },
      {
        naam: "Unitas S.R.",
        soort: "gezelligheid",
        tekst: "Voor studenten van zowel de Universiteit als de Hogeschool Utrecht.",
      },
      { naam: "Biton", soort: "gezelligheid", tekst: "Inclusief: geen ontgroening, geen hiërarchie en geen selectie." },
      {
        naam: "Navigators Studentenvereniging Utrecht",
        soort: "christelijk",
        tekst: "Ruim 600 leden verdeeld over 26 disputen.",
      },
    ],
    overzichten: [
      {
        label: "Studentenorganisaties UU",
        url: "https://students.uu.nl/homepagina/studentenleven-en-vrije-tijd/studentenorganisaties",
      },
    ],
  },
  {
    plaats: "Amsterdam",
    intro: "Honderden verenigingen voor studenten van UvA, VU, HvA en het mbo.",
    verenigingen: [
      {
        naam: "A.S.C./A.V.S.V.",
        soort: "gezelligheid",
        tekst: "Amsterdamsch Studenten Corps: de grootste traditionele vereniging van de stad.",
      },
      { naam: "LANX", soort: "gezelligheid", tekst: "Studentenvereniging met een kennismakingstijd." },
      { naam: "Unitas", soort: "gezelligheid", tekst: "Studentenvereniging met vestigingen in Amsterdam en Utrecht." },
      { naam: "Nonomes", soort: "gezelligheid", tekst: "Studentenvereniging met een kennismakingstijd." },
      { naam: "SSRA", soort: "gezelligheid", tekst: "Studentenvereniging met een kennismakingstijd." },
    ],
    overzichten: [
      {
        label: "Overzicht studentenverenigingen UvA",
        url: "https://student.uva.nl/onderwerpen/overzicht-studentenverenigingen",
      },
      { label: "Studentenverenigingen VU", url: "https://vu.nl/nl/student/verenigingen/studentenverenigingen" },
    ],
  },
  {
    plaats: "Delft",
    intro: "Vijf grote studentenverenigingen, en daarnaast tientallen sportverenigingen.",
    verenigingen: [
      {
        naam: "Delftsch Studenten Corps",
        soort: "gezelligheid",
        tekst: "Oudste vereniging van Delft (1848), aan de Phoenixstraat.",
      },
      {
        naam: "K.S.V. Sanctus Virgilius (Virgiel)",
        soort: "gezelligheid",
        tekst: "Grootste studentenvereniging van Delft (opgericht 1898).",
      },
      {
        naam: "D.S.V. Sint Jansbrug",
        soort: "gezelligheid",
        tekst: "Gemengde vereniging met ± 700 leden; als eerste in Delft ook voor vrouwen (1969).",
      },
      { naam: "Delftsche Studenten Bond", soort: "gezelligheid", tekst: "Een van de vijf grote Delftse verenigingen." },
      {
        naam: "C.S.R. Delft",
        soort: "christelijk",
        tekst: "Christelijke studentenvereniging (Civitas Studiosorum Reformatorum).",
      },
    ],
    overzichten: [
      { label: "Associations TU Delft", url: "https://www.tudelft.nl/en/education/practical-matters/associations" },
      {
        label: "D.S.V. Sint Jansbrug (TU Delft)",
        url: "https://www.tudelft.nl/onderwijs/praktische-zaken/studie-studentenverenigingen/verenigingen/dsv-sint-jansbrug",
      },
    ],
  },
  {
    plaats: "Leiden",
    intro: "De oudste universiteitsstad van Nederland, met verenigingen die al eeuwen bestaan.",
    verenigingen: [
      {
        naam: "L.S.V. Minerva",
        soort: "gezelligheid",
        tekst: "Wortels uit 1814: de oudste studentensociëteit van Nederland, met 18 subverenigingen.",
      },
      {
        naam: "L.S.V. Augustinus",
        soort: "gezelligheid",
        tekst: "Opgericht in 1893, een van de grootste studentenverenigingen van het land.",
      },
      {
        naam: "Quintus",
        soort: "gezelligheid",
        tekst: "Grote vereniging met meer dan 30 subverenigingen, elk met een eigen identiteit.",
      },
      { naam: "SSR-Leiden", soort: "gezelligheid", tekst: "Gezelligheidsvereniging in Leiden." },
      {
        naam: "Catena",
        soort: "internationaal",
        tekst: "Voor internationale betrekkingen, maar iedereen is welkom: pubquizzen, films en feesten.",
      },
    ],
    overzichten: [
      {
        label: "Studentenverenigingen Universiteit Leiden",
        url: "https://www.universiteitleiden.nl/onderwijs/bachelors/studentenleven/studentenstad-leiden/studentenverenigingen",
      },
    ],
  },
  {
    plaats: "Rotterdam",
    intro: "Studentenstad van de Erasmus Universiteit, Hogeschool Rotterdam en Inholland.",
    verenigingen: [
      {
        naam: "R.S.C./R.V.S.V.",
        soort: "gezelligheid",
        tekst: "Rotterdamsch Studenten Corps, met de sociëteiten Hermes en Mimosa.",
      },
      { naam: "R.K.S.V. Sanctus Laurentius", soort: "gezelligheid", tekst: "Grote studentenvereniging in Rotterdam." },
      {
        naam: "SSR-Rotterdam",
        soort: "gezelligheid",
        tekst: "Gastvrije vereniging met een pand aan de Mauritsstraat.",
      },
    ],
    overzichten: [
      {
        label: "Student associations (Erasmus)",
        url: "https://www.eur.nl/en/ese/alumni/networking/student-associations",
      },
    ],
  },
  {
    plaats: "Nijmegen",
    intro: "Meer dan 150 studentenverenigingen en -organisaties rond de Radboud Universiteit en de HAN.",
    verenigingen: [
      { naam: "N.S.V. Carolus Magnus", soort: "gezelligheid", tekst: "Grote gezelligheidsvereniging in Nijmegen." },
      { naam: "Ovum Novum", soort: "gezelligheid", tekst: "Opgericht in 1990, ruim 600 leden." },
      { naam: "N.S.R.V. Phocas", soort: "sport", tekst: "Studentenroeivereniging." },
      { naam: "Loefbijter", soort: "sport", tekst: "Studentenzeilvereniging." },
    ],
    overzichten: [
      {
        label: "Overzicht studentenorganisaties Radboud",
        url: "https://www.ru.nl/studenten/studentenleven/overzicht-studentenorganisaties",
      },
    ],
  },
  {
    plaats: "Eindhoven",
    intro: "Studentenstad van de TU/e en Fontys. Drie grote verenigingen werken samen in Compositum.",
    verenigingen: [
      {
        naam: "E.S.V. Demos",
        soort: "gezelligheid",
        tekst: "Open voor TU/e- en hbo-studenten; gelijkwaardigheid staat voorop.",
        url: "https://www.tue.nl/universiteit/community/esv-demos",
      },
      {
        naam: "Eindhovensch Studenten Corps",
        soort: "gezelligheid",
        tekst: "Een van de drie grote verenigingen van Eindhoven.",
      },
      { naam: "a.s.v. SSRE", soort: "gezelligheid", tekst: "Een van de drie grote verenigingen van Eindhoven." },
      {
        naam: "ESMG Quadrivium",
        soort: "cultuur",
        tekst: "Klassieke muziek: ensembles, open podium en masterclasses.",
        url: "https://www.tue.nl/universiteit/community/esmg-quadrivium",
      },
      {
        naam: "AEGEE-Eindhoven",
        soort: "internationaal",
        tekst: "Europese studentenvereniging.",
        url: "https://www.tue.nl/universiteit/community/aegee-eindhoven/",
      },
    ],
    overzichten: [
      { label: "Community-overzicht TU/e", url: "https://www.tue.nl/universiteit/community/community-overzicht" },
      {
        label: "Student associations Fontys",
        url: "https://www.fontys.nl/en/Fontys-Helps/Fontys-1/Student-associations.htm",
      },
    ],
  },
  {
    plaats: "Tilburg",
    intro: "Olof, Plato en Vidar werken samen in de SOTS en organiseren samen bijvoorbeeld de Welzijnsweek.",
    verenigingen: [
      {
        naam: "T.S.C. St. Olof",
        soort: "gezelligheid",
        tekst: "Opgericht in 1927 en het rijkst aan traditie (± 650 leden).",
      },
      {
        naam: "T.S.V. Plato",
        soort: "gezelligheid",
        tekst: "Grootste vereniging van Tilburg (± 750 leden), zonder ontgroening.",
      },
      { naam: "Vidar", soort: "sport", tekst: "Studentenroeivereniging, opgericht in 1961." },
      {
        naam: "ESN Tilburg",
        soort: "internationaal",
        tekst: "Voor internationale studenten; Nederlanders zijn ook welkom.",
      },
    ],
    overzichten: [
      {
        label: "Student associations Tilburg University",
        url: "https://www.tilburguniversity.edu/students/studying/student-associations",
      },
    ],
  },
  {
    plaats: "Wageningen",
    intro: "Kleine stad, groot studentenleven rond Wageningen University & Research.",
    verenigingen: [
      {
        naam: "W.S.V. Ceres",
        soort: "gezelligheid",
        tekst: "Opgericht in 1878, bekend om de grootste feesten van Wageningen.",
      },
      {
        naam: "K.S.V. Sint Franciscus Xaverius",
        soort: "gezelligheid",
        tekst: "Veel verenigingshuizen en heel betrokken leden.",
      },
      { naam: "SSR-W", soort: "gezelligheid", tekst: "Opgericht in 1931, met jaarclubs en debatclubs." },
      { naam: "Unitas Wageningen", soort: "gezelligheid", tekst: "Informeel: bij Unitas is niets verplicht." },
      { naam: "D.L.V. Nji-Sri", soort: "gezelligheid", tekst: "Boerenstudentenvereniging, opgericht in 1904." },
      { naam: "W.S.R. Argo", soort: "sport", tekst: "Studentenroeivereniging, populair bij eerstejaars." },
    ],
    overzichten: [
      {
        label: "Studentenverenigingen WUR",
        url: "https://www.wur.nl/nl/onderwijs/studeren-wageningen/studentenleven/studentenverenigingen",
      },
    ],
  },
  {
    plaats: "Maastricht",
    intro: "Internationale studentenstad met veel verenigingen rond de Universiteit Maastricht en Zuyd.",
    verenigingen: [{ naam: "Lux ad Mosam", soort: "christelijk", tekst: "Christelijke studentenvereniging." }],
    overzichten: [
      {
        label: "Studentenorganisaties Maastricht",
        url: "https://www.maastrichtuniversity.nl/nl/studeren/studentenleven/studentenorganisaties",
      },
    ],
  },
];

export const PER_STAD = new Map(STUDENTENVERENIGINGEN.map((s) => [s.plaats, s]));

// --------------------------------------------------------------- studieverenigingen

export interface Studievereniging {
  naam: string;
  /** Deel van de instellingsnaam (DUO) */
  instelling: string;
  /** Opleidingen waar de vereniging bij hoort (zoekt in de naam) */
  opleiding: RegExp;
  tekst: string;
  url?: string;
}

export const STUDIEVERENIGINGEN: Studievereniging[] = [
  {
    naam: "S.V. Stress",
    instelling: "Twente",
    opleiding:
      /business administration|bedrijfskunde|industrial engineering|business information|technische bedrijfskunde/i,
    tekst:
      "Studievereniging voor (International) Business Administration, Industrial Engineering & Management en Business & IT.",
  },
  {
    naam: "S.A. Proto",
    instelling: "Twente",
    opleiding: /creative technology/i,
    tekst: "Studievereniging voor Creative Technology, opgericht in 2011.",
  },
  {
    naam: "Scintilla",
    instelling: "Twente",
    opleiding: /electrical engineering|elektrotechniek/i,
    tekst: "Studievereniging voor Electrical Engineering, opgericht in 1965.",
  },
  {
    naam: "ConcepT",
    instelling: "Twente",
    opleiding: /civil engineering|civiele/i,
    tekst: "Studievereniging voor Civil Engineering.",
    url: "https://www.utwente.nl/onderwijs/bachelor/opleidingen/civil-engineering/meer-info/studievereniging/",
  },
  {
    naam: "Dimensie",
    instelling: "Twente",
    opleiding: /psycholog/i,
    tekst: "Studievereniging voor Psychology.",
    url: "https://www.utwente.nl/onderwijs/bachelor/opleidingen/psychology/contact/studievereniging/",
  },
  {
    naam: "Daedalus",
    instelling: "Twente",
    opleiding: /industrial design|industrieel ontwerpen/i,
    tekst: "Studievereniging voor Industrial Design Engineering.",
    url: "https://www.utwente.nl/onderwijs/bachelor/opleidingen/industrial-design-engineering/meer-info/studievereniging/",
  },
  {
    naam: "Gezelschap Leeghwater",
    instelling: "Delft",
    opleiding: /werktuigbouwkunde|mechanical engineering/i,
    tekst: "Studievereniging voor Werktuigbouwkunde.",
  },
  {
    naam: "VSV 'Leonardo da Vinci'",
    instelling: "Delft",
    opleiding: /lucht- en ruimtevaart|aerospace/i,
    tekst: "Studievereniging voor Lucht- en Ruimtevaarttechniek.",
  },
  {
    naam: "W.I.S.V. 'Christiaan Huygens'",
    instelling: "Delft",
    opleiding: /wiskunde|mathemat|informatica|computer science/i,
    tekst: "Studievereniging voor Wiskunde en Informatica.",
  },
  {
    naam: "Technologisch Gezelschap",
    instelling: "Delft",
    opleiding: /molecular science|scheikundige technologie|chemical/i,
    tekst: "Studievereniging voor Molecular Science & Technology en scheikundige technologie.",
  },
  {
    naam: "Vereniging voor Technische Physica",
    instelling: "Delft",
    opleiding: /technische natuurkunde|applied physics/i,
    tekst: "Studievereniging voor Technische Natuurkunde.",
  },
];

/** Overzicht van studieverenigingen per universiteit of hogeschool (deel van de DUO-naam → link) */
export const STUDIEVERENIGING_OVERZICHT: { instelling: string; label: string; url: string }[] = [
  {
    instelling: "Universiteit Twente",
    label: "Studieverenigingen UT",
    url: "https://www.utwente.nl/en/education/bachelor/studentlife/associations",
  },
  {
    instelling: "Technische Universiteit Delft",
    label: "Study associations TU Delft",
    url: "https://www.tudelft.nl/en/education/practical-matters/study-associations-student-associations/study-associations",
  },
  {
    instelling: "Technische Universiteit Eindhoven",
    label: "FSE: studieverenigingen TU/e",
    url: "https://fse.tue.nl/",
  },
  {
    instelling: "Universiteit Utrecht",
    label: "Studentenorganisaties UU",
    url: "https://students.uu.nl/homepagina/studentenleven-en-vrije-tijd/studentenorganisaties",
  },
  {
    instelling: "Vrije Universiteit",
    label: "Studieverenigingen VU",
    url: "https://vu.nl/nl/student/verenigingen/studieverenigingen",
  },
  {
    instelling: "Universiteit van Amsterdam",
    label: "Studentenverenigingen UvA",
    url: "https://student.uva.nl/onderwerpen/studentenverenigingen",
  },
  {
    instelling: "Rijksuniversiteit Groningen",
    label: "Verenigingen RUG",
    url: "https://www.rug.nl/education/bachelor/nederlandse-studenten/studeren-in-groningen/verenigingen/",
  },
  {
    instelling: "Universiteit Leiden",
    label: "Verenigingen Universiteit Leiden",
    url: "https://www.student.universiteitleiden.nl/naast-je-studie/verenigingen/naast-je-studie/studentenverenigingen",
  },
  {
    instelling: "Radboud Universiteit",
    label: "Studentenorganisaties Radboud",
    url: "https://www.ru.nl/studenten/studentenleven/overzicht-studentenorganisaties",
  },
  {
    instelling: "Universiteit Maastricht",
    label: "Studentenorganisaties UM",
    url: "https://www.maastrichtuniversity.nl/nl/studeren/studentenleven/studentenorganisaties",
  },
  {
    instelling: "Tilburg",
    label: "Studieverenigingen Tilburg University",
    url: "https://www.tilburguniversity.edu/students/studying/student-associations",
  },
  {
    instelling: "Wageningen",
    label: "Study & student associations WUR",
    url: "https://www.wur.nl/en/education-programmes/current-students/extracurriculair-activities/study-and-student-associations.htm",
  },
  {
    instelling: "Saxion",
    label: "Student associations Saxion",
    url: "https://www.saxion.edu/studying-in-the-netherlands/life-in-the-nl/student-associations",
  },
  {
    instelling: "Windesheim",
    label: "Student life Windesheim",
    url: "https://www.windesheim.com/practical-information/student-life-in-zwolle",
  },
  {
    instelling: "Fontys",
    label: "Student associations Fontys",
    url: "https://www.fontys.nl/en/Fontys-Helps/Fontys-1/Student-associations.htm",
  },
];

/** Speciaal voor UU-opleidingen: pagina's over studieverenigingen per opleiding */
export const UU_OPLEIDING: { opleiding: RegExp; url: string }[] = [
  { opleiding: /^informatica$/i, url: "https://students.uu.nl/beta/informatica/nieuwe-student/studentenleven" },
  { opleiding: /scheikunde/i, url: "https://students.uu.nl/beta/scheikunde/nieuwe-student/studentenleven" },
  {
    opleiding: /natuur- en sterrenkunde/i,
    url: "https://students.uu.nl/beta/natuur-en-sterrenkunde/nieuwe-student/studentenleven",
  },
  {
    opleiding: /rechtsgeleerdheid/i,
    url: "https://students.uu.nl/rebo/rechtsgeleerdheid/naast-en-na-de-studie/studieverenigingen",
  },
  {
    opleiding: /diergeneeskunde/i,
    url: "https://students.uu.nl/dgk/diergeneeskunde-ba/naast-na-je-studie/vrije-tijd-en-studentenleven",
  },
];

export const LANDELIJK = [
  {
    naam: "JOB",
    tekst: "De Jongeren Organisatie Beroepsonderwijs komt op voor alle mbo-studenten.",
    url: "https://www.job-mbo.nl",
    voor: "mbo" as const,
  },
  {
    naam: "LSVb",
    tekst: "Landelijke Studentenvakbond: hulp en informatie voor hbo- en wo-studenten.",
    url: "https://lsvb.nl",
    voor: "ho" as const,
  },
  {
    naam: "ISO",
    tekst: "Interstedelijk Studenten Overleg: de stem van studenten in Den Haag.",
    url: "https://www.iso.nl",
    voor: "ho" as const,
  },
];
