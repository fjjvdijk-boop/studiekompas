"use client";

import { Check } from "lucide-react";
import { PROFIEL_LABEL, PROFIEL_VAKKEN } from "@/lib/toelating";
import { VAKKEN, type Profiel, type ProfielNaam, type Vak } from "@/lib/types";

type Diploma = Pick<Profiel, "vooropleiding" | "leerweg" | "profielen" | "vakken">;

/** Kies je route naar de universiteit, en op het vwo je profiel en vakken */
export function DiplomaKiezer({ waarde, zet }: { waarde: Diploma; zet: (w: Partial<Diploma>) => void }) {
  const vwo = waarde.vooropleiding === "vwo" || waarde.vooropleiding === null;
  const wisselProfiel = (pr: ProfielNaam) => {
    const aan = waarde.profielen.includes(pr);
    const profielen = aan ? waarde.profielen.filter((x) => x !== pr) : [...waarde.profielen, pr];
    const vakken = aan ? waarde.vakken : [...new Set([...waarde.vakken, ...PROFIEL_VAKKEN[pr]])];
    zet({ profielen, vakken });
  };
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
              {(Object.keys(PROFIEL_LABEL) as ProfielNaam[]).map((pr) => {
                const aan = waarde.profielen.includes(pr);
                return (
                  <button
                    key={pr}
                    type="button"
                    aria-pressed={aan}
                    onClick={() => wisselProfiel(pr)}
                    className={`focus-ring flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      aan ? "border-ink bg-brand text-white" : "border-line bg-card hover:border-ink/40"
                    }`}
                  >
                    <span className="display text-xl">{pr}</span>
                    <span className="text-sm leading-tight">{PROFIEL_LABEL[pr]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="bovenschrift mb-1.5">Je vakken</p>
            <p className="mb-3 text-sm text-muted">
              Voor veel studies heb je bepaalde vakken nodig, zoals wiskunde B en natuurkunde voor techniek.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {VAKKEN.map((vak) => {
                const aan = waarde.vakken.includes(vak);
                return (
                  <button
                    key={vak}
                    type="button"
                    aria-pressed={aan}
                    onClick={() => wisselVak(vak)}
                    className={`focus-ring inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      aan ? "border-ink bg-brand text-white" : "border-line bg-card hover:border-ink/40"
                    }`}
                  >
                    {aan && <Check className="h-3.5 w-3.5" />}
                    {vak.charAt(0).toUpperCase() + vak.slice(1)}
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

/** Is het diploma compleet genoeg ingevuld om door te gaan? */
export function diplomaCompleet(d: Pick<Profiel, "vooropleiding" | "profielen">): boolean {
  if (d.vooropleiding === "vwo" || d.vooropleiding === null) return d.profielen.length > 0;
  return true;
}
