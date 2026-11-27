"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { HOOFDRICHTINGEN, SECTOR } from "@/data/sectoren";
import type { SectorId } from "@/lib/types";

/** Radargrafiek met je interesse per richting: je persoonlijke kompas */
export default function KompasRadar({
  interesse,
  hoogte = 340,
}: {
  interesse: Partial<Record<SectorId, number>>;
  hoogte?: number;
}) {
  const data = HOOFDRICHTINGEN.map((s) => ({ naam: SECTOR[s].kort, waarde: Math.round((interesse[s] ?? 0) * 100) }));
  return (
    <ResponsiveContainer width="100%" height={hoogte}>
      <RadarChart data={data} outerRadius="70%" margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
        <PolarGrid stroke="var(--line)" />
        <PolarAngleAxis dataKey="naam" tick={{ fill: "var(--muted)", fontSize: 12, fontFamily: "var(--font-sans)" }} />
        <Radar
          dataKey="waarde"
          stroke="var(--ink)"
          strokeWidth={1.75}
          fill="var(--brand)"
          fillOpacity={0.18}
          dot={{ r: 2.5, fill: "var(--ink)" }}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
