#!/usr/bin/env python3
"""
StudieKompas – zet de open data van DUO om naar compacte JSON voor de app.

Gebruik:  python3 scripts/bouw-data.py
Download de bronbestanden (± 25 MB) naar .cache/ en schrijft:
  public/data/opleidingen.json   alle mbo-, hbo- en wo-opleidingen
  public/data/woonplaatsen.json  alle woonplaatsen met coördinaten (voor je eigen woonplaats)

Bronnen:
  DUO Open Onderwijsdata (onderwijsdata.duo.nl), licentie CC0
  PDOK Locatieserver (api.pdok.nl), voor coördinaten van woonplaatsen
"""
import csv, hashlib, json, os, re, sys, urllib.request
from collections import Counter, defaultdict
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".cache")
UIT = os.path.join(ROOT, "public", "data")

BRONNEN = {
    "mbo_aanbod.csv": "https://onderwijsdata.duo.nl/dataset/894ebe77-15e7-48e6-9daf-c93da08b1ab9/resource/5776abd4-d34b-4489-9b1b-fd639b05acdb/download/mbo_opleidingsaanbod.csv",
    "hbo_eerstejaars.csv": "https://onderwijsdata.duo.nl/dataset/eec8c988-66a6-4b06-9bcf-4038d016f2a1/resource/0f594842-cca9-4f17-8cbc-e502dba408b4/download/eerstejaarsingeschrevenenhbo.csv",
    "wo_eerstejaars.csv": "https://onderwijsdata.duo.nl/dataset/eec8c988-66a6-4b06-9bcf-4038d016f2a1/resource/1a67316d-db9f-415c-8057-8c47bee19d44/download/eerstejaarsingeschrevenenwo.csv",
    "ho_aanbod.csv": "https://onderwijsdata.duo.nl/dataset/7c0686f4-b5c2-418e-8e44-7be0057d8084/resource/ffffa7ad-e6a2-4ba7-9fc2-a09df4128555/download/ho_opleidingsoverzicht.csv",
    "instellingen_ho.csv": "https://onderwijsdata.duo.nl/dataset/37051cda-b681-43eb-a385-efa18e99cdd2/resource/bf1da9c6-c688-4873-91b1-b12c9ac2c132/download/instellingenho.csv",
}


def download():
    os.makedirs(CACHE, exist_ok=True)
    for naam, url in BRONNEN.items():
        pad = os.path.join(CACHE, naam)
        if not os.path.exists(pad):
            print(f"Downloaden: {naam}")
            urllib.request.urlretrieve(url, pad)
    pad = os.path.join(CACHE, "woonplaatsen.json")
    if not os.path.exists(pad):
        print("Downloaden: woonplaatsen (PDOK)")
        alles = []
        for start in range(0, 3000, 100):
            u = (
                "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=*:*&fq=type:woonplaats"
                f"&rows=100&start={start}&fl=woonplaatsnaam,gemeentenaam,provincienaam,centroide_ll"
                "&sort=woonplaatsnaam%20asc"
            )
            docs = json.load(urllib.request.urlopen(u, timeout=60))["response"]["docs"]
            if not docs:
                break
            alles += docs
        json.dump(alles, open(pad, "w"))


def lees(naam):
    return list(csv.DictReader(open(os.path.join(CACHE, naam), encoding="utf-8")))


# ---------------------------------------------------------------- sectoren

SECTOREN = [
    "techniek", "ict", "zorg", "welzijn", "onderwijs", "economie", "recht",
    "natuur", "beta", "creatief", "taal", "horeca", "sport", "logistiek",
]

