import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OPLEIDINGEN } from "@/data/opleidingen";
import { OpleidingDetail } from "./OpleidingDetail";

export function generateStaticParams() {
  return OPLEIDINGEN.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const o = OPLEIDINGEN.find((x) => x.id === id);
  return o ? { title: `${o.naam} – ${o.instelling}`, description: o.omschrijving } : {};
}

export default async function Pagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!OPLEIDINGEN.some((o) => o.id === id)) notFound();
  return <OpleidingDetail id={id} />;
}
