import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { INSTELLINGEN, STANDAARD_PROFIEL, WIERDEN } from "@/data/instellingen";
import { berekenUitslag, DOMEINEN, LEGE_ANTWOORDEN, VRAGEN } from "@/data/vragenlijst";
import { aanvullendeBeurs, DUO, geldplaatje, grensGeenBeurs, maandTerug, studieschuld } from "./duo";
import {
  afstandKm,
  bereken,
  dagenTot,
  kosten,
  plaatsSlug,
  reistijd,
  reistijdTekst,
  stoplicht,
  telDagenOp,
  vandaag,
} from "./bereken";
import { decodeer, type RuweData } from "./data";
import { toelating } from "./toelating";
import type { Opleiding, Plaats, Profiel } from "./types";

const data = decodeer(
  JSON.parse(readFileSync(path.join(__dirname, "../../public/data/opleidingen.json"), "utf8")) as RuweData,
);
const plaats = (naam: string) => data.plaatsen.find((p) => p.naam === naam)!;
const enschede = plaats("Enschede");
const amsterdam = plaats("Amsterdam");

const profiel: Profiel = {
  ...STANDAARD_PROFIEL,
  interesse: { ict: 1, techniek: 0.75, zorg: 0 },
  vooropleiding: "vwo",
  profielen: ["NT"],
  vakken: ["wiskunde B", "natuurkunde", "scheikunde"],
  wonen: "allebei",
  maxReistijd: 45,
  maxLenen: 600,
  vragenlijstKlaar: true,
};

const nep = (o: Partial<Opleiding>, p: Plaats): Opleiding => ({
  id: "x",
  naam: "Test",
  eigenNaam: null,
  instelling: { naam: "Universiteit", soort: "wo", url: null },
  niveau: "wo",
  soort: "wo",
  sector: "ict",
  plaats: p,
  instroom: null,
  duur: 4,
  leerwegen: null,
  url: null,
  code: "1",
  taal: "NL",
  studiekeuzecheck: false,
  ...o,
});

describe("data van DUO", () => {
  it("bevat alleen universitaire bachelors", () => {
    expect(data.opleidingen.length).toBeGreaterThan(400);
    expect(data.opleidingen.every((o) => o.soort === "wo")).toBe(true);
  });
  it("kent de voertaal van bijna alle opleidingen", () => {
    expect(data.opleidingen.filter((o) => o.taal).length / data.opleidingen.length).toBeGreaterThan(0.85);
  });
  it("heeft unieke id's en voor elke opleiding een plaats met coördinaten in Nederland", () => {
    expect(new Set(data.opleidingen.map((o) => o.id)).size).toBe(data.opleidingen.length);
    for (const p of data.plaatsen) {
      expect(p.lat).toBeGreaterThan(50.7);
      expect(p.lat).toBeLessThan(53.7);
      expect(p.lng).toBeGreaterThan(3.2);
      expect(p.lng).toBeLessThan(7.3);
    }
  });
  it("kent de Universiteit Twente in Enschede", () => {
    expect(
      data.opleidingen.some((o) => o.plaats.naam === "Enschede" && o.instelling.naam === "Universiteit Twente"),
    ).toBe(true);
  });
});

describe("reistijd en stoplicht", () => {
  it("gebruikt gecontroleerde tijden vanaf Wierden", () => {
    expect(reistijd(WIERDEN, enschede)).toEqual({ minuten: 22, schatting: false });
  });
  it("schat de reistijd op basis van de afstand", () => {
    const r = reistijd({ naam: "Groningen", lat: 53.219, lng: 6.566 }, amsterdam);
    expect(r.schatting).toBe(true);
    expect(r.minuten).toBeGreaterThan(90);
    expect(r.minuten).toBeLessThan(200);
    expect(afstandKm(WIERDEN, enschede)).toBeGreaterThan(20);
  });
  it("geeft groen, oranje en rood op de grenzen", () => {
    expect(stoplicht(45)).toBe("groen");
    expect(stoplicht(46)).toBe("oranje");
    expect(stoplicht(75)).toBe("oranje");
    expect(stoplicht(76)).toBe("rood");
  });
});

describe("kosten", () => {
  it("rekent collegegeld en kamerhuur van Kamernet", () => {
    const k = kosten({ soort: "wo", leerwegen: null }, amsterdam, 120, profiel);
    expect(k.schoolgeld).toBeCloseTo(INSTELLINGEN.collegegeld / 12);
    expect(k.huur).toBe(979);
    expect(k.huurSchatting).toBe(false);
    expect(k.thuisMogelijk).toBe(false);
    expect(k.advies).toBe(k.uitwonend);
  });
  it("adviseert thuis wonen als de reistijd binnen je maximum valt, of als je dat wilt", () => {
    expect(kosten({ soort: "wo", leerwegen: null }, enschede, 22, profiel).thuisMogelijk).toBe(true);
    expect(kosten({ soort: "wo", leerwegen: null }, amsterdam, 120, { ...profiel, wonen: "thuis" }).thuisMogelijk).toBe(
      true,
    );
  });
});

