"""
Turns public-domain photos into scissor-cut collage figures:
black-and-white, contrast lifted, background removed (rembg), then a
paper rim cut a few pixels outside the silhouette with a slightly
irregular edge, like a hand-cut magazine figure.

  python3 prepare_figures.py figures.json SRC_DIR OUT_DIR
figures.json: {"name": {"file": "...", "crop": [x0,y0,x1,y1] (fractions, optional),
                        "model": "u2net_human_seg"|"isnet-general-use", "rim": 10, "keep": 1}}
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps
from rembg import new_session, remove
from scipy import ndimage

spec_path, src, out = sys.argv[1:4]
spec = json.load(open(spec_path))
os.makedirs(out, exist_ok=True)
sessions = {}


def session(name):
    if name not in sessions:
        sessions[name] = new_session(name)
    return sessions[name]


for name, s in spec.items():
    im = Image.open(os.path.join(src, s["file"])).convert("RGB")
    if s.get("crop"):
        w, h = im.size
        x0, y0, x1, y1 = s["crop"]
        im = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
    # work at a sensible size
    scale = min(1.0, 1500 / max(im.size))
    if scale < 1:
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    cut = remove(im, session=session(s.get("model", "u2net_human_seg")), post_process_mask=True)
    a = np.array(cut)[:, :, 3].astype(np.float32) / 255
    mask = a > 0.5
    # keep the biggest pieces (people), drop specks
    lab, n = ndimage.label(mask)
    if n > 1:
        sizes = ndimage.sum(mask, lab, range(1, n + 1))
        keep = np.argsort(sizes)[::-1][: s.get("keep", 1)] + 1
        mask = np.isin(lab, keep)
    mask = ndimage.binary_fill_holes(mask)
    # black and white, newsprint contrast
    g = ImageOps.grayscale(im)
    g = ImageOps.autocontrast(g, cutoff=1.5)
    ga = np.array(g).astype(np.float32) / 255
    ga = np.clip((ga - 0.5) * 1.15 + 0.5, 0, 1) ** 0.95
    rng = np.random.default_rng(7)
    ga = np.clip(ga + rng.normal(0, 0.035, ga.shape), 0, 1)
    # scissor rim: dilate, then roughen the outline with low-frequency noise
    rim = s.get("rim", 10)
    dist = ndimage.distance_transform_edt(~mask)
    noise = ndimage.gaussian_filter(rng.normal(0, 1, mask.shape), 6)
    noise = noise / (np.abs(noise).max() + 1e-6)
    outer = dist < (rim + noise * rim * 0.45)
    outer = ndimage.binary_opening(outer, iterations=2)
    # straight-ish scissor cuts: smooth slightly then threshold
    outer = ndimage.gaussian_filter(outer.astype(np.float32), 1.2) > 0.5
    H, W = mask.shape
    rgba = np.zeros((H, W, 4), np.uint8)
    paper = np.array([244, 240, 230], np.float32) / 255
    figure = np.stack([ga * 0.96 + 0.02] * 3, -1) * np.array([1.0, 0.99, 0.96])
    col = np.where(mask[..., None], figure, paper)
    rgba[..., :3] = (np.clip(col, 0, 1) * 255).astype(np.uint8)
    rgba[..., 3] = (outer * 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    bbox = img.getbbox()
    img = img.crop(bbox)
    mh = s.get("maxh", 1400)
    if img.height > mh:
        img = img.resize((int(img.width * mh / img.height), mh), Image.LANCZOS)
    img.save(os.path.join(out, f"{name}.png"), optimize=True)
    print(name, img.size)
