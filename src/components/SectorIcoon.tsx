import {
  Activity,
  BookOpen,
  Cog,
  Cpu,
  FlaskConical,
  GraduationCap,
  Leaf,
  Map,
  Palette,
  Scale,
  Ship,
  Stethoscope,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SECTOR } from "@/data/sectoren";
import type { SectorId } from "@/lib/types";

export const SECTOR_ICOON: Record<SectorId, LucideIcon> = {
  beta: FlaskConical,
  techniek: Cog,
  ict: Cpu,
  zorg: Stethoscope,
  natuur: Leaf,
  welzijn: Users,
  economie: TrendingUp,
  recht: Scale,
  taal: BookOpen,
  creatief: Palette,
  onderwijs: GraduationCap,
  sport: Activity,
  horeca: Map,
  logistiek: Ship,
};

/** Rustig icoon in een vierkantje met de kleur van de richting */
export function SectorIcoon({ sector, maat = 40 }: { sector: SectorId; maat?: number }) {
  const Icoon = SECTOR_ICOON[sector];
  const s = SECTOR[sector];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{
        width: maat,
        height: maat,
        color: s.kleur,
        background: `color-mix(in oklab, ${s.kleur} 11%, var(--card))`,
      }}
      aria-hidden
    >
      <Icoon style={{ width: maat * 0.48, height: maat * 0.48 }} strokeWidth={1.75} />
    </span>
  );
}
