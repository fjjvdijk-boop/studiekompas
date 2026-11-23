"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Cloud, HardDrive, LogOut, Mail } from "lucide-react";
import { HOOFDRICHTINGEN, SECTOR } from "@/data/sectoren";
import { euro, reistijdTekst } from "@/lib/bereken";
import { useStore } from "@/lib/store";
import type { Profiel, TaalVoorkeur, Wonen } from "@/lib/types";
import { PaginaKop, Schuif, Segment } from "@/components/ui";
import { DiplomaKiezer } from "@/components/DiplomaKiezer";
import { WoonplaatsKiezer } from "@/components/WoonplaatsKiezer";

export default function ProfielPagina() {
  const { profiel, slaProfielOp, geladen, cloud, gebruiker, stuurInloglink, logUit } = useStore();
  const [p, setP] = useState<Profiel>(profiel);
  const [opgeslagen, setOpgeslagen] = useState(false);

  useEffect(() => {
    if (geladen) setP(profiel);
  }, [geladen, profiel]);

  if (!geladen) return <div className="h-96 animate-pulse rounded-2xl bg-card-2" />;

  const zet = <K extends keyof Profiel>(k: K, v: Profiel[K]) => {
    setP((oud) => ({ ...oud, [k]: v }));
    setOpgeslagen(false);
  };
  const opslaan = async () => {
    await slaProfielOp(p);
    setOpgeslagen(true);
  };
  const veranderd = JSON.stringify(p) !== JSON.stringify(profiel);

  return (
    <>
      <PaginaKop
        label="Profiel"
        titel={p.naam ? `Hoi ${p.naam}` : "Mijn profiel"}
        sub="Hiermee berekenen we je match-score, je toelating, je reistijd en je geldplaatje."
      />

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-14">
          <Blok titel="Over jou">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="bovenschrift mb-2 block">Voornaam</span>
                <input
                  value={p.naam}
                  onChange={(e) => zet("naam", e.target.value)}
                  autoComplete="given-name"
                  placeholder="Je voornaam"
                  className="focus-ring w-full rounded-xl border border-line bg-card px-4 py-3.5 text-[15px]"
                />
              </label>
              <div>
                <span className="bovenschrift mb-2 block">Woonplaats</span>
                <WoonplaatsKiezer waarde={p.woonplaats} kies={(w) => zet("woonplaats", w)} />
              </div>
            </div>
          </Blok>

          <Blok titel="Toelating">
            <DiplomaKiezer
              waarde={p}
              zet={(w) => {
                setP((o) => ({ ...o, ...w }));
                setOpgeslagen(false);
              }}
            />
          </Blok>

          <Blok titel="Voorkeuren">
            <div className="space-y-7">
              <div>
                <span className="bovenschrift mb-2 block">Voertaal</span>
                <Segment
                  waarde={p.taal}
                  kies={(t: TaalVoorkeur) => zet("taal", t)}
                  opties={[
                    { waarde: "beide", label: "Maakt niet uit" },
                    { waarde: "nl", label: "Nederlands" },
                    { waarde: "en", label: "Engels" },
                  ]}
                />
              </div>
              <div>
                <span className="bovenschrift mb-2 block">Wonen</span>
                <Segment
                  waarde={p.wonen}
                  kies={(w: Wonen) => zet("wonen", w)}
                  opties={[
                    { waarde: "thuis", label: "Thuis" },
                    { waarde: "allebei", label: "Weet nog niet" },
                    { waarde: "kamer", label: "Op kamer" },
                  ]}
                />
              </div>
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="bovenschrift">Max. reistijd (enkele reis)</span>
                  <span className="display text-xl tabular">{reistijdTekst(p.maxReistijd)}</span>
                </div>
                <Schuif
                  label="Maximale reistijd"
                  waarde={p.maxReistijd}
                  min={15}
                  max={150}
                  stap={5}
                  zet={(n) => zet("maxReistijd", n)}
                />
              </div>
            </div>
          </Blok>

          <Blok titel="Geld" actie={{ href: "/geld", label: "Uitgebreid rekenen" }}>
            <dl className="grid grid-cols-2 border-y border-line sm:grid-cols-4">
              {[
                ["Inkomen ouders", p.ouderInkomen === null ? "onbekend" : euro(p.ouderInkomen)],
                ["Bijdrage ouders", euro(p.ouderBijdrage)],
                ["Bijbaan", euro(p.bijbaan)],
                ["Max. lenen", euro(p.maxLenen)],
              ].map(([l, w], i) => (
                <div
                  key={l}
                  className={`py-4 ${i % 2 ? "pl-4" : "pr-4"} ${i > 0 ? "sm:border-l sm:border-line sm:pl-4" : ""} ${i > 1 ? "border-t border-line sm:border-t-0" : ""}`}
                >
                  <dt className="bovenschrift">{l}</dt>
                  <dd className="display mt-1 text-xl tabular">{w}</dd>
                </div>
              ))}
            </dl>
          </Blok>

          <Blok
            titel="Interesses"
            actie={{ href: "/vragenlijst", label: p.vragenlijstKlaar ? "Test opnieuw" : "Doe de test" }}
          >
            <p className="mb-5 text-sm text-muted">
              {p.vragenlijstKlaar
                ? "Uit je studietest. Je kunt ze hier bijstellen."
                : "Doe de studietest, of stel ze zelf in."}
            </p>
            <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {HOOFDRICHTINGEN.map((s) => {
                const w = Math.round((p.interesse[s] ?? 0) * 100);
                return (
                  <li key={s}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{SECTOR[s].naam}</span>
                      <span className="font-mono text-xs text-muted tabular">{w}</span>
                    </div>
                    <Schuif
                      label={SECTOR[s].naam}
                      waarde={w}
                      min={0}
                      max={100}
                      stap={5}
                      zet={(n) => zet("interesse", { ...p.interesse, [s]: n / 100 })}
                    />
                  </li>
                );
              })}
            </ul>
          </Blok>

          <div className="sticky bottom-20 z-20 flex items-center gap-4 rounded-full border border-line bg-card p-2 pl-5 shadow-groot lg:bottom-6">
            <span className="flex-1 text-sm text-muted">
              {opgeslagen ? (
                <span className="inline-flex items-center gap-1.5 text-groen">
                  <Check className="h-4 w-4" /> Opgeslagen
                </span>
              ) : veranderd ? (
                "Je hebt wijzigingen"
              ) : (
                "Alles is opgeslagen"
              )}
            </span>
            <button
              type="button"
              onClick={opslaan}
              disabled={!veranderd}
              className="rounded-full bg-ink px-6 py-2.5 text-sm text-bg disabled:opacity-30"
            >
              Opslaan
            </button>
          </div>
        </div>

        <aside className="space-y-8">
          <Account cloud={cloud} email={gebruiker?.email ?? null} stuurInloglink={stuurInloglink} logUit={logUit} />
          <div className="border-t border-line pt-5 text-sm text-muted">
            <h2 className="display mb-3 text-xl text-ink">Hoe werkt de match-score?</h2>
            <ul className="space-y-2">
              <li>
                <span className="text-ink">50</span> punten: past de richting bij je studietest? Min 10 als de voertaal
                niet past.
              </li>
              <li>
                <span className="text-ink">10</span> punten: kun je erheen met je profiel en vakken?
              </li>
              <li>
                <span className="text-ink">20</span> punten: hoeveel moet je lenen, tegenover wat je maximaal wilt?
              </li>
              <li>
                <span className="text-ink">20</span> punten: is de reistijd te doen?
              </li>
            </ul>
            <p className="mt-3">Mis je een vak, dan krijgt een opleiding maximaal 70 punten.</p>
          </div>
        </aside>
      </div>
    </>
  );
}

