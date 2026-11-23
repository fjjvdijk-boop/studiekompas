import { ImageResponse } from "next/og";
import { DeelAfbeelding, OG_MAAT, ogOpties } from "@/components/DeelAfbeelding";
import { plaatsNaam, plaatsSlug } from "@/lib/bereken";
import { dataOpServer } from "@/lib/data-server";

export const alt = "Studeren in deze plaats";
export const size = OG_MAAT;
export const contentType = "image/png";

export default async function Afbeelding({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const data = dataOpServer();
  const plaats = data.plaatsen.find((p) => plaatsSlug(p.naam) === slug);
  const hier = plaats ? data.opleidingen.filter((o) => o.plaats.naam === plaats.naam) : [];
  const unis = new Set(hier.map((o) => o.instelling.naam)).size;
  return new ImageResponse(
    <DeelAfbeelding
      label={plaats?.provincie ?? "Studieplaats"}
      titel={`Studeren in ${plaats ? plaatsNaam(plaats.naam) : "Nederland"}`}
      sub={`${hier.length} bachelors · kosten, kamers en studentenleven`}
      chips={[`${unis} ${unis === 1 ? "universiteit" : "universiteiten"}`, "Kamer vinden", "Geld & DUO"]}
    />,
    ogOpties(),
  );
}
