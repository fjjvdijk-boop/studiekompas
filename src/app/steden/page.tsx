"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BedDouble, GraduationCap, Repeat, TrainFront } from "lucide-react";
import { OPLEIDINGEN } from "@/data/opleidingen";
import { STEDEN } from "@/data/steden";
import { euro, kosten, stoplicht } from "@/lib/bereken";
import { useStore } from "@/lib/store";
import { PaginaKop, StoplichtBadge } from "@/components/ui";

const StedenKaart = dynamic(() => import("@/components/StedenKaart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-[1.25rem] bg-card-2" />,
});

type Sortering = "kosten" | "reistijd" | "huur";

export default function StedenPagina() {
  const { profiel } = useStore();
  const [gekozen, setGekozen] = useState<string | null>(null);
  const [sort, setSort] = useState<Sortering>("kosten");

  const lijst = useMemo(() => {
    const l = STEDEN.map((s) => ({
      stad: s,
      k: kosten(s, profiel.maxReistijd),
      aantal: OPLEIDINGEN.filter((o) => o.stadId === s.id).length,
    }));
    const f: Record<Sortering, (a: (typeof l)[0], b: (typeof l)[0]) => number> = {
      kosten: (a, b) => a.k.advies - b.k.advies,
      reistijd: (a, b) => a.stad.reistijd - b.stad.reistijd,
      huur: (a, b) => a.stad.kamerhuur - b.stad.kamerhuur,
    };
    return l.sort(f[sort]);
  }, [profiel.maxReistijd, sort]);

  const maandlasten = Object.fromEntries(lijst.map(({ stad, k }) => [stad.id, k.advies]));

  return (
    <>
      <PaginaKop
        titel="Studiesteden"
        sub="Kamerhuur en reistijd vanaf Wierden. Op de kaart zie je jouw maandlasten per stad, het stoplicht laat zien hoe goed je kunt reizen."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="kaart h-[55dvh] min-h-[360px] p-1.5 lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)]">
          <StedenKaart geselecteerd={gekozen} kies={setGekozen} maandlasten={maandlasten} />
        </div>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted">{STEDEN.length} steden</p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sorteer</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sortering)}
                className="focus-ring rounded-lg border border-line bg-card px-2 py-1.5"
              >
                <option value="kosten">Maandlasten</option>
                <option value="reistijd">Reistijd</option>
                <option value="huur">Kamerhuur</option>
              </select>
            </label>
          </div>
          <ul className="space-y-2.5">
            {lijst.map(({ stad, k, aantal }) => (
              <li
                key={stad.id}
                className={`kaart overflow-hidden transition-colors ${
                  gekozen === stad.id ? "border-brand ring-1 ring-brand" : "hover:border-brand/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setGekozen(gekozen === stad.id ? null : stad.id)}
                  aria-expanded={gekozen === stad.id}
                  className="focus-ring w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{stad.naam}</p>
                      <p className="text-xs text-muted">{stad.provincie}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular">{euro(k.advies)}</p>
                      <p className="text-xs text-muted">{k.thuisMogelijk ? "thuis wonend" : "op kamer"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                    <StoplichtBadge licht={stoplicht(stad.reistijd)} minuten={stad.reistijd} />
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="h-4 w-4" /> {euro(stad.kamerhuur)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {stad.overstappen ? <Repeat className="h-4 w-4" /> : <TrainFront className="h-4 w-4" />}
                      {stad.overstappen ? `${stad.overstappen}× overstap` : "direct"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" /> {aantal}
                    </span>
                  </div>
                </button>
                {gekozen === stad.id && (
                  <div className="mx-4 mb-4 flex flex-wrap gap-1.5 border-t border-line pt-3">
                    {OPLEIDINGEN.filter((o) => o.stadId === stad.id).map((o) => (
                      <Link
                        key={o.id}
                        href={`/opleiding/${o.id}`}
                        className="rounded-full bg-card-2 px-2.5 py-1 text-xs font-medium text-ink hover:text-brand"
                      >
                        {o.naam} <span className="text-muted">· {o.niveau}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Kamerhuur: gemiddelde volgens de Kamernet Huurmonitor (indicatief). Reistijd: NS, enkele reis op een
            doordeweekse ochtend (indicatief).
          </p>
        </section>
      </div>
    </>
  );
}
