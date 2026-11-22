"use client";

import { useMemo } from "react";
import { OPLEIDINGEN } from "@/data/opleidingen";
import { kosten, matchScore, stadVan, stoplicht, type Kosten, type Match, type Stoplicht } from "./bereken";
import { useStore } from "./store";
import type { Opleiding, Profiel, Stad } from "./types";

export interface Resultaat {
  opleiding: Opleiding;
  stad: Stad;
  kosten: Kosten;
  match: Match;
  licht: Stoplicht;
}

export function bereken(opleiding: Opleiding, profiel: Profiel): Resultaat {
  const stad = stadVan(opleiding);
  return {
    opleiding,
    stad,
    kosten: kosten(stad, profiel.maxReistijd),
    match: matchScore(opleiding, profiel),
    licht: stoplicht(stad.reistijd),
  };
}

/** Alle opleidingen met kosten, stoplicht en match-score voor het profiel van de gebruiker. */
export function useResultaten(): Resultaat[] {
  const { profiel } = useStore();
  return useMemo(() => OPLEIDINGEN.map((o) => bereken(o, profiel)), [profiel]);
}
