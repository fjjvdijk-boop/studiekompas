/**
 * Toelatingseisen: mag je met jouw diploma, profiel en vakken naar deze opleiding?
 *
 * Gebaseerd op de LANDELIJKE profielvereisten voor hbo en wo en de toelatingsregels voor het mbo.
 * Dit is een vereenvoudiging: hogescholen en universiteiten kunnen afwijken, en een ontbrekend vak
 * kun je vaak wegwerken (een "deficiëntie") met een toets of zomercursus. Check altijd de site van de opleiding.
 */
import type { Leerweg, Opleiding, Profiel, ProfielNaam, Vak } from "./types";

export interface Eisen {
  /** Met deze profielen kun je zonder extra vakken naar binnen */
  vrij: ProfielNaam[];
  /** Anders: van elke groep minstens één vak (bijv. [["wiskunde A","wiskunde B"],["natuurkunde"]]) */
  vakken: Vak[][];
  /** Extra informatie, zoals toelatingsexamen of selectie */
  notities: string[];
}

export type ToelatingStatus = "ja" | "deficientie" | "nee" | "onbekend";

export interface Toelating {
  status: ToelatingStatus;
  /** Wat je mist, leesbaar: ["natuurkunde", "wiskunde A of B"] */
  mist: string[];
  reden: string;
  eisen: Eisen | null;
}

export const PROFIEL_LABEL: Record<ProfielNaam, string> = {
  NT: "Natuur & Techniek",
  NG: "Natuur & Gezondheid",
  EM: "Economie & Maatschappij",
  CM: "Cultuur & Maatschappij",
};

export const LEERWEG_LABEL: Record<Leerweg, string> = {
  basis: "Basisberoepsgerichte leerweg",
  kader: "Kaderberoepsgerichte leerweg",
  gl: "Gemengde leerweg",
  tl: "Theoretische leerweg (mavo)",
};

/** Vakken die (bijna) altijd in een profiel zitten, als startpunt */
export const PROFIEL_VAKKEN: Record<ProfielNaam, Vak[]> = {
  NT: ["wiskunde B", "natuurkunde", "scheikunde"],
  NG: ["biologie", "scheikunde", "wiskunde A"],
  EM: ["wiskunde A", "economie", "geschiedenis"],
  CM: ["geschiedenis"],
};

const W = ["wiskunde A", "wiskunde B"] as Vak[];
const WB = ["wiskunde B"] as Vak[];

interface Regel {
  test: RegExp;
  eisen: Eisen;
}

const e = (vrij: ProfielNaam[], vakken: Vak[][], notities: string[] = []): Eisen => ({ vrij, vakken, notities });

// ---------------------------------------------------------------- wo (met een vwo-diploma)
const WO: Regel[] = [
  {
    test: /geneeskunde|tandheelkunde|farmacie|farmaceutische|biomedische wetenschappen|biomedical sciences/i,
    eisen: e([], [W, ["natuurkunde"], ["scheikunde"], ["biologie"]], ["Vaak een numerus fixus met selectie"]),
  },
  {
    test: /diergeneeskunde/i,
    eisen: e([], [W, ["natuurkunde"], ["scheikunde"], ["biologie"]], ["Numerus fixus met selectie"]),
  },
  { test: /natuurkunde|sterrenkunde|physics|astronom|nanobiolog/i, eisen: e([], [WB, ["natuurkunde"]]) },
  { test: /^wiskunde|mathemat|econometr|technische wiskunde|actuari/i, eisen: e([], [WB]) },
  {
    test: /scheikund|chemi|molecula|moleculaire|life science|biotechnolog|biomedische technologie|biomedical engineering|klinische technologie|medische natuurwetenschappen|food technology/i,
    eisen: e([], [WB, ["natuurkunde"], ["scheikunde"]]),
  },
  { test: /^informatica|computer science|computing science|data science|technische informatica/i, eisen: e([], [WB]) },
  { test: /landschapsarchitectuur/i, eisen: e([], [W]) },
  { test: /kunstmatige intelligentie|artificial intelligence|informatiekunde|information science/i, eisen: e([], [W]) },
  {
    test: /technische bedrijfskunde|creative technology|industrial engineering|technische bestuurskunde/i,
    eisen: e([], [WB]),
  },
  {
    test: /psycholog|econom|bedrijfskunde|business|finance|fiscal|bestuurskunde|sociolog|pedagog|onderwijskunde|criminolog|geografie|planolog|bedrijfs|commerc|management/i,
    eisen: e([], [W]),
  },
  {
    test: /werktuig|elektrotechniek|electrical|civiel|civil engineering|ruimtevaart|aerospace|mechanical|industrieel ontwerpen|industrial design|bouwkunde|^architecture|technische|engineering|maritieme techniek|advanced technology/i,
    eisen: e([], [WB, ["natuurkunde"]]),
  },
  {
    test: /biolog|gezondheidswetenschap|bewegingswetenschap|voeding|food|agro|bodem|environmental|aardwetenschap|earth|plant|animal|dier|natuurbeheer/i,
    eisen: e([], [W, ["scheikunde"], ["biologie", "natuurkunde"]]),
  },
];

