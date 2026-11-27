"""
Haalt de officiële nadere vooropleidingseisen voor het wo op (Regeling aanmelding en toelating hoger onderwijs,
BWBR0035059, Bijlage A) uit de open-datarepository van de overheid en schrijft src/data/toelating-wo.json.

Per opleiding en per vwo-profiel (NT, NG, EM, CM):
  {"vrij": true}                 * = dit profiel geeft toelatingsrecht
  {"geen": true}                 # = geen toelatingsrecht; de universiteit kan je toelaten na een onderzoek
  {"en": [...]} / {"of": [...]}  vakken die je naast je profiel nodig hebt
  {"vak": "biologie"}
  {"min": 2, "uit": [...]}       minimaal twee van de volgende vakken

Gebruik: python3 scripts/toelating-wo.py
"""
import html, json, re, urllib.request

BASIS = "https://repository.officiele-overheidspublicaties.nl/bwb/BWBR0035059/"
UA = {"User-Agent": "StudieKompas-schoolproject/1.0"}
VAK = {"wisA": "wiskunde A", "wisB": "wiskunde B", "wisC": "wiskunde C", "nat": "natuurkunde", "schk": "scheikunde",
       "biol": "biologie", "econ": "economie", "ak": "aardrijkskunde", "nlt": "NLT", "latl": "Latijn", "grtl": "Grieks"}


def haal(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode("utf8")


def lijst(tekst):
    """'biol, nat, schk, en/of (econ of ak)' -> knopen"""
    tekst = tekst.replace("en/of", ",").replace(".", ",")
    delen, diepte, huidig = [], 0, ""
    for c in tekst:
        if c == "(": diepte += 1
        if c == ")": diepte -= 1
        if c == "," and diepte == 0:
            delen.append(huidig); huidig = ""
        else:
            huidig += c
    delen.append(huidig)
    return [ontleed(d) for d in delen if d.strip()]


def ontleed(t):
    t = t.strip()
    m = re.match(r"^\(?minimaal\)?\s*twee van de volgende vakken:\s*(.*)$", t, re.I)
    if m:
        return {"min": 2, "uit": lijst(m.group(1))}
    # buitenste haakjes weg
    while t.startswith("(") and t.endswith(")") and balans(t[1:-1]):
        t = t[1:-1].strip()
    for scheiding, soort in ((r"\s\+\s", "en"), (r"\sof\s", "of")):
        delen = splits(t, scheiding)
        if len(delen) > 1:
            knopen = [ontleed(d) for d in delen]
            # dubbele weg (de regeling bevat bijv. 'ak of biol of ak')
            uniek = [k for i, k in enumerate(knopen) if k not in knopen[:i]]
            return {soort: uniek} if len(uniek) > 1 else uniek[0]
    if t in VAK:
        return {"vak": VAK[t]}
    raise ValueError(f"Onbekend: {t!r}")


def balans(t):
    d = 0
    for c in t:
        d += c == "("; d -= c == ")"
        if d < 0: return False
    return d == 0


def splits(t, patroon):
    """Splits op het patroon, maar niet binnen haakjes of na 'vakken:'"""
    if re.match(r"^\(?minimaal", t, re.I):
        return [t]
    delen, diepte, start = [], 0, 0
    for m in re.finditer(r"[()]|" + patroon, t):
        x = m.group(0)
        if x == "(": diepte += 1
        elif x == ")": diepte -= 1
        elif diepte == 0:
            if "vakken:" in t[start:m.start()].lower():
                continue
            delen.append(t[start:m.start()]); start = m.end()
    delen.append(t[start:])
    return [d for d in delen if d.strip()]


def eis(cel):
    if cel == "*": return {"vrij": True}
    if cel == "#": return {"geen": True}
    return ontleed(cel)


def main():
    manifest = haal(BASIS + "manifest.xml")
    laatste = re.search(r'_latestItem="([^"]+)"', manifest).group(1)
    xml = haal(BASIS + laatste)
    a = xml.index('<nr status="officieel">A</nr>'); b = xml.index('<nr status="officieel">B</nr>')
    deel = xml[a:b]
    uit = {}
    for rij in re.findall(r"<row[^>]*>(.*?)</row>", deel, re.S):
        cellen = [html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", c)).strip())
                  for c in re.findall(r"<entry[^>]*>(.*?)</entry>", rij, re.S)]
        if len(cellen) != 5 or cellen[1].startswith("NT"):
            continue
        naam = re.sub(r"\s*\d+$", "", cellen[0])  # voetnootnummers weg
        uit[naam] = dict(zip(["NT", "NG", "EM", "CM"], (eis(c) for c in cellen[1:])))
    geldig = re.search(r"(\d{4}-\d{2}-\d{2})", laatste).group(1)
    json.dump({"bron": "Regeling aanmelding en toelating hoger onderwijs (BWBR0035059), bijlage A",
               "geldigVanaf": geldig, "opleidingen": dict(sorted(uit.items()))},
              open("src/data/toelating-wo.json", "w"), ensure_ascii=False, indent=1)
    print(f"{len(uit)} opleidingen, versie geldig vanaf {geldig}")


if __name__ == "__main__":
    main()
