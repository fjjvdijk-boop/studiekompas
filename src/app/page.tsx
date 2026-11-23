"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CalendarHeart, Heart, Search, Sparkles, TrainFront, Wallet } from "lucide-react";
import { SECTOR, SECTOREN } from "@/data/sectoren";
import { dagenTot, datumTekst, euro, getal, plaatsNaam, reistijdTekst, vandaag } from "@/lib/bereken";
import { useData } from "@/lib/data-client";
import { plaatsOverzicht } from "@/lib/plaatsen";
import { useResultaten } from "@/lib/resultaten";
import { useStore } from "@/lib/store";
import type { SectorId } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { KaartSkelet, OpleidingKaart } from "@/components/OpleidingKaart";
import { Kop, ScoreRing, StoplichtBadge } from "@/components/ui";

export default function HomePagina() {
  const data = useData();
  const resultaten = useResultaten();
  const { profiel, geladen, favorieten } = useStore();

  const aantallen = useMemo(() => {
    const t = { mbo: 0, hbo: 0, wo: 0, totaal: 0 };
    for (const o of data?.opleidingen ?? []) {
      t[o.soort]++;
      t.totaal++;
    }
    return t;
  }, [data]);
  const perSector = useMemo(() => {
    const t: Partial<Record<SectorId, number>> = {};
    for (const o of data?.opleidingen ?? []) t[o.sector] = (t[o.sector] ?? 0) + 1;
    return t;
  }, [data]);

  const matches = useMemo(() => {
    if (!resultaten) return null;
    const gezien = new Set<string>();
    return [...resultaten]
      .filter((r) => r.match.toelaatbaar && profiel.soorten.includes(r.opleiding.soort))
      .sort((a, b) => b.match.score - a.match.score || a.reistijd - b.reistijd)
      .filter((r) => (gezien.has(r.opleiding.naam) ? false : (gezien.add(r.opleiding.naam), true)))
      .slice(0, 4);
  }, [resultaten, profiel.soorten]);

  const steden = useMemo(
    () =>
      data
        ? plaatsOverzicht(data, profiel)
            .filter((p) => p.aantal >= 60)
            .sort((a, b) => a.kosten.uitwonend - b.kosten.uitwonend || a.reistijd - b.reistijd)
            .slice(0, 5)
        : null,
    [data, profiel],
  );

  const topSectoren = (Object.entries(profiel.interesse) as [SectorId, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const volgendeOpenDag = favorieten
    .filter((f) => f.openDag && f.openDag >= vandaag())
    .sort((a, b) => a.openDag!.localeCompare(b.openDag!))[0];
  const openDagOpleiding = volgendeOpenDag ? data?.perId.get(volgendeOpenDag.opleidingId) : undefined;
  const voorbeeld = profiel.vragenlijstKlaar ? matches?.[0] : undefined;

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* ---------- HERO ---------- */}
      <section className="relative grid items-center gap-10 pt-2 lg:grid-cols-[1.1fr_1fr] lg:pt-6">
        <div className="binnenkomen">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold shadow-zacht">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-groen" /> Voor eindexamenleerlingen · echte data
            van DUO
          </span>
          <h1 className="display mt-5 text-[44px] font-extrabold leading-[0.98] sm:text-7xl">
            {geladen && profiel.naam ? (
              <>
                Hoi {profiel.naam}, <span className="gradient-tekst">waar ga jij heen?</span>
              </>
            ) : (
              <>
                Vind de studie die <span className="gradient-tekst">echt bij je past.</span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            {aantallen.totaal ? getal(aantallen.totaal) : "Ruim 10.000"} mbo-, hbo- en wo-opleidingen op één plek. Doe
            de studietest, zie meteen wat studeren je per maand kost en of je thuis kunt blijven wonen.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/vragenlijst"
              className="focus-ring group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#4f39f6] px-6 py-4 font-semibold text-white shadow-[0_14px_34px_-12px_rgba(79,57,246,.9)] transition hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" />
              {profiel.vragenlijstKlaar ? "Bekijk je kompas" : "Doe de studietest"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/zoeken"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-line bg-card px-6 py-4 font-semibold hover:border-brand"
            >
              <Search className="h-4 w-4" /> Zoek opleidingen
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {[
              ["mbo", aantallen.mbo, "#ff9f1c"],
              ["hbo", aantallen.hbo, "#0ea5e9"],
              ["wo", aantallen.wo, "var(--brand)"],
            ].map(([label, n, kleur]) => (
              <div key={label as string} className="kaart px-4 py-3">
                <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: kleur as string }} />
                  {label}
                </dt>
                <dd className="display mt-0.5 text-2xl font-bold tabular">{n ? getal(n as number) : "…"}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Illustratie met zwevende kaartjes */}
        <div className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[480px]" aria-hidden>
          <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-br from-[#7c6cff] via-[#5b45f7] to-[#2d1fa8] shadow-groot" />
          <div className="absolute inset-6 overflow-hidden rounded-[3rem]">
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#ff9f1c] opacity-40 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-[#ec4899] opacity-30 blur-3xl" />
            <svg
              className="absolute inset-0 h-full w-full opacity-[.12]"
              viewBox="0 0 400 400"
              preserveAspectRatio="none"
            >
              {Array.from({ length: 9 }, (_, i) => (
                <circle key={i} cx="200" cy="200" r={30 + i * 30} fill="none" stroke="#fff" strokeWidth="1" />
              ))}
            </svg>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logo className="h-36 w-36 drop-shadow-2xl sm:h-44 sm:w-44" bewegend />
          </div>
          <div
            className="zweven absolute left-0 top-8 w-60 rounded-3xl bg-card p-4 text-ink shadow-groot sm:left-[-8px]"
            style={{ ["--r" as string]: "-4deg" }}
          >
            <div className="flex items-center gap-3">
              <ScoreRing score={voorbeeld?.match.score ?? 94} maat={48} dik={4} />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase text-groen">Top match</p>
                <p className="display truncate font-bold leading-tight">
                  {voorbeeld?.opleiding.naam ?? "Creative Technology"}
                </p>
                <p className="truncate text-xs text-muted">
                  {voorbeeld ? plaatsNaam(voorbeeld.opleiding.plaats.naam) : "Enschede"}
                </p>
              </div>
            </div>
          </div>
          <div
            className="zweven absolute bottom-16 right-0 w-52 rounded-3xl bg-card p-4 text-ink shadow-groot [animation-delay:-2s] sm:right-[-8px]"
            style={{ ["--r" as string]: "5deg" }}
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Wallet className="h-3.5 w-3.5" /> Per maand
            </p>
            <p className="display text-3xl font-bold tabular">{voorbeeld ? euro(voorbeeld.kosten.advies) : "€ 545"}</p>
            <div className="mt-2 flex h-2 gap-0.5 overflow-hidden rounded-full">
              <div className="w-[46%] rounded-full bg-[var(--c-leef)]" />
              <div className="w-[42%] rounded-full bg-[var(--c-college)]" />
              <div className="w-[12%] rounded-full bg-[var(--c-boeken)]" />
            </div>
          </div>
          <div className="zweven absolute bottom-2 left-6 flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-semibold text-ink shadow-groot [animation-delay:-4s]">
            <TrainFront className="h-4 w-4 text-groen" />
            {voorbeeld ? reistijdTekst(voorbeeld.reistijd) : "22 min"} · thuis wonen kan
          </div>
        </div>
      </section>

      {/* ---------- JOUW KOMPAS ---------- */}
      {geladen && profiel.vragenlijstKlaar ? (
        <section>
          <Kop
            titel={
              <>
                Jouw beste matches
                {topSectoren.length > 0 && (
                  <span className="ml-3 inline-flex translate-y-[-3px] gap-1 align-middle">
                    {topSectoren.map(([s]) => (
                      <span key={s} className="rounded-full bg-card-2 px-2 py-0.5 text-base" title={SECTOR[s].naam}>
                        {SECTOR[s].emoji}
                      </span>
                    ))}
                  </span>
                )}
              </>
            }
            sub={`Op basis van je studietest, vanuit ${profiel.woonplaats.naam}`}
            actie={{ href: "/zoeken", label: "Alle matches" }}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {matches ? (
              matches.map((r, i) => <OpleidingKaart key={r.opleiding.id} r={r} index={i} />)
            ) : (
              <KaartSkelet aantal={4} />
            )}
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-[2rem] bg-[#16123a] p-7 text-white sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#7c6cff] opacity-40 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b3a9ff]">Studietest · 5 minuten</p>
              <h2 className="display mt-2 text-3xl font-bold sm:text-5xl">Weet je nog niet wat je wilt?</h2>
              <p className="mt-3 max-w-xl text-white/75">
                Beantwoord 42 korte stellingen over 14 interessegebieden. Je krijgt je persoonlijke kompas en de
                opleidingen die het best bij je passen.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-2xl">
                {SECTOREN.map((s) => (
                  <span
                    key={s.id}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10"
                    title={s.naam}
                  >
                    {s.emoji}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href="/vragenlijst"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-[#16123a] shadow-[0_10px_40px_-10px_rgba(255,255,255,.6)] hover:bg-white/90"
            >
              Start de test <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ---------- RICHTINGEN ---------- */}
      <section>
        <Kop titel="Kies een richting" sub="Of blader door alle 14 interessegebieden" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {SECTOREN.map((s, i) => (
            <Link
              key={s.id}
              href={`/zoeken?sector=${s.id}`}
              className="kaart focus-ring group binnenkomen relative overflow-hidden p-4 transition-all hover:-translate-y-1 hover:shadow-groot"
              style={{ animationDelay: `${i * 25}ms` }}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-25 blur-xl transition-opacity group-hover:opacity-50"
                style={{ background: s.kleur }}
              />
              <span className="relative text-3xl">{s.emoji}</span>
              <p className="display relative mt-3 font-bold leading-tight">{s.naam}</p>
              <p className="relative mt-1 text-xs text-muted tabular">
                {perSector[s.id] ? `${getal(perSector[s.id]!)} opleidingen` : "…"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- STEDEN + OPEN DAG ---------- */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <Kop
            titel="Voordeligste studiesteden"
            sub={`Maandlasten voor jou, vanuit ${profiel.woonplaats.naam}`}
            actie={{ href: "/kaart", label: "Kaart" }}
          />
          <ul className="kaart divide-y divide-line overflow-hidden">
            {(steden ?? Array.from({ length: 5 }, () => null)).map((p, i) =>
              p ? (
                <li key={p.plaats.naam}>
                  <Link
                    href={`/plaats/${p.slug}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-card-2"
                  >
                    <span className="display w-6 text-xl font-bold text-muted tabular">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{plaatsNaam(p.plaats.naam)}</p>
                      <p className="text-xs text-muted tabular">
                        {getal(p.aantal)} opleidingen
                        {p.kosten.thuisMogelijk ? (
                          <span className="font-medium text-groen"> · thuis wonen</span>
                        ) : (
                          ` · kamer ${euro(p.kosten.huur)}`
                        )}
                      </p>
                    </div>
                    <StoplichtBadge licht={p.licht} minuten={p.reistijd} schatting={p.reistijdSchatting} />
                    <span className="display w-20 text-right text-lg font-bold tabular">
                      {euro(p.kosten.uitwonend)}
                    </span>
                  </Link>
                </li>
              ) : (
                <li key={i} className="h-[73px] animate-pulse bg-card-2/60" />
              ),
            )}
          </ul>
        </section>

        <section>
          <Kop
            titel="Jouw lijst"
            sub={favorieten.length ? `${favorieten.length} favorieten bewaard` : "Bewaar opleidingen met het hartje"}
          />
          {volgendeOpenDag && openDagOpleiding ? (
            <Link
              href={`/opleiding/${openDagOpleiding.id}`}
              className="kaart group relative block overflow-hidden p-6 transition-all hover:shadow-groot"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ff9f1c] opacity-20 blur-2xl" />
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-oranje">
                <CalendarHeart className="h-4 w-4" /> Volgende open dag
              </p>
              <div className="mt-4 flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-3xl bg-ink text-bg">
                  <span className="text-xs font-semibold uppercase">
                    {datumTekst(volgendeOpenDag.openDag!, { month: "short" }).replace(".", "")}
                  </span>
                  <span className="display text-3xl font-bold leading-none tabular">
                    {datumTekst(volgendeOpenDag.openDag!, { day: "numeric" })}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="display truncate text-xl font-bold group-hover:text-brand">{openDagOpleiding.naam}</p>
                  <p className="truncate text-sm text-muted">{openDagOpleiding.instelling.naam}</p>
                  <p className="mt-1 text-sm font-semibold text-brand">
                    {(() => {
                      const n = dagenTot(volgendeOpenDag.openDag!);
                      return n === 0 ? "Vandaag!" : n === 1 ? "Morgen" : `Over ${n} dagen`;
                    })()}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="kaart flex flex-col items-start gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rood-soft text-rood">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="display text-xl font-bold">
                  {favorieten.length ? "Plan je open dagen" : "Begin je lijst"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {favorieten.length
                    ? "Vul bij je favorieten in wanneer je naar de open dag gaat. Dan krijg je een overzicht en een herinnering."
                    : "Tik op het hartje bij een opleiding. Daarna kun je ze vergelijken en open dagen plannen."}
                </p>
              </div>
              <Link
                href={favorieten.length ? "/open-dagen" : "/zoeken"}
                className="focus-ring rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg"
              >
                {favorieten.length ? "Naar open dagen" : "Opleidingen zoeken"}
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* ---------- HOE WERKT HET ---------- */}
      <section>
        <Kop titel="Zo werkt StudieKompas" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "1",
              "Doe de studietest",
              "42 stellingen over wat je leuk vindt, hoe je leert, waar je woont en wat je kunt uitgeven.",
              "/vragenlijst",
            ],
            [
              "2",
              "Vergelijk eerlijk",
              "Per opleiding zie je je maandlasten, je reistijd, je match-score en het studentenleven in die stad.",
              "/zoeken",
            ],
            [
              "3",
              "Ga kijken",
              "Bewaar favorieten, plan je open dagen, zet ze in je agenda en geef ze daarna een cijfer.",
              "/open-dagen",
            ],
          ].map(([n, titel, tekst, href]) => (
            <Link
              key={n}
              href={href}
              className="kaart group p-6 transition-all hover:-translate-y-1 hover:shadow-groot"
            >
              <span className="display flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-xl font-bold text-brand">
                {n}
              </span>
              <h3 className="display mt-4 text-xl font-bold group-hover:text-brand">{titel}</h3>
              <p className="mt-1.5 text-sm text-muted">{tekst}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
