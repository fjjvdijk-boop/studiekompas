"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { HOOFDRICHTINGEN, SECTOREN } from "@/data/sectoren";
import { euro, getal, plaatsNaam } from "@/lib/bereken";
import { useData } from "@/lib/data-client";
import { plaatsOverzicht } from "@/lib/plaatsen";
import { useStore } from "@/lib/store";
import type { SectorId } from "@/lib/types";
import { PlaatsPaneel } from "@/components/PlaatsPaneel";
import { PaginaKop, StoplichtBadge } from "@/components/ui";

const NederlandKaart = dynamic(() => import("@/components/NederlandKaart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-[1.25rem] bg-card-2" />,
});

export default function KaartPagina() {
  const data = useData();
  const { profiel } = useStore();
  const [sector, setSector] = useState<SectorId | null>(null);
  const [gekozen, setGekozen] = useState<string | null>(null);
  const paneel = useRef<HTMLElement>(null);
  // Op mobiel staat het paneel onder de kaart: scroll ernaartoe als je een plaats kiest
  useEffect(() => {
    if (gekozen && window.innerWidth < 1024)
      setTimeout(() => paneel.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  }, [gekozen]);

  const plaatsen = useMemo(
    () => (data ? plaatsOverzicht(data, profiel, (o) => !sector || o.sector === sector, "wo") : []),
    [data, profiel, sector],
  );
  const punten = useMemo(
    () =>
      plaatsen.map((p) => ({
        naam: p.plaats.naam,
        label: plaatsNaam(p.plaats.naam),
        lat: p.plaats.lat,
        lng: p.plaats.lng,
        aantal: p.aantal,
        licht: p.licht,
        maandlasten: p.kosten.advies,
      })),
    [plaatsen],
  );
  const info = plaatsen.find((p) => p.plaats.naam === gekozen) ?? null;

  return (
    <>
      <PaginaKop
        label="Kaart"
        titel="Waar kun je studeren?"
        sub={
          <>
            {getal(plaatsen.length)} plaatsen. Hoe groter de stip, hoe meer opleidingen. De kleur is je reistijd vanaf{" "}
            <strong className="text-ink">{profiel.woonplaats.naam}</strong>:{" "}
            <span className="font-semibold text-groen">groen</span> is goed te doen,{" "}
            <span className="font-semibold text-rood">rood</span> betekent op kamer.
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="scroll-x -mx-4 flex flex-1 gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setSector(null)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${!sector ? "border-ink bg-ink text-bg" : "border-line bg-card"}`}
          >
            Alle richtingen
          </button>
          {SECTOREN.filter((s) => HOOFDRICHTINGEN.includes(s.id)).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSector(sector === s.id ? null : s.id)}
              aria-pressed={sector === s.id}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                sector === s.id ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-ink"
              }`}
            >
              {s.kort}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        <div className="kaart relative h-[62dvh] min-h-[420px] p-1.5 lg:sticky lg:top-24 lg:h-[calc(100dvh-8.5rem)]">
          <NederlandKaart punten={punten} thuis={profiel.woonplaats} gekozen={gekozen} kies={setGekozen} />
          <div className="pointer-events-none absolute bottom-4 left-4 flex gap-3 rounded-full bg-card/90 px-3 py-1.5 text-[11px] font-semibold shadow-zacht backdrop-blur">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#12a660]" /> ≤ 45 min
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f07c1b]" /> ≤ 75 min
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e0344a]" /> verder
            </span>
          </div>
        </div>

        <aside ref={paneel} className="kaart h-fit scroll-mt-20 p-5 sm:p-6">
          {info ? (
            <PlaatsPaneel info={info} sluit={() => setGekozen(null)} />
          ) : (
            <div>
              <h2 className="display text-3xl">Universiteitssteden</h2>
              <p className="mb-4 text-sm text-muted">Tik op een stad voor alle details.</p>
              {!data ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-2xl bg-card-2" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {plaatsen.map((p, i) => (
                    <li key={p.plaats.naam}>
                      <button
                        type="button"
                        onClick={() => setGekozen(p.plaats.naam)}
                        className="focus-ring flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-card-2"
                      >
                        <span className="display w-6 text-center font-bold text-muted tabular">{i + 1}</span>
                        <MapPin className="h-4 w-4 text-brand" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{plaatsNaam(p.plaats.naam)}</span>
                          <span className="text-xs text-muted tabular">
                            {getal(p.aantal)} bachelors · kamer {euro(p.kosten.huur)}
                          </span>
                        </span>
                        <StoplichtBadge licht={p.licht} minuten={p.reistijd} schatting={p.reistijdSchatting} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