# Volgorde is belangrijk: de eerste regel die past, wint.
TREFWOORDEN = [
    ("onderwijs", r"\bleraar|lerarenopleiding|\bpabo\b|docent|onderwijsassistent|pedagogisch educatief|pedagogisch medewerker|kinderopvang|onderwijskunde|\balo\b|lichamelijke opvoeding|educatie"),
    ("ict", r"informatica|\bict\b|software|computer|\bdata\b|data science|cyber|\bgame|artificial intelligence|kunstmatige intelligentie|informatie|it-|\bit\b|netwerk|applicatie|media developer|digital"),
    ("sport", r"\bsport|bewegings|beweging|fitness|\bcios\b|politie|beveiliging|veiligheid|defensie|militair|brandweer|handhav|boa\b|security"),
    ("logistiek", r"logistiek|luchtvaart|maritiem|scheepvaart|\bschipper|havens|transport|vervoer|chauffeur|stuurman|\bpiloot|aviation"),
    ("zorg", r"verpleeg|genees|farma|apothe|fysio|mondzorg|tandarts|verloskunde|ergotherap|logoped|diëtet|dietet|oefentherap|medisch|zorg|biomedi|gezondheid|health|optometr|huidtherap|radiolog|anesthes|ambulance|doktersassistent"),
    ("recht", r"rechtsgeleerd|rechten|\blaw\b|notari|juridisch|fiscaal|fiscale|bestuurskunde|politicolog|bestuur|criminolog|public administration|recht"),
    ("welzijn", r"psycholog|sociaal|social|sociolog|pedagog|maatschappelijk|welzijn|begeleider|jeugd|culturele antropologie|antropolog|human resource|toegepaste psychologie|cultureel maatschappelijk"),
    ("creatief", r"design|ontwerp|\bkunst\b|kunsten|beeldende|kunst en|\bart\b|muziek|music|dans|theater|film|fotograf|animat|illustrat|mode|fashion|grafisch|vormgev|architect|interieur|media|audiovisu|podium|regie|acteur|artiest|creative"),
    ("horeca", r"horeca|hotel|kok\b|koken|bakker|banket|toeris|touris|leisure|recreat|reis|gastvrij|hospitality|evenement|event|kapper|haar|schoonheid|beauty|nagel|uiterlijke|facilitair|zelfstandig werkend kok|gastheer|barista|food"),
    ("natuur", r"biolog|dier|animal|milieu|voeding|agr|landbouw|tuin|bos|groen|natuur|plant|veehouderij|bodem|water|ecolog|paard|hovenier|bloem|levensmiddel|food technology|life science|earth|aarde|geograf|planolog|duurzaam"),
    ("beta", r"wiskunde|mathemat|natuurkunde|physics|scheikunde|chemie|chemistry|chemisch|laboratorium|labor|analist|astronom|nanobiolog|moleculair|science"),
    ("economie", r"econom|bedrijfskunde|business|finance|financ|accountancy|accountant|marketing|commerc|bank|verkoop|sales|retail|ondernem|manag|administrat|secretar|office|kantoor|handel|winkel|makelaar|vastgoed|international business"),
    ("taal", r"taal|talen|letterkunde|literatuur|engels|duits|frans|spaans|nederlands|geschiedenis|history|filosofie|philosophy|religie|theolog|communicatie|journalist|tolk|vertal|cultuur|cultural|kunstgeschiedenis|archeolog|liberal arts|studies|humanities"),
    ("techniek", r"techn|werktuig|bouwk|bouw|elektro|mechatron|installatie|engineer|engineering|metaal|lassen|auto|motor|voertuig|monteur|mechanic|civiel|infra|lucht- en ruimtevaart|proces|operator|industrie|timmer|schilder|stukad|meubel|hout|energie"),
]
TREFWOORDEN = [(s, re.compile(p, re.I)) for s, p in TREFWOORDEN]

