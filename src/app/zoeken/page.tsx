import type { Metadata } from "next";
import { Suspense } from "react";
import { statistiek } from "@/lib/statistiek";
import { Zoeken } from "./Zoeken";

export const metadata: Metadata = {
  title: "Zoeken",
  description: "Zoek en filter in alle mbo-, hbo- en wo-opleidingen van Nederland.",
};

export default function Pagina() {
  return (
    <Suspense fallback={<div className="min-h-[150dvh]" aria-busy />}>
      <Zoeken totaal={statistiek().totaal} />
    </Suspense>
  );
}
