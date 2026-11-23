"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, CalendarPlus, Star } from "lucide-react";
import { SECTOR } from "@/data/sectoren";
import { KAMER_PER_PLAATS } from "@/data/kamers";
import {
  LANDELIJK,
  PER_STAD,
  SOORT_LABEL,
  STUDIEVERENIGING_OVERZICHT,
  STUDIEVERENIGINGEN,
  UU_OPLEIDING,
} from "@/data/verenigingen";
import { bereken, datumTekst, duurTekst, getal, plaatsNaam, plaatsSlug, reistijdTekst, vandaag } from "@/lib/bereken";
import { downloadIcs, maakIcs } from "@/lib/ics";
import { useStore } from "@/lib/store";
import type { Toelating } from "@/lib/toelating";
import type { Opleiding } from "@/lib/types";
import { GeldBlok } from "@/components/GeldBlok";
import { Illustratie } from "@/components/Illustratie";
import { KamerStadKaart } from "@/components/KamerStadKaart";
import { OpleidingKaart } from "@/components/OpleidingKaart";
import { FavorietKnop, LICHT_LABEL, ScoreRing, SectorLabel, Segment, TaalChip } from "@/components/ui";

export function OpleidingDetail({
  opleiding: o,
  elders,
  hier,
}: {
  opleiding: Opleiding;
  elders: Opleiding[];
  hier: Opleiding[];
}) {
  const { profiel, favorieten, werkFavorietBij, geladen } = useStore();
  const r = useMemo(() => bereken(o, profiel), [o, profiel]);
  const { kosten: k, match, licht } = r;
  const [thuis, setThuis] = useState(k.thuisMogelijk);
  useEffect(() => setThuis(k.thuisMogelijk), [k.thuisMogelijk]);
  const fav = favorieten.find((f) => f.opleidingId === o.id);

  const andere = useMemo(
    () =>
      elders
        .map((e) => bereken(e, profiel))
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 3),
    [elders, profiel],
  );
  const verwant = useMemo(
    () =>
      hier
        .map((e) => bereken(e, profiel))
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 3),
    [hier, profiel],
  );

  const stad = PER_STAD.get(o.plaats.naam);
  const kamer = KAMER_PER_PLAATS.get(o.plaats.naam);
  const studieVer = STUDIEVERENIGINGEN.filter(
    (v) => o.instelling.naam.includes(v.instelling) && v.opleiding.test(o.naam),
  );
  const studieOverzicht = STUDIEVERENIGING_OVERZICHT.find((x) => o.instelling.naam.includes(x.instelling));
  const uuPagina = o.instelling.naam.includes("Universiteit Utrecht")
    ? UU_OPLEIDING.find((x) => x.opleiding.test(o.naam))
    : undefined;
  const landelijk = LANDELIJK.filter((l) => l.voor === "ho");
  const site = o.url ?? o.instelling.url;

  return (
    <div className="space-y-16">
      <div>
        <Link
          href="/zoeken"
          className="focus-ring mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Alle bachelors
        </Link>

        <header className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="binnenkomen">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <SectorLabel sector={o.sector} />
              <TaalChip taal={o.taal} />
              <span className="bovenschrift">Bachelor · {duurTekst(o.duur)}</span>
            </div>
            <h1 className="display text-[44px] leading-[1] sm:text-7xl">{o.naam}</h1>
            <p className="mt-5 text-lg text-muted">
              {o.instelling.naam} ·{" "}
              <Link href={`/plaats/${plaatsSlug(o.plaats.naam)}`} className="streep text-ink">
                {plaatsNaam(o.plaats.naam)}
              </Link>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <FavorietKnop opleidingId={o.id} groot />
              {site && (
                <a
                  href={site}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm text-bg hover:opacity-90"
                >
                  {o.url ? "Naar de opleiding" : "Website universiteit"} <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              <a
                href="https://www.studiekeuze123.nl"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm"
              >
                <span className="streep">Studiekeuze123</span> <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line">
            <Illustratie sector={o.sector} className="block aspect-[3/2] w-full" tekenen />
            <div className="flex items-center gap-4 bg-card p-4">
              <ScoreRing score={match.score} maat={56} />
              <p className="text-sm text-muted">
                {profiel.vragenlijstKlaar ? (
                  "Zo goed past deze opleiding bij jou."
                ) : (
                  <>
                    <Link href="/vragenlijst" className="streep text-ink">
                      Doe de studietest
                    </Link>{" "}
                    voor een persoonlijke score.
                  </>
                )}
              </p>
            </div>
          </div>
        </header>

        <dl className="mt-12 grid grid-cols-2 border-y border-line sm:grid-cols-4">
          {[
            [
              "Voertaal",
              o.taal === "EN" ? "Engels" : o.taal === "NL" ? "Nederlands" : o.taal === "NL/EN" ? "NL en EN" : "–",
            ],
            ["Eerstejaars", o.instroom !== null ? getal(o.instroom) : "–"],
            [
              `Reistijd vanaf ${profiel.woonplaats.naam}`,
              `${r.reistijdSchatting ? "± " : ""}${reistijdTekst(r.reistijd)}`,
            ],
            ["Studiekeuzecheck", o.studiekeuzecheck ? "Verplicht" : "Niet verplicht"],
          ].map(([l, w], i) => (
            <div
              key={l}
              className={`py-5 ${i % 2 ? "pl-5" : "pr-5"} ${i > 0 ? "sm:border-l sm:border-line sm:pl-5" : ""} ${i > 1 ? "border-t border-line sm:border-t-0" : ""}`}
            >
              <dt className="bovenschrift">{l}</dt>
              <dd className="display mt-1 text-2xl tabular">{w}</dd>
              {i === 2 && (
                <dd
                  className={`text-xs ${licht === "groen" ? "text-groen" : licht === "oranje" ? "text-oranje" : "text-rood"}`}
                >
                  {LICHT_LABEL[licht]}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>

      <ToelatingBlok t={match.toelating} opleiding={o} />

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <div>
            <p className="bovenschrift mb-1">Geld & DUO</p>
            <h2 className="display text-3xl sm:text-4xl">Wat kost het, en wat betaalt DUO?</h2>
          </div>
          <Segment
            waarde={thuis ? "thuis" : "kamer"}
            kies={(w) => setThuis(w === "thuis")}
            opties={[
              { waarde: "kamer", label: `Op kamer in ${plaatsNaam(o.plaats.naam)}` },
              { waarde: "thuis", label: "Thuis wonen" },
            ]}
          />
        </div>
        <GeldBlok kosten={k} thuis={thuis} jaren={o.duur ?? 3} />
        {thuis && !k.thuisMogelijk && (
          <p className="mt-4 text-sm text-muted">
            Let op: {reistijdTekst(r.reistijd)} enkele reis is meer dan je maximum van {profiel.maxReistijd} minuten.
            Met je studentenreisproduct reis je wel gratis.
          </p>
        )}
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="bovenschrift mb-1">Match-score</p>
          <h2 className="display mb-6 text-3xl">Waarom {match.score} punten?</h2>
          <ul className="divide-y divide-line border-y border-line">
            {match.onderdelen.map((x) => (
              <li key={x.label} className="grid grid-cols-[1fr_auto] gap-x-4 py-4">
                <span className="font-medium">{x.label}</span>
                <span className="font-mono text-sm tabular">
                  {x.punten}/{x.max}
                </span>
                <span className="col-span-2 mt-1 text-sm text-muted">{x.uitleg}</span>
                <span className="col-span-2 mt-2 h-[3px] bg-line">
                  <span className="block h-full bg-ink" style={{ width: `${(x.punten / x.max) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="bovenschrift mb-1">Kamer vinden</p>
          <h2 className="display mb-6 text-3xl">Wonen in {plaatsNaam(o.plaats.naam)}</h2>
          {kamer ? (
            <KamerStadKaart k={kamer} metLink={false} />
          ) : (
            <p className="text-muted">
              Voor {plaatsNaam(o.plaats.naam)} hebben we nog geen huisvesters verzameld. Schrijf je in elk geval in bij
              ROOM.nl en lees{" "}
              <Link href="/kamer" className="streep text-ink">
                het stappenplan
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-6 border-b border-line pb-3">
          <p className="bovenschrift mb-1">Studentenleven</p>
          <h2 className="display text-3xl sm:text-4xl">Verenigingen in {plaatsNaam(o.plaats.naam)}</h2>
          {stad && <p className="mt-1 max-w-2xl text-muted">{stad.intro}</p>}
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {stad ? (
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {stad.verenigingen.map((v) => (
                  <li key={v.naam} className="border-b border-line py-4">
                    <p className="bovenschrift">{SOORT_LABEL[v.soort].label}</p>
                    <p className="display mt-1 text-lg">
                      {v.url ? (
                        <a href={v.url} target="_blank" rel="noreferrer" className="streep">
                          {v.naam}
                        </a>
                      ) : (
                        v.naam
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted">{v.tekst}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">
                We hebben voor {plaatsNaam(o.plaats.naam)} nog geen verenigingen verzameld. Vraag ernaar op de open dag.
              </p>
            )}
            {stad && (
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
            )}
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="bovenschrift mb-2">Studievereniging</h3>
              {studieVer.length ? (
                studieVer.map((v) => (
                  <div key={v.naam} className="mb-3">
                    <p className="display text-lg">
                      {v.url ? (
                        <a href={v.url} target="_blank" rel="noreferrer" className="streep">
                          {v.naam}
                        </a>
                      ) : (
                        v.naam
                      )}
                    </p>
                    <p className="text-sm text-muted">{v.tekst}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">
                  Bijna elke opleiding heeft een studievereniging, met borrels, excursies en tweedehands boeken.
                </p>
              )}
              {(uuPagina || studieOverzicht) && (
                <a
                  href={(uuPagina ?? studieOverzicht)!.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm"
                >
                  <span className="streep">
                    {uuPagina ? "Studieverenigingen van deze opleiding" : studieOverzicht!.label}
                  </span>{" "}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <div>
              <h3 className="bovenschrift mb-2">Voor alle studenten</h3>
              <ul className="space-y-2 text-sm">
                {landelijk.map((l) => (
                  <li key={l.naam}>
                    <a href={l.url} target="_blank" rel="noreferrer" className="streep font-medium">
                      {l.naam}
                    </a>
                    <span className="text-muted"> · {l.tekst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <div>
            <p className="bovenschrift mb-1">Open dag</p>
            <h2 className="display text-3xl sm:text-4xl">Plan je bezoek</h2>
          </div>
          {site && (
            <a href={site} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm">
              <span className="streep">Open dagen op de site van de universiteit</span>{" "}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {!geladen ? null : fav ? (
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <label className="block">
                <span className="bovenschrift mb-2 block">Datum van de open dag</span>
                <input
                  type="date"
                  value={fav.openDag ?? ""}
                  min={vandaag()}
                  onChange={(e) => void werkFavorietBij(o.id, { openDag: e.target.value || null })}
                  className="focus-ring w-full rounded-lg border border-line bg-card px-3 py-2.5"
                />
              </label>
              {fav.openDag && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="display text-xl first-letter:uppercase">{datumTekst(fav.openDag)}</p>
                  <button
                    type="button"
                    onClick={() =>
                      downloadIcs(`open-dag-${o.naam}.ics`, maakIcs([{ datum: fav.openDag!, opleiding: o }]))
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-bg"
                  >
                    <CalendarPlus className="h-4 w-4" /> In mijn agenda
                  </button>
                </div>
              )}
              <p className="mt-3 text-sm text-muted">Ben je ingelogd? Dan krijg je drie dagen van tevoren een mail.</p>
            </div>
            <Beoordeling
              key={o.id}
              bezocht={fav.bezocht}
              cijfer={fav.cijfer}
              notitie={fav.notitie}
              opslaan={(w) => werkFavorietBij(o.id, w)}
            />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <p className="flex-1 text-muted">
              Bewaar deze opleiding eerst. Daarna plan je hier de open dag en geef je na afloop een cijfer.
            </p>
            <FavorietKnop opleidingId={o.id} groot />
          </div>
        )}
      </section>

      {andere.length > 0 && (
        <section>
          <div className="mb-6 border-b border-line pb-3">
            <p className="bovenschrift mb-1">Dezelfde studie</p>
            <h2 className="display text-3xl">{o.naam} bij andere universiteiten</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {andere.map((x, i) => (
              <OpleidingKaart key={x.opleiding.id} r={x} index={i} />
            ))}
          </div>
        </section>
      )}
      {verwant.length > 0 && (
        <section>
          <div className="mb-6 border-b border-line pb-3">
            <p className="bovenschrift mb-1">In dezelfde richting</p>
            <h2 className="display text-3xl">
              Meer {SECTOR[o.sector].kort.toLowerCase()} in {plaatsNaam(o.plaats.naam)}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {verwant.map((x, i) => (
              <OpleidingKaart key={x.opleiding.id} r={x} index={i} />
            ))}
          </div>
        </section>
      )}
      <p className="text-xs text-muted">
        Bron: DUO Open Onderwijsdata (croho {o.code}). Kamerhuur en reistijd zijn schattingen.
      </p>
    </div>
  );
}

const STATUS = {
  ja: { kleur: "text-groen", rand: "border-groen", titel: "Je bent toelaatbaar" },
  deficientie: { kleur: "text-oranje", rand: "border-oranje", titel: "Je mist een vak" },
  nee: { kleur: "text-rood", rand: "border-rood", titel: "Niet direct toelaatbaar" },
  onbekend: { kleur: "text-ink", rand: "border-ink", titel: "Check je toelating" },
} as const;

function ToelatingBlok({ t, opleiding: o }: { t: Toelating; opleiding: Opleiding }) {
  const { profiel } = useStore();
  const st = STATUS[t.status];
  const e = t.eisen;
  const heeftEisen = !!e && (e.vakken.length > 0 || e.notities.length > 0);
  if (t.status === "ja" && !heeftEisen) return null;
  return (
    <section className={`grid gap-8 border-l-2 pl-6 lg:grid-cols-[1fr_1fr] ${st.rand}`}>
      <div>
        <p className="bovenschrift mb-1">Toelating</p>
        <h2 className={`display text-3xl ${st.kleur}`}>{st.titel}</h2>
        <p className="mt-2 text-muted">{t.reden}</p>
        {(t.status === "onbekend" || t.status === "deficientie") && (
          <Link href="/profiel" className="mt-4 inline-block text-sm streep">
            {t.status === "onbekend" ? "Vul je profiel en vakken in" : "Vakken aanpassen"}
          </Link>
        )}
      </div>
      {heeftEisen && (
        <div className="space-y-4">
          {e!.vakken.length > 0 && (
            <div>
              <p className="bovenschrift mb-2">Nodig</p>
              <ul className="flex flex-wrap gap-1.5">
                {e!.vakken.map((g) => {
                  const tekst = g.join(" of ");
                  const mist = !g.some((v) => profiel.vakken.includes(v));
                  return (
                    <li
                      key={tekst}
                      className={`rounded-full border px-3 py-1 text-sm ${t.status === "deficientie" && mist ? "border-oranje text-oranje" : "border-line"}`}
                    >
                      {t.status === "deficientie" ? (mist ? "✕ " : "✓ ") : ""}
                      {tekst}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {e!.notities.map((n) => (
            <p key={n} className="text-sm">
              {n}
            </p>
          ))}
          {t.status === "deficientie" && (
            <p className="text-sm text-muted">
              Een ontbrekend vak heet een deficiëntie. Vaak kun je die wegwerken met een toets of zomercursus.
            </p>
          )}
          <p className="text-xs text-muted">
            Landelijke profieleisen voor {o.soort === "wo" ? "de universiteit" : "het hbo"}, vereenvoudigd. Check altijd
            de toelatingseisen op de site van de opleiding.
          </p>
        </div>
      )}
    </section>
  );
}

function Beoordeling({
  bezocht,
  cijfer,
  notitie,
  opslaan,
}: {
  bezocht: boolean;
  cijfer: number | null;
  notitie: string;
  opslaan: (w: { bezocht?: boolean; cijfer?: number | null; notitie?: string }) => Promise<void>;
}) {
  const [tekst, setTekst] = useState(notitie);
  const [bewaard, setBewaard] = useState(false);
  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span>
          <span className="block font-medium">Ik ben er geweest</span>
          <span className="text-sm text-muted">Geef daarna een cijfer en een notitie</span>
        </span>
        <input
          type="checkbox"
          checked={bezocht}
          onChange={(e) => void opslaan({ bezocht: e.target.checked })}
          className="peer sr-only"
        />
        <span className="relative h-6 w-11 shrink-0 rounded-full border border-line bg-card-2 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-[18px] after:w-[18px] after:rounded-full after:bg-ink after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5 peer-checked:after:bg-bg" />
      </label>
      {bezocht && (
        <>
          <fieldset>
            <legend className="bovenschrift mb-2">Cijfer</legend>
            <div className="grid grid-cols-10 border border-line">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={cijfer === n}
                  onClick={() => void opslaan({ cijfer: cijfer === n ? null : n })}
                  className={`aspect-square border-r border-line text-sm tabular last:border-r-0 ${cijfer === n ? "bg-ink text-bg" : "bg-card hover:bg-card-2"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            {cijfer !== null && (
              <p className="mt-2 flex items-center gap-1 text-sm text-muted">
                <Star className="h-4 w-4" /> Je gaf een {cijfer}
              </p>
            )}
          </fieldset>
          <label className="block">
            <span className="mb-2 flex justify-between">
              <span className="bovenschrift">Notitie</span>
              {bewaard && <span className="text-xs text-groen">Opgeslagen</span>}
            </span>
            <textarea
              value={tekst}
              onChange={(e) => {
                setTekst(e.target.value);
                setBewaard(false);
              }}
              onBlur={async () => {
                if (tekst !== notitie) {
                  await opslaan({ notitie: tekst });
                  setBewaard(true);
                }
              }}
              rows={3}
              placeholder="Sfeer, vakken, studenten, gebouw…"
              className="focus-ring w-full resize-y rounded-lg border border-line bg-card p-3 text-sm placeholder:text-muted"
            />
          </label>
        </>
      )}
    </div>
  );
}
