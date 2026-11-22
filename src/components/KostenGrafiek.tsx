"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { euro } from "@/lib/bereken";
import type { Resultaat } from "@/lib/resultaten";
import { KOSTEN_KLEUREN } from "./ui";

export default function KostenGrafiek({ items }: { items: Resultaat[] }) {
  const data = items.map((r) => {
    const thuis = r.kosten.thuisMogelijk;
    return {
      naam: `${r.opleiding.naam} · ${r.stad.naam}`,
      Kamerhuur: thuis ? 0 : r.kosten.huur,
      Leefkosten: thuis ? r.kosten.leefThuis : r.kosten.leefUit,
      Collegegeld: Math.round(r.kosten.collegegeld),
      Boeken: Math.round(r.kosten.boeken),
    };
  });
  const reeksen = [
    ["Kamerhuur", KOSTEN_KLEUREN.huur],
    ["Leefkosten", KOSTEN_KLEUREN.leef],
    ["Collegegeld", KOSTEN_KLEUREN.collegegeld],
    ["Boeken", KOSTEN_KLEUREN.boeken],
  ] as const;

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, items.length * 56 + 70)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 4 }} barCategoryGap={14}>
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
          width={150}
          tick={{ fill: "var(--ink)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => (v.length > 24 ? v.slice(0, 23) + "…" : v)}
        />
        <Tooltip
          cursor={{ fill: "var(--card-2)" }}
          formatter={(v: number) => euro(v)}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            color: "var(--ink)",
            fontSize: 13,
          }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, color: "var(--muted)" }} />
        {reeksen.map(([naam, kleur], i) => (
          <Bar
            key={naam}
            dataKey={naam}
            stackId="kosten"
            fill={kleur}
            radius={i === reeksen.length - 1 ? [0, 6, 6, 0] : 0}
            stroke="var(--card)"
            strokeWidth={1}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
