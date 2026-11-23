import Link from "next/link";
import { Logo } from "./Logo";

export function Voettekst() {
  return (
    <footer className="mx-auto mb-28 max-w-7xl px-4 sm:px-6 lg:mb-10">
      <div className="kaart flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="display text-lg font-bold">StudieKompas</span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Gemaakt voor de app-opdracht Informatica 6V. Opleidingen uit DUO Open Onderwijsdata, coördinaten van PDOK.
            Kamerhuur en reistijden zijn schattingen.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <Link className="text-muted hover:text-ink" href="/vragenlijst">
            Studietest
          </Link>
          <Link className="text-muted hover:text-ink" href="/zoeken">
            Alle opleidingen
          </Link>
          <Link className="text-muted hover:text-ink" href="/kaart">
            Kaart
          </Link>
          <Link className="text-muted hover:text-ink" href="/open-dagen">
            Open dagen
          </Link>
          <a className="text-muted hover:text-ink" href="https://onderwijsdata.duo.nl" target="_blank" rel="noreferrer">
            DUO open data
          </a>
          <a
            className="text-muted hover:text-ink"
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
