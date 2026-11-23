"use client";

import { useMemo } from "react";
import { bereken, type Resultaat } from "./bereken";
import { useData } from "./data-client";
import { useStore } from "./store";

export type { Resultaat };

/** Alle opleidingen met kosten, reistijd en match-score voor het profiel van de gebruiker. */
export function useResultaten(): Resultaat[] | null {
  const data = useData();
  const { profiel } = useStore();
  return useMemo(() => (data ? data.opleidingen.map((o) => bereken(o, profiel)) : null), [data, profiel]);
}
