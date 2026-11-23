"use client";

import { Check } from "lucide-react";
import { TOELATING } from "@/lib/bereken";
import { LEERWEG_LABEL, PROFIEL_LABEL, PROFIEL_VAKKEN } from "@/lib/toelating";
import { VAKKEN, type Leerweg, type Profiel, type ProfielNaam, type Vak, type Vooropleiding } from "@/lib/types";

type Diploma = Pick<Profiel, "vooropleiding" | "leerweg" | "profielen" | "vakken" | "soorten">;

const DIPLOMA: [Vooropleiding, string, string, string][] = [
  ["vmbo", "vmbo", "🎒", "Door naar het mbo"],
  ["havo", "havo", "📘", "Door naar mbo of hbo"],
  ["vwo", "vwo", "🎓", "Door naar mbo, hbo of universiteit"],
  ["mbo4", "mbo 4", "🛠️", "Door naar het hbo"],
];

/** Kies je diploma, en daarna je leerweg (vmbo) of je profiel en vakken (havo/vwo) */
export function DiplomaKiezer({
  waarde,
  zet,
  groot = false,
}: {
  waarde: Diploma;
  zet: (w: Partial<Diploma>) => void;
  groot?: boolean;
}) {
  const v = waarde.vooropleiding;
  const wisselProfiel = (pr: ProfielNaam) => {
    const aan = waarde.profielen.includes(pr);
    const profielen = aan ? waarde.profielen.filter((x) => x !== pr) : [...waarde.profielen, pr];
    // Vakken die bij een nieuw profiel horen automatisch aanzetten
    const vakken = aan ? waarde.vakken : [...new Set([...waarde.vakken, ...PROFIEL_VAKKEN[pr]])];
    zet({ profielen, vakken });
  };
  const wisselVak = (vak: Vak) =>
    zet({ vakken: waarde.vakken.includes(vak) ? waarde.vakken.filter((x) => x !== vak) : [...waarde.vakken, vak] });

  return (
    <div className="space-y-6">
      <div className={`grid gap-3 ${groot ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        {DIPLOMA.map(([w, label, emoji, tekst]) => {
          const gekozen = v === w;
          return (
            <button
              key={w}
              type="button"
              aria-pressed={gekozen}
              onClick={() => zet({ vooropleiding: w, soorten: TOELATING[w], ...(w !== v ? { leerweg: null } : {}) })}
              className={`focus-ring relative flex flex-col items-start gap-1.5 rounded-3xl border-2 text-left transition-all active:scale-[.98] ${groot ? "p-4 sm:p-5" : "p-3.5"} ${
                gekozen ? "border-brand bg-brand-soft shadow-groot" : "border-line bg-card hover:border-brand/50"
              }`}
            >
              <span className={groot ? "text-3xl" : "text-2xl"}>{emoji}</span>
              <span className="display text-lg font-bold leading-tight">{label}</span>
              {groot && <span className="text-sm text-muted">{tekst}</span>}
              {gekozen && (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-ink">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {v === "vmbo" && (
        <div className="binnenkomen">
          <p className="mb-2.5 font-semibold">Welke leerweg?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(LEERWEG_LABEL) as Leerweg[]).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={waarde.leerweg === l}
                onClick={() => zet({ leerweg: l })}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  waarde.leerweg === l ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-brand"
                }`}
              >
                {LEERWEG_LABEL[l]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Met de basisberoepsgerichte leerweg begin je op mbo 2; met de andere leerwegen kun je naar mbo 3 of 4.
          </p>
        </div>
      )}

      {(v === "havo" || v === "vwo") && (
        <div className="binnenkomen space-y-5">
          <div>
            <p className="mb-2.5 font-semibold">
              Welk profiel? <span className="font-normal text-muted">(een combinatie kan ook)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PROFIEL_LABEL) as ProfielNaam[]).map((pr) => {
                const aan = waarde.profielen.includes(pr);
                return (
                  <button
                    key={pr}
                    type="button"
                    aria-pressed={aan}
                    onClick={() => wisselProfiel(pr)}
                    className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                      aan ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-brand"
                    }`}
                  >
                    <span className={`display text-lg font-bold ${aan ? "" : "text-brand"}`}>{pr}</span>
                    <span className="text-sm leading-tight">{PROFIEL_LABEL[pr]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-1 font-semibold">Welke vakken heb je?</p>
            <p className="mb-2.5 text-sm text-muted">
              Belangrijk voor de toelating: voor techniek heb je vaak wiskunde B en natuurkunde nodig, voor de zorg
              biologie.
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
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      aan ? "border-brand bg-brand text-brand-ink" : "border-line bg-card hover:border-brand"
                    }`}
                  >
                    {aan && <Check className="h-3.5 w-3.5" />}
                    {vak.charAt(0).toUpperCase() + vak.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {v === "mbo4" && (
        <p className="rounded-2xl bg-card-2 p-4 text-sm text-muted">
          Met een mbo 4-diploma kun je naar het hbo. Sommige hbo-opleidingen vragen een passende mbo-opleiding of een
          extra toets: dat zie je per opleiding.
        </p>
      )}
    </div>
  );
}

/** Is het diploma compleet genoeg ingevuld om door te gaan? */
export function diplomaCompleet(d: Pick<Profiel, "vooropleiding" | "leerweg" | "profielen">): boolean {
  if (!d.vooropleiding) return false;
  if (d.vooropleiding === "vmbo") return d.leerweg !== null;
  if (d.vooropleiding === "havo" || d.vooropleiding === "vwo") return d.profielen.length > 0;
  return true;
}
