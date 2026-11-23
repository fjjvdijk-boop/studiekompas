"use client";

import { useEffect, useState } from "react";

export type Thema = "systeem" | "licht" | "donker";
import { THEMA_SLEUTEL } from "./thema-script";

export function leesThema(): Thema {
  try {
    const t = localStorage.getItem(THEMA_SLEUTEL);
    return t === "licht" || t === "donker" ? t : "systeem";
  } catch {
    return "systeem";
  }
}

export function zetThema(t: Thema) {
  try {
    if (t === "systeem") localStorage.removeItem(THEMA_SLEUTEL);
    else localStorage.setItem(THEMA_SLEUTEL, t);
  } catch {
    /* geen opslag: alleen voor nu */
  }
  const el = document.documentElement;
  if (t === "licht") el.dataset.theme = "light";
  else if (t === "donker") el.dataset.theme = "dark";
  else delete el.dataset.theme;
}

/** Is het donkere thema nu actief (gekozen of via het systeem)? */
export function useDonker() {
  const [donker, setDonker] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const bepaal = () => {
      const t = document.documentElement.dataset.theme;
      setDonker(t === "dark" || (t !== "light" && mq.matches));
    };
    bepaal();
    mq.addEventListener("change", bepaal);
    const mo = new MutationObserver(bepaal);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      mq.removeEventListener("change", bepaal);
      mo.disconnect();
    };
  }, []);
  return donker;
}
