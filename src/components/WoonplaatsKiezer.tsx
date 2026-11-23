"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { laadWoonplaatsen } from "@/lib/data-client";
import type { Woonplaats } from "@/lib/types";

const normaal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");

export function WoonplaatsKiezer({ waarde, kies }: { waarde: Woonplaats; kies: (w: Woonplaats) => void }) {
  const [lijst, setLijst] = useState<Woonplaats[]>([]);
  const [tekst, setTekst] = useState(waarde.naam);
  const [open, setOpen] = useState(false);
  const [actief, setActief] = useState(0);
  const id = useId();
  const doos = useRef<HTMLDivElement>(null);

  useEffect(() => {
    laadWoonplaatsen()
      .then(setLijst)
      .catch(() => {});
  }, []);
  useEffect(() => setTekst(waarde.naam), [waarde.naam]);
  useEffect(() => {
    const klik = (e: MouseEvent) => {
      if (doos.current && !doos.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", klik);
    return () => document.removeEventListener("mousedown", klik);
  }, []);

  const treffers = useMemo(() => {
    const q = normaal(tekst);
    if (!q) return [];
    const begin = lijst.filter((w) => normaal(w.naam).startsWith(q));
    const midden = lijst.filter((w) => !normaal(w.naam).startsWith(q) && normaal(w.naam).includes(q));
    return [...begin, ...midden].slice(0, 8);
  }, [tekst, lijst]);

  const kiesItem = (w: Woonplaats) => {
    kies(w);
    setTekst(w.naam);
    setOpen(false);
  };

  return (
    <div className="relative" ref={doos}>
      <label htmlFor={id} className="sr-only">
        Woonplaats
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        id={id}
        role="combobox"
        aria-expanded={open && treffers.length > 0}
        aria-controls={`${id}-lijst`}
        aria-autocomplete="list"
        autoComplete="off"
        value={tekst}
        placeholder="Typ je woonplaats"
        onFocus={(e) => {
          e.target.select();
          setOpen(true);
        }}
        onChange={(e) => {
          setTekst(e.target.value);
          setOpen(true);
          setActief(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActief((a) => Math.min(a + 1, treffers.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActief((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && treffers[actief]) {
            e.preventDefault();
            kiesItem(treffers[actief]);
          } else if (e.key === "Escape") setOpen(false);
        }}
        className="focus-ring w-full rounded-2xl border border-line bg-card py-3.5 pl-11 pr-4 text-[15px] font-medium"
      />
      {open && treffers.length > 0 && (
        <ul
          id={`${id}-lijst`}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-1.5 shadow-groot"
        >
          {treffers.map((w, i) => (
            <li
              key={`${w.naam}-${w.gemeente}`}
              role="option"
              aria-selected={i === actief}
              onMouseDown={(e) => {
                e.preventDefault();
                kiesItem(w);
              }}
              onMouseEnter={() => setActief(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === actief ? "bg-brand-soft" : ""}`}
            >
              <MapPin className="h-4 w-4 text-brand" />
              <span className="font-medium">{w.naam}</span>
              {w.gemeente !== w.naam && <span className="text-sm text-muted">gem. {w.gemeente}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
