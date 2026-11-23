# 🧭 StudieKompas

**Alle mbo-, hbo- en wo-opleidingen van Nederland, een studiekeuzetest, en meteen zien wat studeren je per maand kost.**

StudieKompas is een web-app voor eindexamenleerlingen. De app koppelt open data over opleidingen (DUO), kamerhuur (Kamernet) en reistijd (NS) en maakt daar nieuwe informatie van: *wat kost studeren daar per maand, en kan ik thuis blijven wonen?*

Gemaakt voor de app-opdracht Informatica 6V.

---

## Functies

| Scherm | Wat je kunt doen |
|---|---|
| **Home** | Je beste matches, alle 14 richtingen, de voordeligste studentensteden en je volgende open dag |
| **Studietest** | 42 stellingen over 14 interessegebieden, plus je diploma, hoe je leert, wonen en budget. Resultaat: je persoonlijke "kompas" (radargrafiek), niveau-advies en je beste matches |
| **Zoeken** | Alle 10.538 opleidingen filteren op mbo/hbo/wo (en mbo-niveau 1–4 of Ad), richting, plaats en reistijd, en alleen tonen wat je met je diploma mag |
| **Opleiding** | Maandlasten (op kamer of thuis), reistijd-stoplicht, uitleg van je match-score, studentenleven en studieverenigingen, links, open dag plannen, cijfer en notitie |
| **Kaart** | Vectorkaart van Nederland met alle 154 studieplaatsen: grootte = aantal opleidingen, kleur = reistijd vanaf je woonplaats |
| **Plaats** | Per stad: kosten, scholen, richtingen, je beste matches en studentenverenigingen met links |
| **Mijn lijst** | Favorieten vergelijken (tabel en grafiek) en open dagen plannen in een kalender (ook als .ics in je agenda) |
| **Profiel** | Woonplaats (alle 2.503 woonplaatsen), diploma, wonen, budget, reistijd en je interesses bijstellen |

**Op de achtergrond:**
- **Echte data:** alle opleidingen komen uit DUO Open Onderwijsdata (zie `scripts/bouw-data.py`)
- **Maandlasten:** kamerhuur + leefkosten + collegegeld of lesgeld (2026/2027) + boeken ÷ 12
- **Reistijd:** vanaf je eigen woonplaats; vanaf Wierden gecontroleerde treintijden, anders een schatting op basis van afstand
- **Match-score (0–100):** interesse 45, niveau en leerstijl 15, budget 20, reistijd 20 punten (zie `src/lib/bereken.ts`)
- **Toelatingseisen:** je geeft je diploma op, en bij vmbo je leerweg, bij havo/vwo je profiel en vakken. Per opleiding checkt de app de landelijke profielvereisten (bijvoorbeeld wiskunde B + natuurkunde voor techniek aan de universiteit, biologie voor hbo-zorg met een EM/CM-profiel). Je ziet "✅ toelaatbaar", "⚠️ je mist natuurkunde" (een deficiëntie die je vaak kunt wegwerken) of "⛔ niet direct". Ook toelatingsexamens (kunst), sporttests (ALO), toetsen voor de pabo en numerus fixus worden genoemd. Zie `src/lib/toelating.ts`. Dit is een vereenvoudiging: scholen kunnen afwijken.
- **Alleen eigen favorieten:** row level security in de database (`supabase/schema.sql`)
- **E-mailherinnering:** 3 dagen voor een open dag die je hebt gepland
- Werkt op je telefoon, ook als app op je beginscherm (met eigen icoon)
- Thema-knop: licht, donker of zoals je apparaat
- Zoeken groepeert dezelfde opleiding op meerdere plekken ("+ 33 plekken") en vindt ook verwante woorden
- Studietest: tussenstand blijft bewaard, toetsen 1–5 om snel te antwoorden, en je kunt je kompas delen
- Mooie preview-afbeelding als je een link deelt (WhatsApp, Instagram …), sitemap voor zoekmachines

---

## Techniek

| Onderdeel | Gekozen |
|---|---|
| Framework | Next.js 15 + React + TypeScript |
| Opmaak | Tailwind CSS 4, lettertypes Bricolage Grotesque en Geist |
| Kaart | MapLibre GL met vectorkaarten van OpenFreeMap (gratis, geen sleutel) |
| Grafieken | Recharts |
| Data | Python-script dat DUO-bestanden omzet naar `public/data/*.json` |
| Database + inloggen | Supabase (optioneel) |
| E-mail | Resend (optioneel) |
| Hosting | Vercel |

### Mappen

