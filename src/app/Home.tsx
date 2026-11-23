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
import { Illustratie } from "@/components/Illustratie";
import { KaartSkelet, OpleidingKaart } from "@/components/OpleidingKaart";
import { Knop, Kop } from "@/components/ui";

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
    <div className="space-y-20 sm:space-y-28">
      {/* ---------- OPENING ---------- */}
      <section className="grid items-end gap-12 pt-4 lg:grid-cols-[1.25fr_1fr] lg:pt-10">
        <div className="binnenkomen">
          <p className="bovenschrift mb-5">Studiekeuze voor de universiteit · start september 2027</p>
          <h1 className="display text-[48px] leading-[0.98] sm:text-[88px]">
            {geladen && profiel.naam ? (
              <>
                {profiel.naam}, welke studie <em className="italic">past</em> bij jou?
              </>
            ) : (
              <>
                Welke studie <em className="italic">past</em> bij jou?
              </>
            )}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
            Alle {stat.totaal} universitaire bachelors van Nederland, met wat het je per maand kost, wat DUO betaalt en
            hoe je aan een kamer komt.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Knop href="/vragenlijst">
              {profiel.vragenlijstKlaar ? "Bekijk je uitslag" : "Doe de studietest"} <ArrowRight className="h-4 w-4" />
            </Knop>
            <Link href="/zoeken" className="streep text-sm">
              Of blader door alle bachelors
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3" aria-hidden>
          {(["beta", "recht", "zorg", "taal"] as const).map((s, i) => (
            <div key={s} className={`overflow-hidden rounded-2xl border border-line ${i % 2 ? "translate-y-8" : ""}`}>
              <Illustratie sector={s} className="block aspect-[3/2] w-full" tekenen />
            </div>
          ))}
        </div>
      </section>

      <dl className="grid grid-cols-2 border-y border-line sm:grid-cols-4">
        {[
          [String(stat.totaal), "universitaire bachelors"],
          [String(stat.instellingen.length), "universiteiten en instellingen"],
          [String(stat.engels), "(ook) in het Engels"],
          [euro(DUO.basisbeurs.uitwonend), "basisbeurs per maand op kamer"],
        ].map(([g, t], i) => (
          <div
            key={t}
            className={`py-6 ${i % 2 ? "pl-6" : "pr-6"} ${i > 0 ? "sm:border-l sm:border-line sm:pl-6" : ""} ${i > 1 ? "border-t border-line sm:border-t-0" : ""}`}
          >
            <dt className="display text-4xl tabular">{g}</dt>
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
        <section className="grid overflow-hidden rounded-2xl bg-ink text-bg lg:grid-cols-[1.2fr_1fr]">
          <div className="p-8 sm:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.08em] opacity-60">De studietest</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Nog geen idee? Begin hier.</h2>
            <p className="mt-4 max-w-md opacity-75">
              Kies je favoriete vakken, maak acht keer een keuze tussen twee dingen, en kies waar je jezelf ziet werken.
              Na zes minuten weet je welke richtingen bij je passen, en waarom.
            </p>
            <Link
              href="/vragenlijst"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-bg px-6 py-3.5 text-sm font-medium text-ink hover:opacity-90"
            >
              Begin de test <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden grid-cols-2 gap-px bg-bg/10 lg:grid">
            {(["ict", "economie", "natuur", "creatief"] as const).map((s) => (
              <Illustratie key={s} sector={s} className="block h-full w-full opacity-90" />
            ))}
          </div>
        </section>
      )}

      {/* ---------- RICHTINGEN ---------- */}
      <section>
        <Kop label="Tien richtingen" titel="Waar wil je meer over weten?" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {HOOFDRICHTINGEN.map((s) => (
            <Link key={s} href={`/zoeken?sector=${s}`} className="group">
              <div className="overflow-hidden rounded-xl border border-line">
                <Illustratie
                  sector={s}
                  className="block aspect-[3/2] w-full transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <p className="display mt-3 text-lg leading-tight group-hover:underline group-hover:underline-offset-4">
                {SECTOR[s].naam}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted">{stat.perSector[s] ?? 0} bachelors</p>
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
                <span className="display text-2xl text-muted tabular">{i + 1}</span>
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
                <span className="flex items-center gap-1 font-mono text-xs text-muted tabular">
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
