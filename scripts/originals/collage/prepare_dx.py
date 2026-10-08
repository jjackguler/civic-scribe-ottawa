"""
Double-exposure portraits for the title sequence: the person cut out of a
public-domain photo with a soft (feathered) edge, black-and-white, high contrast.

  python3 prepare_dx.py spec.json SRC_ROOT OUT_DIR
spec: {"name": {"file": "intro/xyz.jpg", "crop": [x0,y0,x1,y1], "model": "u2net_human_seg", "keep": 1}}
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageOps
from rembg import new_session, remove
from scipy import ndimage

spec_path, src, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
sess = {}
for name, s in json.load(open(spec_path)).items():
    im = Image.open(os.path.join(src, s["file"])).convert("RGB")
    if s.get("crop"):
        w, h = im.size
        x0, y0, x1, y1 = s["crop"]
        im = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
    sc = min(1.0, 1600 / max(im.size))
    if sc < 1:
        im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
    m = s.get("model", "u2net_human_seg")
    sess.setdefault(m, new_session(m))
    a = np.array(remove(im, session=sess[m], post_process_mask=True))[:, :, 3] > 127
    lab, n = ndimage.label(a)
    if n > 1:
        sizes = ndimage.sum(a, lab, range(1, n + 1))
        a = np.isin(lab, np.argsort(sizes)[::-1][: s.get("keep", 1)] + 1)
    a = ndimage.binary_fill_holes(a)
    alpha = ndimage.gaussian_filter(a.astype(np.float32), 2.2)
    g = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1.0)
    ga = np.array(g).astype(np.float32) / 255
    ga = np.clip((ga - 0.5) * 1.25 + 0.55, 0, 1)
    rgba = np.zeros((*a.shape, 4), np.uint8)
    rgba[..., 0] = rgba[..., 1] = rgba[..., 2] = (ga * 255).astype(np.uint8)
    rgba[..., 3] = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    img = img.crop(img.getbbox())
    img.save(os.path.join(out, f"{name}.png"), optimize=True)
    print(name, img.size)
