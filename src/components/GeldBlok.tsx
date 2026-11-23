"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { euro, geldVoor, type Kosten } from "@/lib/bereken";
import { DUO, DUO_LINKS, maandTerug, studieschuld } from "@/lib/duo";
import { useStore } from "@/lib/store";
import { Balk, kostenDelen } from "./ui";

/** Uitgaven tegenover inkomsten (DUO, ouders, bijbaan) en wat je moet lenen */
export function GeldBlok({ kosten: k, thuis, jaren = 3 }: { kosten: Kosten; thuis: boolean; jaren?: number }) {
  const { profiel } = useStore();
  const g = geldVoor(k, profiel, thuis);
  const uit = kostenDelen(k, thuis);
  const inkomsten = [
    { naam: `Basisbeurs DUO (${thuis ? "thuiswonend" : "uitwonend"})`, bedrag: g.basisbeurs, kleur: "var(--c-gift)" },
    {
      naam: "Aanvullende beurs DUO",
      bedrag: g.aanvullend,
      kleur: "color-mix(in oklab, var(--c-gift) 60%, var(--card))",
    },
    { naam: "Bijdrage ouders", bedrag: g.ouders, kleur: "var(--c-leef)" },
    { naam: "Bijbaan", bedrag: g.bijbaan, kleur: "var(--c-boeken)" },
    { naam: "Lening DUO", bedrag: g.teLenen, kleur: "var(--c-lening)" },
  ].filter((d) => d.bedrag > 0.5);
  const schuld = studieschuld(g.teLenen, jaren);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="bovenschrift mb-2">Uitgaven per maand</p>
          <p className="display mb-3 text-4xl tabular">{euro(g.kosten)}</p>
          <Balk delen={uit} />
          <ul className="mt-4 space-y-1.5 text-sm">
            {uit.map((d) => (
              <li key={d.naam} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.kleur }} />
                <span className="flex-1 text-muted">{d.naam}</span>
                <span className="tabular">{euro(d.bedrag)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="bovenschrift mb-2">Zo betaal je het</p>
          <p className="display mb-3 text-4xl tabular">{euro(g.kosten)}</p>
          <Balk delen={inkomsten} />
          <ul className="mt-4 space-y-1.5 text-sm">
            {inkomsten.map((d) => (
              <li key={d.naam} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.kleur }} />
                <span className="flex-1 text-muted">{d.naam}</span>
                <span className="tabular">{euro(d.bedrag)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        <div className="bg-card p-4">
          <p className="bovenschrift">Gift bij diploma</p>
          <p className="display mt-1 text-2xl tabular text-groen">{euro(g.gift)}</p>
          <p className="text-xs text-muted">per maand: basisbeurs + aanvullende beurs (prestatiebeurs)</p>
        </div>
        <div className="bg-card p-4">
          <p className="bovenschrift">Schuld na {jaren} jaar</p>
          <p className="display mt-1 text-2xl tabular">{euro(schuld)}</p>
          <p className="text-xs text-muted">
            {g.teLenen > 0
              ? `${euro(g.teLenen)} per maand lenen, ${String(DUO.rente * 100).replace(".", ",")}% rente`
              : "Je hoeft niet te lenen"}
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="bovenschrift">Terugbetalen</p>
          <p className="display mt-1 text-2xl tabular">{schuld > 0 ? `± ${euro(maandTerug(schuld))}` : "€ 0"}</p>
          <p className="text-xs text-muted">per maand in 35 jaar; minder als je weinig verdient</p>
        </div>
      </div>

      {!g.past && (
        <p className="border-l-2 border-rood pl-4 text-sm text-rood">
          Dit lukt niet met alleen de lening van DUO (max. {euro(g.maxLening)} per maand inclusief collegegeldkrediet).
          Je hebt meer inkomsten nodig of een goedkopere kamer.
        </p>
      )}
      <p className="text-xs text-muted">
        Bedragen DUO {DUO.periode}. De aanvullende beurs is een schatting op basis van het inkomen van je ouders
        {profiel.ouderInkomen === null ? " (niet ingevuld: we rekenen met € 0)" : ""}.{" "}
        <Link href="/geld" className="streep text-ink">
          Pas je geldplaatje aan
        </Link>{" "}
        ·{" "}
        <a
          href={DUO_LINKS.rekenhulp}
          target="_blank"
          rel="noreferrer"
          className="streep inline-flex items-center gap-1 text-ink"
        >
          Rekenhulp DUO <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
}
