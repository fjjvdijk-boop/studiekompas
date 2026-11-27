# StudieKompas

**Alle 433 universitaire bachelors van Nederland, een studietest, en meteen zien wat DUO betaalt en hoe je aan een kamer komt.**

StudieKompas is een web-app voor vwo-leerlingen die naar de universiteit willen. De app koppelt open data over opleidingen (DUO), studiefinanciering (duo.nl), kamerhuur (Kamernet) en reistijd en maakt daar nieuwe informatie van: *wat kost studeren daar per maand, hoeveel moet ik lenen, en hoe kom ik aan een kamer?*

Gemaakt voor de app-opdracht Informatica 6V.

---

## Functies

| Scherm | Wat je kunt doen |
|---|---|
| **Home** | Je beste matches, de tien richtingen, een rekenvoorbeeld voor een kamer in Utrecht en alle universiteiten |
| **Studietest** | Een story-quiz met foto's: eerst een grote richting, dan zes vragen met vier antwoorden, daarna kort je diploma, wonen, taal en geld. Uitslag: je richting op een grote foto, je top 3 met redenen, je kompas en je beste bachelors |
| **Opleidingen** | Filteren op richting, voertaal (NL/EN), universiteit, stad, reistijd en toelating; sorteren op match, kosten of "minst lenen" |
| **Opleiding** | Toelating met jouw profiel en vakken, geldplaatje (thuis of op kamer) met DUO, schuld en terugbetalen, kamermarkt in die stad, verenigingen, open dag plannen |
| **Geld & DUO** | Rekenhulp met basisbeurs, aanvullende beurs (op basis van inkomen ouders en broers/zussen), lening, collegegeldkrediet, schuld en maandbedrag terugbetalen; plus het stappenplan om het aan te vragen |
| **Kamer vinden** | Stappenplan voor september (ROOM.nl vanaf 16 jaar, lokale huisvesters, Studielink-deadlines, oplichting herkennen), en per universiteitsstad de gemiddelde huur, wachttijd en huisvesters met links |
| **Steden** | Kaart van alle universiteitssteden, kleur = reistijd vanaf je woonplaats |
| **Mijn lijst** | Favorieten vergelijken (toelating, voertaal, kosten, zelf lenen, schuld) en open dagen plannen |
| **Profiel** | Woonplaats, diploma (vwo-profiel en vakken of hbo-propedeuse), voertaal, wonen, geld en interesses |

**Op de achtergrond:**
- **Echte data:** alle wo-bachelors uit DUO Open Onderwijsdata, inclusief voertaal (zie `scripts/bouw-data.py`)
- **DUO-bedragen** (september–december 2027, gecontroleerd op duo.nl) in `src/lib/duo.ts`. De aanvullende beurs is een vereenvoudiging van de DUO-regel (13,6% van het inkomen boven de grens, rekening met andere kinderen). Collegegeld 2027/2028 (€ 2.771) is afgeleid van het collegegeldkrediet.
- **Match-score (0–100):** interesse 50, toelating 10, geld (hoeveel je moet lenen t.o.v. wat je wilt) 20, reistijd 20 (zie `src/lib/bereken.ts`)
- **Toelatingseisen:** officieel, uit bijlage A van de *Regeling aanmelding en toelating hoger onderwijs* (BWBR0035059, versie vanaf 1 september 2026), opgehaald uit de open data van de overheid met `scripts/toelating-wo.py` naar `src/data/toelating-wo.json`. Per bachelor en per vwo-profiel (NT/NG/EM/CM): vrij toegankelijk, welke extra vakken je nodig hebt, of geen toelatingsrecht. Je kiest je profiel, je wiskunde (A/B/C) en je andere vakken; per opleiding zie je "toelaatbaar", "je mist biologie" (deficiëntie) of "geen toegang", met een overzicht per profiel. Staat een opleiding niet in de bijlage, dan heeft ze geen extra vakeisen. Zie `src/lib/toelating.ts`.
- **Vormgeving:** wit, één felblauwe merkkleur en echte foto's van Nederlandse universiteiten en studentensteden (Wikimedia Commons, vrije licenties; maker en licentie staan bij elke foto, zie `scripts/fotos.md`). Licht en donker thema
- **Studietest als story:** schermvullende foto per vraag, voortgang in segmenten, antwoorden A–D met één tik. Eerst kies je een grote richting, daarna krijg je zes vragen die daarbij passen (of een gemengde route als je twijfelt). Zie `src/data/vragenlijst.ts`
- Alleen eigen favorieten (row level security, `supabase/schema.sql`), e-mailherinnering 3 dagen voor een open dag, installeerbaar op je telefoon, deelbare uitslag met preview-afbeelding

---

## Techniek

| Onderdeel | Gekozen |
|---|---|
| Framework | Next.js 15 + React + TypeScript |
| Opmaak | Tailwind CSS 4, lettertype Geist |
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
| Opleidingen wo | DUO: eerstejaars per opleiding en gemeente | Echt (bachelors met eerstejaars in de laatste 2 jaar) |
| Voertaal | DUO: hoger-onderwijsaanbod | Echt |
| Studiefinanciering | duo.nl | Bedragen september–december 2027 |
| Websites | DUO | Waar DUO ze heeft; anders de site van de school |
| Coördinaten | PDOK Locatieserver | Echt |
| Collegegeld | duo.nl (collegegeldkrediet) | 2027/2028: € 2.771 |
| Kamerhuur en huisvesting | Kamernet Huurmonitor, sites van ROOM.nl, DUWO, SSH&, Roomspot, Idealis | **Indicatief**; wachttijden zijn een orde van grootte |
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
