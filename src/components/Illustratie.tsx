import { SECTOR } from "@/data/sectoren";
import type { SectorId } from "@/lib/types";

/**
 * Getekende illustraties per richting (eigen SVG's, geen stockfoto's).
 * Lijnen in inktkleur, vlakken in de kleur van de richting.
 */
export function Illustratie({
  sector,
  className = "",
  tekenen = false,
}: {
  sector: SectorId;
  className?: string;
  tekenen?: boolean;
}) {
  const k = SECTOR[sector].kleur;
  const vlak = `color-mix(in oklab, ${k} 22%, var(--card))`;
  const licht = `color-mix(in oklab, ${k} 10%, var(--card))`;
  const lijn: Lijn = {
    fill: "none",
    stroke: "var(--ink)",
    strokeWidth: 2.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const tekening = TEKENINGEN[sector] ?? TEKENINGEN.taal!;
  return (
    <svg
      viewBox="0 0 240 160"
      className={`${tekenen ? "teken" : ""} ${className}`}
      role="img"
      aria-label={SECTOR[sector].naam}
    >
      <rect x="0" y="0" width="240" height="160" fill={licht} />
      <line x1="0" y1="138" x2="240" y2="138" stroke="var(--line)" strokeWidth="1.5" />
      {tekening({ k, vlak, lijn })}
    </svg>
  );
}

interface Lijn {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeLinecap: "round";
  strokeLinejoin: "round";
}
type Tekening = (p: { k: string; vlak: string; lijn: Lijn }) => React.ReactNode;

const TEKENINGEN: Partial<Record<SectorId, Tekening>> = {
  beta: ({ k, vlak, lijn }) => (
    <>
      <path d="M92 32h28M98 32v34l-30 52a8 8 0 0 0 7 12h62a8 8 0 0 0 7-12l-30-52V32" {...lijn} />
      <path d="M78 104h56l9 16a6 6 0 0 1-5 9H74a6 6 0 0 1-5-9z" fill={vlak} />
      <circle cx="100" cy="112" r="4" fill={k} />
      <circle cx="114" cy="100" r="3" fill={k} />
      <ellipse cx="182" cy="62" rx="30" ry="11" {...lijn} />
      <ellipse cx="182" cy="62" rx="30" ry="11" transform="rotate(60 182 62)" {...lijn} />
      <ellipse cx="182" cy="62" rx="30" ry="11" transform="rotate(-60 182 62)" {...lijn} />
      <circle cx="182" cy="62" r="6" fill={k} />
    </>
  ),
  techniek: ({ k, vlak, lijn }) => (
    <>
      <path d="M20 118c40-60 120-60 160 0" {...lijn} />
      <path d="M20 118h160" {...lijn} />
      {[50, 80, 110, 140].map((x) => (
        <line key={x} x1={x} y1={x === 50 || x === 140 ? 96 : 82} x2={x} y2="118" stroke="var(--ink)" strokeWidth="2" />
      ))}
      <rect x="18" y="118" width="14" height="20" fill={vlak} />
      <rect x="168" y="118" width="14" height="20" fill={vlak} />
      <g transform="translate(196 50)">
        <circle r="17" fill={vlak} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="-4" y="-25" width="8" height="10" rx="2" fill={k} transform={`rotate(${i * 45})`} />
        ))}
        <circle r="17" {...lijn} />
        <circle r="6" fill="var(--card)" stroke="var(--ink)" strokeWidth="2.4" />
      </g>
    </>
  ),
  ict: ({ k, vlak, lijn }) => (
    <>
      <rect x="58" y="34" width="124" height="80" rx="6" fill={vlak} />
      <rect x="58" y="34" width="124" height="80" rx="6" {...lijn} />
      <path d="M40 126h160l-10-12H50z" {...lijn} />
      <path d="M100 62l-14 12 14 12M140 62l14 12-14 12M126 56l-12 36" {...lijn} stroke={k} />
      <circle cx="208" cy="40" r="5" fill={k} />
      <circle cx="222" cy="66" r="5" fill={k} />
      <circle cx="200" cy="80" r="5" fill={k} />
      <path d="M208 40l14 26-22 14" {...lijn} strokeWidth={1.6} />
    </>
  ),
  zorg: ({ k, vlak, lijn }) => (
    <>
      <path d="M120 126C80 100 56 80 56 56a24 24 0 0 1 64-14 24 24 0 0 1 64 14c0 24-24 44-64 70z" fill={vlak} />
      <path d="M120 126C80 100 56 80 56 56a24 24 0 0 1 64-14 24 24 0 0 1 64 14c0 24-24 44-64 70z" {...lijn} />
      <path d="M24 84h56l10-22 14 44 12-30 8 8h92" {...lijn} stroke={k} strokeWidth={2.8} />
      <path d="M196 30v20M186 40h20" {...lijn} />
    </>
  ),
  natuur: ({ k, vlak, lijn }) => (
    <>
      <circle cx="186" cy="40" r="16" fill={vlak} />
      <circle cx="186" cy="40" r="16" {...lijn} />
      <path d="M0 138l56-56 34 30 38-48 62 74" fill={vlak} />
      <path d="M0 138l56-56 34 30 38-48 62 74" {...lijn} />
      <path d="M54 130c0-40 30-60 60-62-2 32-24 58-60 62z" fill={k} opacity=".85" />
      <path d="M54 130c16-22 34-40 56-58" {...lijn} stroke="var(--card)" strokeWidth={2} />
    </>
  ),
  welzijn: ({ k, vlak, lijn }) => (
    <>
      <circle cx="78" cy="70" r="16" {...lijn} />
      <path d="M48 128c0-22 13-34 30-34s30 12 30 34" {...lijn} />
      <circle cx="158" cy="76" r="16" fill={vlak} />
      <circle cx="158" cy="76" r="16" {...lijn} />
      <path d="M128 132c0-22 13-34 30-34s30 12 30 34" fill={vlak} />
      <path d="M128 132c0-22 13-34 30-34s30 12 30 34" {...lijn} />
      <path
        d="M96 22h44a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8h-24l-12 10v-10h-8a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8z"
        fill={k}
        opacity=".9"
      />
      <path d="M104 36h28" stroke="var(--card)" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  economie: ({ k, vlak, lijn }) => (
    <>
      {[
        [40, 96],
        [76, 78],
        [112, 86],
        [148, 56],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="24"
          height={138 - y}
          fill={i === 3 ? k : vlak}
          stroke="var(--ink)"
          strokeWidth="2.2"
        />
      ))}
      <path d="M34 74l42-22 34 10 52-34" {...lijn} />
      <path d="M150 28h14v14" {...lijn} />
      <circle cx="204" cy="104" r="18" fill={vlak} />
      <circle cx="204" cy="104" r="18" {...lijn} />
      <path d="M204 94v20M198 99h9a4 4 0 0 1 0 8h-6" {...lijn} strokeWidth={2} />
    </>
  ),
  recht: ({ k, vlak, lijn }) => (
    <>
      <path d="M120 28v98M92 130h56M60 46h120" {...lijn} />
      <circle cx="120" cy="26" r="5" fill={k} />
      <path d="M68 46l-22 44h44z" {...lijn} />
      <path d="M46 90a22 10 0 0 0 44 0z" fill={vlak} stroke="var(--ink)" strokeWidth="2.4" />
      <path d="M172 46l-22 44h44z" {...lijn} />
      <path d="M150 90a22 10 0 0 0 44 0z" fill={k} stroke="var(--ink)" strokeWidth="2.4" />
    </>
  ),
  taal: ({ k, vlak, lijn }) => (
    <>
      <path d="M40 46c24-8 48-8 72 6v76c-24-14-48-14-72-6z" fill={vlak} />
      <path d="M184 46c-24-8-48-8-72 6v76c24-14 48-14 72-6z" fill="var(--card)" />
      <path d="M40 46c24-8 48-8 72 6v76c-24-14-48-14-72-6zM184 46c-24-8-48-8-72 6v76c24-14 48-14 72-6z" {...lijn} />
      {[66, 80, 94].map((y) => (
        <path key={y} d={`M128 ${y}c14-5 28-5 42-1`} {...lijn} strokeWidth={1.6} stroke={k} />
      ))}
      <path d="M206 30c-14 10-30 34-36 60l6-2c8-22 22-42 30-58z" fill={k} />
    </>
  ),
  creatief: ({ k, vlak, lijn }) => (
    <>
      <rect x="44" y="30" width="96" height="76" fill={vlak} />
      <rect x="44" y="30" width="96" height="76" {...lijn} />
      <path d="M52 98l26-30 18 18 14-12 22 24" {...lijn} />
      <circle cx="116" cy="50" r="7" fill={k} />
      <path d="M70 106l-14 28M114 106l14 28" {...lijn} />
      <rect x="160" y="54" width="56" height="62" rx="4" fill="var(--card)" stroke="var(--ink)" strokeWidth="2.4" />
      {[62, 80, 98].map((y) => (
        <rect key={y} x="166" y={y} width="44" height="12" fill={k} opacity=".8" />
      ))}
    </>
  ),
};
