"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Cloud, HardDrive, LogOut, Mail } from "lucide-react";
import { STEDEN } from "@/data/steden";
import { euro, kosten, reistijdTekst } from "@/lib/bereken";
import { useStore } from "@/lib/store";
import { SECTOREN, type Profiel } from "@/lib/types";
import { PaginaKop } from "@/components/ui";

export default function ProfielPagina() {
  const { profiel, heeftProfiel, slaProfielOp, geladen, cloud, gebruiker, stuurInloglink, logUit } = useStore();
  const router = useRouter();
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

  const thuisSteden = STEDEN.filter((s) => s.reistijd <= p.maxReistijd).map((s) => s.naam);
  const binnenBudget = STEDEN.filter((s) => kosten(s, p.maxReistijd).advies <= p.budget).length;

  const opslaan = async (e: React.FormEvent) => {
    e.preventDefault();
    await slaProfielOp(p);
    setOpgeslagen(true);
    if (!heeftProfiel) setTimeout(() => router.push("/"), 600);
  };

  return (
    <>
      <PaginaKop
        titel="Mijn profiel"
        sub="Hiermee berekent StudieKompas je match-score en of je thuis kunt blijven wonen."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={opslaan} className="kaart space-y-8 p-5 sm:p-7">
          <label className="block">
            <span className="mb-2 block font-medium">Hoe heet je?</span>
            <input
              value={p.naam}
              onChange={(e) => zet("naam", e.target.value)}
              placeholder="Je voornaam"
              autoComplete="given-name"
              className="focus-ring w-full rounded-xl border border-line bg-card px-3.5 py-3"
            />
          </label>

          <fieldset>
            <legend className="mb-1 font-medium">Wat vind je interessant?</legend>
            <p className="mb-3 text-sm text-muted">Kies een of meer sectoren. Telt voor 40 van de 100 punten.</p>
            <div className="flex flex-wrap gap-2">
              {SECTOREN.map((s) => {
                const aan = p.interesses.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={aan}
                    onClick={() => zet("interesses", aan ? p.interesses.filter((x) => x !== s) : [...p.interesses, s])}
                    className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                      aan ? "border-brand bg-brand text-brand-ink" : "border-line bg-card hover:border-brand"
                    }`}
                  >
                    {aan && <Check className="h-3.5 w-3.5" />}
                    {s}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-medium">Welk niveau?</legend>
            <div className="grid max-w-sm grid-cols-3 gap-1 rounded-full bg-card-2 p-1">
              {(["beide", "hbo", "wo"] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={p.niveau === n}
                  onClick={() => zet("niveau", n)}
                  className={`focus-ring rounded-full py-2 text-sm font-medium transition-colors ${
                    p.niveau === n ? "bg-card text-ink shadow-sm" : "text-muted"
                  }`}
                >
                  {n === "beide" ? "Beide" : n.toUpperCase()}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1 flex items-baseline justify-between font-medium">
              Budget per maand
              <span className="text-2xl font-semibold tabular">{euro(p.budget)}</span>
            </span>
            <span className="mb-3 block text-sm text-muted">Alles samen: huur, eten, collegegeld, boeken.</span>
            <input
              type="range"
              min={300}
              max={1800}
              step={25}
              value={p.budget}
              onChange={(e) => zet("budget", Number(e.target.value))}
              className="w-full accent-[var(--brand)]"
            />
            <span className="mt-1 block text-sm text-muted">
              In <strong className="text-ink">{binnenBudget}</strong> van de {STEDEN.length} steden blijf je binnen je
              budget.
            </span>
          </label>

          <label className="block">
            <span className="mb-1 flex items-baseline justify-between font-medium">
              Max. reistijd om thuis te blijven wonen
              <span className="text-2xl font-semibold tabular">{reistijdTekst(p.maxReistijd)}</span>
            </span>
            <span className="mb-3 block text-sm text-muted">Enkele reis met de trein vanaf Wierden.</span>
            <input
              type="range"
              min={15}
              max={150}
              step={5}
              value={p.maxReistijd}
              onChange={(e) => zet("maxReistijd", Number(e.target.value))}
              className="w-full accent-[var(--brand)]"
            />
            <span className="mt-1 block text-sm text-muted">
              {thuisSteden.length ? (
                <>
                  Thuis wonen kan voor: <strong className="text-ink">{thuisSteden.join(", ")}</strong>
                </>
              ) : (
                "Met deze reistijd ga je overal op kamer."
              )}
            </span>
          </label>

          <div className="flex items-center gap-4 border-t border-line pt-6">
            <button
              type="submit"
              className="focus-ring rounded-full bg-brand px-6 py-3 font-semibold text-brand-ink hover:opacity-90"
            >
              {heeftProfiel ? "Opslaan" : "Profiel maken"}
            </button>
            {opgeslagen && (
              <span
                className="binnenkomen inline-flex items-center gap-1.5 text-sm font-medium text-groen"
                role="status"
              >
                <Check className="h-4 w-4" /> Opgeslagen
              </span>
            )}
          </div>
        </form>

        <aside className="space-y-4">
          <Account cloud={cloud} email={gebruiker?.email ?? null} stuurInloglink={stuurInloglink} logUit={logUit} />
          <div className="kaart p-5 text-sm text-muted">
            <h2 className="mb-2 font-semibold text-ink">Hoe werkt de match-score?</h2>
            <ul className="space-y-1.5">
              <li>
                <strong className="text-ink">40</strong> punten als de sector bij je interesses hoort
              </li>
              <li>
                <strong className="text-ink">10</strong> punten als het niveau past
              </li>
              <li>
                <strong className="text-ink">25</strong> punten als de maandlasten binnen je budget blijven
              </li>
              <li>
                <strong className="text-ink">25</strong> punten als je thuis kunt blijven wonen
              </li>
            </ul>
            <p className="mt-3">Ben je net over je budget of reistijd heen? Dan krijg je nog een deel van de punten.</p>
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
  const [status, setStatus] = useState<"" | "bezig" | "verstuurd" | string>("");

  if (!cloud) {
    return (
      <div className="kaart p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <HardDrive className="h-4 w-4" /> Opgeslagen op dit apparaat
        </h2>
        <p className="mt-1 text-sm text-muted">
          Je profiel en favorieten worden in deze browser bewaard. Je hebt geen account nodig.
        </p>
      </div>
    );
  }

  if (email) {
    return (
      <div className="kaart p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Cloud className="h-4 w-4 text-brand" /> Ingelogd
        </h2>
        <p className="mt-1 break-all text-sm text-muted">{email}</p>
        <p className="mt-2 text-sm text-muted">
          Je favorieten staan op al je apparaten, en je krijgt 3 dagen van tevoren een mail over open dagen.
        </p>
        <button
          type="button"
          onClick={() => void logUit()}
          className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-rood hover:text-rood"
        >
          <LogOut className="h-4 w-4" /> Uitloggen
        </button>
      </div>
    );
  }

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
      <h2 className="flex items-center gap-2 font-semibold">
        <Mail className="h-4 w-4 text-brand" /> Inloggen met je e-mail
      </h2>
      <p className="mt-1 text-sm text-muted">
        Dan staan je favorieten op al je apparaten en krijg je een herinnering voor open dagen. Wat je al hebt bewaard
        neem je mee.
      </p>
      {status === "verstuurd" ? (
        <p className="mt-4 rounded-xl bg-groen-soft p-3 text-sm text-groen" role="status">
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
            className="focus-ring mt-4 w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={status === "bezig"}
            className="focus-ring mt-2 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-brand-ink disabled:opacity-60"
          >
            {status === "bezig" ? "Versturen…" : "Stuur inloglink"}
          </button>
          {status && status !== "bezig" && <p className="mt-2 text-sm text-rood">{status}</p>}
        </>
      )}
    </form>
  );
}
