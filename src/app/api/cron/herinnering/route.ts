import { createClient } from "@supabase/supabase-js";
import { OPEN_DAGEN } from "@/data/opendagen";
import { datumTekst, opleidingVan, stadVan, telDagenOp, vandaag } from "@/lib/bereken";

export const dynamic = "force-dynamic";

/** Hoeveel dagen van tevoren de herinnering wordt gestuurd */
const DAGEN_VOORAF = 3;

/**
 * Dagelijkse taak (zie vercel.json): mailt iedereen die een opleiding als favoriet heeft
 * waarvan over 3 dagen een open dag is.
 *
 * Nodig in Vercel → Settings → Environment Variables:
 *   CRON_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, MAIL_VAN (optioneel)
 */
export async function GET(req: Request) {
  const geheim = process.env.CRON_SECRET;
  if (!geheim || req.headers.get("authorization") !== `Bearer ${geheim}`) {
    return Response.json({ fout: "Niet toegestaan" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!url || !serviceKey || !resendKey) {
    return Response.json({ fout: "Supabase of Resend is niet ingesteld" }, { status: 500 });
  }

  const doel = telDagenOp(vandaag(), DAGEN_VOORAF);
  const dagen = OPEN_DAGEN.filter((d) => d.datum === doel);
  if (!dagen.length) return Response.json({ datum: doel, verstuurd: 0 });

  // De service role key mag langs de beveiliging (row level security): alleen op de server gebruiken!
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: favs, error } = await db
    .from("favorieten")
    .select("user_id, opleiding_id")
    .in(
      "opleiding_id",
      dagen.map((d) => d.opleidingId),
    );
  if (error) return Response.json({ fout: error.message }, { status: 500 });

  const perGebruiker = new Map<string, string[]>();
  for (const f of favs ?? []) perGebruiker.set(f.user_id, [...(perGebruiker.get(f.user_id) ?? []), f.opleiding_id]);

  let verstuurd = 0;
  const fouten: string[] = [];
  for (const [userId, opleidingIds] of perGebruiker) {
    const { data: u } = await db.auth.admin.getUserById(userId);
    const email = u.user?.email;
    if (!email) continue;
    const { data: profiel } = await db.from("profielen").select("naam").eq("id", userId).maybeSingle();

    const items = dagen
      .filter((d) => opleidingIds.includes(d.opleidingId))
      .map((d) => ({ d, o: opleidingVan(d.opleidingId)! }));
    const titel =
      items.length === 1
        ? `Over ${DAGEN_VOORAF} dagen: ${items[0].d.soort.toLowerCase()} ${items[0].o.naam}`
        : `Over ${DAGEN_VOORAF} dagen: ${items.length} open dagen`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_VAN ?? "StudieKompas <onboarding@resend.dev>",
        to: email,
        subject: titel,
        html: mail(profiel?.naam ?? "", doel, items, new URL(req.url).origin),
      }),
    });
    if (res.ok) verstuurd++;
    else fouten.push(`${res.status}`);
  }

  return Response.json({ datum: doel, verstuurd, fouten });
}

const ontsnap = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function mail(
  naam: string,
  datum: string,
  items: { d: (typeof OPEN_DAGEN)[0]; o: NonNullable<ReturnType<typeof opleidingVan>> }[],
  basis: string,
) {
  const blokken = items
    .map(
      ({ d, o }) => `
      <tr><td style="padding:16px;border:1px solid #e3e6ef;border-radius:12px">
        <div style="font-size:12px;color:#5b6478;text-transform:uppercase;letter-spacing:.04em">${ontsnap(d.soort)} · ${d.start}–${d.eind}</div>
        <div style="font-size:17px;font-weight:600;margin:4px 0">${ontsnap(o.naam)}</div>
        <div style="color:#5b6478">${ontsnap(o.instelling)}, ${ontsnap(stadVan(o).naam)} · ${stadVan(o).reistijd} min vanaf Wierden</div>
        <a href="${basis}/opleiding/${o.id}" style="display:inline-block;margin-top:12px;color:#4338ca;font-weight:600">Bekijk in StudieKompas →</a>
      </td></tr><tr><td style="height:10px"></td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f5f6fa;font-family:system-ui,-apple-system,sans-serif;color:#0e1630">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table width="100%" style="max-width:520px;background:#fff;border-radius:20px;padding:28px" cellpadding="0" cellspacing="0">
    <tr><td style="font-size:20px;font-weight:700;color:#4338ca;padding-bottom:16px">🧭 StudieKompas</td></tr>
    <tr><td style="font-size:16px;padding-bottom:16px">Hoi${naam ? " " + ontsnap(naam) : ""}! Op <strong>${datumTekst(datum)}</strong> is er een open dag van een van je favorieten.</td></tr>
    ${blokken}
    <tr><td style="font-size:14px;color:#5b6478;padding-top:8px">Na afloop kun je in de app een cijfer en notitie geven. Succes met kiezen!</td></tr>
  </table></td></tr></table></body></html>`;
}
