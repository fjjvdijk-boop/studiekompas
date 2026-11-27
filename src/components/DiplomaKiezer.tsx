"use client";

import { Check } from "lucide-react";
import { PROFIEL_LABEL, PROFIEL_VAKKEN, PROFIELEN } from "@/lib/toelating";
import { VAKKEN, type Profiel, type ProfielNaam, type Vak } from "@/lib/types";

type Diploma = Pick<Profiel, "vooropleiding" | "leerweg" | "profielen" | "vakken">;

/** Kies je route naar de universiteit, en op het vwo je profiel en vakken */
export function DiplomaKiezer({ waarde, zet }: { waarde: Diploma; zet: (w: Partial<Diploma>) => void }) {
  const vwo = waarde.vooropleiding === "vwo" || waarde.vooropleiding === null;
  const wisselProfiel = (pr: ProfielNaam) => {
    const aan = waarde.profielen.includes(pr);
    const profielen = aan ? waarde.profielen.filter((x) => x !== pr) : [...waarde.profielen, pr];
    zet({ profielen });
  };
  const vast = new Set(waarde.profielen.flatMap((pr) => PROFIEL_VAKKEN[pr]));
  const wiskunde = WISKUNDE.find((w) => waarde.vakken.includes(w)) ?? (vast.has("wiskunde B") ? "wiskunde B" : null);
  const kiesWiskunde = (w: Vak) => zet({ vakken: [...waarde.vakken.filter((x) => !WISKUNDE.includes(x)), w] });
  const wisselVak = (vak: Vak) =>
    zet({ vakken: waarde.vakken.includes(vak) ? waarde.vakken.filter((x) => x !== vak) : [...waarde.vakken, vak] });

  return (
    <div className="space-y-7">
      <div className="grid gap-2 sm:grid-cols-2">
        {(
          [
            ["vwo", "Ik doe vwo", "De gewone route naar de universiteit"],
            ["havo", "Via een hbo-propedeuse", "Na havo of mbo 4 en een jaar hbo"],
          ] as const
        ).map(([w, titel, tekst]) => {
          const gekozen = w === "vwo" ? vwo : !vwo;
          return (
            <button
              key={w}
              type="button"
              aria-pressed={gekozen}
              onClick={() => zet({ vooropleiding: w })}
              className={`focus-ring flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                gekozen ? "border-ink bg-card" : "border-line hover:border-ink/40"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${gekozen ? "border-ink bg-brand text-white" : "border-line"}`}
              >
                {gekozen && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span>
                <span className="block font-medium">{titel}</span>
                <span className="text-sm text-muted">{tekst}</span>
              </span>
            </button>
          );
        })}
      </div>

      {vwo && (
        <>
          <div>
            <p className="bovenschrift mb-3">Je profiel · een combinatie kan ook</p>
            <div className="grid grid-cols-2 gap-2">
              {PROFIELEN.map((pr) => {
                const aan = waarde.profielen.includes(pr);
                return (
                  <button
                    key={pr}
                    type="button"
                    aria-pressed={aan}
                    onClick={() => wisselProfiel(pr)}
                    className={`focus-ring flex min-h-14 flex-col items-start justify-center gap-0.5 rounded-xl border px-3.5 py-2.5 text-left transition-colors min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-3 ${
                      aan ? "border-ink bg-brand text-white" : "border-line bg-card hover:border-ink/40"
                    }`}
                  >
                    <span className="display text-xl leading-none">{pr}</span>
                    <span className="text-[13px] leading-tight min-[400px]:text-sm">{PROFIEL_LABEL[pr]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="bovenschrift mb-3">Welke wiskunde heb je?</p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Welke wiskunde heb je?">
              {WISKUNDE.map((w) => {
                const aan = wiskunde === w;
                const uit = w !== "wiskunde B" && vast.has("wiskunde B");
                return (
                  <button
                    key={w}
                    type="button"
                    role="radio"
                    aria-checked={aan}
                    disabled={uit}
                    onClick={() => kiesWiskunde(w)}
                    className={`focus-ring min-h-12 rounded-xl border px-2 py-2.5 text-center font-semibold transition-colors disabled:opacity-35 ${
                      aan ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-ink/40"
                    }`}
                  >
                    <span className="block text-[11px] font-medium opacity-75">Wiskunde</span>
                    <span className="block text-xl leading-tight">{w.slice(-1)}</span>
                  </button>
                );
              })}
            </div>
            {vast.has("wiskunde B") && (
              <p className="mt-2 text-xs text-muted">In het profiel NT zit altijd wiskunde B.</p>
            )}
          </div>
          <div>
            <p className="bovenschrift mb-1.5">Je andere vakken</p>
            <p className="mb-3 text-sm text-muted">
              Kies alles wat in je pakket zit, ook je keuzevakken. Voor veel studies heb je bepaalde vakken nodig, zoals
              biologie voor Geneeskunde met een NT-profiel.
            </p>
            <div className="flex flex-wrap gap-2">
              {VAKKEN.filter((v) => !WISKUNDE.includes(v)).map((vak) => {
                const inProfiel = vast.has(vak);
                const aan = inProfiel || waarde.vakken.includes(vak);
                return (
                  <button
                    key={vak}
                    type="button"
                    aria-pressed={aan}
                    disabled={inProfiel}
                    title={inProfiel ? "Zit al in je profiel" : undefined}
                    onClick={() => wisselVak(vak)}
                    className={`focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                      aan ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-ink/40"
                    } ${inProfiel ? "cursor-default opacity-80" : ""}`}
                  >
                    {aan && <Check className="h-3.5 w-3.5" />}
                    {vak.charAt(0).toUpperCase() + vak.slice(1)}
                    {inProfiel && <span className="text-[11px] opacity-80">· profiel</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
      {!vwo && (
        <p className="border-l-2 border-ink pl-4 text-sm text-muted">
          Met een hbo-propedeuse (het eerste jaar van een hbo-opleiding) mag je naar de universiteit. Soms moet je nog
          een vak bijspijkeren, bijvoorbeeld wiskunde. Dat zie je per opleiding.
        </p>
      )}
    </div>
  );
}

const WISKUNDE: Vak[] = ["wiskunde A", "wiskunde B", "wiskunde C"];

/** Is het diploma compleet genoeg ingevuld om door te gaan? (vwo: profiel én wiskunde gekozen) */
export function diplomaCompleet(d: Pick<Profiel, "vooropleiding" | "profielen" | "vakken">): boolean {
  if (d.vooropleiding === "vwo" || d.vooropleiding === null)
    return d.profielen.length > 0 && (d.profielen.includes("NT") || WISKUNDE.some((w) => d.vakken.includes(w)));
  return true;
}
