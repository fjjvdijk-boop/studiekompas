import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plaatsNaam, plaatsSlug } from "@/lib/bereken";
import { dataOpServer } from "@/lib/data-server";
import { PlaatsDetail } from "./PlaatsDetail";

export function generateStaticParams() {
  return dataOpServer().plaatsen.map((p) => ({ slug: plaatsSlug(p.naam) }));
}

function zoek(slug: string) {
  const data = dataOpServer();
  const plaats = data.plaatsen.find((p) => plaatsSlug(p.naam) === slug);
  return plaats ? { plaats, opleidingen: data.opleidingen.filter((o) => o.plaats.naam === plaats.naam) } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = zoek((await params).slug);
  if (!r) return {};
  return {
    title: `Studeren in ${plaatsNaam(r.plaats.naam)}`,
    description: `${r.opleidingen.length} opleidingen in ${plaatsNaam(r.plaats.naam)}: kosten, reistijd, scholen en studentenverenigingen.`,
  };
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const r = zoek((await params).slug);
  if (!r) notFound();
  return <PlaatsDetail plaats={r.plaats} opleidingen={r.opleidingen} />;
}
