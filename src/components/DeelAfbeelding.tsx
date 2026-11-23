/* Gedeelde opmaak voor de preview-afbeeldingen (Open Graph), gemaakt met next/og */
import { readFileSync } from "fs";
import path from "path";

export const OG_MAAT = { width: 1200, height: 630 };

const lees = (bestand: string) => readFileSync(path.join(process.cwd(), "assets", "fonts", bestand));

/** Lettertypes voor de afbeeldingen (Geist, uit assets/fonts) */
export function ogOpties() {
  return {
    ...OG_MAAT,
    fonts: [
      { name: "Geist", data: lees("Geist-Regular.ttf"), weight: 400 as const, style: "normal" as const },
      { name: "Geist", data: lees("Geist-SemiBold.ttf"), weight: 600 as const, style: "normal" as const },
      { name: "Geist", data: lees("Geist-Black.ttf"), weight: 800 as const, style: "normal" as const },
    ],
  };
}

function Kompas({ maat }: { maat: number }) {
  return (
    <svg width={maat} height={maat} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="29" fill="none" stroke="#17160f" strokeWidth="2.5" />
      <path d="M32 3v6M32 55v6M3 32h6M55 32h6" stroke="#17160f" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 12 L38 32 L32 52 L26 32 Z" fill="#17160f" />
      <path d="M32 12 L38 32 L26 32 Z" fill="#b9472f" />
      <circle cx="32" cy="32" r="2.6" fill="#f6f3ec" />
    </svg>
  );
}

export function DeelAfbeelding({
  label,
  titel,
  sub,
  chips = [],
}: {
  label: string;
  titel: string;
  sub: string;
  chips?: string[];
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#f6f3ec",
        color: "#17160f",
        borderBottom: "14px solid #1e4d3b",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Kompas maat={72} />
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>StudieKompas</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: "#b3a9ff" }}>
          {label}
        </div>
        <div
          style={{
            fontSize: titel.length > 32 ? 64 : 84,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: -2,
            marginTop: 12,
            maxWidth: 1000,
          }}
        >
          {titel}
        </div>
        <div style={{ fontSize: 32, color: "#625e55", marginTop: 18 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {chips.map((c) => (
          <div
            key={c}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              border: "2px solid #17160f",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