```
scripts/bouw-data.py      Haalt de DUO-data op en maakt public/data/opleidingen.json
public/data/              Alle opleidingen en woonplaatsen (gegenereerd)
src/
  app/                    Pagina's (elke map = een URL)
    vragenlijst/          De studietest
    zoeken/               Zoeken en filteren
    opleiding/[id]/       Pagina per opleiding
    kaart/                De kaart
    plaats/[slug]/        Pagina per studieplaats
    vergelijken/          Favorieten vergelijken
    open-dagen/           Open dagen plannen
    profiel/              Profiel en inloggen
    api/cron/herinnering/ Dagelijkse e-mailherinnering
  components/             Onderdelen (opleidingskaart, kaart, grafieken, …)
  data/                   Sectoren, vragenlijst, verenigingen, kamerhuur, bedragen
  lib/
    bereken.ts            Alle berekeningen (reistijd, maandlasten, match-score)
    bereken.test.ts       Tests (draaien op de echte data)
    store.tsx             Opslag van profiel en favorieten (browser of Supabase)
supabase/schema.sql       Database-tabellen en beveiliging
```

---

## Zelf draaien op je computer

Je hebt [Node.js](https://nodejs.org) (versie 20 of hoger) nodig.

```bash
npm install
npm run dev
```

Open daarna http://localhost:3000. Testen draai je met `npm test`.

## Online zetten met Vercel

1. Ga naar [vercel.com](https://vercel.com) en log in met GitHub.
2. Klik op **Add New → Project** en kies de repository `studiekompas`.
3. Klik op **Deploy**. Na een minuut staat je app online.

De app werkt meteen. Profiel en favorieten worden dan in de browser bewaard. Elke keer dat er iets nieuws op GitHub komt, zet Vercel de nieuwe versie automatisch online.

## Inloggen en e-mailherinneringen aanzetten (Supabase)

Hiermee staan je favorieten op al je apparaten, ziet iedereen alleen zijn eigen gegevens, en werkt de e-mailherinnering.

1. Maak een gratis project op [supabase.com](https://supabase.com).
2. Ga naar **SQL Editor → New query**, plak de inhoud van `supabase/schema.sql` en klik op **Run**.
3. Ga naar **Authentication → URL Configuration** en zet bij *Site URL* het adres van je Vercel-app (bijvoorbeeld `https://studiekompas.vercel.app`).
4. Ga naar **Project Settings → API** en kopieer de *Project URL* en de *anon public* key.
5. Zet in Vercel bij **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = de Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = de anon key
6. Klik in Vercel op **Deployments → … → Redeploy**. Op de profielpagina kun je nu inloggen met je e-mail. Wat je al had bewaard, neem je mee.

**E-mailherinnering** (optioneel):

7. Maak een gratis account op [resend.com](https://resend.com) en maak een API key.
8. Voeg in Vercel toe:
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API → *service_role*, **geheim houden!**)
   - `RESEND_API_KEY`
   - `CRON_SECRET` (zelf verzonnen lange tekst)
9. Redeploy. De dagelijkse taak staat in `vercel.json`. Zonder eigen domein kan Resend alleen mailen naar het adres waarmee je je bij Resend hebt aangemeld. Dat is genoeg om het te testen.

---

## De data

| Wat | Bron | Status |
|---|---|---|
| Opleidingen mbo | DUO: `mbo_opleidingsaanbod` | Echt (alle kwalificaties met BOL/BBL per school en plaats) |
| Opleidingen hbo/wo | DUO: eerstejaars per opleiding en gemeente | Echt (opleidingen met eerstejaars in de laatste 2 jaar) |
| Websites | DUO | Waar DUO ze heeft; anders de site van de school |
| Coördinaten | PDOK Locatieserver | Echt |
| Collegegeld / lesgeld | duo.nl, rijksoverheid.nl | 2026/2027: € 2.694 / € 1.511 |
| Kamerhuur | Kamernet Huurmonitor (orde van grootte) | **Indicatief**, per provincie geschat voor kleinere plaatsen |
| Reistijd | NS (vanaf Wierden), anders afstand | **Indicatief** |
| Verenigingen | Officiële sites van universiteiten en hogescholen | Alleen gecontroleerde namen, met links naar de officiële overzichten |

### Data bijwerken

Als DUO nieuwe cijfers publiceert:

```bash
rm -rf .cache
python3 scripts/bouw-data.py
```

Het script downloadt de bestanden opnieuw en schrijft `public/data/opleidingen.json`. Daarna commit en push je, en Vercel zet de nieuwe versie online.

> Heb je Supabase al eerder ingesteld? Draai `supabase/schema.sql` dan nog een keer: er zijn kolommen bijgekomen (profiel en open-dagdatum).
