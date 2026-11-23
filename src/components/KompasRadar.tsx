"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { SECTOREN } from "@/data/sectoren";
import type { SectorId } from "@/lib/types";

/** Radargrafiek met je interesse per sector: je persoonlijke "kompas" */
export default function KompasRadar({
  interesse,
  hoogte = 340,
}: {
  interesse: Partial<Record<SectorId, number>>;
  hoogte?: number;
}) {
  const data = SECTOREN.map((s) => ({
    naam: `${s.emoji} ${s.kort}`,
    waarde: Math.round((interesse[s.id] ?? 0) * 100),
  }));
  return (
    <ResponsiveContainer width="100%" height={hoogte}>
      <RadarChart data={data} outerRadius="68%" margin={{ top: 8, right: 34, bottom: 8, left: 34 }}>
        <defs>
          <linearGradient id="radar-vulling" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c6cff" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#ff9f1c" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="var(--line)" />
        <PolarAngleAxis dataKey="naam" tick={{ fill: "var(--muted)", fontSize: 11, fontWeight: 600 }} />
        <Radar
          dataKey="waarde"
          stroke="var(--brand)"
          strokeWidth={2.5}
          fill="url(#radar-vulling)"
          dot={{ r: 3, fill: "var(--brand)" }}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
