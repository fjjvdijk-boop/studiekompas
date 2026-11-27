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
import { eisTekst, normaliseer, toelating, type Eis } from "./toelating";
import tabel from "@/data/toelating-wo.json";
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

describe("toelatingseisen (officiële tabel, bijlage A)", () => {
  const geneeskunde = nep({ sector: "zorg", naam: "Geneeskunde" }, amsterdam);
  const werktuigWo = nep({ sector: "techniek", naam: "Werktuigbouwkunde" }, amsterdam);
  const rechten = nep({ sector: "recht", naam: "Rechtsgeleerdheid" }, amsterdam);
  const psychologie = nep({ sector: "welzijn", naam: "Psychologie" }, amsterdam);
  const vwo = (profielen: Profiel["profielen"], vakken: Profiel["vakken"]) => ({
    vooropleiding: "vwo" as const,
    profielen,
    vakken,
  });

  it("vindt de eisen voor (bijna) elke opleiding met eisen in de tabel", () => {
    const tabelNamen = Object.keys(tabel.opleidingen).map(normaliseer);
    const ons = new Set(data.opleidingen.map((o) => normaliseer(o.naam)));
    const gevonden = tabelNamen.filter((n) => ons.has(n));
    expect(gevonden.length).toBeGreaterThan(110);
  });
  it("Geneeskunde: NT heeft biologie nodig, NG natuurkunde, EM geen toelatingsrecht", () => {
    expect(toelating(geneeskunde, vwo(["NT"], [])).mist).toEqual(["biologie"]);
    expect(toelating(geneeskunde, vwo(["NT"], ["biologie"])).status).toBe("ja");
    expect(toelating(geneeskunde, vwo(["NG"], ["wiskunde A"])).mist).toEqual(["natuurkunde"]);
    expect(toelating(geneeskunde, vwo(["EM"], ["wiskunde A"])).status).toBe("nee");
  });
  it("met een combinatie van profielen telt het gunstigste", () => {
    expect(toelating(geneeskunde, vwo(["NG", "NT"], [])).status).toBe("ja");
  });
  it("techniek aan de universiteit: NT vrij, NG mist wiskunde B en natuurkunde", () => {
    expect(toelating(werktuigWo, vwo(["NT"], [])).status).toBe("ja");
    const t = toelating(werktuigWo, vwo(["NG"], ["wiskunde A"]));
    expect(t.status === "deficientie" || t.status === "nee").toBe(true);
  });
  it("rechten en psychologie hebben geen extra vakeisen", () => {
    expect(toelating(rechten, vwo(["CM"], ["wiskunde C"])).status).toBe("ja");
    expect(toelating(psychologie, vwo(["CM"], ["wiskunde C"])).status).toBe("ja");
  });
  it("vraagt eerst om je profiel", () => {
    expect(toelating(geneeskunde, vwo([], [])).status).toBe("onbekend");
  });
  it("kan elke eis uit de tabel leesbaar maken", () => {
    for (const eisen of Object.values(tabel.opleidingen))
      for (const e of Object.values(eisen)) expect(eisTekst(e as Eis).length).toBeGreaterThan(2);
  });
  it("verlaagt de score bij een ontbrekend vak", () => {
    const p = { ...profiel, interesse: { zorg: 1 }, profielen: ["NT" as const], vakken: [] };
    expect(bereken(geneeskunde, p).match.score).toBeLessThanOrEqual(70);
  });
});
