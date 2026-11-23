"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { leesThema, zetThema, type Thema } from "@/lib/thema";

const VOLGENDE: Record<Thema, Thema> = { systeem: "licht", licht: "donker", donker: "systeem" };
const LABEL: Record<Thema, string> = {
  systeem: "Thema: zoals je apparaat",
  licht: "Thema: licht",
  donker: "Thema: donker",
};

export function ThemaKnop() {
  const [thema, setThema] = useState<Thema>("systeem");
  useEffect(() => setThema(leesThema()), []);
  const Icoon = thema === "licht" ? Sun : thema === "donker" ? Moon : Monitor;
  return (
    <button
      type="button"
      onClick={() => {
        const t = VOLGENDE[thema];
        zetThema(t);
        setThema(t);
      }}
      aria-label={`${LABEL[thema]} (klik om te wisselen)`}
      title={LABEL[thema]}
      className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-ink transition-colors hover:border-brand"
    >
      <Icoon className="h-[18px] w-[18px]" />
    </button>
  );
}
