"""
Fetches free, reusable material for the collage explainers and records where
every file came from:

  photos/     public-domain photographs from Wikimedia Commons (license checked
              from the file's own metadata; anything not PD/CC0 is skipped)
  newsprint/  public-domain newspaper pages (pre-1929) from Wikimedia Commons
  sfx/        CC0 sound effects (Kenney packs; Freesound CC0 previews)
  music/      CC0 music (HoliznaCC0 on the Internet Archive)
  credits.json  source URL, author, license for every file
  log.txt     what was tried and what failed

Runs on GitHub Actions (open internet). Usage: python3 fetch_assets.py OUT_DIR
"""
import io, json, os, re, sys, time, urllib.parse, urllib.request, zipfile

OUT = sys.argv[1]
UA = "AIBroadsheetAssets/1.0 (https://github.com/jjackguler/civic-scribe-ottawa; editorial collage explainers)"
LOG = []
CREDITS = []


def log(*a):
    s = " ".join(str(x) for x in a)
    print(s, flush=True)
    LOG.append(s)


def get(url, binary=False, tries=3, timeout=60):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read()
                return data if binary else data.decode("utf-8", "replace")
        except Exception as e:  # noqa: BLE001
            if k == tries - 1:
                log("  FAIL", url[:140], repr(e)[:160])
                return None
            time.sleep(2 + k * 3)


def slug(s, n=60):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:n]


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


# ── Wikimedia Commons ────────────────────────────────────────────────────────
PD_OK = re.compile(r"^(public domain|pd|cc0|no restrictions)", re.I)


