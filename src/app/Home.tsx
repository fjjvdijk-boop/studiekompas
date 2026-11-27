"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { HOOFDRICHTINGEN, SECTOR } from "@/data/sectoren";
import { KAMER_STAPPEN } from "@/data/kamers";
import { euro, kosten, plaatsNaam, plaatsSlug } from "@/lib/bereken";
import { DUO, geldplaatje } from "@/lib/duo";
import { useResultaten } from "@/lib/resultaten";
import { useStore } from "@/lib/store";
import type { Statistiek } from "@/lib/statistiek";
import { Foto, FotoBron } from "@/components/Foto";
import { SECTOR_FOTO, STAD_FOTO } from "@/data/fotos";
import { KaartSkelet, OpleidingKaart } from "@/components/OpleidingKaart";
import { Kop } from "@/components/ui";

export function Home({ stat }: { stat: Statistiek }) {
  const resultaten = useResultaten();
  const { profiel, geladen } = useStore();

  const matches = useMemo(() => {
    if (!resultaten) return null;
    const gezien = new Set<string>();
    return [...resultaten]
      .filter((r) => r.match.toelaatbaar)
      .sort((a, b) => b.match.score - a.match.score || a.reistijd - b.reistijd)
      .filter((r) => (gezien.has(r.opleiding.naam) ? false : (gezien.add(r.opleiding.naam), true)))
      .slice(0, 3);
  }, [resultaten]);

  // Voorbeeld voor het geldblok: op kamer in Utrecht, met de gegevens uit je profiel
  const voorbeeld = useMemo(() => {
    const k = kosten(
      { soort: "wo", leerwegen: null },
      { naam: "Utrecht", provincie: "Utrecht", lat: 52.09, lng: 5.12 },
      100,
      { maxReistijd: 0, wonen: "kamer" },
    );
    return geldplaatje(k.uitwonend, {
      uitwonend: true,
      ouderInkomen: profiel.ouderInkomen,
      andereKinderen: profiel.andereKinderen,
      ouderBijdrage: profiel.ouderBijdrage,
      bijbaan: profiel.bijbaan,
    });
  }, [profiel]);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ---------- OPENING ---------- */}
      <section className="volle-breedte relative -mt-5 overflow-hidden bg-black text-white sm:-mt-8">
        <Foto
          sleutel="campus"
          className="kenburns absolute inset-0 h-full w-full object-cover"
          sizes="100vw"
          prioriteit
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" aria-hidden />
        <div className="relative mx-auto flex min-h-[520px] max-w-6xl flex-col justify-end px-4 pb-12 pt-32 sm:min-h-[620px] sm:px-6 sm:pb-16">
          <p className="text-sm font-semibold text-white/85">Studiekeuze voor de universiteit · start september 2027</p>
          <h1 className="mt-3 max-w-4xl text-[46px] font-bold leading-[0.98] tracking-tight sm:text-[84px]">
            {geladen && profiel.naam ? `${profiel.naam}, welke studie past bij jou?` : "Welke studie past bij jou?"}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
            Alle {stat.totaal} universitaire bachelors van Nederland, met wat het je per maand kost, wat DUO betaalt en
            hoe je aan een kamer komt.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/vragenlijst"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 font-semibold text-white hover:bg-brand-2"
            >
              {profiel.vragenlijstKlaar ? "Bekijk je uitslag" : "Doe de studietest"} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/zoeken"
              className="inline-flex items-center gap-2 rounded-md bg-white/15 px-6 py-3.5 font-semibold backdrop-blur hover:bg-white/25"
            >
              Alle bachelors
            </Link>
          </div>
          <FotoBron sleutel="campus" className="mt-8 self-end text-[11px] text-white/60" />
        </div>
      </section>

      <dl className="relative z-10 -mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:-mt-14 sm:grid-cols-4">
        {[
          [String(stat.totaal), "universitaire bachelors"],
          [String(stat.instellingen.length), "universiteiten en instellingen"],
          [String(stat.engels), "(ook) in het Engels"],
          [euro(DUO.basisbeurs.uitwonend), "basisbeurs per maand op kamer"],
        ].map(([g, t]) => (
          <div key={t} className="bg-card px-5 py-5 sm:px-6">
            <dt className="display text-3xl tabular sm:text-4xl">{g}</dt>
            <dd className="mt-1 text-sm text-muted">{t}</dd>
          </div>
        ))}
      </dl>

      {/* ---------- MATCHES OF TEST ---------- */}
      {geladen && profiel.vragenlijstKlaar ? (
        <section>
          <Kop
            label="Op basis van je studietest"
            titel="Jouw beste matches"
            actie={{ href: "/zoeken", label: "Alle matches" }}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {matches ? (
              matches.map((r, i) => <OpleidingKaart key={r.opleiding.id} r={r} index={i} />)
            ) : (
              <KaartSkelet aantal={3} />
            )}
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-2xl bg-black text-white">
          <Foto
            sleutel="collegezaal"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" aria-hidden />
          <div className="relative grid items-center gap-8 p-7 sm:p-12 lg:grid-cols-[1fr_300px]">
            <div>
              <p className="text-sm font-semibold text-white/80">De studietest · 4 minuten</p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Twijfel je nog? Begin hier.</h2>
              <p className="mt-4 max-w-md text-white/80">
                Zeven vragen, één tik per vraag. Eerst kies je een grote richting, daarna krijg je vragen die daarbij
                passen. Je ziet meteen welke bachelors bij je passen, en waarom.
              </p>
              <Link
                href="/vragenlijst"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 font-semibold text-white hover:bg-brand-2"
              >
                Start de test <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Voorproefje van de story */}
            <div className="relative mx-auto hidden aspect-[9/16] w-[240px] overflow-hidden rounded-[18px] border border-white/20 shadow-2xl sm:block">
              <Foto sleutel="lab" className="absolute inset-0 h-full w-full object-cover" sizes="240px" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/30" />
              <div className="absolute inset-x-2 top-2 flex gap-1">
                {[1, 1, 0.5, 0, 0, 0, 0].map((w, i) => (
                  <div key={i} className="h-[2px] flex-1 rounded-full bg-white/35">
                    <div className="h-full bg-white" style={{ width: `${w * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-3 top-9 space-y-1.5 text-[11px] text-[#0b0d12]">
                <p className="rounded bg-white/90 px-3 py-2">
                  Wat zou je het liefst <b>een dag</b> doen?
                </p>
                {[
                  "Een app programmeren",
                  "Meelopen met een chirurg",
                  "Een robot ontwerpen",
                  "Proeven doen in een lab",
                ].map((t, i) => (
                  <p key={t} className="flex overflow-hidden rounded bg-white/85">
                    <span className="w-6 shrink-0 bg-brand py-1.5 text-center font-bold text-white">{"ABCD"[i]}</span>
                    <span className="px-2 py-1.5">{t}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- RICHTINGEN ---------- */}
      <section>
        <Kop label="Tien richtingen" titel="Waar wil je meer over weten?" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {HOOFDRICHTINGEN.map((s) => (
            <Link
              key={s}
              href={`/zoeken?sector=${s}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-black text-white"
            >
              <Foto
                sleutel={SECTOR_FOTO[s]}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 1024px) 230px, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <p className="text-[17px] font-bold leading-tight tracking-tight">{SECTOR[s].naam}</p>
                <p className="mt-0.5 text-xs text-white/75">{stat.perSector[s] ?? 0} bachelors</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- GELD EN KAMER ---------- */}
      <section className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-2">
        <div className="bg-card p-7 sm:p-10">
          <p className="bovenschrift">Geld & DUO</p>
          <h2 className="display mt-2 text-3xl sm:text-4xl">Wat kost een kamer in Utrecht?</h2>
          <p className="mt-2 text-muted">
            Met de bedragen van DUO voor september 2027
            {profiel.ouderInkomen !== null ? " en het inkomen van je ouders" : ""}.
          </p>
          <dl className="mt-8 space-y-3 text-[15px]">
            {[
              ["Uitgaven per maand", euro(voorbeeld.kosten), ""],
              ["Basisbeurs + aanvullende beurs", `− ${euro(voorbeeld.gift)}`, "text-groen"],
              ["Bijbaan en ouders", `− ${euro(voorbeeld.bijbaan + voorbeeld.ouders)}`, ""],
            ].map(([l, w, k]) => (
              <div key={l} className="flex justify-between border-b border-line pb-3">
                <dt className="text-muted">{l}</dt>
                <dd className={`tabular ${k}`}>{w}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between pt-1">
              <dt className="font-medium">Zelf lenen</dt>
              <dd className="display text-3xl tabular">{euro(voorbeeld.teLenen)}</dd>
            </div>
          </dl>
          <Link href="/geld" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
            <span className="streep">Reken je eigen situatie uit</span> <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="bg-card p-7 sm:p-10">
          <p className="bovenschrift">Kamer vinden</p>
          <h2 className="display mt-2 text-3xl sm:text-4xl">Inschrijven kan al vanaf je zestiende</h2>
          <ol className="mt-8 space-y-5">
            {KAMER_STAPPEN.slice(0, 3).map((s, i) => (
              <li key={s.titel} className="grid grid-cols-[2rem_1fr] gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand tabular">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{s.titel}</p>
                  <p className="mt-0.5 text-sm text-muted">{s.tekst}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/kamer" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
            <span className="streep">Het hele stappenplan en alle steden</span> <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ---------- UNIVERSITEITEN ---------- */}
      <section>
        <Kop label="Waar kun je heen?" titel="Universiteiten" actie={{ href: "/kaart", label: "Op de kaart" }} />
        <div className="scroll-x -mx-4 mb-8 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-4">
          {Object.entries(STAD_FOTO).map(([stad, f]) => (
            <Link
              key={stad}
              href={`/plaats/${plaatsSlug(stad)}`}
              className="group relative block aspect-[4/3] w-[70vw] shrink-0 snap-start overflow-hidden rounded-xl bg-black text-white sm:w-auto"
            >
              <Foto
                sleutel={f}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 1024px) 280px, 70vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <p className="absolute bottom-3 left-3.5 text-lg font-bold tracking-tight">{plaatsNaam(stad)}</p>
            </Link>
          ))}
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-8">
          {stat.instellingen.map((u) => (
            <li key={u.naam} className="border-b border-line">
              <Link
                href={`/plaats/${plaatsSlug(u.plaats)}`}
                className="group flex items-baseline justify-between gap-4 py-3.5"
              >
                <span>
                  <span className="block group-hover:underline group-hover:underline-offset-4">{u.naam}</span>
                  <span className="text-sm text-muted">{plaatsNaam(u.plaats)}</span>
                </span>
                <span className="flex items-center gap-1 text-sm text-muted tabular">
                  {u.aantal} <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
