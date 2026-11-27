"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { euro, kosten, plaatsNaam } from "@/lib/bereken";
import { useData } from "@/lib/data-client";
import {
  aanvullendeBeurs,
  DUO,
  DUO_LINKS,
  draagkrachtPerMaand,
  grensGeenBeurs,
  maandTerug,
  studieschuld,
} from "@/lib/duo";
import { useStore } from "@/lib/store";
import type { Plaats, Profiel } from "@/lib/types";
import { GeldBlok } from "@/components/GeldBlok";
import { PaginaKop, Schuif, Segment } from "@/components/ui";

const UITLEG = [
  {
    titel: "Basisbeurs",
    bedrag: `${euro(DUO.basisbeurs.uitwonend)} uitwonend · ${euro(DUO.basisbeurs.thuiswonend)} thuiswonend`,
    tekst:
      "Iedereen krijgt hem. Uitwonend krijg je alleen als je bij de gemeente op een ander adres staat dan je ouders.",
    link: DUO_LINKS.uitwonend,
  },
  {
    titel: "Aanvullende beurs",
    bedrag: `tot ${euro(DUO.aanvullendeBeursMax)}`,
    tekst: `Hangt af van het inkomen van je ouders. Onder ${euro(DUO.inkomensgrens)} per jaar (samen) krijg je het maximum. Vraag hem altijd aan.`,
    link: DUO_LINKS.aanvullendeBeurs,
  },
  {
    titel: "Prestatiebeurs",
    bedrag: "wordt een gift",
    tekst:
      "Basisbeurs, aanvullende beurs en je reisproduct worden een gift als je binnen 10 jaar je diploma haalt. Anders moet je ze terugbetalen.",
    link: DUO_LINKS.giftOfTerugbetalen,
  },
  {
    titel: "Lening",
    bedrag: `tot ${euro(DUO.lening)}`,
    tekst: "Altijd terugbetalen, met rente. Krijg je minder aanvullende beurs, dan mag je dat verschil extra lenen.",
    link: DUO_LINKS.bedragen,
  },
  {
    titel: "Collegegeldkrediet",
    bedrag: `${euro(DUO.collegegeldkrediet)}`,
    tekst: "Een lening speciaal voor je collegegeld. Ook dit betaal je terug.",
    link: DUO_LINKS.collegegeld,
  },
  {
    titel: "Studentenreisproduct",
    bedrag: "gratis OV",
    tekst: "Een week- of weekendabonnement voor trein, bus en tram. Handig als je thuis blijft wonen.",
    link: DUO_LINKS.reisproduct,
  },
];

const STAPPEN = [
  ["Vraag een DigiD aan", "Je hebt DigiD nodig voor Mijn DUO. De brief met inloggegevens komt binnen 3 werkdagen."],
  [
    "Vraag studiefinanciering aan",
    "In Mijn DUO, het liefst minstens 8 weken voordat je begint. Vraag de aanvullende beurs altijd aan, ook als je denkt dat je ouders te veel verdienen.",
  ],
  ["Kies wat je leent", "Je bepaalt zelf of en hoeveel je leent. Je kunt het later altijd aanpassen."],
  [
    "Vraag je reisproduct aan",
    "Kies een week- of weekendabonnement. Je kunt het niet met terugwerkende kracht krijgen.",
  ],
  [
    "Ga je op kamer? Geef het door",
    "Schrijf je in bij de gemeente op je kameradres en wijzig je woonsituatie in Mijn DUO. Pas dan krijg je de uitwonende beurs.",
  ],
];

