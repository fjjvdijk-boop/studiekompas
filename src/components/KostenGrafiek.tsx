"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { euro, plaatsNaam } from "@/lib/bereken";
import type { Resultaat } from "@/lib/resultaten";
import { KOSTEN_KLEUREN } from "./ui";

export default function KostenGrafiek({ items }: { items: Resultaat[] }) {
  const data = items.map((r) => {
    const thuis = r.kosten.thuisMogelijk;
    return {
      naam: `${r.opleiding.naam} · ${plaatsNaam(r.opleiding.plaats.naam)}`,
      Kamerhuur: thuis ? 0 : r.kosten.huur,
      Leefkosten: thuis ? r.kosten.leefThuis : r.kosten.leefUit,
      "College-/lesgeld": Math.round(r.kosten.schoolgeld),
      Boeken: Math.round(r.kosten.boeken),
    };
  });
  const reeksen = [
    ["Kamerhuur", KOSTEN_KLEUREN.huur],
    ["Leefkosten", KOSTEN_KLEUREN.leef],
    ["College-/lesgeld", KOSTEN_KLEUREN.schoolgeld],
    ["Boeken", KOSTEN_KLEUREN.boeken],
  ] as const;
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, items.length * 58 + 80)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 4 }} barCategoryGap={16}>
        <CartesianGrid horizontal={false} stroke="var(--line)" />
        <XAxis
          type="number"
          tickFormatter={(v) => euro(v)}
          tick={{ fill: "var(--muted)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="naam"
          width={170}
          tick={{ fill: "var(--ink)", fontSize: 12, fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => (v.length > 26 ? v.slice(0, 25) + "…" : v)}
        />
        <Tooltip
          cursor={{ fill: "var(--card-2)" }}
          formatter={(v: number) => euro(v)}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            color: "var(--ink)",
            fontSize: 13,
          }}
          labelStyle={{ fontWeight: 700, marginBottom: 4 }}
        />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, color: "var(--muted)" }} />
        {reeksen.map(([naam, kleur], i) => (
          <Bar
            key={naam}
            dataKey={naam}
            stackId="k"
            fill={kleur}
            radius={i === reeksen.length - 1 ? [0, 8, 8, 0] : 0}
            stroke="var(--card)"
            strokeWidth={2}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
