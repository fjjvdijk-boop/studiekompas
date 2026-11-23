"use client";

import { useEffect, useState } from "react";
import { decodeer, type Data, type RuweData } from "./data";
import type { Woonplaats } from "./types";

let dataBelofte: Promise<Data> | null = null;
let dataKlaar: Data | null = null;

/** Laadt alle opleidingen één keer (± 200 kB) en houdt ze daarna in het geheugen. */
export function laadData(): Promise<Data> {
  dataBelofte ??= fetch("/data/opleidingen.json")
    .then((r) => {
      if (!r.ok) throw new Error("Kon de opleidingen niet laden");
      return r.json() as Promise<RuweData>;
    })
    .then((ruw) => (dataKlaar = decodeer(ruw)));
  return dataBelofte;
}

export function useData(): Data | null {
  const [data, setData] = useState<Data | null>(dataKlaar);
  useEffect(() => {
    if (!data) laadData().then(setData).catch(console.error);
  }, [data]);
  return data;
}

let woonBelofte: Promise<Woonplaats[]> | null = null;

export function laadWoonplaatsen(): Promise<Woonplaats[]> {
  woonBelofte ??= fetch("/data/woonplaatsen.json")
    .then((r) => r.json() as Promise<[string, string, number, number][]>)
    .then((rijen) => rijen.map(([naam, gemeente, lat, lng]) => ({ naam, gemeente, lat, lng })));
  return woonBelofte;
}
