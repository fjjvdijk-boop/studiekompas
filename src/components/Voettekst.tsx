import Link from "next/link";
import { Logo } from "./Logo";

export function Voettekst() {
  return (
    <footer className="mx-auto mb-20 max-w-7xl px-4 sm:px-6 lg:mb-0">
      <div className="flex flex-col gap-8 border-t border-line py-10 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6 text-ink" />
            <span className="display text-lg">StudieKompas</span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Gemaakt voor de app-opdracht Informatica 6V. Opleidingen uit DUO Open Onderwijsdata, bedragen van duo.nl,
            kamerhuur van de Kamernet Huurmonitor. Alles zonder garantie: check altijd de officiële bron.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 text-sm">
          <Link className="block py-2 text-muted hover:text-ink" href="/vragenlijst">
            Studietest
          </Link>
          <Link className="block py-2 text-muted hover:text-ink" href="/zoeken">
            Opleidingen
          </Link>
          <Link className="block py-2 text-muted hover:text-ink" href="/geld">
            Geld & DUO
          </Link>
          <Link className="block py-2 text-muted hover:text-ink" href="/kamer">
            Kamer vinden
          </Link>
          <Link className="block py-2 text-muted hover:text-ink" href="/kaart">
            Studiesteden
          </Link>
          <Link className="block py-2 text-muted hover:text-ink" href="/open-dagen">
            Open dagen
          </Link>
          <a className="block py-2 text-muted hover:text-ink" href="https://duo.nl" target="_blank" rel="noreferrer">
            duo.nl
          </a>
          <a
            className="block py-2 text-muted hover:text-ink"
            href="https://github.com/fjjvdijk-boop/studiekompas"
            target="_blank"
            rel="noreferrer"
          >
            Broncode
          </a>
        </div>
      </div>
    </footer>
  );
}
