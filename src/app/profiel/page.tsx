"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Cloud, HardDrive, LogOut, Mail, Sparkles } from "lucide-react";
import { SECTOREN } from "@/data/sectoren";
import { euro, reistijdTekst, TOELATING } from "@/lib/bereken";
import { useStore } from "@/lib/store";
import type { Profiel, Soort, Wonen } from "@/lib/types";
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

  if (!geladen) return <div className="h-96 animate-pulse rounded-3xl bg-card-2" />;

  const zet = <K extends keyof Profiel>(k: K, v: Profiel[K]) => {
    setP((oud) => ({ ...oud, [k]: v }));
    setOpgeslagen(false);
  };
  const opslaan = async () => {
    await slaProfielOp(p);
    setOpgeslagen(true);
  };
  const veranderd = JSON.stringify(p) !== JSON.stringify(profiel);
  const toegestaan: Soort[] = p.vooropleiding ? TOELATING[p.vooropleiding] : ["mbo", "hbo", "wo"];

  return (
    <>
      <PaginaKop
        label="Profiel"
        titel={p.naam ? `Hoi ${p.naam}` : "Mijn profiel"}
        sub="Hiermee berekent StudieKompas je match-score, je reistijd en je maandlasten."
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="kaart space-y-6 p-6 sm:p-7">
            <h2 className="display text-xl font-bold">Over jou</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Voornaam</span>
                <input
                  value={p.naam}
                  onChange={(e) => zet("naam", e.target.value)}
                  autoComplete="given-name"
                  placeholder="Je voornaam"
                  className="focus-ring w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] font-medium"
                />
              </label>
              <div>
                <span className="mb-2 block text-sm font-semibold">Woonplaats</span>
                <WoonplaatsKiezer waarde={p.woonplaats} kies={(w) => zet("woonplaats", w)} />
              </div>
            </div>
            <div>
              <span className="mb-1 block text-sm font-semibold">Diploma, profiel en vakken</span>
              <p className="mb-3 text-sm text-muted">Hiermee checken we per opleiding of je toelaatbaar bent.</p>
              <DiplomaKiezer
                waarde={p}
                zet={(w) => {
                  setP((o) => ({ ...o, ...w }));
                  setOpgeslagen(false);
                }}
              />
            </div>
            <div>
              <span className="mb-2 block text-sm font-semibold">Ik zoek naar</span>
              <div className="flex gap-2">
                {(["mbo", "hbo", "wo"] as Soort[]).map((s) => {
                  const aan = p.soorten.includes(s);
                  const mag = toegestaan.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!mag}
                      aria-pressed={aan}
                      onClick={() => zet("soorten", aan ? p.soorten.filter((x) => x !== s) : [...p.soorten, s])}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold uppercase transition-colors disabled:opacity-30 ${
                        aan && mag ? "border-ink bg-ink text-bg" : "border-line bg-card hover:border-brand"
                      }`}
                    >
                      {aan && mag && <Check className="h-3.5 w-3.5" />} {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="kaart space-y-7 p-6 sm:p-7">
            <h2 className="display text-xl font-bold">Wonen en geld</h2>
            <div>
              <span className="mb-2 block text-sm font-semibold">Wonen</span>
              <Segment
                waarde={p.wonen}
                kies={(w: Wonen) => zet("wonen", w)}
                opties={[
                  { waarde: "thuis", label: "🏠 Thuis" },
                  { waarde: "allebei", label: "🤷 Weet nog niet" },
                  { waarde: "kamer", label: "🔑 Op kamer" },
                ]}
              />
            </div>
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-sm font-semibold">Max. reistijd (enkele reis)</span>
                <span className="display text-2xl font-bold tabular">{reistijdTekst(p.maxReistijd)}</span>
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
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-sm font-semibold">Budget per maand</span>
                <span className="display text-2xl font-bold tabular">{euro(p.budget)}</span>
              </div>
              <Schuif label="Budget" waarde={p.budget} min={300} max={2000} stap={25} zet={(n) => zet("budget", n)} />
            </div>
            <div>
              <div className="mb-3 flex justify-between text-sm font-semibold">
                <span>🔧 Praktisch leren</span>
                <span>🧠 Theoretisch leren</span>
              </div>
              <Schuif
                label="Leerstijl"
                waarde={p.leerstijl * 100}
                min={0}
                max={100}
                stap={5}
                zet={(n) => zet("leerstijl", n / 100)}
              />
            </div>
          </section>

          <section className="kaart p-6 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="display text-xl font-bold">Interesses</h2>
                <p className="text-sm text-muted">
                  {p.vragenlijstKlaar
                    ? "Uit je studietest. Je kunt ze hier bijstellen."
                    : "Doe de studietest, of stel ze zelf in."}
                </p>
              </div>
              <Link
                href="/vragenlijst"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#4f39f6] px-4 py-2 text-sm font-semibold text-white"
              >
                <Sparkles className="h-4 w-4" /> {p.vragenlijstKlaar ? "Test opnieuw" : "Doe de test"}
              </Link>
            </div>
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {SECTOREN.map((s) => {
                const w = Math.round((p.interesse[s.id] ?? 0) * 100);
                return (
                  <li key={s.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {s.emoji} {s.naam}
                      </span>
                      <span className="text-muted tabular">{w}%</span>
                    </div>
                    <Schuif
                      label={s.naam}
                      waarde={w}
                      min={0}
                      max={100}
                      stap={5}
                      zet={(n) => zet("interesse", { ...p.interesse, [s.id]: n / 100 })}
                    />
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="sticky bottom-24 z-20 flex items-center gap-4 rounded-full border border-line bg-card/95 p-2 pl-5 shadow-groot backdrop-blur lg:bottom-6">
            <span className="flex-1 text-sm text-muted">
              {opgeslagen ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-groen">
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
              className="rounded-full bg-ink px-6 py-3 font-semibold text-bg disabled:opacity-40"
            >
              Opslaan
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <Account cloud={cloud} email={gebruiker?.email ?? null} stuurInloglink={stuurInloglink} logUit={logUit} />
          <div className="kaart p-6 text-sm text-muted">
            <h2 className="display mb-3 text-lg font-bold text-ink">Hoe werkt de match-score?</h2>
            <ul className="space-y-2">
              <li>
                <strong className="text-ink">45</strong> punten: past de richting bij je interesses?
              </li>
              <li>
                <strong className="text-ink">15</strong> punten: mbo, hbo of wo, heb je de juiste vakken, en past het
                bij hoe je leert?
              </li>
              <li>
                <strong className="text-ink">20</strong> punten: blijf je binnen je budget?
              </li>
              <li>
                <strong className="text-ink">20</strong> punten: is de reistijd te doen?
              </li>
            </ul>
            <p className="mt-3">
              Kun je er met je diploma niet heen, dan krijgt een opleiding maximaal 40 punten. Mis je een vak, maximaal
              70.
            </p>
          </div>
        </aside>
      </div>
    </>
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
      <div className="kaart p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <HardDrive className="h-4 w-4 text-brand" /> Opgeslagen op dit apparaat
        </h2>
        <p className="mt-1 text-sm text-muted">
          Je profiel en favorieten staan alleen in deze browser. Je hebt geen account nodig.
        </p>
      </div>
    );

  if (email)
    return (
      <div className="kaart p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <Cloud className="h-4 w-4 text-brand" /> Ingelogd
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
      className="kaart p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("bezig");
        const { fout } = await stuurInloglink(invoer.trim());
        setStatus(fout ?? "verstuurd");
      }}
    >
      <h2 className="flex items-center gap-2 font-bold">
        <Mail className="h-4 w-4 text-brand" /> Inloggen met je e-mail
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
