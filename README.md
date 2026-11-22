# 🧭 StudieKompas

**Zoek, vergelijk en bewaar opleidingen, en zie meteen wat studeren je per maand kost.**

StudieKompas is een web-app voor eindexamenleerlingen. De app koppelt open data over opleidingen (DUO), kamerhuur (Kamernet) en reistijd (NS) en maakt daar nieuwe informatie van: *wat kost studeren daar per maand, en kan ik thuis blijven wonen?*

Gemaakt voor de app-opdracht Informatica 6V.

---

## Functies

| Scherm | Wat je kunt doen |
|---|---|
| **Home** | Je beste matches, de eerstvolgende open dag van je favorieten en de goedkoopste studiesteden |
| **Zoeken** | Opleidingen filteren op hbo/wo, sector, stad en reistijd, en sorteren op match, kosten, reistijd of grootte |
| **Opleiding** | Maandlasten (op kamer of thuis), reistijd-stoplicht, uitleg van je match-score, open dagen, favoriet-knop, cijfer en notitie na de open dag |
| **Studiesteden** | Kaart met je maandlasten per stad en de reistijd vanaf Wierden |
| **Vergelijken** | Je favorieten naast elkaar in een tabel (beste waarde gemarkeerd) en een grafiek van de maandlasten |
| **Open dagen** | Kalender met open dagen van je favorieten, die je met één tik in je agenda zet (.ics) |
| **Mijn profiel** | Interesses, niveau, budget en maximale reistijd, en optioneel inloggen |

**Op de achtergrond:**
- **Maandlasten:** kamerhuur + leefkosten + (collegegeld + boeken) ÷ 12, of de goedkopere variant als je thuis kunt blijven wonen
- **Match-score (0–100):** interesse 40, niveau 10, budget 25, reistijd 25 punten (zie `src/lib/bereken.ts`)
- **Reistijd-stoplicht:** groen tot 45 min, oranje tot 75 min, daarboven rood
- **Alleen eigen favorieten:** row level security in de database (`supabase/schema.sql`)
- **E-mailherinnering:** elke dag om 18:00 krijg je een mail als een favoriet over 3 dagen een open dag heeft
- Werkt op je telefoon, ook als app op je beginscherm (PWA), en in licht en donker thema

---

## Techniek

| Onderdeel | Gekozen | Waarom |
|---|---|---|
| Framework | [Next.js 15](https://nextjs.org) + React + TypeScript | Veelgebruikt, snel, elke pagina een eigen URL |
| Opmaak | Tailwind CSS 4 | Snel een strak, eigen ontwerp |
| Kaart | Leaflet + OpenStreetMap/CARTO | Gratis, geen API-sleutel nodig |
| Grafiek | Recharts | Eenvoudige grafieken in React |
| Database + inloggen | Supabase (optioneel) | Gratis PostgreSQL met inloggen via e-mail |
| E-mail | Resend (optioneel) | Eenvoudige mail-API |
| Hosting | Vercel | Koppelt aan GitHub, gratis |

### Mappen

```
src/
  app/                    Pagina's (elke map = een URL)
    page.tsx              Home
    zoeken/               Zoeken
    opleiding/[id]/       Detailpagina per opleiding
    steden/               Kaart met studiesteden
    vergelijken/          Favorieten vergelijken
    open-dagen/           Kalender
    profiel/              Mijn profiel + inloggen
    api/cron/herinnering/ Dagelijkse e-mailherinnering
  components/             Herbruikbare onderdelen (kaartjes, kaart, grafiek)
  data/                   De open data: opleidingen, steden, open dagen, instellingen
  lib/
    bereken.ts            Alle berekeningen (maandlasten, stoplicht, match-score)
    bereken.test.ts       Tests voor de berekeningen
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

De data staat in `src/data/`. Pas het daar aan, de rest van de app rekent automatisch mee.

| Bestand | Bron | Status |
|---|---|---|
| `opleidingen.ts` | DUO Open Onderwijsdata | Opleidingen bestaan; **instroom is indicatief** |
| `steden.ts` | Kamernet Huurmonitor, NS-reisplanner | **Kamerhuur en reistijd zijn indicatief** |
| `opendagen.ts` | Websites van de instellingen | **Voorbeelddatums**, vervangen door echte |
| `instellingen.ts` | duo.nl, Nibud | Collegegeld 2025-2026, leefkosten zijn een schatting |

### Uitbreiden

- **Meer opleidingen:** voeg een regel toe in `opleidingen.ts` (nieuw ID, bijvoorbeeld `O41`).
- **Meer steden:** voeg een stad toe in `steden.ts` met coördinaten, kamerhuur en reistijd.
- **Andere woonplaats dan Wierden:** pas `THUISSTAD` en de reistijden in `steden.ts` aan.
