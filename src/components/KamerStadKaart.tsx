import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { KamerStad } from "@/data/kamers";
import { euro, plaatsNaam, plaatsSlug } from "@/lib/bereken";

/** Alles over kamers in één universiteitsstad */
export function KamerStadKaart({ k, metLink = true }: { k: KamerStad; metLink?: boolean }) {
  return (
    <article className="kaart flex flex-col p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-4">
        <h3 className="display text-2xl">{plaatsNaam(k.plaats)}</h3>
        <div className="text-right">
          <p className="display text-2xl tabular">{k.kamernet ? euro(k.kamernet) : "–"}</p>
          <p className="bovenschrift">{k.kamernet ? "gem. kamer (Kamernet)" : "geen Kamernet-cijfer"}</p>
        </div>
      </div>
      {k.wachttijd && (
        <p className="mt-4 text-sm">
          <span className="bovenschrift mr-2">Wachttijd</span>
          {k.wachttijd} voor een studentenwoning via inschrijving
        </p>
      )}
      <ul className="mt-4 space-y-3">
        {k.huisvesters.map((h) => (
          <li key={h.naam} className="text-sm">
            <a
              href={h.url}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex min-h-10 items-center gap-1 font-semibold text-brand"
            >
              <span className="streep inline-flex min-h-10 items-center">{h.naam}</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="text-muted">{h.tekst}</p>
          </li>
        ))}
      </ul>
      {k.tips.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm text-muted">
          {k.tips.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-ink">–</span>
              {t}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap gap-x-5 pt-4 text-sm">
        {k.uniPagina && (
          <a
            href={k.uniPagina.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-1"
          >
            <span className="streep inline-flex min-h-10 items-center">{k.uniPagina.label}</span>{" "}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
        {metLink && (
          <Link href={`/plaats/${plaatsSlug(k.plaats)}`} className="streep inline-flex min-h-10 items-center">
            Studeren in {plaatsNaam(k.plaats)}
          </Link>
        )}
      </div>
    </article>
  );
}