function Blok({
  titel,
  actie,
  children,
}: {
  titel: string;
  actie?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between border-b border-line pb-2">
        <h2 className="display text-2xl">{titel}</h2>
        {actie && (
          <Link href={actie.href} className="text-sm streep">
            {actie.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Account({
  cloud,
  email,
  stuurInloglink,
  logUit,
}: {
  cloud: boolean;
  email: string | null;
  stuurInloglink: (e: string) => Promise<{ fout?: string }>;
  logUit: () => Promise<void>;
}) {
  const [invoer, setInvoer] = useState("");
  const [status, setStatus] = useState<string>("");

  if (!cloud)
    return (
      <div className="kaart p-5">
        <h2 className="flex items-center gap-2 font-medium">
          <HardDrive className="h-4 w-4 text-ink" /> Opgeslagen op dit apparaat
        </h2>
        <p className="mt-1 text-sm text-muted">
          Je profiel en favorieten staan alleen in deze browser. Je hebt geen account nodig.
        </p>
      </div>
    );

  if (email)
    return (
      <div className="kaart p-5">
        <h2 className="flex items-center gap-2 font-medium">
          <Cloud className="h-4 w-4 text-ink" /> Ingelogd
        </h2>
        <p className="mt-1 break-all text-sm text-muted">{email}</p>
        <p className="mt-2 text-sm text-muted">
          Je lijst staat op al je apparaten, en 3 dagen voor een geplande open dag krijg je een mail.
        </p>
        <button
          type="button"
          onClick={() => void logUit()}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-rood hover:text-rood"
        >
          <LogOut className="h-4 w-4" /> Uitloggen
        </button>
      </div>
    );

  return (
    <form
      className="kaart p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("bezig");
        const { fout } = await stuurInloglink(invoer.trim());
        setStatus(fout ?? "verstuurd");
      }}
    >
      <h2 className="flex items-center gap-2 font-medium">
        <Mail className="h-4 w-4 text-ink" /> Inloggen met je e-mail
      </h2>
      <p className="mt-1 text-sm text-muted">
        Bewaar je lijst op al je apparaten en krijg een herinnering voor je open dagen. Wat je al hebt, neem je mee.
      </p>
      {status === "verstuurd" ? (
        <p className="mt-4 rounded-2xl bg-groen-soft p-3 text-sm text-groen" role="status">
          Check je mail en klik op de link om in te loggen.
        </p>
      ) : (
        <>
          <input
            type="email"
            required
            value={invoer}
            onChange={(e) => setInvoer(e.target.value)}
            placeholder="jij@voorbeeld.nl"
            autoComplete="email"
            className="focus-ring mt-4 w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={status === "bezig"}
            className="mt-2 w-full rounded-full bg-ink py-3 text-sm font-semibold text-bg disabled:opacity-60"
          >
            {status === "bezig" ? "Versturen…" : "Stuur inloglink"}
          </button>
          {status && status !== "bezig" && <p className="mt-2 text-sm text-rood">{status}</p>}
        </>
      )}
    </form>
  );
}
