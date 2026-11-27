import sys, json, re, os, urllib.request, urllib.parse, io
from PIL import Image, ImageDraw
UA = {"User-Agent": "StudieKompas-schoolproject/1.0 (educational app; contact via project repository)"}
API = "https://commons.wikimedia.org/w/api.php"
OK = re.compile(r"^(CC0|Public domain|PD|CC BY(-SA)? [234]\.0|CC BY(-SA)? 2\.5)", re.I)
import time, urllib.error
def haal(url):
    for poging in range(12):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            wacht = int(e.headers.get("retry-after") or 30) + 2
            print("  429, wacht", wacht, flush=True); time.sleep(wacht)
    raise RuntimeError("blijft 429")
def get(params):
    params = {**params, "format": "json", "formatversion": "2"}
    time.sleep(3)
    return json.loads(haal(API + "?" + urllib.parse.urlencode(params)))
def zoek(term, n=12):
    d = get({"action": "query", "generator": "search", "gsrsearch": f"{term} filetype:bitmap", "gsrnamespace": 6, "gsrlimit": 30,
             "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 480})
    uit = []
    for pg in (d.get("query", {}).get("pages") or []):
        ii = (pg.get("imageinfo") or [{}])[0]; m = ii.get("extmetadata", {})
        lic = m.get("LicenseShortName", {}).get("value", "")
        if not OK.match(lic) or ii.get("width", 0) < 1600: continue
        artist = re.sub("<[^>]+>", "", m.get("Artist", {}).get("value", "")).strip()
        uit.append({"titel": pg["title"], "lic": lic, "artist": artist[:60], "w": ii["width"], "h": ii["height"], "thumb": ii["thumburl"], "url": ii["url"], "pagina": ii.get("descriptionurl")})
    return uit[:n]
uitvoer = sys.argv[1]; termen = sys.argv[2:]
alles = {}
for t in termen:
    r = zoek(t); alles[t] = r
    W = 240; cols = 6; rows = (len(r) + cols - 1) // cols or 1
    vel = Image.new("RGB", (W * cols, rows * 200), "white"); dr = ImageDraw.Draw(vel)
    for i, x in enumerate(r):
        try:
            time.sleep(1); im = Image.open(io.BytesIO(haal(x["thumb"]))).convert("RGB")
            im.thumbnail((W - 6, 170)); vel.paste(im, ((i % cols) * W + 3, (i // cols) * 200 + 3))
        except Exception as e: pass
        dr.rectangle([(i % cols) * W, (i // cols) * 200 + 176, (i % cols) * W + 30, (i // cols) * 200 + 198], fill="black")
        dr.text(((i % cols) * W + 6, (i // cols) * 200 + 180), str(i), fill="white")
    naam = re.sub(r"\W+", "_", t)
    vel.save(f"{uitvoer}/{naam}.jpg", quality=80)
    json.dump(r, open(f"{uitvoer}/{naam}.json", "w"), ensure_ascii=False)
    print("##", t, flush=True)
    for i, x in enumerate(r): print(i, x["lic"], x["w"], "x", x["h"], "|", x["titel"][5:80], "|", x["artist"][:30])

