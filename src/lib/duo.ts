/**
 * Studiefinanciering van DUO voor universiteitsstudenten.
 *
 * Bedragen: duo.nl, "Bedragen studiefinanciering hbo en universiteit", september t/m december 2027
 * (je begint in september 2027). Aanvullende beurs: DUO-folder "Berekening aanvullende beurs hbo en
 * universiteit 2027". Rente: DUO-persbericht rentepercentages 2027. Draagkracht: duo.nl (2026).
 * Dit is een schatting: de echte berekening doet DUO, met de Rekenhulp op duo.nl.
 */

export const DUO = {
  periode: "september t/m december 2027",
  basisbeurs: { uitwonend: 335.1, thuiswonend: 134.45 },
  aanvullendeBeursMax: 507.1,
  lening: 325.44,
  collegegeldkrediet: 230.92,
  /** Ouders samen (inkomen 2025) onder deze grens: maximale aanvullende beurs */
  inkomensgrens: 43492.62,
  /** Van elke euro boven de grens gaat 13,6 cent per jaar van de beurs af */
  inhouding: 0.136,
  /** Aftrek per ander schoolgaand kind in het gezin, per jaar */
  aftrekPerKind: 363,
  /** Rente 2027 voor studenten (terugbetalingsregels 35 jaar) */
  rente: 0.027,
  terugbetaalJaren: 35,
  /** Draagkracht: 4% van je inkomen boven de vrijstelling (bedrag 2026) */
  draagkrachtVrijstelling: 38351.77,
  draagkrachtProcent: 0.04,
} as const;

export const DUO_LINKS = {
  bedragen: "https://duo.nl/particulier/studiefinanciering/bedragen.jsp",
  aanvullendeBeurs: "https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/hoeveel-is-het.jsp",
  giftOfTerugbetalen: "https://duo.nl/particulier/studiefinanciering/gift-of-terugbetalen.jsp",
  uitwonend: "https://duo.nl/particulier/studiefinanciering/uitwonend.jsp",
  collegegeld: "https://duo.nl/particulier/collegegeld.jsp",
  terugbetalen: "https://duo.nl/particulier/studieschuld-terugbetalen/zo-werkt-terugbetalen.jsp",
  rente: "https://duo.nl/organisatie/pers/rentepercentages-studiefinanciering-voor-2027-zijn-bekend.jsp",
  rekenhulp: "https://duo.nl/particulier/rekenhulpen/rekenhulp-studiefinanciering.jsp",
  aanvragen: "https://duo.nl/particulier/studiefinanciering/aanvragen.jsp",
  reisproduct: "https://duo.nl/particulier/studiefinanciering/ov.jsp",
  mijnDuo: "https://duo.nl/particulier/",
};

/**
 * Schatting van de aanvullende beurs per maand (DUO-rekenregel, vereenvoudigd):
 * ouders samen, zonder eigen studieschuld en zonder extra vrijstelling.
 */
export function aanvullendeBeurs(ouderInkomen: number | null, andereKinderen = 0, kinderenMetBeurs = 1): number {
  if (ouderInkomen === null) return 0;
  const boven = Math.max(0, ouderInkomen - DUO.inkomensgrens);
  const inhoudingJaar =
    Math.max(0, boven * DUO.inhouding - DUO.aftrekPerKind * andereKinderen) / Math.max(1, kinderenMetBeurs);
  return Math.max(0, DUO.aanvullendeBeursMax - inhoudingJaar / 12);
}

/** Vanaf welk ouderinkomen is de aanvullende beurs helemaal weg? */
export function grensGeenBeurs(andereKinderen = 0): number {
  return DUO.inkomensgrens + (DUO.aanvullendeBeursMax * 12 + DUO.aftrekPerKind * andereKinderen) / DUO.inhouding;
}

export interface GeldProfiel {
  uitwonend: boolean;
  ouderInkomen: number | null;
  andereKinderen: number;
  ouderBijdrage: number;
  bijbaan: number;
}

export interface Plaatje {
  kosten: number;
  basisbeurs: number;
  aanvullend: number;
  /** Basisbeurs + aanvullende beurs: een gift als je binnen 10 jaar je diploma haalt */
  gift: number;
  ouders: number;
  bijbaan: number;
  /** Wat je nog moet lenen (of anders regelen) per maand */
  teLenen: number;
  /** Kan het met de lening + het collegegeldkrediet van DUO? */
  past: boolean;
  maxLening: number;
  overschot: number;
}

/** Het hele geldplaatje per maand: kosten tegenover beurs, ouders, bijbaan en lening */
export function geldplaatje(kosten: number, g: GeldProfiel): Plaatje {
  const basisbeurs = g.uitwonend ? DUO.basisbeurs.uitwonend : DUO.basisbeurs.thuiswonend;
  const aanvullend = aanvullendeBeurs(g.ouderInkomen, g.andereKinderen);
  const gift = basisbeurs + aanvullend;
  const binnen = gift + g.ouderBijdrage + g.bijbaan;
  const tekort = kosten - binnen;
  const maxLening = DUO.lening + DUO.collegegeldkrediet + (DUO.aanvullendeBeursMax - aanvullend);
  return {
    kosten,
    basisbeurs,
    aanvullend,
    gift,
    ouders: g.ouderBijdrage,
    bijbaan: g.bijbaan,
    teLenen: Math.max(0, tekort),
    past: tekort <= maxLening,
    maxLening,
    overschot: Math.max(0, -tekort),
  };
}

/** Studieschuld (lening + rente) na een aantal jaar elke maand hetzelfde bedrag lenen */
export function studieschuld(perMaand: number, jaren: number, rente: number = DUO.rente): number {
  const r = rente / 12;
  let schuld = 0;
  for (let m = 0; m < jaren * 12; m++) schuld = schuld * (1 + r) + perMaand;
  return schuld;
}

/** Maandbedrag als je de schuld in 35 jaar gelijkmatig terugbetaalt (zonder draagkracht) */
export function maandTerug(schuld: number, rente: number = DUO.rente, jaren: number = DUO.terugbetaalJaren): number {
  if (schuld <= 0) return 0;
  const r = rente / 12;
  const n = jaren * 12;
  return (schuld * r) / (1 - Math.pow(1 + r, -n));
}

/** Hoeveel je per maand maximaal hoeft te betalen bij een bepaald bruto jaarinkomen (draagkracht) */
export function draagkrachtPerMaand(jaarinkomen: number): number {
  return Math.max(0, (jaarinkomen - DUO.draagkrachtVrijstelling) * DUO.draagkrachtProcent) / 12;
}
