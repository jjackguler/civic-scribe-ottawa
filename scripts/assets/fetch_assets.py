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


START = time.time()
BUDGET = float(os.environ.get("BUDGET_SEC", "1e9"))


def over_budget():
    return time.time() - START > BUDGET


def save_meta():
    only = os.environ.get("ONLY", "") or "all"
    with open(os.path.join(OUT, f"credits-{only}.json"), "w") as f:
        json.dump(CREDITS, f, indent=1)
    with open(os.path.join(OUT, f"log-{only}.txt"), "w") as f:
        f.write("\n".join(LOG))


def get(url, binary=False, tries=2, timeout=40):
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


# Portraits of real people (editorial use): public domain, CC0, CC BY (no ShareAlike) or
# the UK Open Government Licence, always credited. "Personality rights" warnings are
# expected on portraits of living people and are fine for news use; trademark flags are not.
PEOPLE_OK = re.compile(r"^(public domain|pd|cc0|no restrictions|cc by \d|cc-by-\d|cc by$|ogl|open government)", re.I)


def commons(query, folder, limit=8, min_w=900, lic_ok=PD_OK, people=False):
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
        if not lic_ok.match(lic) or "sa" in lic.lower().replace("usa", "").split() or "-sa" in lic.lower() or ii.get("width", 0) < min_w or ii.get("mime") not in ("image/jpeg", "image/png", "image/tiff"):
            continue
        if restr and restr.lower() not in ("", "none") and not (people and set(restr.lower().replace(",", " ").split()) <= {"personality"}):
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
INTRO_QUERIES = [
    "NASA Pleiades supercomputer", "NASA supercomputer room", "oil refinery Louisiana 1940s", "refinery night lights Texas",
    "Louisiana bayou 1930s", "high voltage transmission lines towers", "telephone poles rural road 1930s",
    "printing press newspaper 1940s", "linotype operator", "radio tower antenna 1930s", "highway overpass 1950s night",
    "crowd of people 1940s street", "factory smokestacks 1930s", "Hoover Dam power plant generators", "electric power plant turbines 1940s",
    "IBM 7090 NASA", "data processing center 1960s", "satellite dish antenna NASA", "storm clouds", "flock of birds sky",
    "railroad yard 1940s", "steel mill workers 1940s", "farmer field 1930s Farm Security Administration", "woman portrait 1940s Farm Security Administration",
    "man portrait 1930s Farm Security Administration", "worker portrait 1940s Office of War Information",
]
NEWSPRINT_QUERIES = [
    "newspaper front page 1920", "New-York tribune front page 1922", "Evening star Washington front page 1925",
    "newspaper page 1910 Chronicling America", "classified advertisements newspaper 1920",
]


# ── Kenney (CC0) ─────────────────────────────────────────────────────────────
KENNEY = ["impact-sounds", "interface-sounds", "rpg-audio", "ui-audio"]


KENNEY_ZIPS = {
    "impact-sounds": "https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip",
    "interface-sounds": "https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip",
    "rpg-audio": "https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip",
    "ui-audio": "https://kenney.nl/media/pages/assets/ui-audio/490d233f68-1677590494/kenney_ui-audio.zip",
}


def kenney(pack):
    url = KENNEY_ZIPS.get(pack)
    if not url:
        return
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
MUSIC = [
    "documentary background music", "cinematic underscore", "news background music", "minimal piano loop",
    "tension pulse music", "lofi beat loop", "ambient pad music", "upbeat corporate music", "music bed",
]
FREESOUND = [
    "scissors cutting paper", "paper tear", "tape rip", "rubber stamp", "marker pen writing",
    "pencil scribble", "paper slide table", "paper crumple", "page turn", "typewriter",
    "camera shutter", "whoosh paper", "newspaper", "glue stick", "stapler", "printing press",
]