describe("studiefinanciering (DUO)", () => {
  it("geeft de maximale aanvullende beurs onder de inkomensgrens", () => {
    expect(aanvullendeBeurs(30000)).toBeCloseTo(DUO.aanvullendeBeursMax);
    expect(aanvullendeBeurs(null)).toBe(0);
  });
  it("trekt 13,6% van het inkomen boven de grens af, per jaar", () => {
    const boven = 10000;
    expect(aanvullendeBeurs(DUO.inkomensgrens + boven)).toBeCloseTo(DUO.aanvullendeBeursMax - (boven * 0.136) / 12);
    expect(aanvullendeBeurs(grensGeenBeurs() + 1)).toBe(0);
  });
  it("telt broers en zussen mee", () => {
    expect(aanvullendeBeurs(70000, 2)).toBeGreaterThan(aanvullendeBeurs(70000, 0));
  });
  it("maakt een kloppend geldplaatje", () => {
    const g = geldplaatje(1500, {
      uitwonend: true,
      ouderInkomen: 30000,
      andereKinderen: 0,
      ouderBijdrage: 100,
      bijbaan: 300,
    });
    expect(g.gift).toBeCloseTo(DUO.basisbeurs.uitwonend + DUO.aanvullendeBeursMax);
    expect(g.teLenen).toBeCloseTo(1500 - g.gift - 400);
    expect(g.past).toBe(true);
  });
  it("rekent schuld met rente en een maandbedrag in 35 jaar", () => {
    const schuld = studieschuld(300, 4);
    expect(schuld).toBeGreaterThan(300 * 48);
    expect(schuld).toBeLessThan(300 * 48 * 1.06);
    const m = maandTerug(schuld);
    expect(m * 35 * 12).toBeGreaterThan(schuld);
    expect(maandTerug(0)).toBe(0);
  });
});

