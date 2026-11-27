import { ArrowUpRight } from "lucide-react";
import { KAMER_LINKS, KAMER_STAPPEN, KAMER_STEDEN } from "@/data/kamers";
import { KamerStadKaart } from "@/components/KamerStadKaart";
import { PaginaKop } from "@/components/ui";

export default function KamerPagina() {
  const steden = [...KAMER_STEDEN].sort((a, b) => (a.kamernet ?? 9999) - (b.kamernet ?? 9999));
  return (
    <>
      <PaginaKop
        foto="kamer"
        label="Kamer vinden"
        titel={
          <>
            Aan een kamer komen <em>begint nu</em>
          </>
        }
        sub="Er zijn in Nederland tienduizenden studentenkamers te weinig. Wie zich vroeg inschrijft en slim zoekt, heeft de meeste kans. Dit is het stappenplan."
      />

      <div className="mb-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {[
          ["€ 979", "gemiddelde kamer in Amsterdam"],
          ["€ 397", "gemiddelde kamer in Enschede"],
          ["5+ jaar", "wachttijd in Amsterdam"],
          ["16 jaar", "vanaf dan kun je je inschrijven"],
        ].map(([g, t]) => (
          <div key={t} className="bg-card p-5">
            <p className="display text-3xl tabular">{g}</p>
            <p className="mt-1 text-sm text-muted">{t}</p>
          </div>
        ))}
      </div>

      <section className="mb-16">
        <p className="bovenschrift mb-2">Stappenplan voor september 2027</p>
        <h2 className="display mb-8 text-3xl sm:text-4xl">Wat doe je wanneer?</h2>
        <ol className="relative border-l border-line">
          {KAMER_STAPPEN.map((s) => (
            <li key={s.titel} className="relative pb-8 pl-8 last:pb-0">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand" />
              <p className="bovenschrift">{s.wanneer}</p>
              <h3 className="display mt-1 text-xl">{s.titel}</h3>
              <p className="mt-1 max-w-2xl text-[15px] text-muted">{s.tekst}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <div>
            <p className="bovenschrift mb-1">Per universiteitsstad</p>
            <h2 className="display text-3xl sm:text-4xl">Waar en hoe zoek je?</h2>
          </div>
          <p className="text-sm text-muted">Gesorteerd van goedkoop naar duur · huur volgens Kamernet Q1 2025</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {steden.map((k) => (
            <KamerStadKaart key={k.plaats} k={k} />
          ))}
        </div>
      </section>

      <section className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        {[
          [
            "Kamernet",
            "De grootste site met particuliere kamers. Vaak sneller, maar duurder dan via een huisvester.",
            KAMER_LINKS.kamernet,
          ],
          [
            "Huurcommissie",
            "Check met de puntentelling of je huur niet te hoog is. Je kunt ook achteraf nog naar de Huurcommissie.",
            KAMER_LINKS.huurcommissie,
          ],
          [
            "Op kamers (Studiekeuze123)",
            "Overzicht per studiestad van wat een kamer kost en waar je moet zoeken.",
            KAMER_LINKS.studiekeuze123,
          ],
        ].map(([titel, tekst, url]) => (
          <a key={titel} href={url} target="_blank" rel="noreferrer" className="group bg-card p-6 hover:bg-card-2">
            <h3 className="display flex items-center gap-1.5 text-xl">
              {titel}{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </h3>
            <p className="mt-2 text-sm text-muted">{tekst}</p>
          </a>
        ))}
      </section>
      <p className="mt-6 text-xs text-muted">
        Bronnen: huisvestingspagina&apos;s van de universiteiten, DUWO en ROOM.nl, Kamernet Huurmonitor (Q1 2025),
        wachttijden volgens NU.nl/Kassa (2026). Regels en prijzen veranderen: check altijd de site van de huisvester.
      </p>
    </>
  );
}