def freesound(query, limit=4, folder="sfx"):
    url = "https://freesound.org/search/?" + urllib.parse.urlencode({"q": query, "f": 'license:"Creative Commons 0"'})
    html = get(url)
    if not html:
        return
    # Each result carries its preview URL (-lq); the -hq preview sits next to it.
    previews = [(u.replace("-lq.mp3", "-hq.mp3"), sid) for u, sid in re.findall(r'(https://cdn\.freesound\.org/previews/\d+/(\d+)_\d+-lq\.mp3)', html)]
    seen, n = set(), 0
    for purl, sid in previews:
        if sid in seen or n >= limit or over_budget():
            continue
        seen.add(sid)
        title = re.search(rf'href="(/people/([^/]+)/sounds/{sid}/)"[^>]*>([^<]+)<', html)
        page = "https://freesound.org" + title.group(1) if title else f"https://freesound.org/s/{sid}/"
        data = get(purl, binary=True)
        if not data:
            continue
        name = f"fs-{slug(query, 24)}--{sid}.mp3"
        with open(os.path.join(OUT, folder, name), "wb") as f:
            f.write(data)
        CREDITS.append({"file": f"{folder}/{name}", "source": page, "author": title.group(2) if title else "", "title": title.group(3).strip() if title else "", "license": "CC0 1.0 (filtered by Freesound license search)"})
        n += 1
        save_meta()
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
    only = os.environ.get("ONLY", "")
    for d in ("photos", "newsprint", "sfx", "music"):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)
    if only in ("", "images"):
        for q in PHOTO_QUERIES:
            commons(q, "photos", limit=6)
        for q in NEWSPRINT_QUERIES:
            commons(q, "newsprint", limit=3, min_w=1200)
    if only == "url":
        # URLS="name.ext=https://... name2.ext=https://..." — files the owner asked for (their own work)
        for pair in os.environ.get("URLS", "").split():
            name, url = pair.split("=", 1)
            data = None
            for ua in ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", UA):
                try:
                    req = urllib.request.Request(url, headers={"User-Agent": ua, "Referer": "https://suno.com/", "Accept": "audio/mpeg,*/*"})
                    with urllib.request.urlopen(req, timeout=180) as r:
                        data = r.read()
                    break
                except Exception as e:  # noqa: BLE001
                    log("  try", ua[:20], repr(e)[:120])
            if data:
                with open(os.path.join(OUT, "music", name), "wb") as f:
                    f.write(data)
                CREDITS.append({"file": f"music/{name}", "source": url, "author": "Deep Cave Records (owner's Suno account)", "license": "Owner's own Suno creation"})
                log(f"url {name}: {len(data)} bytes")
        save_meta()
    if only == "people":
        folder = os.environ.get("FOLDER", "people")
        os.makedirs(os.path.join(OUT, folder), exist_ok=True)
        for q in os.environ.get("PEOPLE", "").split(";"):
            if q.strip() and not over_budget():
                commons(q.strip(), folder, limit=int(os.environ.get("PER", "6")), min_w=700, lic_ok=PEOPLE_OK, people=True)
                save_meta()
    if only == "intro":
        os.makedirs(os.path.join(OUT, "intro"), exist_ok=True)
        for q in INTRO_QUERIES:
            if over_budget():
                break
            commons(q, "intro", limit=5, min_w=1000)
            save_meta()
        for q in ["dark ambient guitar drone", "slide guitar ambient", "southern gothic guitar", "cinematic drone dark", "tremolo guitar ambient"]:
            freesound(q, limit=3, folder="music")
    if only in ("", "audio"):
        for p in KENNEY:
            kenney(p)
        for q in FREESOUND:
            freesound(q, limit=5)
    if only == "sfx2":
        for q in ["scissors snip", "paper tear", "rubber stamp", "pencil scribble", "paper slide", "paper rustle", "whoosh", "typewriter key", "camera shutter", "tape"]:
            freesound(q, limit=3)
    if only in ("", "audio", "music", "sfx2"):
        for q in MUSIC:
            freesound(q, limit=3, folder="music")
    name = f"credits-{only or 'all'}.json"
    with open(os.path.join(OUT, name), "w") as f:
        json.dump(CREDITS, f, indent=1)
    with open(os.path.join(OUT, f"log-{only or 'all'}.txt"), "w") as f:
        f.write("\n".join(LOG))


if __name__ == "__main__":
    main()
