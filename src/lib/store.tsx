"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { STANDAARD_PROFIEL } from "@/data/instellingen";
import { vandaag } from "./bereken";
import { supabase } from "./supabase";
import type { Favoriet, Profiel, SectorId, Woonplaats } from "./types";

const OPSLAG_SLEUTEL = "studiekompas:v1";

/** Oude sectornamen (versie 1) naar de nieuwe indeling */
const OUDE_SECTOREN: Record<string, SectorId> = {
  Economie: "economie",
  "Gedrag en Maatschappij": "welzijn",
  Gezondheidszorg: "zorg",
  Natuur: "beta",
  Onderwijs: "onderwijs",
  Recht: "recht",
  "Taal en Cultuur": "taal",
  Techniek: "techniek",
};

/** Zet een profiel uit een oudere versie om naar het huidige formaat */
export function migreerProfiel(p: unknown): Profiel | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  if (o.versie === 2 || o.versie === 3) {
    // Oude velden (budget, leerstijl, soorten) vallen weg; nieuwe krijgen een standaardwaarde
    const { budget: _b, leerstijl: _l, soorten: _s, ...rest } = o as Record<string, unknown>;
    void _b;
    void _l;
    void _s;
    return {
      ...STANDAARD_PROFIEL,
      ...(rest as Partial<Profiel>),
      versie: 3,
      vooropleiding: (rest.vooropleiding as Profiel["vooropleiding"]) ?? "vwo",
    };
  }
  const interesse: Partial<Record<SectorId, number>> = {};
  if (Array.isArray(o.interesses))
    for (const s of o.interesses) if (OUDE_SECTOREN[s]) interesse[OUDE_SECTOREN[s]] = 0.85;
  const niveau = o.niveau as string | undefined;
  void niveau;
  return {
    ...STANDAARD_PROFIEL,
    naam: typeof o.naam === "string" ? o.naam : "",
    interesse,
    maxReistijd: typeof o.maxReistijd === "number" ? o.maxReistijd : STANDAARD_PROFIEL.maxReistijd,
  };
}

const naarFavorietLokaal = (f: Partial<Favoriet> & { opleidingId: string }): Favoriet => ({
  opleidingId: f.opleidingId,
  toegevoegd: f.toegevoegd ?? vandaag(),
  openDag: f.openDag ?? null,
  bezocht: f.bezocht ?? false,
  cijfer: f.cijfer ?? null,
  notitie: f.notitie ?? "",
});

interface Opslag {
  profiel: Profiel | null;
  favorieten: Favoriet[];
}

interface Gebruiker {
  id: string;
  email: string;
}

interface StoreWaarde {
  geladen: boolean;
  /** Supabase is ingesteld: inloggen is mogelijk */
  cloud: boolean;
  gebruiker: Gebruiker | null;
  profiel: Profiel;
  heeftProfiel: boolean;
  favorieten: Favoriet[];
  isFavoriet: (opleidingId: string) => boolean;
  slaProfielOp: (p: Profiel) => Promise<void>;
  wisselFavoriet: (opleidingId: string) => Promise<void>;
  werkFavorietBij: (opleidingId: string, wijziging: Partial<Omit<Favoriet, "opleidingId">>) => Promise<void>;
  zetWoonplaats: (w: Woonplaats) => Promise<void>;
  stuurInloglink: (email: string) => Promise<{ fout?: string }>;
  logUit: () => Promise<void>;
}

const StoreContext = createContext<StoreWaarde | null>(null);

function leesLokaal(): Opslag {
  try {
    const ruw = localStorage.getItem(OPSLAG_SLEUTEL);
    if (ruw) {
      const data = JSON.parse(ruw) as Opslag;
      return {
        profiel: migreerProfiel(data.profiel),
        favorieten: Array.isArray(data.favorieten) ? data.favorieten.map(naarFavorietLokaal) : [],
      };
    }
  } catch {
    /* geen toegang tot opslag (privévenster): gewoon leeg beginnen */
  }
  return { profiel: null, favorieten: [] };
}

function schrijfLokaal(data: Opslag) {
  try {
    localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(data));
  } catch {
    /* negeren */
  }
}

// ---- Vertaling tussen app en database (snake_case) ----

interface ProfielRij {
  id: string;
  email: string;
  naam: string;
  data: Profiel | null;
}

interface FavorietRij {
  user_id: string;
  opleiding_id: string;
  toegevoegd: string;
  bezocht: boolean;
  cijfer: number | null;
  notitie: string | null;
  open_dag: string | null;
}

const naarProfiel = (r: ProfielRij): Profiel | null => migreerProfiel(r.data ?? { naam: r.naam });

const naarFavoriet = (r: FavorietRij): Favoriet => ({
  opleidingId: r.opleiding_id,
  toegevoegd: r.toegevoegd,
  bezocht: r.bezocht,
  cijfer: r.cijfer,
  notitie: r.notitie ?? "",
  openDag: r.open_dag,
});

const profielRij = (g: Gebruiker, p: Profiel): ProfielRij => ({
  id: g.id,
  email: g.email,
  naam: p.naam,
  data: p,
});

const favorietRij = (g: Gebruiker, f: Favoriet): FavorietRij => ({
  user_id: g.id,
  opleiding_id: f.opleidingId,
  toegevoegd: f.toegevoegd,
  bezocht: f.bezocht,
  cijfer: f.cijfer,
  notitie: f.notitie,
  open_dag: f.openDag,
});

