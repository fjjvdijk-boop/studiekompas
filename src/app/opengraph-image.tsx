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
      label="Studiekeuze voor de universiteit"
      titel="Welke studie past bij jou?"
      sub={`Alle ${s.totaal} universitaire bachelors, met DUO en kamers.`}
      chips={["Studietest", "Geld & DUO", "Kamer vinden"]}
    />,
    ogOpties(),
  );
}
