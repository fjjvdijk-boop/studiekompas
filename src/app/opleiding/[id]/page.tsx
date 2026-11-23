import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plaatsNaam } from "@/lib/bereken";
import { dataOpServer } from "@/lib/data-server";
import { OpleidingDetail } from "./OpleidingDetail";

// Pagina's worden bij het eerste bezoek gemaakt en daarna bewaard (er zijn er ruim 10.000)
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const o = dataOpServer().perId.get(id);
  if (!o) return {};
  return {
    title: `${o.naam} – ${o.instelling.naam}`,
    description: `Bachelor ${o.naam} aan de ${o.instelling.naam} in ${plaatsNaam(o.plaats.naam)}: kosten, studiefinanciering, toelating, kamers en studentenleven.`,
  };
}

export default async function Pagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = dataOpServer();
  const opleiding = data.perId.get(id);
  if (!opleiding) notFound();
  const elders = data.opleidingen
    .filter((o) => o.naam === opleiding.naam && o.soort === opleiding.soort && o.id !== id)
    .slice(0, 40);
  const hier = data.opleidingen
    .filter(
      (o) =>
        o.plaats.naam === opleiding.plaats.naam &&
        o.sector === opleiding.sector &&
        o.id !== id &&
        o.naam !== opleiding.naam,
    )
    .slice(0, 30);
  return <OpleidingDetail opleiding={opleiding} elders={elders} hier={hier} />;
}