async function laadUitCloud(g: Gebruiker): Promise<Opslag> {
  const [p, f] = await Promise.all([
    supabase!.from("profielen").select("*").eq("id", g.id).maybeSingle<ProfielRij>(),
    supabase!.from("favorieten").select("*").eq("user_id", g.id).returns<FavorietRij[]>(),
  ]);
  return { profiel: p.data ? naarProfiel(p.data) : null, favorieten: (f.data ?? []).map(naarFavoriet) };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [geladen, setGeladen] = useState(false);
  const [gebruiker, setGebruiker] = useState<Gebruiker | null>(null);
  const [data, setData] = useState<Opslag>({ profiel: null, favorieten: [] });
  const dataRef = useRef(data);
  dataRef.current = data;

  // Eerste keer laden: uit de browser
  useEffect(() => {
    setData(leesLokaal());
    if (!supabase) {
      setGeladen(true);
      return;
    }

    let actief = true;
    const koppel = async (sessie: { user: { id: string; email?: string } } | null) => {
      if (!sessie) {
        if (actief) {
          setGebruiker(null);
          setData(leesLokaal());
          setGeladen(true);
        }
        return;
      }
      const g = { id: sessie.user.id, email: sessie.user.email ?? "" };
      let cloud = await laadUitCloud(g);
      // Eerste keer ingelogd? Neem wat je zonder account had opgeslagen mee.
      const lokaal = leesLokaal();
      if (!cloud.profiel && cloud.favorieten.length === 0 && (lokaal.profiel || lokaal.favorieten.length)) {
        if (lokaal.profiel) await supabase!.from("profielen").upsert(profielRij(g, lokaal.profiel));
        if (lokaal.favorieten.length)
          await supabase!.from("favorieten").upsert(lokaal.favorieten.map((f) => favorietRij(g, f)));
        cloud = lokaal;
      }
      if (actief) {
        setGebruiker(g);
        setData(cloud);
        setGeladen(true);
      }
    };

    supabase.auth.getSession().then(({ data }) => koppel(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, sessie) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void koppel(sessie);
    });
    return () => {
      actief = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const bewaar = useCallback(
    (nieuw: Opslag) => {
      setData(nieuw);
      if (!gebruiker) schrijfLokaal(nieuw);
    },
    [gebruiker],
  );

  const slaProfielOp = useCallback(
    async (p: Profiel) => {
      bewaar({ ...dataRef.current, profiel: p });
      if (gebruiker && supabase) await supabase.from("profielen").upsert(profielRij(gebruiker, p));
    },
    [bewaar, gebruiker],
  );

  const wisselFavoriet = useCallback(
    async (opleidingId: string) => {
      const huidig = dataRef.current;
      const bestaat = huidig.favorieten.some((f) => f.opleidingId === opleidingId);
      if (bestaat) {
        bewaar({ ...huidig, favorieten: huidig.favorieten.filter((f) => f.opleidingId !== opleidingId) });
        if (gebruiker && supabase)
          await supabase.from("favorieten").delete().eq("user_id", gebruiker.id).eq("opleiding_id", opleidingId);
      } else {
        const fav = naarFavorietLokaal({ opleidingId });
        bewaar({ ...huidig, favorieten: [...huidig.favorieten, fav] });
        if (gebruiker && supabase) await supabase.from("favorieten").upsert(favorietRij(gebruiker, fav));
      }
    },
    [bewaar, gebruiker],
  );

  const werkFavorietBij = useCallback(
    async (opleidingId: string, wijziging: Partial<Omit<Favoriet, "opleidingId">>) => {
      const huidig = dataRef.current;
      const favorieten = huidig.favorieten.map((f) => (f.opleidingId === opleidingId ? { ...f, ...wijziging } : f));
      bewaar({ ...huidig, favorieten });
      const fav = favorieten.find((f) => f.opleidingId === opleidingId);
      if (fav && gebruiker && supabase) await supabase.from("favorieten").upsert(favorietRij(gebruiker, fav));
    },
    [bewaar, gebruiker],
  );

  const zetWoonplaats = useCallback(
    async (w: Woonplaats) => {
      const p = { ...(dataRef.current.profiel ?? STANDAARD_PROFIEL), woonplaats: w };
      bewaar({ ...dataRef.current, profiel: p });
      if (gebruiker && supabase) await supabase.from("profielen").upsert(profielRij(gebruiker, p));
    },
    [bewaar, gebruiker],
  );

  const stuurInloglink = useCallback(async (email: string) => {
    if (!supabase) return { fout: "Inloggen is nog niet ingesteld." };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/profiel` },
    });
    return error ? { fout: error.message } : {};
  }, []);

  const logUit = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const waarde = useMemo<StoreWaarde>(
    () => ({
      geladen,
      cloud: !!supabase,
      gebruiker,
      profiel: data.profiel ?? STANDAARD_PROFIEL,
      heeftProfiel: !!data.profiel,
      favorieten: data.favorieten,
      isFavoriet: (id) => data.favorieten.some((f) => f.opleidingId === id),
      slaProfielOp,
      wisselFavoriet,
      werkFavorietBij,
      zetWoonplaats,
      stuurInloglink,
      logUit,
    }),
    [geladen, gebruiker, data, slaProfielOp, wisselFavoriet, werkFavorietBij, zetWoonplaats, stuurInloglink, logUit],
  );

  return <StoreContext.Provider value={waarde}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore moet binnen <StoreProvider> staan");
  return s;
}
