"""
Newsprint halftone portraits for the "What is AI?" opener: a freely licensed
photo becomes black ink dots on cream stock. Portraits ("cut") are lifted off
their background (rembg) and get a scissor-cut white rim; scenes ("rect") keep
their frame.

  python3 prepare_players.py players.json SRC_DIR OUT_DIR
players.json: {"name": {"file": "...", "crop": [x0,y0,x1,y1], "mode": "cut"|"rect",
                        "height": 1300, "cell": 8, "gamma": 1.0, "keep": 1}}
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage

spec_path, src, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
sessions = {}
INK = np.array([20, 18, 16], np.float32)
PAPER = np.array([243, 236, 220], np.float32)


def halftone(g, cell, angle=45):
    """g: 0..1 lightness. Returns ink coverage 0..1 (antialiased round dots)."""
    H, W = g.shape
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    a = np.deg2rad(angle)
    u = x * np.cos(a) + y * np.sin(a)
    v = -x * np.sin(a) + y * np.cos(a)
    fu = (u % cell) - cell / 2
    fv = (v % cell) - cell / 2
    d = np.sqrt(fu * fu + fv * fv)
    dark = 1 - ndimage.gaussian_filter(g, cell * 0.35)
    r = cell * 0.74 * np.sqrt(np.clip(dark, 0, 1))
    ink = np.clip(r - d + 0.5, 0, 1)
    ink = np.maximum(ink, np.clip((dark - 0.86) * 8, 0, 1))  # deepest shadows go solid
    return ink


for name, s in json.load(open(spec_path)).items():
    im = Image.open(os.path.join(src, s["file"])).convert("RGB")
    if s.get("crop"):
        w, h = im.size
        x0, y0, x1, y1 = s["crop"]
        im = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
    target = s.get("height", 1300)
    k = target / im.height
    im = im.resize((max(1, int(im.width * k)), target), Image.LANCZOS)
    g = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1.0)
    ga = (np.array(g).astype(np.float32) / 255) ** s.get("gamma", 1.0)
    ga = np.clip((ga - 0.5) * 1.2 + 0.55, 0, 1)
    ink = halftone(ga, s.get("cell", 8))
    col = PAPER * (1 - ink[..., None]) + INK * ink[..., None]
    if s.get("mode", "cut") == "cut":
        from rembg import new_session, remove
        m = s.get("model", "u2net_human_seg")
        sessions.setdefault(m, new_session(m))
        a = np.array(remove(im, session=sessions[m], post_process_mask=True))[:, :, 3] > 127
        lab, n = ndimage.label(a)
        if n > 1:
            sizes = ndimage.sum(a, lab, range(1, n + 1))
            a = np.isin(lab, np.argsort(sizes)[::-1][: s.get("keep", 1)] + 1)
        a = ndimage.binary_fill_holes(a)
        rng = np.random.default_rng(11)
        rim = s.get("rim", 14)
        dist = ndimage.distance_transform_edt(~a)
        noise = ndimage.gaussian_filter(rng.normal(0, 1, a.shape), 7)
        noise /= np.abs(noise).max() + 1e-6
        outer = ndimage.gaussian_filter((dist < rim + noise * rim * 0.5).astype(np.float32), 1.2) > 0.5
        rgb = np.where(a[..., None], col, np.array([250, 248, 242], np.float32))
        rgba = np.dstack([rgb, outer * 255.0]).astype(np.uint8)
        img = Image.fromarray(rgba, "RGBA")
        img = img.crop(img.getbbox())
    else:
        img = Image.fromarray(col.astype(np.uint8), "RGB")
    img.save(os.path.join(out, f"{name}.png"), optimize=True)
    print(name, img.size)
