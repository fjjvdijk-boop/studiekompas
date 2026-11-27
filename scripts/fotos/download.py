"""Gebruik: download.py keuzes.json uitmap fotos.ts
keuzes.json: [{"sleutel": "campus", "bestand": "Academiegebouw_Groningen.json", "nr": 2, "alt": "...", "positie": "50% 60%"}]"""
import sys, json, io, re, time, urllib.request, urllib.error, os
from PIL import Image
UA = {"User-Agent": "StudieKompas-schoolproject/1.0 (educational app; contact via project repository)"}
def haal(url):
    for _ in range(12):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(int(e.headers.get("retry-after") or 20) + 2)
    raise RuntimeError("429")
keuzes = json.load(open(sys.argv[1])); uit = sys.argv[2]; ts = sys.argv[3]; basis = os.path.dirname(sys.argv[1])
os.makedirs(uit, exist_ok=True)
meta = json.load(open(ts + ".json")) if os.path.exists(ts + ".json") else {}
for k in keuzes:
    if k["sleutel"] in meta and os.path.exists(f'{uit}/{k["sleutel"]}-800.webp'): continue
    x = json.load(open(os.path.join(basis, k["bestand"])))[k["nr"]]
    breedte = 1920 if x["w"] > 1920 else None
    url = re.sub(r"/\d+px-", "/1920px-", x["thumb"]) if breedte else x["url"]
    im = Image.open(io.BytesIO(haal(url))).convert("RGB")
    for w in (1600, 800):
        kopie = im.copy(); kopie.thumbnail((w, w * 2))
        kopie.save(f'{uit}/{k["sleutel"]}-{w}.webp', "WEBP", quality=72, method=6)
    klein = im.copy(); klein.thumbnail((1, 1)); kleur = "#%02x%02x%02x" % klein.getpixel((0, 0))
    meta[k["sleutel"]] = {"alt": k["alt"], "maker": re.sub(r"\s+", " ", x["artist"]).strip() or "onbekend", "licentie": x["lic"],
                          "bron": x["pagina"], "titel": x["titel"], "kleur": kleur, **({"positie": k["positie"]} if k.get("positie") else {})}
    json.dump(meta, open(ts + ".json", "w"), ensure_ascii=False, indent=1)
    print("ok", k["sleutel"], im.size, flush=True); time.sleep(1)
json.dump(meta, open(ts + ".json", "w"), ensure_ascii=False, indent=1)
