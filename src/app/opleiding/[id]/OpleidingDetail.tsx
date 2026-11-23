"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarPlus,
  Clock,
  ExternalLink,
  GraduationCap,
  Home as HomeIcon,
  MapPin,
  Star,
  TrainFront,
  Users,
  Wallet,
} from "lucide-react";
import { NIVEAU_LABEL, NIVEAU_UITLEG, SECTOR } from "@/data/sectoren";
import {
  LANDELIJK,
  PER_STAD,
  SOORT_LABEL,
  STUDIEVERENIGING_OVERZICHT,
  STUDIEVERENIGINGEN,
  UU_OPLEIDING,
} from "@/data/verenigingen";
import {
  bereken,
  datumTekst,
  duurTekst,
  euro,
  getal,
  plaatsNaam,
  plaatsSlug,
  reistijdTekst,
  vandaag,
} from "@/lib/bereken";
import { downloadIcs, maakIcs } from "@/lib/ics";
import { useStore } from "@/lib/store";
import type { Toelating } from "@/lib/toelating";
import type { Opleiding } from "@/lib/types";
import { OpleidingKaart } from "@/components/OpleidingKaart";
import {
  FavorietKnop,
  KostenBalk,
  LICHT_LABEL,
  NiveauChip,
  ScoreRing,
  SectorIcoon,
  Segment,
  kostenDelen,
} from "@/components/ui";

