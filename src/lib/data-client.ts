"use client";

import { useEffect, useState } from "react";
import { decodeer, type Data, type RuweData } from "./data";
import type { Woonplaats } from "./types";

let dataBelofte: Promise<Data> | null = null;
let dataKlaar: Data | null = null;
const foutLuisteraars = new Set<(fout: boolean) => void>();

async function haalOp(poging = 1): Promise<Data> {
  try {
    const r = await fetch("/data/opleidingen.json");
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (dataKlaar = decodeer((await r.json()) as RuweData));
  } catch (e) {
    if (poging < 3) {
      await new Promise((ok) => setTimeout(ok, 1500 * poging));
      return haalOp(poging + 1);
    }
    throw e;
  }
}

/** Laadt alle opleidingen één keer (± 200 kB) en houdt ze daarna in het geheugen. Probeert het 3 keer. */
export function laadData(): Promise<Data> {
  dataBelofte ??= haalOp().catch((e) => {
    dataBelofte = null;
    foutLuisteraars.forEach((f) => f(true));
    throw e;
  });
  return dataBelofte;
}

export function useData(): Data | null {
  const [data, setData] = useState<Data | null>(dataKlaar);
  useEffect(() => {
    if (!data)
      laadData()
        .then(setData)
        .catch(() => {});
  }, [data]);
  return data;
}

/** true als het laden van de opleidingen (na 3 pogingen) is mislukt */
export function useDataFout(): boolean {
  const [fout, setFout] = useState(false);
  useEffect(() => {
    foutLuisteraars.add(setFout);
    return () => void foutLuisteraars.delete(setFout);
  }, []);
  return fout;
}

let woonBelofte: Promise<Woonplaats[]> | null = null;

export function laadWoonplaatsen(): Promise<Woonplaats[]> {
  woonBelofte ??= fetch("/data/woonplaatsen.json")
    .then((r) => r.json() as Promise<[string, string, number, number][]>)
    .then((rijen) => rijen.map(([naam, gemeente, lat, lng]) => ({ naam, gemeente, lat, lng })));
  return woonBelofte;
}