def commons(query, folder, limit=8, min_w=900):
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6,
        "gsrsearch": f"{query} filetype:bitmap", "gsrlimit": 30,
        "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 1600,
    })
    raw = get(api)
    if not raw:
        return 0
    pages = sorted(json.loads(raw).get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    got = 0
    for p in pages:
        if got >= limit:
            break
        ii = (p.get("imageinfo") or [{}])[0]
        md = ii.get("extmetadata", {})
        lic = strip_html(md.get("LicenseShortName", {}).get("value", ""))
        restr = strip_html(md.get("Restrictions", {}).get("value", ""))
        if not PD_OK.match(lic) or ii.get("width", 0) < min_w or ii.get("mime") not in ("image/jpeg", "image/png", "image/tiff"):
            continue
        if restr and restr.lower() not in ("", "none"):
            continue  # trademark/personality-rights flags: skip to be safe
        url = ii.get("thumburl") or ii.get("url")
        data = get(url, binary=True)
        if not data:
            continue
        name = f"{slug(query, 24)}--{slug(p['title'].replace('File:', ''), 50)}.jpg"
        path = os.path.join(OUT, folder, name)
        with open(path, "wb") as f:
            f.write(data)
        CREDITS.append({
            "file": f"{folder}/{name}", "title": p["title"], "source": ii.get("descriptionurl"),
            "author": strip_html(md.get("Artist", {}).get("value", ""))[:200],
            "credit": strip_html(md.get("Credit", {}).get("value", ""))[:200],
            "license": lic, "description": strip_html(md.get("ImageDescription", {}).get("value", ""))[:300],
            "date": strip_html(md.get("DateTimeOriginal", {}).get("value", ""))[:60], "query": query,
        })
        got += 1
    log(f"commons '{query}': {got}")
    return got


PHOTO_QUERIES = [
    "NASA human computers", "ENIAC women programmers", "telephone switchboard operators 1910s",
    "woman at typewriter 1940s", "librarian card catalog", "man reading newspaper 1920s",
    "artist painting at easel 1920s", "photographer with camera 1920s", "telegraph operator",
    "punched card operator 1950s", "NASA IBM 704 computer room", "office workers 1950s typing pool",
    "scientist at blackboard equations", "mathematician chalkboard 1950s", "Grace Hopper UNIVAC",
    "post office mail sorting 1920s", "stock exchange traders 1920s", "businessmen shaking hands 1950s",
    "construction workers lunch beam", "radio announcer microphone 1930s", "factory assembly line 1920s",
    "crowd waiting line 1930s", "detective magnifying glass", "lighthouse keeper",
]
NEWSPRINT_QUERIES = [
    "newspaper front page 1920", "New-York tribune front page 1922", "Evening star Washington front page 1925",
    "newspaper page 1910 Chronicling America", "classified advertisements newspaper 1920",
]


# ── Kenney (CC0) ─────────────────────────────────────────────────────────────
KENNEY = ["impact-sounds", "interface-sounds", "rpg-audio", "ui-audio", "foley-sounds", "sci-fi-sounds"]


def kenney(pack):
    page = get(f"https://kenney.nl/assets/{pack}")
    if not page:
        return
    m = re.search(r'href="([^"]+\.zip)"', page)
    if not m:
        log(f"kenney {pack}: no zip link")
        return
    url = urllib.parse.urljoin("https://kenney.nl/", m.group(1))
    data = get(url, binary=True, timeout=180)
    if not data:
        return
    n = 0
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        for info in z.infolist():
            if re.search(r"\.(ogg|wav)$", info.filename, re.I):
                name = f"kenney-{pack}--{slug(os.path.basename(info.filename).rsplit('.', 1)[0], 40)}.{info.filename.rsplit('.', 1)[1].lower()}"
                with open(os.path.join(OUT, "sfx", name), "wb") as f:
                    f.write(z.read(info))
                n += 1
    CREDITS.append({"file": f"sfx/kenney-{pack}--*", "source": f"https://kenney.nl/assets/{pack}", "author": "Kenney (kenney.nl)", "license": "CC0 1.0"})
    log(f"kenney {pack}: {n} files")


# ── Freesound CC0 previews ───────────────────────────────────────────────────
FREESOUND = [
    "scissors cutting paper", "paper tear", "tape rip", "rubber stamp", "marker pen writing",
    "pencil scribble", "paper slide table", "paper crumple", "page turn", "typewriter",
    "camera shutter", "whoosh paper", "newspaper", "glue stick", "stapler", "printing press",
]


def freesound(query, limit=4):
    url = "https://freesound.org/search/?" + urllib.parse.urlencode({"q": query, "f": 'license:"Creative Commons 0"', "s": "Rating highest first", "g": "1"})
    html = get(url)
    if not html:
        return
    # Each result carries its preview URL; ids and names come from the sound links.
    previews = re.findall(r'(https://cdn\.freesound\.org/previews/\d+/(\d+)_\d+-hq\.mp3)', html)
    seen, n = set(), 0
    for purl, sid in previews:
        if sid in seen or n >= limit:
            continue
        seen.add(sid)
        title = re.search(rf'href="(/people/([^/]+)/sounds/{sid}/)"[^>]*>([^<]+)<', html)
        page = "https://freesound.org" + title.group(1) if title else f"https://freesound.org/s/{sid}/"
        data = get(purl, binary=True)
        if not data:
            continue
        name = f"fs-{slug(query, 24)}--{sid}.mp3"
        with open(os.path.join(OUT, "sfx", name), "wb") as f:
            f.write(data)
        CREDITS.append({"file": f"sfx/{name}", "source": page, "author": title.group(2) if title else "", "title": title.group(3).strip() if title else "", "license": "CC0 1.0 (filtered by Freesound license search)"})
        n += 1
    log(f"freesound '{query}': {n}")


# ── HoliznaCC0 (CC0) on the Internet Archive ─────────────────────────────────
def holizna(max_tracks=14):
    q = urllib.parse.urlencode({"q": 'creator:(HoliznaCC0) AND mediatype:(audio)', "fl[]": ["identifier", "title"], "rows": 40, "output": "json"}, doseq=True)
    raw = get(f"https://archive.org/advancedsearch.php?{q}")
    if not raw:
        return
    docs = json.loads(raw)["response"]["docs"]
    log("archive items:", ", ".join(d["identifier"] for d in docs))
    n = 0
    for d in docs:
        if n >= max_tracks:
            break
        meta = get(f"https://archive.org/metadata/{d['identifier']}")
        if not meta:
            continue
        meta = json.loads(meta)
        lic = meta.get("metadata", {}).get("licenseurl", "")
        if "publicdomain/zero" not in lic and "publicdomain/mark" not in lic:
            log(f"  skip {d['identifier']} license {lic}")
            continue
        for f in meta.get("files", []):
            if n >= max_tracks:
                break
            if f.get("format") in ("VBR MP3", "128Kbps MP3", "MP3") and f["name"].lower().endswith(".mp3"):
                if int(f.get("size", 0) or 0) > 12_000_000:
                    continue
                url = f"https://archive.org/download/{d['identifier']}/{urllib.parse.quote(f['name'])}"
                data = get(url, binary=True, timeout=180)
                if not data:
                    continue
                name = f"holizna--{slug(d['identifier'], 24)}--{slug(f['name'].rsplit('.', 1)[0], 40)}.mp3"
                with open(os.path.join(OUT, "music", name), "wb") as fh:
                    fh.write(data)
                CREDITS.append({"file": f"music/{name}", "source": f"https://archive.org/details/{d['identifier']}", "author": "HoliznaCC0", "title": f.get("title") or f["name"], "license": lic})
                n += 1
    log(f"holizna: {n} tracks")


def main():
    for d in ("photos", "newsprint", "sfx", "music"):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)
    for q in PHOTO_QUERIES:
        commons(q, "photos", limit=6)
    for q in NEWSPRINT_QUERIES:
        commons(q, "newsprint", limit=3, min_w=1200)
    for p in KENNEY:
        kenney(p)
    for q in FREESOUND:
        freesound(q)
    holizna()
    with open(os.path.join(OUT, "credits.json"), "w") as f:
        json.dump(CREDITS, f, indent=1)
    with open(os.path.join(OUT, "log.txt"), "w") as f:
        f.write("\n".join(LOG))


if __name__ == "__main__":
    main()