export function OpleidingDetail({
  opleiding: o,
  elders,
  hier,
}: {
  opleiding: Opleiding;
  elders: Opleiding[];
  hier: Opleiding[];
}) {
  const { profiel, heeftProfiel, favorieten, werkFavorietBij, geladen } = useStore();
  const r = useMemo(() => bereken(o, profiel), [o, profiel]);
  const { kosten: k, match, licht } = r;
  const [thuis, setThuis] = useState(k.thuisMogelijk);
  useEffect(() => setThuis(k.thuisMogelijk), [k.thuisMogelijk]);
  const fav = favorieten.find((f) => f.opleidingId === o.id);
  const s = SECTOR[o.sector];

  const andere = useMemo(
    () =>
      elders
        .map((e) => bereken(e, profiel))
        .sort((a, b) => b.match.score - a.match.score || a.reistijd - b.reistijd)
        .slice(0, 6),
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
  const studieVer = STUDIEVERENIGINGEN.filter(
    (v) => o.instelling.naam.includes(v.instelling) && v.opleiding.test(o.naam),
  );
  const studieOverzicht = STUDIEVERENIGING_OVERZICHT.find((x) => o.instelling.naam.includes(x.instelling));
  const uuPagina = o.instelling.naam.includes("Universiteit Utrecht")
    ? UU_OPLEIDING.find((x) => x.opleiding.test(o.naam))
    : undefined;
  const landelijk = LANDELIJK.filter((l) => (o.soort === "mbo" ? l.voor === "mbo" : l.voor === "ho"));

  const delen = kostenDelen(k, thuis);
  const totaal = thuis ? k.thuis : k.uitwonend;
  const vergelijkSite =
    o.soort === "mbo"
      ? { label: "Kiesmbo.nl", url: "https://www.kiesmbo.nl" }
      : { label: "Studiekeuze123", url: "https://www.studiekeuze123.nl" };

  return (
    <div className="space-y-6">
      <Link
        href="/zoeken"
        className="focus-ring inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Alle opleidingen
      </Link>

      {/* ---------- KOP ---------- */}
      <header className="kaart binnenkomen relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: s.kleur }}
        />
        <div className="relative flex flex-col gap-8 p-6 sm:p-9 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4">
              <SectorIcoon sector={o.sector} maat={60} />
              <div className="flex flex-wrap items-center gap-2">
                <NiveauChip niveau={o.niveau} />
                <span
                  className="text-sm font-medium"
                  style={{ color: `color-mix(in oklab, ${s.kleur} 75%, var(--ink))` }}
                >
                  {s.naam}
                </span>
                {o.leerwegen && (
                  <span className="rounded-md bg-card-2 px-1.5 py-0.5 text-xs font-semibold">{o.leerwegen}</span>
                )}
              </div>
            </div>
            <h1 className="display mt-5 text-4xl font-bold leading-[1.02] sm:text-5xl">{o.naam}</h1>
            {o.eigenNaam && <p className="mt-2 text-lg text-muted">“{o.eigenNaam}”</p>}
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" /> {o.instelling.naam}
              </span>
              <Link
                href={`/plaats/${plaatsSlug(o.plaats.naam)}`}
                className="inline-flex items-center gap-1.5 hover:text-brand"
              >
                <MapPin className="h-4 w-4" /> {plaatsNaam(o.plaats.naam)}, {o.plaats.provincie}
              </Link>
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <FavorietKnop opleidingId={o.id} groot />
              {(o.url ?? o.instelling.url) && (
                <a
                  href={(o.url ?? o.instelling.url)!}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg hover:opacity-90"
                >
                  {o.url ? "Bekijk de opleiding" : "Website school"} <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <a
                href={vergelijkSite.url}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold hover:border-brand"
              >
                {vergelijkSite.label} <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-5 rounded-3xl bg-card-2 p-5 lg:w-72 lg:flex-col lg:items-start">
            <ScoreRing score={match.score} maat={96} dik={7} />
            <div>
              <p className="display text-lg font-bold">Match-score</p>
              <p className="text-sm text-muted">
                {heeftProfiel && profiel.vragenlijstKlaar
                  ? "Hoe goed dit bij jou past"
                  : "Doe de studietest voor een persoonlijke score"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <ToelatingBlok t={match.toelating} opleiding={o} />

      {/* ---------- FEITEN ---------- */}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Feit
          icoon={<Wallet className="h-4 w-4" />}
          label="Per maand"
          waarde={euro(k.advies)}
          sub={k.thuisMogelijk ? "als je thuis woont" : "op kamer"}
        />
        <Feit
          icoon={<TrainFront className="h-4 w-4" />}
          label={`Reistijd vanaf ${profiel.woonplaats.naam}`}
          waarde={`${r.reistijdSchatting ? "± " : ""}${reistijdTekst(r.reistijd)}`}
          sub={
            <span
              className={`font-semibold ${licht === "groen" ? "text-groen" : licht === "oranje" ? "text-oranje" : "text-rood"}`}
            >
              ● {LICHT_LABEL[licht]}
            </span>
          }
        />
        <Feit
          icoon={<Clock className="h-4 w-4" />}
          label="Duur"
          waarde={duurTekst(o.duur)}
          sub={NIVEAU_UITLEG[o.niveau]}
        />
        {o.instroom !== null ? (
          <Feit
            icoon={<Users className="h-4 w-4" />}
            label="Eerstejaars"
            waarde={getal(o.instroom)}
            sub="vorig studiejaar (DUO)"
          />
        ) : (
          <Feit
            icoon={<BookOpen className="h-4 w-4" />}
            label="Leerweg"
            waarde={o.leerwegen ?? "–"}
            sub={
              o.leerwegen?.includes("BBL") ? "BBL: werken en leren, je verdient salaris" : "BOL: naar school met stages"
            }
          />
        )}
      </dl>

      {/* ---------- KOSTEN + SCORE ---------- */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="kaart p-6 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="display text-2xl font-bold">Wat kost het per maand?</h2>
              <p className="text-sm text-muted">Bedragen van {"2026/2027"}; per jaar omgerekend naar per maand.</p>
            </div>
            <Segment
              waarde={thuis ? "thuis" : "kamer"}
              kies={(w) => setThuis(w === "thuis")}
              opties={[
                { waarde: "kamer", label: "Op kamer" },
                { waarde: "thuis", label: "Thuis" },
              ]}
            />
          </div>
          <p className="display mb-4 text-5xl font-bold tabular">
            {euro(totaal)} <span className="font-sans text-base font-normal text-muted">per maand</span>
          </p>
          <KostenBalk kosten={k} thuis={thuis} />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {delen.map((d) => (
              <li key={d.naam} className="flex items-center gap-3 rounded-2xl bg-card-2 px-4 py-3 text-sm">
                <span className="h-3 w-3 rounded-full" style={{ background: d.kleur }} />
                <span className="flex-1">{d.naam}</span>
                <span className="font-semibold tabular">{euro(d.bedrag)}</span>
              </li>
            ))}
          </ul>
          <div
            className={`mt-5 flex gap-3 rounded-2xl p-4 text-sm ${k.thuisMogelijk ? "bg-groen-soft text-groen" : "bg-card-2 text-muted"}`}
          >
            <HomeIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {k.thuisMogelijk
                ? `Met ${reistijdTekst(r.reistijd)} reizen kun je thuis blijven wonen. Dat scheelt ${euro(k.uitwonend - k.thuis)} per maand.`
                : `${reistijdTekst(r.reistijd)} enkele reis is meer dan je maximum van ${profiel.maxReistijd} min. Reken op een kamer in ${plaatsNaam(o.plaats.naam)}.`}
              <span className="mt-1 block text-xs opacity-80">
                {o.soort === "mbo"
                  ? "Ben je 18 of ouder? Dan krijg je als mbo-student een studentenreisproduct."
                  : "Met je studentenreisproduct reis je doordeweeks gratis met het OV."}
              </span>
            </p>
          </div>
        </section>

        <section className="kaart p-6 sm:p-7">
          <h2 className="display text-2xl font-bold">Waarom deze score?</h2>
          <p className="mb-6 text-sm text-muted">
            {profiel.vragenlijstKlaar ? (
              "Op basis van je studietest en profiel."
            ) : (
              <>
                <Link href="/vragenlijst" className="font-semibold text-brand hover:underline">
                  Doe de studietest
                </Link>{" "}
                voor een eerlijke score.
              </>
            )}
          </p>
          <ul className="space-y-5">
            {match.onderdelen.map((x) => (
              <li key={x.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold">{x.label}</span>
                  <span className="text-muted tabular">
                    {x.punten}/{x.max}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-card-2">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${(x.punten / x.max) * 100}%`,
                      background: x.punten >= x.max * 0.8 ? "var(--groen)" : "var(--brand)",
                    }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">{x.uitleg}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ---------- STUDENTENLEVEN ---------- */}
      <section className="kaart overflow-hidden">
        <div className="border-b border-line p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Studentenleven</p>
          <h2 className="display mt-1 text-2xl font-bold">Verenigingen in {plaatsNaam(o.plaats.naam)}</h2>
          {stad && <p className="mt-1 max-w-2xl text-sm text-muted">{stad.intro}</p>}
        </div>
        <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {stad ? (
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {stad.verenigingen.map((v) => (
                  <li key={v.naam} className="rounded-2xl bg-card-2 p-4">
                    <p className="text-xs font-semibold text-muted">
                      {SOORT_LABEL[v.soort].emoji} {SOORT_LABEL[v.soort].label}
                    </p>
                    <p className="mt-0.5 font-semibold">
                      {v.url ? (
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-brand"
                        >
                          {v.naam} <ExternalLink className="h-3 w-3" />
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
              <p className="rounded-2xl bg-card-2 p-4 text-sm text-muted">
                Voor {plaatsNaam(o.plaats.naam)} hebben we nog geen verenigingen verzameld. Vraag op de open dag naar
                het studentenleven, of kijk op de site van de school.
              </p>
            )}
            {stad && (
              <div className="mt-4 flex flex-wrap gap-2">
                {stad.overzichten.map((x) => (
                  <a
                    key={x.url}
                    href={x.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium hover:border-brand"
                  >
                    {x.label} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-line p-5">
              <h3 className="font-semibold">Studievereniging</h3>
              {studieVer.length ? (
                <ul className="mt-2 space-y-2">
                  {studieVer.map((v) => (
                    <li key={v.naam}>
                      <p className="font-semibold text-brand">
                        {v.url ? (
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:underline"
                          >
                            {v.naam} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          v.naam
                        )}
                      </p>
                      <p className="text-sm text-muted">{v.tekst}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-muted">
                  {o.soort === "mbo"
                    ? "Op het mbo heb je meestal geen studievereniging, maar wel een studentenraad en activiteiten op school."
                    : "Bijna elke opleiding heeft een studievereniging met borrels, excursies en een boekenverkoop."}
                </p>
              )}
              {(uuPagina || studieOverzicht) && (
                <a
                  href={(uuPagina ?? studieOverzicht)!.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                >
                  {uuPagina ? "Studieverenigingen van deze opleiding" : studieOverzicht!.label}{" "}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <div className="rounded-2xl border border-line p-5">
              <h3 className="font-semibold">Voor alle {o.soort === "mbo" ? "mbo-" : ""}studenten</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {landelijk.map((l) => (
                  <li key={l.naam}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                    >
                      {l.naam} <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="text-muted"> · {l.tekst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- OPEN DAG + BEOORDELING ---------- */}
      <section className="kaart p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Open dag</p>
            <h2 className="display mt-1 text-2xl font-bold">Plan je bezoek</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Zoek de datum op de site van {o.instelling.naam} en zet hem hier. Dan staat hij in je kalender en krijg je
              (als je bent ingelogd) 3 dagen van tevoren een mail.
            </p>
          </div>
          {(o.url ?? o.instelling.url) && (
            <a
              href={(o.url ?? o.instelling.url)!}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-brand"
            >
              Open dagen op de site <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {!geladen ? null : fav ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-card-2 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Datum open dag</span>
                <input
                  type="date"
                  value={fav.openDag ?? ""}
                  min={vandaag()}
                  onChange={(e) => void werkFavorietBij(o.id, { openDag: e.target.value || null })}
                  className="focus-ring w-full rounded-xl border border-line bg-card px-3 py-2.5"
                />
              </label>
              {fav.openDag && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium capitalize">{datumTekst(fav.openDag)}</p>
                  <button
                    type="button"
                    onClick={() =>
                      downloadIcs(`open-dag-${o.naam}.ics`, maakIcs([{ datum: fav.openDag!, opleiding: o }]))
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg"
                  >
                    <CalendarPlus className="h-4 w-4" /> In mijn agenda
                  </button>
                </div>
              )}
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
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-card-2 p-5">
            <p className="flex-1 text-sm text-muted">
              Bewaar deze opleiding eerst als favoriet. Daarna kun je een datum plannen en na de open dag een cijfer en
              notitie geven.
            </p>
            <FavorietKnop opleidingId={o.id} groot />
          </div>
        )}
      </section>

      {/* ---------- MEER ---------- */}
      {andere.length > 0 && (
        <section>
          <h2 className="display mb-1 text-2xl font-bold">{o.naam} op andere plekken</h2>
          <p className="mb-4 text-sm text-muted">
            {getal(elders.length)} andere scholen; dit zijn de beste matches voor jou.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {andere.map((x, i) => (
              <OpleidingKaart key={x.opleiding.id} r={x} index={i} />
            ))}
          </div>
        </section>
      )}
      {verwant.length > 0 && (
        <section>
          <h2 className="display mb-4 text-2xl font-bold">
            Meer {s.kort.toLowerCase()} in {plaatsNaam(o.plaats.naam)}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {verwant.map((x, i) => (
              <OpleidingKaart key={x.opleiding.id} r={x} index={i} />
            ))}
          </div>
        </section>
      )}
      <p className="text-xs text-muted">
        Bron: DUO Open Onderwijsdata ({o.soort === "mbo" ? "crebo" : "croho"} {o.code}). {NIVEAU_LABEL[o.niveau]}.
        Kamerhuur en reistijd zijn schattingen.
      </p>
    </div>
  );
}

function Feit({
  icoon,
  label,
  waarde,
  sub,
}: {
  icoon: React.ReactNode;
  label: string;
  waarde: string;
  sub: React.ReactNode;
}) {
  return (
    <div className="kaart p-4 sm:p-5">
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        {icoon}
        <span className="truncate">{label}</span>
      </dt>
      <dd className="display mt-2 text-2xl font-bold tabular">{waarde}</dd>
      <dd className="mt-1 text-xs text-muted">{sub}</dd>
    </div>
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
    <div className="space-y-5 rounded-2xl bg-card-2 p-5">
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span>
          <span className="block font-semibold">Ik ben er geweest</span>
          <span className="text-sm text-muted">Geef daarna een cijfer en notitie</span>
        </span>
        <input
          type="checkbox"
          checked={bezocht}
          onChange={(e) => void opslaan({ bezocht: e.target.checked })}
          className="peer sr-only"
        />
        <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5" />
      </label>
      {bezocht && (
        <>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Cijfer</legend>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={cijfer === n}
                  onClick={() => void opslaan({ cijfer: cijfer === n ? null : n })}
                  className={`aspect-square rounded-xl text-sm font-bold tabular transition-all ${
                    cijfer !== null && n <= cijfer
                      ? n >= 7
                        ? "bg-groen text-white"
                        : n >= 5
                          ? "bg-accent text-white"
                          : "bg-rood text-white"
                      : "bg-card text-muted hover:text-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {cijfer !== null && (
              <p className="mt-2 flex items-center gap-1 text-sm text-muted">
                <Star className="h-4 w-4 fill-accent text-accent" /> Je gaf een {cijfer}
              </p>
            )}
          </fieldset>
          <label className="block">
            <span className="mb-2 flex justify-between text-sm font-semibold">
              Notitie {bewaard && <span className="font-normal text-groen">Opgeslagen ✓</span>}
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
              className="focus-ring w-full resize-y rounded-xl border border-line bg-card p-3 text-sm placeholder:text-muted"
            />
          </label>
        </>
      )}
    </div>
  );
}

const STATUS_STIJL = {
  ja: { kleur: "text-groen", bg: "bg-groen-soft", icoon: "✅", titel: "Je kunt hier naartoe" },
  deficientie: { kleur: "text-oranje", bg: "bg-oranje-soft", icoon: "⚠️", titel: "Je mist een vak" },
  nee: { kleur: "text-rood", bg: "bg-rood-soft", icoon: "⛔", titel: "Niet direct toelaatbaar" },
  onbekend: { kleur: "text-muted", bg: "bg-card-2", icoon: "❔", titel: "Check je toelating" },
} as const;

function ToelatingBlok({ t, opleiding: o }: { t: Toelating; opleiding: Opleiding }) {
  const { profiel } = useStore();
  const st = STATUS_STIJL[t.status];
  const eisen = t.eisen;
  const heeftEisen = !!eisen && (eisen.vakken.length > 0 || eisen.vrij.length > 0 || eisen.notities.length > 0);
  if (t.status === "ja" && !heeftEisen) return null;
  return (
    <section className="kaart overflow-hidden">
      <div className={`flex flex-wrap items-center gap-4 p-5 sm:p-6 ${st.bg}`}>
        <span className="text-3xl" aria-hidden>
          {st.icoon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Toelating</p>
          <h2 className={`display text-xl font-bold ${st.kleur}`}>{st.titel}</h2>
          <p className="text-sm">{t.reden}</p>
        </div>
        {(t.status === "onbekend" || t.status === "deficientie") && (
          <Link href="/profiel" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg">
            {t.status === "onbekend" ? "Vul je vakken in" : "Vakken aanpassen"}
          </Link>
        )}
      </div>
      {heeftEisen && (
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {(eisen!.vakken.length > 0 || eisen!.vrij.length > 0) && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Wat heb je nodig?</h3>
              {eisen!.vrij.length > 0 && eisen!.vrij.length < 4 && (
                <p className="mb-2 text-sm">
                  Met het profiel <strong>{eisen!.vrij.join(" of ")}</strong> kun je zonder meer naar binnen.
                </p>
              )}
              {eisen!.vakken.length > 0 && (
                <>
                  <p className="mb-2 text-sm text-muted">
                    {eisen!.vrij.length
                      ? "Met een ander profiel heb je deze vakken nodig:"
                      : "Deze vakken heb je nodig:"}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {eisen!.vakken.map((g) => {
                      const tekst = g.join(" of ");
                      const mist = !g.some((vak) => profiel.vakken.includes(vak));
                      return (
                        <li
                          key={tekst}
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            t.status === "deficientie" && mist ? "bg-oranje-soft text-oranje" : "bg-card-2"
                          }`}
                        >
                          {t.status === "deficientie" ? (mist ? "✗ " : "✓ ") : ""}
                          {tekst}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          )}
          <div className="space-y-2 text-sm text-muted">
            {eisen!.notities.map((n) => (
              <p key={n} className="rounded-xl bg-card-2 p-3 text-ink">
                📌 {n}
              </p>
            ))}
            {t.status === "deficientie" && (
              <p>
                Een ontbrekend vak heet een <strong className="text-ink">deficiëntie</strong>. Vaak kun je die wegwerken
                met een deficiëntietoets, een zomercursus of een vak extra in je examenjaar.
              </p>
            )}
            <p className="text-xs">
              Dit zijn de landelijke profieleisen{o.soort === "wo" ? " voor universiteiten" : " voor het hbo"}. Scholen
              kunnen afwijken: check altijd de toelatingseisen op de site van de opleiding.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
