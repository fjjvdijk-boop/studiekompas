"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles, TrainFront } from "lucide-react";
import { OPEN_DAGEN } from "@/data/opendagen";
import { STEDEN } from "@/data/steden";
import { dagenTot, datumTekst, euro, kosten, opleidingVan, stoplicht, vandaag } from "@/lib/bereken";
import { useResultaten } from "@/lib/resultaten";
import { useStore } from "@/lib/store";
import { OpleidingKaart } from "@/components/OpleidingKaart";
import { Kop, StoplichtBadge } from "@/components/ui";

function begroeting() {
  const uur = Number(
    new Intl.DateTimeFormat("nl-NL", { hour: "numeric", timeZone: "Europe/Amsterdam" }).format(new Date()),
  );
  if (uur < 6) return "Goedenacht";
  if (uur < 12) return "Goedemorgen";
  if (uur < 18) return "Goedemiddag";
  return "Goedenavond";
}

export default function HomePagina() {
  const { geladen, profiel, heeftProfiel, favorieten } = useStore();
  const resultaten = useResultaten();

  if (!geladen) return <Laden />;

  const matches = [...resultaten]
    .sort((a, b) => b.match.score - a.match.score || a.kosten.advies - b.kosten.advies)
    .slice(0, 4);

  const favIds = new Set(favorieten.map((f) => f.opleidingId));
  const komend = OPEN_DAGEN.filter((d) => d.datum >= vandaag()).sort((a, b) => a.datum.localeCompare(b.datum));
  const favDag = komend.find((d) => favIds.has(d.opleidingId));
  const volgende = favDag ?? komend[0];
  const volgendeOpl = volgende ? opleidingVan(volgende.opleidingId) : undefined;

  const steden = STEDEN.map((s) => ({ stad: s, k: kosten(s, profiel.maxReistijd) }))
    .sort((a, b) => a.k.uitwonend - b.k.uitwonend)
    .slice(0, 4);
  const thuisSteden = STEDEN.filter((s) => s.reistijd <= profiel.maxReistijd);

  return (
    <div className="space-y-10">
      <section className="binnenkomen relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4338ca] via-[#5b4ee6] to-[#7c6cf2] p-6 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
          <div>
            <p className="text-sm font-medium text-white/75">
              {begroeting()}
              {profiel.naam ? `, ${profiel.naam}` : ""} 👋
            </p>
            <h1 className="mt-2 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Welke opleiding past bij jou, en wat kost het je per maand?
            </h1>
            <p className="mt-3 max-w-xl text-white/80">
              StudieKompas combineert open data over opleidingen, kamerhuur en reistijd. Zo zie je meteen of je thuis
              kunt blijven wonen in {`Wierden`}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/zoeken"
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#4338ca] hover:bg-white/90"
              >
                Zoek opleidingen <ArrowRight className="h-4 w-4" />
              </Link>
              {!heeftProfiel && (
                <Link
                  href="/profiel"
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/25"
                >
                  <Sparkles className="h-4 w-4" /> Maak je profiel
                </Link>
              )}
            </div>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-5">
              {[
                ["Opleidingen", resultaten.length],
                ["Studiesteden", STEDEN.length],
                ["Favorieten", favorieten.length],
              ].map(([label, waarde]) => (
                <div key={label}>
                  <dt className="text-xs text-white/65">{label}</dt>
                  <dd className="text-2xl font-semibold tabular">{waarde}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Link
            href="/profiel"
            className="focus-ring hidden rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/15 lg:block"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Jouw situatie</p>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/75">Budget</dt>
                <dd className="font-semibold tabular">{euro(profiel.budget)} /mnd</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/75">Max. reistijd</dt>
                <dd className="font-semibold tabular">{profiel.maxReistijd} min</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/75">Interesses</dt>
                <dd className="text-right font-semibold">
                  {profiel.interesses.length
                    ? profiel.interesses.slice(0, 2).join(", ") +
                      (profiel.interesses.length > 2 ? ` +${profiel.interesses.length - 2}` : "")
                    : "–"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm">
              {thuisSteden.length ? (
                <>
                  🏠 Thuis wonen kan in <strong>{thuisSteden.map((s) => s.naam).join(", ")}</strong>
                </>
              ) : (
                "Met deze reistijd ga je op kamer."
              )}
            </p>
            <p className="mt-3 text-xs font-medium text-white/70">
              {heeftProfiel ? "Aanpassen →" : "Profiel invullen →"}
            </p>
          </Link>
        </div>
      </section>

      <section>
        <Kop
          titel="Beste matches"
          sub={
            heeftProfiel
              ? "Op basis van je interesses, budget en reistijd"
              : "Vul je profiel in voor persoonlijke matches"
          }
          actie={{ href: "/zoeken", label: "Alles bekijken" }}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {matches.map((r) => (
            <OpleidingKaart key={r.opleiding.id} r={r} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <Kop
            titel="Eerstvolgende open dag"
            sub={favDag ? "Van je favorieten" : "Bewaar favorieten om hier jouw open dagen te zien"}
            actie={{ href: "/open-dagen", label: "Kalender" }}
          />
          {volgende && volgendeOpl ? (
            <Link
              href={`/opleiding/${volgendeOpl.id}`}
              className="kaart focus-ring flex items-center gap-5 p-5 transition-colors hover:border-brand/40"
            >
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <span className="text-xs font-semibold uppercase">
                  {datumTekst(volgende.datum, { month: "short" }).replace(".", "")}
                </span>
                <span className="text-3xl font-semibold leading-none tabular">
                  {datumTekst(volgende.datum, { day: "numeric" })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{volgende.soort}</p>
                <h3 className="truncate font-semibold">{volgendeOpl.naam}</h3>
                <p className="truncate text-sm text-muted">{volgendeOpl.instelling}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  <CalendarDays className="h-4 w-4" />
                  {aftellen(dagenTot(volgende.datum))} · {volgende.start}–{volgende.eind}
                </p>
              </div>
            </Link>
          ) : (
            <div className="kaart p-5 text-muted">Geen open dagen gepland.</div>
          )}
        </section>

        <section>
          <Kop
            titel="Goedkoopste studiesteden"
            sub="Maandlasten op kamer, inclusief collegegeld en leefkosten"
            actie={{ href: "/steden", label: "Kaart" }}
          />
          <ul className="kaart divide-y divide-line">
            {steden.map(({ stad, k }, i) => (
              <li key={stad.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="w-5 text-sm font-semibold text-muted tabular">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{stad.naam}</p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <TrainFront className="h-3 w-3" />
                    Kamer {euro(stad.kamerhuur)}
                    {k.thuisMogelijk && <span className="font-medium text-groen">· thuis wonen kan</span>}
                  </p>
                </div>
                <StoplichtBadge licht={stoplicht(stad.reistijd)} minuten={stad.reistijd} />
                <span className="w-20 text-right font-semibold tabular">{euro(k.uitwonend)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function aftellen(dagen: number) {
  if (dagen === 0) return "Vandaag";
  if (dagen === 1) return "Morgen";
  return `Over ${dagen} dagen`;
}

function Laden() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="h-72 animate-pulse rounded-3xl bg-card-2" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-[1.25rem] bg-card-2" />
        ))}
      </div>
    </div>
  );
}
