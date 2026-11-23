import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { INSTELLINGEN, STANDAARD_PROFIEL, WIERDEN } from "@/data/instellingen";
import { interesseUitAntwoorden } from "@/data/vragenlijst";
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
  vooropleiding: "havo",
  soorten: ["mbo", "hbo"],
  leerstijl: 0.5,
  wonen: "allebei",
  budget: 800,
  maxReistijd: 45,
  vragenlijstKlaar: true,
};

const nep = (o: Partial<Opleiding>, p: Plaats): Opleiding => ({
  id: "x",
  naam: "Test",
  eigenNaam: null,
  instelling: { naam: "School", soort: "hbo", url: null },
  niveau: "hbo",
  soort: "hbo",
  sector: "ict",
  plaats: p,
  instroom: null,
  duur: 4,
  leerwegen: null,
  url: null,
  code: "1",
  ...o,
});

describe("data van DUO", () => {
  it("bevat duizenden opleidingen van mbo, hbo en wo", () => {
    expect(data.opleidingen.length).toBeGreaterThan(8000);
    for (const soort of ["mbo", "hbo", "wo"]) expect(data.opleidingen.some((o) => o.soort === soort)).toBe(true);
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
  it("kent de Universiteit Twente en Saxion in Enschede", () => {
    const hier = data.opleidingen.filter((o) => o.plaats.naam === "Enschede");
    expect(hier.some((o) => o.instelling.naam === "Universiteit Twente")).toBe(true);
    expect(hier.some((o) => o.instelling.naam.includes("Saxion"))).toBe(true);
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
  it("rekent collegegeld voor hbo en lesgeld voor mbo (BOL)", () => {
    const hbo = kosten({ soort: "hbo", leerwegen: null }, amsterdam, 120, profiel);
    expect(hbo.schoolgeld).toBeCloseTo(INSTELLINGEN.collegegeld / 12);
    expect(hbo.thuisMogelijk).toBe(false);
    expect(hbo.advies).toBe(hbo.uitwonend);
    const mbo = kosten({ soort: "mbo", leerwegen: "BOL" }, enschede, 22, profiel);
    expect(mbo.schoolgeld).toBeCloseTo(INSTELLINGEN.lesgeldMbo / 12);
    expect(mbo.thuisMogelijk).toBe(true);
    expect(mbo.advies).toBe(mbo.thuis);
  });
  it("rekent geen lesgeld bij BBL", () => {
    expect(kosten({ soort: "mbo", leerwegen: "BBL" }, enschede, 22, profiel).schoolgeld).toBe(0);
  });
  it("adviseert altijd thuis wonen als je dat wilt", () => {
    expect(
      kosten({ soort: "hbo", leerwegen: null }, amsterdam, 120, { ...profiel, wonen: "thuis" }).thuisMogelijk,
    ).toBe(true);
  });
});

describe("match-score", () => {
  it("geeft een hoge score als alles past", () => {
    const m = bereken(nep({ sector: "ict" }, enschede), profiel).match;
    expect(m.score).toBeGreaterThanOrEqual(90);
  });
  it("geeft weinig punten voor een richting die je niet leuk vindt", () => {
    const m = bereken(nep({ sector: "zorg" }, enschede), profiel).match;
    expect(m.onderdelen[0].punten).toBe(0);
  });
  it("laat wo niet toe met een havo-diploma", () => {
    const m = bereken(nep({ soort: "wo", niveau: "wo" }, enschede), profiel).match;
    expect(m.toelaatbaar).toBe(false);
    expect(m.score).toBeLessThanOrEqual(40);
  });
  it("blijft voor elke echte opleiding tussen 0 en 100", () => {
    for (const o of data.opleidingen.slice(0, 2000)) {
      const s = bereken(o, profiel).match.score;
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });
});

describe("vragenlijst", () => {
  it("zet antwoorden om naar interesse tussen 0 en 1", () => {
    expect(interesseUitAntwoorden({ ict: [4, 4, 4], zorg: [0, 2, null], recht: [null, null, null] })).toEqual({
      ict: 1,
      zorg: 0.25,
    });
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
