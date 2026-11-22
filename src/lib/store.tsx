"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { STANDAARD_PROFIEL } from "@/data/instellingen";
import { vandaag } from "./bereken";
import { supabase } from "./supabase";
import type { Favoriet, Niveau, Profiel, Sector } from "./types";

const OPSLAG_SLEUTEL = "studiekompas:v1";

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
  stuurInloglink: (email: string) => Promise<{ fout?: string }>;
  logUit: () => Promise<void>;
}

const StoreContext = createContext<StoreWaarde | null>(null);

function leesLokaal(): Opslag {
  try {
    const ruw = localStorage.getItem(OPSLAG_SLEUTEL);
    if (ruw) {
      const data = JSON.parse(ruw) as Opslag;
      return { profiel: data.profiel ?? null, favorieten: Array.isArray(data.favorieten) ? data.favorieten : [] };
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
  interesses: string[];
  niveau: string;
  budget: number;
  max_reistijd: number;
}

interface FavorietRij {
  user_id: string;
  opleiding_id: string;
  toegevoegd: string;
  bezocht: boolean;
  cijfer: number | null;
  notitie: string | null;
}

const naarProfiel = (r: ProfielRij): Profiel => ({
  naam: r.naam ?? "",
  interesses: (r.interesses ?? []) as Sector[],
  niveau: (r.niveau ?? "beide") as Niveau | "beide",
  budget: r.budget,
  maxReistijd: r.max_reistijd,
});

const naarFavoriet = (r: FavorietRij): Favoriet => ({
  opleidingId: r.opleiding_id,
  toegevoegd: r.toegevoegd,
  bezocht: r.bezocht,
  cijfer: r.cijfer,
  notitie: r.notitie ?? "",
});

const profielRij = (g: Gebruiker, p: Profiel): ProfielRij => ({
  id: g.id,
  email: g.email,
  naam: p.naam,
  interesses: p.interesses,
  niveau: p.niveau,
  budget: p.budget,
  max_reistijd: p.maxReistijd,
});

const favorietRij = (g: Gebruiker, f: Favoriet): FavorietRij => ({
  user_id: g.id,
  opleiding_id: f.opleidingId,
  toegevoegd: f.toegevoegd,
  bezocht: f.bezocht,
  cijfer: f.cijfer,
  notitie: f.notitie,
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
        const fav: Favoriet = { opleidingId, toegevoegd: vandaag(), bezocht: false, cijfer: null, notitie: "" };
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
      profiel: data.profiel ?? { ...STANDAARD_PROFIEL, interesses: [] },
      heeftProfiel: !!data.profiel,
      favorieten: data.favorieten,
      isFavoriet: (id) => data.favorieten.some((f) => f.opleidingId === id),
      slaProfielOp,
      wisselFavoriet,
      werkFavorietBij,
      stuurInloglink,
      logUit,
    }),
    [geladen, gebruiker, data, slaProfielOp, wisselFavoriet, werkFavorietBij, stuurInloglink, logUit],
  );

  return <StoreContext.Provider value={waarde}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore moet binnen <StoreProvider> staan");
  return s;
}
