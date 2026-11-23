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
  const tel = (s: string) => hier.filter((o) => o.soort === s).length;
  return new ImageResponse(
    <DeelAfbeelding
      label={plaats?.provincie ?? "Studieplaats"}
      titel={`Studeren in ${plaats ? plaatsNaam(plaats.naam) : "Nederland"}`}
      sub={`${hier.length} opleidingen · kosten, scholen en studentenleven`}
      chips={[`${tel("mbo")} mbo`, `${tel("hbo")} hbo`, `${tel("wo")} wo`]}
    />,
    ogOpties(),
  );
}
