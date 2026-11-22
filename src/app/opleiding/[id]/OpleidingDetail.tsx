"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarPlus,
  Clock,
  ExternalLink,
  GraduationCap,
  Home as HomeIcon,
  MapPin,
  Star,
  TrainFront,
  Users,
} from "lucide-react";
import { OPLEIDINGEN } from "@/data/opleidingen";
import { datumTekst, euro, opleidingVan, openDagenVan, reistijdTekst } from "@/lib/bereken";
import { downloadIcs, maakIcs } from "@/lib/ics";
import { bereken } from "@/lib/resultaten";
import { useStore } from "@/lib/store";
import { FavorietKnop, KostenBalk, NiveauChip, ScoreRing, StoplichtBadge, kostenDelen } from "@/components/ui";

export function OpleidingDetail({ id }: { id: string }) {
  const { profiel, heeftProfiel, favorieten, werkFavorietBij, geladen } = useStore();
  const opleiding = opleidingVan(id)!;
  const r = bereken(opleiding, profiel);
  const { stad, kosten: k, match, licht } = r;
  const [thuis, setThuis] = useState(k.thuisMogelijk);
  useEffect(() => setThuis(k.thuisMogelijk), [k.thuisMogelijk]);

  const dagen = openDagenVan(id);
  const fav = favorieten.find((f) => f.opleidingId === id);
  const elders = OPLEIDINGEN.filter((o) => o.naam === opleiding.naam && o.id !== id).map((o) => bereken(o, profiel));
  const delen = kostenDelen(k, thuis);
  const totaal = thuis ? k.thuis : k.uitwonend;

  return (
    <div className="binnenkomen space-y-6">
      <Link
        href="/zoeken"
        className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar zoeken
      </Link>

      <header className="kaart overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#4338ca] via-[#6366f1] to-[#f59e0b]" />
        <div className="flex flex-col gap-6 p-5 sm:p-8 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <NiveauChip niveau={opleiding.niveau} />
              <span className="text-sm text-muted">{opleiding.sector}</span>
              {opleiding.selectie && (
                <span className="inline-flex items-center gap-1 rounded-full bg-oranje-soft px-2 py-0.5 text-xs font-medium text-oranje">
                  <BadgeCheck className="h-3.5 w-3.5" /> Selectie / numerus fixus
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{opleiding.naam}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-muted">
              <MapPin className="h-4 w-4" /> {opleiding.instelling} · {stad.naam}
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed">{opleiding.omschrijving}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <FavorietKnop opleidingId={id} groot />
              <a
                href={opleiding.website}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium hover:border-brand"
              >
                Website <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-card-2 p-4 md:w-60 md:flex-col md:items-start">
            <ScoreRing score={match.score} maat={84} />
            <div>
              <p className="font-semibold">Match-score</p>
              <p className="text-sm text-muted">
                {heeftProfiel
                  ? "Hoe goed deze opleiding bij jouw profiel past"
                  : "Vul je profiel in voor een persoonlijke score"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icoon={<HomeIcon className="h-4 w-4" />}
          label="Maandlasten"
          waarde={euro(k.advies)}
          sub={k.thuisMogelijk ? "thuis wonend" : "op kamer"}
        />
        <Stat
          icoon={<TrainFront className="h-4 w-4" />}
          label="Reistijd vanaf Wierden"
          waarde={reistijdTekst(stad.reistijd)}
          sub={
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${licht === "groen" ? "text-groen" : licht === "oranje" ? "text-oranje" : "text-rood"}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {licht === "groen"
                ? "Goed te reizen"
                : licht === "oranje"
                  ? "Pittige reis"
                  : "Te ver om dagelijks te reizen"}
              {stad.overstappen ? ` · ${stad.overstappen}× overstap` : " · direct"}
            </span>
          }
        />
        <Stat
          icoon={<Users className="h-4 w-4" />}
          label="Eerstejaars per jaar"
          waarde={`± ${opleiding.instroom}`}
          sub="indicatief, DUO"
        />
        <Stat
          icoon={<GraduationCap className="h-4 w-4" />}
          label="Duur"
          waarde={`${opleiding.duur} jaar`}
          sub={
            opleiding.niveau === "wo" && opleiding.duur === 3
              ? "+ master"
              : opleiding.niveau === "hbo"
                ? "bachelor"
                : "bachelor + master"
          }
        />
      </dl>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="kaart p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Wat kost het per maand?</h2>
              <p className="text-sm text-muted">Collegegeld en boeken zijn omgerekend naar per maand.</p>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-card-2 p-1 text-sm">
              {[
                [false, "Op kamer"],
                [true, "Thuis wonen"],
              ].map(([w, label]) => (
                <button
                  key={String(w)}
                  type="button"
                  aria-pressed={thuis === w}
                  onClick={() => setThuis(w as boolean)}
                  className={`focus-ring rounded-full px-3 py-1.5 font-medium transition-colors ${
                    thuis === w ? "bg-card text-ink shadow-sm" : "text-muted"
                  }`}
                >
                  {label as string}
                </button>
              ))}
            </div>
          </div>
          <p className="mb-3 text-4xl font-semibold tracking-tight tabular">
            {euro(totaal)} <span className="text-base font-normal text-muted">per maand</span>
          </p>
          <KostenBalk kosten={k} thuis={thuis} />
          <ul className="mt-5 space-y-2.5">
            {delen.map((d) => (
              <li key={d.naam} className="flex items-center gap-3 text-sm">
                <span className="h-3 w-3 rounded-sm" style={{ background: d.kleur }} />
                <span className="flex-1">{d.naam}</span>
                <span className="font-medium tabular">{euro(d.bedrag)}</span>
              </li>
            ))}
          </ul>
          <div
            className={`mt-5 rounded-xl p-3.5 text-sm ${k.thuisMogelijk ? "bg-groen-soft text-groen" : "bg-card-2 text-muted"}`}
          >
            {k.thuisMogelijk
              ? `Met ${reistijdTekst(stad.reistijd)} reizen (jouw maximum is ${profiel.maxReistijd} min) kun je thuis blijven wonen. Dat scheelt ${euro(k.uitwonend - k.thuis)} per maand.`
              : `${reistijdTekst(stad.reistijd)} enkele reis is meer dan jouw maximum van ${profiel.maxReistijd} min. Reken op een kamer in ${stad.naam}.`}
            <span className="mt-1 block text-xs opacity-80">
              Met je studentenreisproduct reis je doordeweeks gratis met de trein.
            </span>
          </div>
        </section>

        <section className="kaart p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Waarom deze score?</h2>
          <p className="mb-5 text-sm text-muted">
            {heeftProfiel ? (
              "Op basis van je profiel."
            ) : (
              <>
                <Link href="/profiel" className="font-medium text-brand hover:underline">
                  Vul je profiel in
                </Link>{" "}
                voor een eerlijke score.
              </>
            )}
          </p>
          <ul className="space-y-4">
            {match.onderdelen.map((o) => (
              <li key={o.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{o.label}</span>
                  <span className="text-muted tabular">
                    {o.punten}/{o.max}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-card-2">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${(o.punten / o.max) * 100}%`,
                      background: o.punten === o.max ? "var(--groen)" : "var(--brand)",
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">{o.uitleg}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="kaart p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Open dagen</h2>
            {dagen.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  downloadIcs(`open-dagen-${opleiding.naam}.ics`, maakIcs(dagen.map((dag) => ({ dag, opleiding }))))
                }
                className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-medium text-brand"
              >
                <CalendarPlus className="h-4 w-4" /> Alles in agenda
              </button>
            )}
          </div>
          {dagen.length ? (
            <ul className="space-y-2">
              {dagen.map((d) => (
                <li key={d.id} className="flex items-center gap-4 rounded-xl bg-card-2 p-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-card text-brand">
                    <span className="text-[10px] font-semibold uppercase">
                      {datumTekst(d.datum, { month: "short" }).replace(".", "")}
                    </span>
                    <span className="text-lg font-semibold leading-none tabular">
                      {datumTekst(d.datum, { day: "numeric" })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{d.soort}</p>
                    <p className="flex items-center gap-1 text-sm capitalize text-muted">
                      <Clock className="h-3.5 w-3.5" /> {datumTekst(d.datum, { weekday: "long" })} · {d.start}–{d.eind}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadIcs(`${d.soort}-${opleiding.naam}.ics`, maakIcs([{ dag: d, opleiding }]))}
                    aria-label="Zet in je agenda"
                    title="Zet in je agenda"
                    className="focus-ring rounded-full p-2 text-muted hover:bg-card hover:text-brand"
                  >
                    <CalendarPlus className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              Nog geen open dagen bekend. Kijk op de website van {opleiding.instelling}.
            </p>
          )}
          <p className="mt-3 text-xs text-muted">Datums zijn voorbeelden. Check altijd de website van de instelling.</p>
        </section>

        <section className="kaart p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Mijn beoordeling</h2>
          {!geladen ? null : fav ? (
            <Beoordeling
              key={id}
              bezocht={fav.bezocht}
              cijfer={fav.cijfer}
              notitie={fav.notitie}
              opslaan={(w) => werkFavorietBij(id, w)}
            />
          ) : (
            <div className="mt-2 text-sm text-muted">
              <p>Bewaar deze opleiding als favoriet. Daarna kun je na de open dag een cijfer en notitie geven.</p>
              <div className="mt-4">
                <FavorietKnop opleidingId={id} groot />
              </div>
            </div>
          )}
        </section>
      </div>

      {elders.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{opleiding.naam} in andere steden</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {elders.map((e) => (
              <li key={e.opleiding.id}>
                <Link
                  href={`/opleiding/${e.opleiding.id}`}
                  className="kaart focus-ring flex items-center gap-3 p-4 transition-colors hover:border-brand/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{e.opleiding.instelling}</p>
                    <p className="text-sm text-muted">
                      {e.stad.naam} · {euro(e.kosten.advies)}/mnd
                    </p>
                  </div>
                  <StoplichtBadge licht={e.licht} minuten={e.stad.reistijd} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({
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
    <div className="kaart p-4">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
        {icoon}
        {label}
      </dt>
      <dd className="mt-2 text-xl font-semibold tracking-tight tabular">{waarde}</dd>
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
    <div className="mt-4 space-y-5">
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span>
          <span className="block font-medium">Ik ben naar de open dag geweest</span>
          <span className="text-sm text-muted">Daarna kun je een cijfer en notitie geven</span>
        </span>
        <input
          type="checkbox"
          checked={bezocht}
          onChange={(e) => void opslaan({ bezocht: e.target.checked })}
          className="peer sr-only"
        />
        <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-brand after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
      </label>

      {bezocht && (
        <>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Cijfer</legend>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={cijfer === n}
                  onClick={() => void opslaan({ cijfer: cijfer === n ? null : n })}
                  className={`focus-ring aspect-square rounded-lg text-sm font-semibold tabular transition-colors ${
                    cijfer !== null && n <= cijfer
                      ? n >= 7
                        ? "bg-groen text-white"
                        : n >= 5
                          ? "bg-[var(--accent)] text-white"
                          : "bg-rood text-white"
                      : "bg-card-2 text-muted hover:text-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {cijfer !== null && (
              <p className="mt-2 flex items-center gap-1 text-sm text-muted">
                <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" /> Je gaf een {cijfer}
              </p>
            )}
          </fieldset>
          <label className="block">
            <span className="mb-2 flex justify-between text-sm font-medium">
              Notitie
              {bewaard && <span className="font-normal text-groen">Opgeslagen</span>}
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
              rows={4}
              placeholder="Wat viel je op? Sfeer, vakken, studenten, gebouw…"
              className="focus-ring w-full resize-y rounded-xl border border-line bg-card p-3 text-sm placeholder:text-muted"
            />
          </label>
        </>
      )}
    </div>
  );
}
