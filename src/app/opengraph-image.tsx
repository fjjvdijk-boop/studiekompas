import { ImageResponse } from "next/og";
import { DeelAfbeelding, OG_MAAT, ogOpties } from "@/components/DeelAfbeelding";
import { statistiek } from "@/lib/statistiek";

export const alt = "StudieKompas – vind de studie die bij je past";
export const size = OG_MAAT;
export const contentType = "image/png";

export default function Afbeelding() {
  const s = statistiek();
  return new ImageResponse(
    <DeelAfbeelding
      label="Studiekeuze"
      titel="Vind de studie die echt bij je past."
      sub="Doe de studietest en zie wat studeren je per maand kost."
      chips={[`${s.mbo.toLocaleString("nl-NL")} mbo`, `${s.hbo.toLocaleString("nl-NL")} hbo`, `${s.wo} wo`]}
    />,
    ogOpties(),
  );
}