// ---------------------------------------------------------------- hbo (met een havo-diploma)
function hboRegel(o: Opleiding): Eisen | null {
  const n = o.naam.toLowerCase();
  // Kunst en sport: talent telt
  if (
    o.sector === "creatief" &&
    /kunst|muziek|dans|theater|film|design|fotograf|mode|fashion|animat|illustrat|vormgev|art|academie/.test(n)
  )
    return e(["NT", "NG", "EM", "CM"], [], ["Toelatingsexamen of portfolio: je moet laten zien dat je talent hebt"]);
  if (/lichamelijke opvoeding|\balo\b/.test(n)) return e(["NT", "NG", "EM", "CM"], [], ["Sportieve toelatingstest"]);
  // Lerarenopleidingen: je vak zelf
  if (/leraar|lerarenopleiding|docent/.test(n)) {
    if (/wiskunde/.test(n)) return e([], [W]);
    if (/natuurkunde/.test(n)) return e([], [["natuurkunde"], W]);
    if (/scheikunde/.test(n)) return e([], [["scheikunde"], W]);
    if (/biologie/.test(n)) return e([], [["biologie"]]);
    if (/economie/.test(n)) return e([], [["economie", "bedrijfseconomie"], W]);
    if (/geschiedenis/.test(n)) return e([], [["geschiedenis"]]);
    if (/aardrijkskunde/.test(n)) return e([], [["aardrijkskunde"]]);
    if (/frans/.test(n)) return e([], [["Frans"]]);
    if (/duits/.test(n)) return e([], [["Duits"]]);
    return e(["NT", "NG", "EM", "CM"], [], ["Vaak moet je het vak dat je wilt geven zelf in je pakket hebben gehad"]);
  }
  if (/pabo|leraar basisonderwijs|basisonderwijs/.test(n))
    return e(
      ["NT", "NG", "EM", "CM"],
      [],
      [
        "Toelatingstoetsen voor geschiedenis, aardrijkskunde en natuur & techniek als je die vakken niet in je pakket had",
      ],
    );
  switch (o.sector) {
    case "techniek":
    case "logistiek":
      return e(["NT"], [W, ["natuurkunde"]]);
    case "beta":
      return e(["NT", "NG"], [W, ["scheikunde"]]);
    case "ict":
      return e(["NT", "NG", "EM"], [W]);
    case "zorg":
      return e(
        ["NT", "NG"],
        [["biologie"]],
        /fysiotherap|mondzorg|verloskunde/.test(n) ? ["Vaak selectie (numerus fixus)"] : [],
      );
    case "natuur":
      return e(["NT", "NG"], [["biologie", "scheikunde"]]);
    case "economie":
      return e(["NT", "NG", "EM"], [W]);
    default:
      return null;
  }
}

/** Welke vakken heeft deze opleiding nodig? null = geen extra eisen bekend */
export function eisenVoor(o: Opleiding): Eisen | null {
  if (o.soort === "wo") return WO.find((r) => r.test.test(o.naam))?.eisen ?? null;
  if (o.soort === "hbo") return hboRegel(o);
  return null;
}