describe("match-score", () => {
  it("geeft een hoge score als alles past", () => {
    expect(bereken(nep({ sector: "ict" }, enschede), profiel).match.score).toBeGreaterThanOrEqual(90);
  });
  it("geeft weinig punten voor een richting die je niet leuk vindt", () => {
    expect(bereken(nep({ sector: "zorg" }, enschede), profiel).match.onderdelen[0].punten).toBe(0);
  });
  it("trekt punten af als de voertaal niet past", () => {
    const p = { ...profiel, taal: "nl" as const };
    expect(bereken(nep({ sector: "ict", taal: "EN" }, enschede), p).match.score).toBeLessThan(
      bereken(nep({ sector: "ict" }, enschede), p).match.score,
    );
  });
  it("blijft voor elke echte opleiding tussen 0 en 100", () => {
    for (const o of data.opleidingen) {
      const s = bereken(o, profiel).match.score;
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });
});

describe("studietest", () => {
  it("zonder antwoorden is alles 0", () => {
    expect(Object.values(berekenUitslag(LEGE_ANTWOORDEN).interesse).every((w) => w === 0)).toBe(true);
  });
  it("elke route heeft zes vragen met vier antwoorden", () => {
    for (const d of DOMEINEN) {
      expect(VRAGEN[d.id]).toHaveLength(6);
      for (const v of VRAGEN[d.id]) expect(v.antwoorden).toHaveLength(4);
    }
  });
  it("vertaalt steeds 'ziekenhuis' kiezen naar Geneeskunde bovenaan, met redenen", () => {
    const vragen = VRAGEN.beta;
    const keuzes = vragen.map((v) => v.antwoorden.findIndex((x) => (x.punten.zorg ?? 0) >= 1));
    const u = berekenUitslag({ domein: "beta", keuzes: keuzes.map((k) => (k < 0 ? null : k)) });
    const top = Object.entries(u.interesse).sort((a, b) => b[1] - a[1])[0][0];
    expect(top).toBe("zorg");
    expect(u.interesse.zorg).toBeGreaterThan(0.9);
    expect(u.redenen.zorg?.length).toBeGreaterThan(2);
    for (const w of Object.values(u.interesse)) expect(w).toBeLessThanOrEqual(1);
  });
  it("kan bij twijfel elke richting bovenaan zetten", () => {
    for (const s of [
      "beta",
      "ict",
      "zorg",
      "natuur",
      "economie",
      "recht",
      "taal",
      "creatief",
      "welzijn",
      "techniek",
    ] as const) {
      const keuzes = VRAGEN.twijfel.map((v) => {
        const i = v.antwoorden.findIndex((x) => (x.punten[s] ?? 0) >= 0.5);
        return i < 0 ? null : i;
      });
      const u = berekenUitslag({ domein: "twijfel", keuzes });
      const top = Object.entries(u.interesse)
        .filter(([k]) => k.length > 0)
        .sort((a, b) => b[1] - a[1])[0][0];
      expect(top, s).toBe(s);
    }
  });
});

describe("hulpfuncties", () => {
  it("telt dagen en maakt tekst", () => {
    expect(dagenTot("2026-11-28", "2026-11-22")).toBe(6);
    expect(telDagenOp("2026-11-30", 3)).toBe("2026-12-03");
    expect(vandaag(new Date("2026-11-22T23:30:00Z"))).toBe("2026-11-23");
    expect(reistijdTekst(105)).toBe("1 u 45 min");
    expect(plaatsSlug("'s-Hertogenbosch")).toBe("s-hertogenbosch");
  });
});

describe("toelatingseisen", () => {
  const techniekHbo = nep({ soort: "hbo", niveau: "hbo", sector: "techniek", naam: "Werktuigbouwkunde" }, enschede);
  const zorgHbo = nep({ soort: "hbo", niveau: "hbo", sector: "zorg", naam: "Verpleegkunde" }, enschede);
  const economieHbo = nep({ soort: "hbo", niveau: "hbo", sector: "economie", naam: "Bedrijfskunde" }, enschede);
  const geneeskunde = nep({ soort: "wo", niveau: "wo", sector: "zorg", naam: "Geneeskunde" }, amsterdam);
  const werktuigWo = nep({ soort: "wo", niveau: "wo", sector: "techniek", naam: "Werktuigbouwkunde" }, amsterdam);
  const rechten = nep({ soort: "wo", niveau: "wo", sector: "recht", naam: "Rechtsgeleerdheid" }, amsterdam);
  const havo = (profielen: Profiel["profielen"], vakken: Profiel["vakken"]) => ({
    vooropleiding: "havo" as const,
    leerweg: null,
    profielen,
    vakken,
  });
  const vwo = (profielen: Profiel["profielen"], vakken: Profiel["vakken"]) => ({
    vooropleiding: "vwo" as const,
    leerweg: null,
    profielen,
    vakken,
  });

  it("laat NT vrij toe tot hbo-techniek", () => {
    expect(toelating(techniekHbo, havo(["NT"], ["wiskunde B", "natuurkunde"])).status).toBe("ja");
  });
  it("geeft een deficiëntie als CM-leerlingen natuurkunde en wiskunde missen", () => {
    const t = toelating(techniekHbo, havo(["CM"], ["geschiedenis"]));
    expect(t.status).toBe("deficientie");
    expect(t.mist).toEqual(["wiskunde A of B", "natuurkunde"]);
  });
  it("laat NG vrij toe tot hbo-zorg, maar EM zonder biologie niet", () => {
    expect(toelating(zorgHbo, havo(["NG"], ["biologie"])).status).toBe("ja");
    expect(toelating(zorgHbo, havo(["EM"], ["wiskunde A", "economie"])).status).toBe("deficientie");
  });
  it("laat CM met wiskunde A toe tot hbo-economie", () => {
    expect(toelating(economieHbo, havo(["CM"], ["wiskunde A", "geschiedenis"])).status).toBe("ja");
  });
  it("vraagt voor geneeskunde natuurkunde, scheikunde en biologie", () => {
    expect(toelating(geneeskunde, vwo(["NG"], ["wiskunde A", "biologie", "scheikunde"])).mist).toEqual(["natuurkunde"]);
    expect(
      toelating(geneeskunde, vwo(["NG", "NT"], ["wiskunde B", "natuurkunde", "scheikunde", "biologie"])).status,
    ).toBe("ja");
  });
  it("vraagt wiskunde B en natuurkunde voor technische universiteiten", () => {
    expect(toelating(werktuigWo, vwo(["NG"], ["wiskunde A", "biologie", "scheikunde"])).mist).toEqual([
      "wiskunde B",
      "natuurkunde",
    ]);
  });
  it("heeft geen vakeisen voor rechten", () => {
    expect(toelating(rechten, vwo(["CM"], ["geschiedenis"])).status).toBe("ja");
  });
  it("laat vmbo-basis niet direct naar mbo 4", () => {
    const mbo4 = nep({ soort: "mbo", niveau: "mbo4" }, enschede);
    const mbo2 = nep({ soort: "mbo", niveau: "mbo2" }, enschede);
    const basis = { vooropleiding: "vmbo" as const, leerweg: "basis" as const, profielen: [], vakken: [] };
    expect(toelating(mbo4, basis).status).toBe("nee");
    expect(toelating(mbo2, basis).status).toBe("ja");
  });
  it("verlaagt de score bij een ontbrekend vak", () => {
    const p = { ...profiel, interesse: { techniek: 1 }, profielen: ["CM" as const], vakken: ["geschiedenis" as const] };
    expect(bereken(techniekHbo, p).match.score).toBeLessThanOrEqual(70);
  });
});
