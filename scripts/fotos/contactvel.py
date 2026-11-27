import sys, json, io, time, urllib.request, urllib.error
from PIL import Image, ImageDraw
UA = {"User-Agent": "StudieKompas-schoolproject/1.0 (educational app; contact via project repository)"}
def haal(url):
    for _ in range(10):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(int(e.headers.get("retry-after") or 20) + 2)
    raise RuntimeError("429")
for pad in sys.argv[1:]:
    r = json.load(open(pad)); W, cols = 240, 6; rows = max(1, (len(r) + cols - 1) // cols)
    vel = Image.new("RGB", (W * cols, rows * 200), "white"); dr = ImageDraw.Draw(vel)
    for i, x in enumerate(r):
        try:
            im = Image.open(io.BytesIO(haal(x["thumb"]))).convert("RGB"); im.thumbnail((W - 6, 170))
            vel.paste(im, ((i % cols) * W + 3, (i // cols) * 200 + 3))
        except Exception as e: print("fout", i, e)
        dr.rectangle([(i % cols) * W, (i // cols) * 200 + 176, (i % cols) * W + 30, (i // cols) * 200 + 198], fill="black")
        dr.text(((i % cols) * W + 6, (i // cols) * 200 + 180), str(i), fill="white")
        time.sleep(0.5)
    vel.save(pad.replace(".json", ".jpg"), quality=80); print("klaar", pad, flush=True)
