"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, BedDouble, ExternalLink, Search, TrainFront, Wallet } from "lucide-react";
import { SECTOR } from "@/data/sectoren";
import { PER_STAD, SOORT_LABEL } from "@/data/verenigingen";
import { bereken, euro, getal, kosten, plaatsNaam, reistijd, reistijdTekst, stoplicht } from "@/lib/bereken";
import { useStore } from "@/lib/store";
import type { Opleiding, Plaats, SectorId, Soort } from "@/lib/types";
import { OpleidingKaart } from "@/components/OpleidingKaart";
import { LICHT_LABEL } from "@/components/ui";

export function PlaatsDetail({ plaats, opleidingen }: { plaats: Plaats; opleidingen: Opleiding[] }) {
  const { profiel } = useStore();
  const naam = plaatsNaam(plaats.naam);
  const r = reistijd(profiel.woonplaats, plaats);
  const licht = stoplicht(r.minuten);
  const k = kosten({ soort: "hbo", leerwegen: null }, plaats, r.minuten, profiel);
  const stad = PER_STAD.get(plaats.naam);

  const perSoort: Record<Soort, number> = { mbo: 0, hbo: 0, wo: 0 };
  const perSector: Partial<Record<SectorId, number>> = {};
  const scholen = new Map<string, { n: number; url: string | null; soort: Soort }>();
  for (const o of opleidingen) {
    perSoort[o.soort]++;
    perSector[o.sector] = (perSector[o.sector] ?? 0) + 1;
    const s = scholen.get(o.instelling.naam) ?? { n: 0, url: o.instelling.url, soort: o.instelling.soort };
    s.n++;
    scholen.set(o.instelling.naam, s);
  }
  const sectoren = (Object.entries(perSector) as [SectorId, number][]).sort((a, b) => b[1] - a[1]);
  const max = sectoren[0]?.[1] ?? 1;

  const top = useMemo(() => {
    const gezien = new Set<string>();
    return opleidingen
      .map((o) => bereken(o, profiel))
      .filter((x) => x.match.toelaatbaar)
      .sort((a, b) => b.match.score - a.match.score)
      .filter((x) => (gezien.has(x.opleiding.naam) ? false : (gezien.add(x.opleiding.naam), true)))
      .slice(0, 6);
  }, [opleidingen, profiel]);

  return (
    <div className="space-y-8">
      <Link
        href="/kaart"
        className="focus-ring inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Kaart
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] bg-[#16123a] px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-[#7c6cff] opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-[#ff9f1c] opacity-20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b3a9ff]">{plaats.provincie}</p>
          <h1 className="display mt-2 text-5xl font-bold sm:text-7xl">Studeren in {naam}</h1>
          <p className="mt-3 max-w-xl text-lg text-white/75">
            {getal(opleidingen.length)} opleidingen bij {scholen.size} {scholen.size === 1 ? "school" : "scholen"}.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [
                <TrainFront key="t" className="h-4 w-4" />,
                `Vanaf ${profiel.woonplaats.naam}`,
                `${r.schatting ? "± " : ""}${reistijdTekst(r.minuten)}`,
                LICHT_LABEL[licht],
              ],
              [
                <Wallet key="w" className="h-4 w-4" />,
                "Per maand (hbo)",
                euro(k.advies),
                k.thuisMogelijk ? "thuis wonend" : "op kamer",
              ],
              [
                <BedDouble key="b" className="h-4 w-4" />,
                "Kamerhuur",
                `${k.huurSchatting ? "± " : ""}${euro(k.huur)}`,
                k.huurSchatting ? "schatting" : "gemiddeld",
              ],
              [
                <span key="s">🎓</span>,
                "mbo · hbo · wo",
                `${perSoort.mbo} · ${perSoort.hbo} · ${perSoort.wo}`,
                "opleidingen",
              ],
            ].map(([icoon, label, waarde, sub], i) => (
              <div key={i} className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10">
                <dt className="flex items-center gap-1.5 text-xs text-white/65">
                  {icoon} {label}
                </dt>
                <dd className="display mt-1 text-2xl font-bold tabular">{waarde}</dd>
                <dd className="text-xs text-white/60">{sub}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={`/zoeken?plaats=${encodeURIComponent(plaats.naam)}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-[#16123a] hover:bg-white/90"
          >
            <Search className="h-4 w-4" /> Alle opleidingen in {naam}
          </Link>
        </div>
      </section>

      {top.length > 0 && (
        <section>
          <h2 className="display mb-4 text-2xl font-bold sm:text-[28px]">Jouw beste matches in {naam}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((x, i) => (
              <OpleidingKaart key={x.opleiding.id} r={x} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="kaart p-6">
          <h2 className="display mb-4 text-2xl font-bold">Richtingen</h2>
          <ul className="space-y-2.5">
            {sectoren.map(([s, n]) => (
              <li key={s}>
                <Link
                  href={`/zoeken?plaats=${encodeURIComponent(plaats.naam)}&sector=${s}`}
                  className="group flex items-center gap-3"
                >
                  <span className="w-7 text-xl">{SECTOR[s].emoji}</span>
                  <span className="w-36 truncate text-sm font-medium group-hover:text-brand sm:w-44">
                    {SECTOR[s].naam}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-card-2">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(n / max) * 100}%`, background: SECTOR[s].kleur }}
                    />
                  </span>
                  <span className="w-10 text-right text-sm text-muted tabular">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="kaart p-6">
          <h2 className="display mb-4 text-2xl font-bold">Scholen</h2>
          <ul className="divide-y divide-line">
            {[...scholen.entries()]
              .sort((a, b) => b[1].n - a[1].n)
              .map(([naam, s]) => (
                <li key={naam} className="flex items-center gap-3 py-2.5">
                  <span className="rounded-md bg-card-2 px-1.5 py-0.5 text-[11px] font-bold uppercase">{s.soort}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{naam}</span>
                  <span className="text-sm text-muted tabular">{s.n}</span>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Website ${naam}`}
                      className="rounded-full p-1.5 text-muted hover:bg-card-2 hover:text-brand"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              ))}
          </ul>
        </section>
      </div>

      <section className="kaart p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Studentenleven</p>
        <h2 className="display mt-1 text-2xl font-bold sm:text-[28px]">Verenigingen in {naam}</h2>
        {stad ? (
          <>
            <p className="mt-1 max-w-2xl text-muted">{stad.intro}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stad.verenigingen.map((v) => (
                <li key={v.naam} className="rounded-2xl bg-card-2 p-5">
                  <p className="text-xs font-semibold text-muted">
                    {SOORT_LABEL[v.soort].emoji} {SOORT_LABEL[v.soort].label}
                  </p>
                  <p className="display mt-1 text-lg font-bold">
                    {v.url ? (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-brand"
                      >
                        {v.naam} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      v.naam
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted">{v.tekst}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {stad.overzichten.map((x) => (
                <a
                  key={x.url}
                  href={x.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg hover:opacity-90"
                >
                  {x.label} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-2 max-w-2xl text-muted">
            Voor {naam} hebben we nog geen verenigingen verzameld. Kijk op de websites van de scholen hierboven of vraag
            ernaar op de open dag.
          </p>
        )}
      </section>
    </div>
  );
}
