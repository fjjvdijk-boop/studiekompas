"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SECTOR } from "@/data/sectoren";
import { KAMER_PER_PLAATS } from "@/data/kamers";
import { PER_STAD, SOORT_LABEL } from "@/data/verenigingen";
import { bereken, euro, geldVoor, kosten, plaatsNaam, reistijd, reistijdTekst, stoplicht } from "@/lib/bereken";
import { useStore } from "@/lib/store";
import type { Opleiding, Plaats, SectorId } from "@/lib/types";
import { KamerStadKaart } from "@/components/KamerStadKaart";
import { OpleidingKaart } from "@/components/OpleidingKaart";
import { LICHT_LABEL } from "@/components/ui";

export function PlaatsDetail({ plaats, opleidingen }: { plaats: Plaats; opleidingen: Opleiding[] }) {
  const { profiel } = useStore();
  const naam = plaatsNaam(plaats.naam);
  const r = reistijd(profiel.woonplaats, plaats);
  const licht = stoplicht(r.minuten);
  const k = kosten({ soort: "wo", leerwegen: null }, plaats, r.minuten, profiel);
  const g = geldVoor(k, profiel, false);
  const kamer = KAMER_PER_PLAATS.get(plaats.naam);
  const stad = PER_STAD.get(plaats.naam);

  const perSector: Partial<Record<SectorId, number>> = {};
  const unis = new Map<string, { n: number; url: string | null }>();
  for (const o of opleidingen) {
    perSector[o.sector] = (perSector[o.sector] ?? 0) + 1;
    const u = unis.get(o.instelling.naam) ?? { n: 0, url: o.instelling.url };
    u.n++;
    unis.set(o.instelling.naam, u);
  }
  const sectoren = (Object.entries(perSector) as [SectorId, number][]).sort((a, b) => b[1] - a[1]);
  const max = sectoren[0]?.[1] ?? 1;

  const top = useMemo(
    () =>
      opleidingen
        .map((o) => bereken(o, profiel))
        .filter((x) => x.match.toelaatbaar)
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 6),
    [opleidingen, profiel],
  );

  return (
    <div className="space-y-16">
      <div>
        <Link
          href="/kaart"
          className="focus-ring mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Alle studiesteden
        </Link>
        <p className="bovenschrift mb-3">{plaats.provincie}</p>
        <h1 className="display text-[48px] leading-[1] sm:text-8xl">
          Studeren in <em className="italic">{naam}</em>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          {opleidingen.length} universitaire bachelors bij {unis.size} {unis.size === 1 ? "instelling" : "instellingen"}
          .
        </p>
        <dl className="mt-10 grid grid-cols-2 border-y border-line sm:grid-cols-4">
          {[
            [
              `Reizen vanaf ${profiel.woonplaats.naam}`,
              `${r.schatting ? "± " : ""}${reistijdTekst(r.minuten)}`,
              LICHT_LABEL[licht],
            ],
            [
              "Gemiddelde kamer",
              `${k.huurSchatting ? "± " : ""}${euro(k.huur)}`,
              k.huurSchatting ? "schatting" : "Kamernet Q1 2025",
            ],
            ["Op kamer per maand", euro(k.uitwonend), "huur, leven, collegegeld, boeken"],
            ["Zelf lenen", euro(g.teLenen), "na DUO, ouders en bijbaan"],
          ].map(([l, w, s], i) => (
            <div
              key={l}
              className={`py-5 ${i % 2 ? "pl-5" : "pr-5"} ${i > 0 ? "sm:border-l sm:border-line sm:pl-5" : ""} ${i > 1 ? "border-t border-line sm:border-t-0" : ""}`}
            >
              <dt className="bovenschrift">{l}</dt>
              <dd className="display mt-1 text-2xl tabular">{w}</dd>
              <dd className="text-xs text-muted">{s}</dd>
            </div>
          ))}
        </dl>
        <Link
          href={`/zoeken?plaats=${encodeURIComponent(plaats.naam)}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm"
        >
          <span className="streep">Alle bachelors in {naam}</span> <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {top.length > 0 && (
        <section>
          <div className="mb-6 border-b border-line pb-3">
            <p className="bovenschrift mb-1">Voor jou</p>
            <h2 className="display text-3xl sm:text-4xl">Je beste matches in {naam}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((x, i) => (
              <OpleidingKaart key={x.opleiding.id} r={x} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="mb-5 border-b border-line pb-3">
            <p className="bovenschrift mb-1">Aanbod</p>
            <h2 className="display text-3xl">Richtingen</h2>
          </div>
          <ul className="space-y-3">
            {sectoren.map(([s, n]) => (
              <li key={s}>
                <Link
                  href={`/zoeken?plaats=${encodeURIComponent(plaats.naam)}&sector=${s}`}
                  className="group grid grid-cols-[11rem_1fr_2rem] items-center gap-3 text-sm"
                >
                  <span className="truncate group-hover:underline group-hover:underline-offset-4">
                    {SECTOR[s].naam}
                  </span>
                  <span className="h-[3px] bg-line">
                    <span
                      className="block h-full"
                      style={{ width: `${(n / max) * 100}%`, background: SECTOR[s].kleur }}
                    />
                  </span>
                  <span className="text-right font-mono text-xs text-muted tabular">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-5 border-b border-line pb-3">
            <p className="bovenschrift mb-1">Instellingen</p>
            <h2 className="display text-3xl">Universiteiten</h2>
          </div>
          <ul className="divide-y divide-line">
            {[...unis.entries()]
              .sort((a, b) => b[1].n - a[1].n)
              .map(([n, u]) => (
                <li key={n} className="flex items-baseline justify-between gap-3 py-3">
                  <span>{n}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted tabular">{u.n}</span>
                    {u.url && (
                      <a
                        href={u.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Website ${n}`}
                        className="text-muted hover:text-ink"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="mb-5 border-b border-line pb-3">
            <p className="bovenschrift mb-1">Wonen</p>
            <h2 className="display text-3xl">Een kamer in {naam}</h2>
          </div>
          {kamer ? (
            <KamerStadKaart k={kamer} metLink={false} />
          ) : (
            <p className="text-muted">
              Schrijf je in bij ROOM.nl en lees{" "}
              <Link href="/kamer" className="streep text-ink">
                het stappenplan
              </Link>
              .
            </p>
          )}
        </div>
        <div>
          <div className="mb-5 border-b border-line pb-3">
            <p className="bovenschrift mb-1">Studentenleven</p>
            <h2 className="display text-3xl">Verenigingen</h2>
          </div>
          {stad ? (
            <>
              <p className="mb-4 text-muted">{stad.intro}</p>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {stad.verenigingen.map((v) => (
                  <li key={v.naam} className="border-b border-line py-3">
                    <p className="bovenschrift">{SOORT_LABEL[v.soort].label}</p>
                    <p className="display mt-0.5 text-lg">
                      {v.url ? (
                        <a href={v.url} target="_blank" rel="noreferrer" className="streep">
                          {v.naam}
                        </a>
                      ) : (
                        v.naam
                      )}
                    </p>
                    <p className="text-sm text-muted">{v.tekst}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {stad.overzichten.map((x) => (
                  <a
                    key={x.url}
                    href={x.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <span className="streep">{x.label}</span> <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted">
              We hebben voor {naam} nog geen verenigingen verzameld. Kijk op de site van de universiteit of vraag ernaar
              op de open dag.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