MBO_DOMEIN = {
    "Zorg en welzijn": "zorg",
    "Techniek en procesindustrie": "techniek",
    "Voedsel, natuur en leefomgeving": "natuur",
    "Voedsel, natuur en leefomgeving (EL&I)": "natuur",
    "Handel en ondernemerschap": "economie",
    "Bouw en infra": "techniek",
    "Economie en administratie": "economie",
    "Horeca en bakkerij": "horeca",
    "Mobiliteit en voertuigen": "techniek",
    "Transport, scheepvaart en logistiek": "logistiek",
    "Veiligheid en sport": "sport",
    "Uiterlijke verzorging": "horeca",
    "Toerisme en recreatie": "horeca",
    "Afbouw, hout en onderhoud": "techniek",
    "Informatie en communicatietechnologie": "ict",
    "Media en vormgeving": "creatief",
    "Ambacht, laboratorium en gezondheidstechniek": "beta",
}
HO_ONDERDEEL = {
    "ECONOMIE": "economie",
    "GEDRAG EN MAATSCHAPPIJ": "welzijn",
    "GEZONDHEIDSZORG": "zorg",
    "LANDBOUW EN NATUURLIJKE OMGEVING": "natuur",
    "NATUUR": "beta",
    "ONDERWIJS": "onderwijs",
    "RECHT": "recht",
    "TAAL EN CULTUUR": "taal",
    "TECHNIEK": "techniek",
    "SECTOROVERSTIJGEND": "welzijn",
}


def sector_van(naam, standaard, sterk=()):
    """Eerst de DUO-indeling voor 'sterke' domeinen, anders trefwoorden, anders de DUO-indeling."""
    if standaard in sterk:
        return standaard
    for s, p in TREFWOORDEN:
        if p.search(naam):
            return s
    return standaard


def mbo_sector(naam, eigennaam, dom, standaard, dossier):
    """Voor mbo is het DUO-domein leidend; trefwoorden verfijnen alleen binnen dat domein."""
    if re.search(r"acteur|musical|danser|muzikant|artiest", naam, re.I):
        return "creatief"
    if re.search(r"optiek|opticien", naam, re.I):
        return "zorg"
    if dossier == "Entree" or naam.lower().startswith("entree"):
        return sector_van(naam, "economie")
    if dom == "Ambacht, laboratorium en gezondheidstechniek":
        if re.search(r"laborant|analist|laboratorium", naam, re.I):
            return "beta"
        if re.search(r"tand|optic|orthopedisch|audicien|medisch", naam, re.I):
            return "zorg"
        return "creatief"
    verfijning = {
        "zorg": ("onderwijs", "welzijn", "sport", "natuur"),
        "economie": ("ict", "logistiek", "horeca", "recht", "creatief"),
        "techniek": ("ict", "logistiek", "beta"),
        "natuur": ("horeca",),
        "horeca": (),
        "sport": ("ict",),
    }.get(standaard, ())
    for s, p in TREFWOORDEN:
        if s in verfijning and p.search(naam):
            return s
    if standaard == "zorg" and re.search(r"pedagog|kinderopvang|onderwijsassistent", naam, re.I):
        return "onderwijs"
    if standaard == "zorg" and re.search(r"begeleid|sociaal|maatschappelijk|welzijn|jeugd", naam, re.I):
        return "welzijn"
    return standaard


# ---------------------------------------------------------------- plaatsen

def normaal(n):
    return re.sub(r"[^a-z]", "", n.lower().replace("’", "'"))


def laad_woonplaatsen():
    docs = json.load(open(os.path.join(CACHE, "woonplaatsen.json")))
    uit = {}
    for d in docs:
        m = re.match(r"POINT\(([\d.]+) ([\d.]+)\)", d["centroide_ll"])
        lng, lat = float(m.group(1)), float(m.group(2))
        uit.setdefault(normaal(d["woonplaatsnaam"]), []).append(
            {"naam": d["woonplaatsnaam"], "gemeente": d["gemeentenaam"], "provincie": d["provincienaam"], "lat": round(lat, 4), "lng": round(lng, 4)}
        )
    return docs, uit


def kort_id(*delen):
    return hashlib.sha1("|".join(delen).encode()).hexdigest()[:7]


def maak_url(w):
    if not w:
        return None
    w = w.strip()
    if not re.match(r"https?://", w):
        w = "https://" + w
    return w


