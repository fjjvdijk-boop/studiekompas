import { ImageResponse } from "next/og";
import { DeelAfbeelding, OG_MAAT, ogOpties } from "@/components/DeelAfbeelding";
import { NIVEAU_LABEL, SECTOR } from "@/data/sectoren";
import { plaatsNaam } from "@/lib/bereken";
import { dataOpServer } from "@/lib/data-server";

export const alt = "Opleiding op StudieKompas";
export const size = OG_MAAT;
export const contentType = "image/png";

export default async function Afbeelding({ params }: { params: Promise<{ id: string }> }) {
  const o = dataOpServer().perId.get((await params).id);
  return new ImageResponse(
    o ? (
      <DeelAfbeelding
        label={`${NIVEAU_LABEL[o.niveau]} · ${SECTOR[o.sector].naam}`}
        titel={o.naam}
        sub={`${o.instelling.naam} · ${plaatsNaam(o.plaats.naam)}`}
        chips={["Kosten per maand", "Reistijd", "Match-score"]}
      />
    ) : (
      <DeelAfbeelding label="Opleiding" titel="StudieKompas" sub="Alle opleidingen van Nederland" />
    ),
    ogOpties(),
  );
}
