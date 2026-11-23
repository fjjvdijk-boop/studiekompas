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
    <div
      style={{
        width: maat,
        height: maat,
        borderRadius: maat * 0.28,
        background: "linear-gradient(135deg, #7c6cff, #4f39f6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,.35)",
      }}
    >
      <svg width={maat * 0.7} height={maat * 0.7} viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="20" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="2.5" />
        <path d="M32 12 L38.5 32 L32 52 L25.5 32 Z" fill="#fff" />
        <path d="M32 12 L38.5 32 L25.5 32 Z" fill="#ff9f1c" />
        <circle cx="32" cy="32" r="3.2" fill="#4f39f6" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </div>
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
        background: "#16123a",
        backgroundImage:
          "radial-gradient(circle at 85% 10%, rgba(124,108,255,.65), transparent 45%), radial-gradient(circle at 10% 110%, rgba(255,159,28,.35), transparent 45%)",
        color: "white",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Kompas maat={72} />
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>StudieKompas</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#b3a9ff" }}>
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
        <div style={{ fontSize: 32, color: "rgba(255,255,255,.75)", marginTop: 18 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {chips.map((c) => (
          <div
            key={c}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,.12)",
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
