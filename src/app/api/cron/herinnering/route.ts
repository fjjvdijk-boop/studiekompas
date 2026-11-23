import { createClient } from "@supabase/supabase-js";
import { datumTekst, plaatsNaam, telDagenOp, vandaag } from "@/lib/bereken";
import { dataOpServer } from "@/lib/data-server";
import type { Opleiding } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Hoeveel dagen van tevoren de herinnering wordt gestuurd */
const DAGEN_VOORAF = 3;

/**
 * Dagelijkse taak (zie vercel.json): mailt iedereen die over 3 dagen naar een open dag gaat
 * (de datum die je zelf bij een favoriet hebt ingevuld).
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
  // De service role key mag langs de beveiliging (row level security): alleen op de server gebruiken!
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: favs, error } = await db.from("favorieten").select("user_id, opleiding_id").eq("open_dag", doel);
  if (error) return Response.json({ fout: error.message }, { status: 500 });

  const { perId } = dataOpServer();
  const perGebruiker = new Map<string, Opleiding[]>();
  for (const f of favs ?? []) {
    const o = perId.get(f.opleiding_id);
    if (o) perGebruiker.set(f.user_id, [...(perGebruiker.get(f.user_id) ?? []), o]);
  }

  let verstuurd = 0;
  const fouten: string[] = [];
  for (const [userId, opleidingen] of perGebruiker) {
    const { data: u } = await db.auth.admin.getUserById(userId);
    const email = u.user?.email;
    if (!email) continue;
    const { data: profiel } = await db.from("profielen").select("naam").eq("id", userId).maybeSingle();
    const titel =
      opleidingen.length === 1
        ? `Over ${DAGEN_VOORAF} dagen: open dag ${opleidingen[0].naam}`
        : `Over ${DAGEN_VOORAF} dagen: ${opleidingen.length} open dagen`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_VAN ?? "StudieKompas <onboarding@resend.dev>",
        to: email,
        subject: titel,
        html: mail(profiel?.naam ?? "", doel, opleidingen, new URL(req.url).origin),
      }),
    });
    if (res.ok) verstuurd++;
    else fouten.push(String(res.status));
  }
  return Response.json({ datum: doel, verstuurd, fouten });
}

const ontsnap = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function mail(naam: string, datum: string, items: Opleiding[], basis: string) {
  const blokken = items
    .map(
      (o) => `
      <tr><td style="padding:16px;border:1px solid #e3e6ef;border-radius:12px">
        <div style="font-size:12px;color:#5b6478;text-transform:uppercase;letter-spacing:.04em">Open dag · ${o.niveau.toUpperCase()}</div>
        <div style="font-size:17px;font-weight:600;margin:4px 0">${ontsnap(o.naam)}</div>
        <div style="color:#5b6478">${ontsnap(o.instelling.naam)}, ${ontsnap(plaatsNaam(o.plaats.naam))}</div>
        <a href="${basis}/opleiding/${o.id}" style="display:inline-block;margin-top:12px;color:#1e4d3b;font-weight:600">Bekijk in StudieKompas →</a>
      </td></tr><tr><td style="height:10px"></td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f5f6fa;font-family:system-ui,-apple-system,sans-serif;color:#0e1630">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table width="100%" style="max-width:520px;background:#fff;border-radius:20px;padding:28px" cellpadding="0" cellspacing="0">
    <tr><td style="font-size:20px;font-weight:600;color:#17160f;padding-bottom:16px;font-family:Georgia,serif">StudieKompas</td></tr>
    <tr><td style="font-size:16px;padding-bottom:16px">Hoi${naam ? " " + ontsnap(naam) : ""}! Op <strong>${datumTekst(datum)}</strong> ga je naar een open dag.</td></tr>
    ${blokken}
    <tr><td style="font-size:14px;color:#5b6478;padding-top:8px">Na afloop kun je in de app een cijfer en notitie geven. Veel plezier!</td></tr>
  </table></td></tr></table></body></html>`;
}