const cache = new WeakMap<Opleiding, Eisen | null>();
function eisenGecacht(o: Opleiding) {
  if (!cache.has(o)) cache.set(o, eisenVoor(o));
  return cache.get(o)!;
}

const groepTekst = (g: Vak[]) =>
  g.length === 2 && g[0].startsWith("wiskunde") && g[1].startsWith("wiskunde")
    ? `${g[0]} of ${g[1].slice(-1)}`
    : g.join(" of ");

/** Mag je met jouw profiel naar deze opleiding? */
export function toelating(
  o: Opleiding,
  p: Pick<Profiel, "vooropleiding" | "leerweg" | "profielen" | "vakken">,
): Toelating {
  const eisen = eisenGecacht(o);
  const v = p.vooropleiding;
  if (!v) return { status: "onbekend", mist: [], reden: "Vul je diploma in om je toelating te checken", eisen };

  // Soort onderwijs
  if (o.soort === "wo" && v !== "vwo")
    return {
      status: "nee",
      mist: [],
      reden: `Met ${v === "mbo4" ? "mbo 4" : v} kun je niet direct naar de universiteit. Wel via een hbo-propedeuse${v === "havo" ? " of het vwo" : ""}.`,
      eisen,
    };
  if (o.soort === "hbo" && v === "vmbo")
    return {
      status: "nee",
      mist: [],
      reden: "Met vmbo kun je niet direct naar het hbo. Wel via mbo 4 of de havo.",
      eisen,
    };

  // Mbo-niveau en vmbo-leerweg
  if (o.soort === "mbo") {
    if (v === "vmbo" && p.leerweg === "basis" && (o.niveau === "mbo3" || o.niveau === "mbo4"))
      return {
        status: "nee",
        mist: [],
        reden: "Met de basisberoepsgerichte leerweg begin je op mbo 2. Daarna kun je doorstromen naar niveau 3 of 4.",
        eisen,
      };
    return { status: "ja", mist: [], reden: "Je voldoet aan de toelatingseisen", eisen };
  }

  // Vakken (alleen met een havo/vwo-diploma; met mbo 4 hangt het af van je opleiding)
  if (!eisen || (!eisen.vrij.length && !eisen.vakken.length))
    return {
      status: "ja",
      mist: [],
      reden: eisen?.notities.length ? "Geen profieleisen, wel let op" : "Geen extra vakken nodig",
      eisen,
    };
  if (v === "mbo4")
    return {
      status: "onbekend",
      mist: [],
      reden: "Met mbo 4 hangt het af van je opleiding: soms moet je een vak bijspijkeren",
      eisen,
    };
  if (!p.profielen.length && !p.vakken.length)
    return { status: "onbekend", mist: [], reden: "Vul je profiel en vakken in om dit te checken", eisen };
  if (p.profielen.some((x) => eisen.vrij.includes(x)))
    return { status: "ja", mist: [], reden: "Je profiel geeft toegang", eisen };
  const mist = eisen.vakken.filter((g) => !g.some((vak) => p.vakken.includes(vak))).map(groepTekst);
  if (!mist.length) return { status: "ja", mist, reden: "Je hebt de vakken die nodig zijn", eisen };
  return {
    status: "deficientie",
    mist,
    reden: `Je mist ${mist.join(" en ")}. Dat kun je vaak nog wegwerken met een toets of zomercursus.`,
    eisen,
  };
}

/** Leesbare samenvatting van de eisen, bijv. "NT vrij · anders: wiskunde A of B + natuurkunde" */
export function eisenTekst(eisen: Eisen): string {
  const delen: string[] = [];
  if (eisen.vrij.length && eisen.vrij.length < 4) delen.push(`Vrij toegankelijk met ${eisen.vrij.join(" of ")}`);
  if (eisen.vakken.length)
    delen.push(`${eisen.vrij.length ? "anders " : ""}nodig: ${eisen.vakken.map(groepTekst).join(" + ")}`);
  return delen.join(" · ");
}