export default function GeldPagina() {
  const data = useData();
  const { profiel, geladen, slaProfielOp } = useStore();
  const [p, setP] = useState<Profiel>(profiel);
  const [thuis, setThuis] = useState(profiel.wonen === "thuis");
  const [stad, setStad] = useState<string>("Utrecht");
  const [jaren, setJaren] = useState(4);
  const eerste = useRef(true);

  useEffect(() => {
    if (geladen) {
      setP(profiel);
      setThuis(profiel.wonen === "thuis");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geladen]);

  // Wijzigingen automatisch bewaren in je profiel
  useEffect(() => {
    if (!geladen) return;
    if (eerste.current) {
      eerste.current = false;
      return;
    }
    const t = setTimeout(() => void slaProfielOp(p), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  const zet = <K extends keyof Profiel>(k: K, v: Profiel[K]) => setP((o) => ({ ...o, [k]: v }));
  const plaatsen = useMemo(
    () => (data ? [...data.plaatsen].sort((a, b) => plaatsNaam(a.naam).localeCompare(plaatsNaam(b.naam))) : []),
    [data],
  );
  const plaats: Plaats = plaatsen.find((x) => x.naam === stad) ?? {
    naam: stad,
    provincie: "Utrecht",
    lat: 52.09,
    lng: 5.12,
  };
  const k = kosten({ soort: "wo", leerwegen: null }, plaats, 0, { maxReistijd: 0, wonen: thuis ? "thuis" : "kamer" });
  const aanvullend = aanvullendeBeurs(p.ouderInkomen, p.andereKinderen);

  return (
    <>
      <PaginaKop
        foto="studeren"
        label="Geld & DUO"
        titel={
          <>
            Wat kost studeren, en wat <em>betaalt DUO</em>?
          </>
        }
        sub="Stel je situatie in. We rekenen met de officiële bedragen van DUO voor september 2027 en bewaren je keuzes in je profiel."
      />

      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        <section className="space-y-7">
          <div>
            <p className="bovenschrift mb-2">Wonen</p>
            <Segment
              waarde={thuis ? "thuis" : "kamer"}
              kies={(w) => setThuis(w === "thuis")}
              opties={[
                { waarde: "kamer", label: "Op kamer" },
                { waarde: "thuis", label: "Thuis" },
              ]}
            />
          </div>
          {!thuis && (
            <label className="block">
              <span className="bovenschrift mb-2 block">Studiestad</span>
              <select
                value={stad}
                onChange={(e) => setStad(e.target.value)}
                className="focus-ring w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm"
              >
                {plaatsen.map((x) => (
                  <option key={x.naam} value={x.naam}>
                    {plaatsNaam(x.naam)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="bovenschrift">Inkomen ouders samen (bruto, 2025)</span>
              <span className="display text-lg tabular">{p.ouderInkomen === null ? "–" : euro(p.ouderInkomen)}</span>
            </div>
            <Schuif
              label="Inkomen ouders"
              waarde={p.ouderInkomen ?? 60000}
              min={0}
              max={150000}
              stap={1000}
              zet={(n) => zet("ouderInkomen", n)}
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={p.ouderInkomen === null}
                onChange={(e) => zet("ouderInkomen", e.target.checked ? null : 60000)}
              />
              Weet ik niet (reken zonder aanvullende beurs)
            </label>
            <p className="mt-2 text-sm">
              Aanvullende beurs: <strong className="tabular">{euro(aanvullend)}</strong> per maand.{" "}
              <span className="text-muted">Boven ± {euro(grensGeenBeurs(p.andereKinderen))} krijg je niets meer.</span>
            </p>
          </div>

          <label className="block">
            <span className="bovenschrift mb-2 block">Broers of zussen van 12 tot 18 die thuis wonen</span>
            <Segment
              waarde={String(p.andereKinderen)}
              kies={(w) => zet("andereKinderen", Number(w))}
              opties={["0", "1", "2", "3"].map((w) => ({ waarde: w, label: w }))}
            />
          </label>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="bovenschrift">Bijdrage van je ouders</span>
              <span className="display text-lg tabular">{euro(p.ouderBijdrage)}</span>
            </div>
            <Schuif
              label="Bijdrage ouders"
              waarde={p.ouderBijdrage}
              min={0}
              max={800}
              stap={25}
              zet={(n) => zet("ouderBijdrage", n)}
            />
          </div>
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="bovenschrift">Bijbaan per maand</span>
              <span className="display text-lg tabular">{euro(p.bijbaan)}</span>
            </div>
            <Schuif label="Bijbaan" waarde={p.bijbaan} min={0} max={1000} stap={25} zet={(n) => zet("bijbaan", n)} />
          </div>
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="bovenschrift">Ik wil maximaal lenen</span>
              <span className="display text-lg tabular">{euro(p.maxLenen)}</span>
            </div>
            <Schuif
              label="Maximaal lenen"
              waarde={p.maxLenen}
              min={0}
              max={900}
              stap={25}
              zet={(n) => zet("maxLenen", n)}
            />
            <p className="mt-1.5 text-xs text-muted">
              Dit gebruiken we in je match-score: hoe meer je moet lenen, hoe minder punten.
            </p>
          </div>
          <div>
            <p className="bovenschrift mb-2">Hoe lang studeer je?</p>
            <Segment
              waarde={String(jaren)}
              kies={(w) => setJaren(Number(w))}
              opties={[
                { waarde: "3", label: "Bachelor" },
                { waarde: "4", label: "+ master 1 jr" },
                { waarde: "5", label: "+ master 2 jr" },
              ]}
            />
          </div>
        </section>

        <section className="kaart h-fit p-5 sm:p-7 lg:sticky lg:top-24">
          <p className="bovenschrift mb-4">{thuis ? "Thuis wonend" : `Op kamer in ${plaatsNaam(stad)}`} · per maand</p>
          <GeldBlok kosten={k} thuis={thuis} jaren={jaren} />
        </section>
      </div>

      <section className="mt-16">
        <p className="bovenschrift mb-2">Zo werkt studiefinanciering</p>
        <h2 className="display mb-6 text-3xl sm:text-4xl">Zes dingen die je moet weten</h2>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {UITLEG.map((u) => (
            <a
              key={u.titel}
              href={u.link}
              target="_blank"
              rel="noreferrer"
              className="group bg-card p-6 transition-colors hover:bg-card-2"
            >
              <p className="bovenschrift">{u.bedrag}</p>
              <h3 className="display mt-2 flex items-center gap-2 text-xl">
                {u.titel} <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
              </h3>
              <p className="mt-2 text-sm text-muted">{u.tekst}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="bovenschrift mb-2">Stappenplan</p>
          <h2 className="display mb-6 text-3xl">Zo regel je het bij DUO</h2>
          <ol className="space-y-5">
            {STAPPEN.map(([titel, tekst], i) => (
              <li key={titel} className="grid grid-cols-[2.5rem_1fr] gap-3">
                <span className="display text-3xl text-muted tabular">{i + 1}</span>
                <div className="border-b border-line pb-5">
                  <p className="font-medium">{titel}</p>
                  <p className="mt-1 text-sm text-muted">{tekst}</p>
                </div>
              </li>
            ))}
          </ol>
          <a
            href={DUO_LINKS.aanvragen}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            <span className="streep">Studiefinanciering aanvragen op duo.nl</span>{" "}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <div>
          <p className="bovenschrift mb-2">Terugbetalen</p>
          <h2 className="display mb-6 text-3xl">Wat betekent lenen later?</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-muted">
            <p>
              Je betaalt terug in <strong className="text-ink">35 jaar</strong>, vanaf twee jaar na je studie. De rente
              voor studenten is in 2027{" "}
              <strong className="text-ink">{String(DUO.rente * 100).replace(".", ",")}%</strong>.
            </p>
            <p>
              Je betaalt nooit meer dan je kunt missen:{" "}
              <strong className="text-ink">4% van je inkomen boven {euro(DUO.draagkrachtVrijstelling)}</strong> per
              jaar. Verdien je minder, dan betaal je niets. Wat na 35 jaar over is, vervalt.
            </p>
            <div className="kaart grid grid-cols-3 gap-px overflow-hidden bg-line p-0 text-center text-sm">
              {[30000, 45000, 60000].map((ink) => (
                <div key={ink} className="bg-card p-3">
                  <p className="bovenschrift">Salaris {euro(ink)}</p>
                  <p className="display mt-1 text-xl text-ink tabular">max {euro(draagkrachtPerMaand(ink))}</p>
                  <p className="text-xs">per maand</p>
                </div>
              ))}
            </div>
            <p className="text-sm">
              Voorbeeld: 4 jaar lang € 300 per maand lenen wordt ± {euro(studieschuld(300, 4))} schuld, en dan ±{" "}
              {euro(maandTerug(studieschuld(300, 4)))} per maand terugbetalen (als je genoeg verdient).
            </p>
            <a
              href={DUO_LINKS.terugbetalen}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink"
            >
              <span className="streep">Zo werkt terugbetalen (duo.nl)</span> <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