def domein(w):
    return re.sub(r"^(https?://)?(www\.)?", "", w).split("/")[0].lower() if w else None


# Merknaam voor mbo-scholen waarvan de DUO-naam alleen een afdeling noemt
MBO_MERK = {
    "100B581": "Noorderpoort",
    "100B582": "Rijn IJssel",
    "101B905": "Aventus",
    "100B691": "Regio College",
}


def main():
    download()
    docs, plaatsen_index = laad_woonplaatsen()

    plaatsen, plaats_idx = [], {}

    def plaats(naam, gemeente_hint=None):
        """Index van een plaats in de lijst; zoekt coördinaten op."""
        sleutel = normaal(naam)
        if sleutel in plaats_idx:
            return plaats_idx[sleutel]
        kandidaten = plaatsen_index.get(sleutel) or plaatsen_index.get(normaal(re.sub(r"\s+(ov|nb|gld|ut|zh|nh|fr|gr|dr|lb|zl)$", "", naam, flags=re.I)))
        if not kandidaten:
            # Gemeente zonder gelijknamige woonplaats: neem het midden van de woonplaatsen in die gemeente
            g = [d for d in docs if normaal(d["gemeentenaam"]) == sleutel]
            if not g:
                print("  Geen coördinaten voor", naam, file=sys.stderr)
                return None
            pts = [tuple(map(float, re.findall(r"[\d.]+", d["centroide_ll"]))) for d in g]
            k = {"naam": naam.title(), "provincie": g[0]["provincienaam"], "lng": round(sum(p[0] for p in pts) / len(pts), 4), "lat": round(sum(p[1] for p in pts) / len(pts), 4)}
        else:
            # Bij dubbele namen (Hoorn NH / Hoorn op Terschelling): voorkeur voor de plaats met een gelijknamige gemeente
            k = next((c for c in kandidaten if normaal(c["gemeente"]) == sleutel), kandidaten[0])
            if gemeente_hint:
                k = next((c for c in kandidaten if normaal(c["gemeente"]) == normaal(gemeente_hint)), k)
        plaats_idx[sleutel] = len(plaatsen)
        plaatsen.append({"naam": k["naam"], "provincie": k["provincie"], "lat": k["lat"], "lng": k["lng"]})
        return plaats_idx[sleutel]

    instellingen, inst_idx = [], {}

    def instelling(naam, soort, url):
        sleutel = (naam, soort)
        if sleutel not in inst_idx:
            inst_idx[sleutel] = len(instellingen)
            instellingen.append({"naam": naam, "soort": soort, "url": url})
        elif url and not instellingen[inst_idx[sleutel]]["url"]:
            instellingen[inst_idx[sleutel]]["url"] = url
        return inst_idx[sleutel]

    opleidingen = []

    # ---------- mbo
    rijen = [
        r for r in lees("mbo_aanbod.csv")
        if r["OPLEIDINGSEENHEID_TYPE"] == "MBOKWALIFICATIE" and r["LEERTRAJECT"] in ("BOL", "BBL") and r["MBONIVEAU"]
    ]
    dossier_domein = defaultdict(Counter)
    bestuur_site = defaultdict(Counter)
    for r in rijen:
        if r["DOMEIN"]:
            dossier_domein[r["KWALIFICATIEDOSSIER"]][r["DOMEIN"]] += 1
        if r["WEBSITE"]:
            bestuur_site[r["ONDERWIJSBESTUURID"]][domein(r["WEBSITE"])] += 1

    groepen = {}
    for r in rijen:
        sleutel = (r["ONDERWIJSAANBIEDERID"], r["ERKENDEOPLEIDINGSCODE"], normaal(r["PLAATSNAAM"]))
        g = groepen.setdefault(sleutel, {"r": r, "leerwegen": set(), "sites": Counter(), "duur": Counter()})
        g["leerwegen"].add(r["LEERTRAJECT"])
        if r["WEBSITE"]:
            g["sites"][maak_url(r["WEBSITE"])] += 1
        if r["AFWIJKENDE_OPLEIDINGSDUUROMVANG"]:
            n, e = int(r["AFWIJKENDE_OPLEIDINGSDUUROMVANG"]), r["AFWIJKENDE_OPLEIDINGSDUUREENHEID"]
            g["duur"][n / 12 if e == "M" else n] += 1

    for (aanbieder, crebo, _), g in groepen.items():
        r = g["r"]
        p = plaats(r["PLAATSNAAM"])
        if p is None:
            continue
        dom = r["DOMEIN"] or (dossier_domein[r["KWALIFICATIEDOSSIER"]].most_common(1) or [("", 0)])[0][0]
        if r["KWALIFICATIEDOSSIER"] == "Entree":
            dom = dom or "Entree"
        standaard = MBO_DOMEIN.get(dom, "economie")
        naam = re.sub(r"^Mbo-\s+", "Mbo-", r["OPLEIDINGSEENHEID_NAAM"].strip())
        sector = mbo_sector(naam, r["EIGENNAAM"], dom, standaard, r["KWALIFICATIEDOSSIER"])

        schoolnaam = r["NAAM"].strip()
        merk = MBO_MERK.get(r["ONDERWIJSBESTUURID"])
        if merk and merk.lower() not in schoolnaam.lower():
            schoolnaam = f"{merk} – {schoolnaam}"
        site_bestuur = bestuur_site[r["ONDERWIJSBESTUURID"]].most_common(1)
        inst_url = "https://" + site_bestuur[0][0] if site_bestuur else None
        i = instelling(schoolnaam, "mbo", inst_url)

        eigen = re.sub(r",?\s*niveau\s*\d.*$", "", r["EIGENNAAM"], flags=re.I).strip()
        extra = eigen if eigen and normaal(eigen) != normaal(naam) and len(eigen) < 80 else None
        duur = g["duur"].most_common(1)[0][0] if g["duur"] else int(r["STUDIELAST"] or 0) / 1600
        if not duur:
            # Gebruikelijke duur als DUO niets invult
            duur = {"1": 1, "2": 2, "3": 3, "4": 3}[r["MBONIVEAU"][-1]]
        url = g["sites"].most_common(1)[0][0] if g["sites"] else None
        niveau = "mbo" + r["MBONIVEAU"][-1]
        opleidingen.append([
            "m" + kort_id(aanbieder, crebo, plaatsen[p]["naam"]),
            naam, extra, i, niveau, SECTOREN.index(sector), p, None,
            round(duur * 2) / 2 if duur else None,
            "/".join(sorted(g["leerwegen"])), url, crebo,
        ])

    # ---------- hbo en wo
    inst_ho = {r["INSTELLINGSCODE"]: maak_url(r["INTERNETADRES"].lower()) for r in lees("instellingen_ho.csv")}
    ho_site = {}
    ho_duur = {}
    for r in lees("ho_aanbod.csv"):
        if r["ERKENDEOPLEIDINGSCODE"] and r["STUDIELAST"]:
            ho_duur.setdefault(r["ERKENDEOPLEIDINGSCODE"], int(r["STUDIELAST"]))
        if r["WEBSITE"] and r["ERKENDEOPLEIDINGSCODE"]:
            ho_site.setdefault((normaal(r["ONDERWIJSBESTUUR_NAAM"])[:12], r["ERKENDEOPLEIDINGSCODE"]), maak_url(r["WEBSITE"]))

    for bestand, soort in (("hbo_eerstejaars.csv", "hbo"), ("wo_eerstejaars.csv", "wo")):
        rijen = lees(bestand)
        laatste = max(r["STUDIEJAAR"] for r in rijen)
        vorig = str(int(laatste) - 1)
        aantallen = defaultdict(dict)
        for r in rijen:
            aantallen[(r["INSTELLINGSCODE_ACTUEEL"], r["OPLEIDINGSCODE_ACTUEEL"], r["GEMEENTENAAM"])][r["STUDIEJAAR"]] = (
                r, int(r["AANTAL_EERSTEJAARS_INGESCHREVENEN"] or 0)
            )
        for (code, croho, gemeente), jaren in aantallen.items():
            if laatste not in jaren and vorig not in jaren:
                continue  # opleiding bestaat niet meer
            r, aantal = jaren.get(laatste) or jaren[vorig]
            p = plaats(gemeente, gemeente)
            if p is None:
                continue
            ruw = r["OPLEIDINGSNAAM_ACTUEEL"].strip()
            ad = r["TYPE_HOGER_ONDERWIJS"] == "associate degree"
            naam = re.sub(r"^(B|Ad|AD)\s+", "", ruw).strip()
            naam = re.sub(r"^Opleiding tot (de )?", "", naam).strip()
            naam = naam[0].upper() + naam[1:]
            onderdeel = r["ONDERDEEL"].replace("_", " ")
            standaard = HO_ONDERDEEL.get(onderdeel, "welzijn")
            if "kunst" in r["SUBONDERDEEL"]:
                standaard = "onderwijs" if "leraren" in r["SUBONDERDEEL"] else "creatief"
            sterk = ("onderwijs", "recht") if standaard in ("onderwijs", "recht") else ()
            sector = sector_van(naam, standaard, sterk=sterk)
            i = instelling(r["INSTELLINGSNAAM_ACTUEEL"].strip(), soort, inst_ho.get(code))
            niveau = "ad" if ad else soort
            ec = ho_duur.get(croho)
            duur = (ec / 60) if ec else (2 if ad else 4 if soort == "hbo" else 3)
            url = ho_site.get((normaal(r["INSTELLINGSNAAM_ACTUEEL"])[:12], croho))
            opleidingen.append([
                "h" + kort_id(code, croho, gemeente),
                naam, None, i, niveau, SECTOREN.index(sector), p, aantal,
                round(duur * 2) / 2, None, url, croho,
            ])

    # ---------- opschonen en wegschrijven
    ids = Counter(o[0] for o in opleidingen)
    dubbel = [k for k, v in ids.items() if v > 1]
    assert not dubbel, f"Dubbele id's: {dubbel[:5]}"
    opleidingen.sort(key=lambda o: (o[1].lower(), o[4]))

    os.makedirs(UIT, exist_ok=True)
    data = {
        "versie": 2,
        "gegenereerd": date.today().isoformat(),
        "bron": "DUO Open Onderwijsdata (CC0); coördinaten: PDOK",
        "kolommen": ["id", "naam", "eigenNaam", "instelling", "niveau", "sector", "plaats", "instroom", "duur", "leerwegen", "url", "code"],
        "sectoren": SECTOREN,
        "plaatsen": plaatsen,
        "instellingen": instellingen,
        "opleidingen": opleidingen,
    }
    with open(os.path.join(UIT, "opleidingen.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    woonplaatsen = sorted(
        {(d["woonplaatsnaam"], d["gemeentenaam"]): d for d in docs}.values(), key=lambda d: d["woonplaatsnaam"]
    )
    wp = []
    for d in woonplaatsen:
        lng, lat = map(float, re.findall(r"[\d.]+", d["centroide_ll"]))
        wp.append([d["woonplaatsnaam"], d["gemeentenaam"], round(lat, 4), round(lng, 4)])
    with open(os.path.join(UIT, "woonplaatsen.json"), "w", encoding="utf-8") as f:
        json.dump(wp, f, ensure_ascii=False, separators=(",", ":"))

    per_niveau = Counter(o[4] for o in opleidingen)
    per_sector = Counter(SECTOREN[o[5]] for o in opleidingen)
    print(f"{len(opleidingen)} opleidingen, {len(instellingen)} instellingen, {len(plaatsen)} plaatsen")
    print("Per niveau:", dict(sorted(per_niveau.items())))
    print("Per sector:", dict(per_sector.most_common()))


if __name__ == "__main__":
    main()
