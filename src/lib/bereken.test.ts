import { describe, expect, it } from "vitest";
import { dagenTot, kosten, matchScore, reistijdTekst, stoplicht, telDagenOp, vandaag } from "./bereken";
import { INSTELLINGEN } from "@/data/instellingen";
import { OPLEIDINGEN } from "@/data/opleidingen";
import { STEDEN } from "@/data/steden";
import type { Profiel } from "./types";

const enschede = STEDEN.find((s) => s.id === "S01")!;
const amsterdam = STEDEN.find((s) => s.id === "S06")!;
const profiel: Profiel = { naam: "Test", interesses: ["Techniek"], niveau: "beide", budget: 800, maxReistijd: 45 };

describe("stoplicht", () => {
  it("geeft groen, oranje en rood op de grenzen", () => {
    expect(stoplicht(45)).toBe("groen");
    expect(stoplicht(46)).toBe("oranje");
    expect(stoplicht(75)).toBe("oranje");
    expect(stoplicht(76)).toBe("rood");
  });
});

describe("kosten", () => {
  it("rekent maandlasten voor op kamer en thuis", () => {
    const k = kosten(amsterdam, 45);
    const vast = (INSTELLINGEN.collegegeld + INSTELLINGEN.boekenPerJaar) / 12;
    expect(k.uitwonend).toBeCloseTo(1000 + INSTELLINGEN.leefUitwonend + vast);
    expect(k.thuis).toBeCloseTo(INSTELLINGEN.leefThuis + vast);
    expect(k.thuisMogelijk).toBe(false);
    expect(k.advies).toBe(k.uitwonend);
  });
  it("adviseert thuis wonen als de reistijd binnen je maximum valt", () => {
    const k = kosten(enschede, 45);
    expect(k.thuisMogelijk).toBe(true);
    expect(k.advies).toBe(k.thuis);
  });
});

describe("matchScore", () => {
  it("geeft 100 voor een perfecte match", () => {
    const hboIct = OPLEIDINGEN.find((o) => o.id === "O05")!;
    expect(matchScore(hboIct, profiel).score).toBe(100);
  });
  it("trekt punten af voor sector, budget en reistijd", () => {
    const rechtenAmsterdam = OPLEIDINGEN.find((o) => o.id === "O27")!;
    const m = matchScore(rechtenAmsterdam, profiel);
    expect(m.onderdelen.find((o) => o.label === "Interesse")!.punten).toBe(0);
    expect(m.onderdelen.find((o) => o.label === "Reistijd")!.punten).toBe(6);
    expect(m.score).toBeLessThan(40);
  });
  it("blijft altijd tussen 0 en 100", () => {
    for (const o of OPLEIDINGEN) {
      const s = matchScore(o, { ...profiel, budget: 0, maxReistijd: 0, interesses: [] }).score;
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });
});

describe("datums en tekst", () => {
  it("telt dagen", () => {
    expect(dagenTot("2026-11-28", "2026-11-22")).toBe(6);
    expect(telDagenOp("2026-11-30", 3)).toBe("2026-12-03");
    expect(vandaag(new Date("2026-11-22T23:30:00Z"))).toBe("2026-11-23");
  });
  it("schrijft reistijd leesbaar", () => {
    expect(reistijdTekst(22)).toBe("22 min");
    expect(reistijdTekst(120)).toBe("2 uur");
    expect(reistijdTekst(105)).toBe("1 u 45 min");
  });
});

describe("data", () => {
  it("heeft 40 opleidingen met een bestaande stad", () => {
    expect(OPLEIDINGEN).toHaveLength(40);
    for (const o of OPLEIDINGEN) expect(STEDEN.some((s) => s.id === o.stadId)).toBe(true);
  });
});
