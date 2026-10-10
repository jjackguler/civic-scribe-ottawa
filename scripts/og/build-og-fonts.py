#!/usr/bin/env python3
"""
Builds src/lib/og/font-data.ts: the glyph outlines and kerning the Open Graph
image renderer (src/lib/og/raster.ts) draws with, so /og/*.png can set our
house type on a Cloudflare Worker without shipping a font engine or WASM.

Faces (instanced from the variable fonts the site already uses):
  g800  Schibsted Grotesk, weight 800  (headlines)
  g700  Schibsted Grotesk, weight 700  (kickers, labels, source lines)
  s600  Newsreader, opsz 72, weight 600 (the wordmark and section names)

Both fonts are under the SIL Open Font License; we embed a Latin subset of
their outlines, unmodified, only to render images.

Usage (needs fontTools, brotli, uharfbuzz):
  python3 scripts/og/build-og-fonts.py [FONTSOURCE_NODE_MODULES_DIR]

The directory defaults to scripts/originals/node_modules (run `npm i` there
first); it must contain @fontsource-variable/schibsted-grotesk and
@fontsource-variable/newsreader.
"""
import io
import json
import os
import sys

import uharfbuzz as hb
from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NM = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "scripts", "originals", "node_modules")
OUT = os.path.join(ROOT, "src", "lib", "og", "font-data.ts")

FACES = {
    "g800": ("@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2", {"wght": 800}),
    "g700": ("@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2", {"wght": 700}),
    "s600": ("@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2", {"wght": 600, "opsz": 72}),
}

# Printable ASCII, Latin-1 letters and the typography French and English copy uses.
CHARS = [chr(c) for c in range(0x20, 0x7F)] + [chr(c) for c in range(0xA0, 0x100)] + list("ŒœŸ‘’‚“”„–—…•€™−")
# Kerning is measured between these (accented letters kern as their base letter).
KERN = list("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;-'\"’“”«»?!()/&")


class PathPen(BasePen):
    """Records a glyph as a compact relative path: m/l/q/c/z, integers in font units."""

    def __init__(self, glyphSet, scale):
        super().__init__(glyphSet)
        self.out = []
        self.cur = (0, 0)
        self.k = scale

    def _r(self, p):
        return (round(p[0] * self.k), round(p[1] * self.k))

    def _rel(self, *pts):
        res = []
        x0, y0 = self.cur
        for p in pts:
            x, y = self._r(p)
            res += [x - x0, y - y0]
        self.cur = self._r(pts[-1])
        return res

    def _emit(self, cmd, nums):
        s = cmd
        for i, n in enumerate(nums):
            s += (str(n) if (i == 0 or n < 0) else "," + str(n))
        self.out.append(s)

    def _moveTo(self, pt):
        self._emit("m", self._rel(pt))

    def _lineTo(self, pt):
        self._emit("l", self._rel(pt))

    def _qCurveToOne(self, p1, p2):
        self._emit("q", self._rel(p1, p2))

    def _curveToOne(self, p1, p2, p3):
        self._emit("c", self._rel(p1, p2, p3))

    def _closePath(self):
        self.out.append("z")

    def _endPath(self):
        self.out.append("z")


def build(rel, axes):
    path = os.path.join(NM, rel)
    font = TTFont(path)
    inst = instantiateVariableFont(font, axes, inplace=False)
    buf = io.BytesIO()
    inst.flavor = None
    inst.save(buf)
    data = buf.getvalue()
    inst = TTFont(io.BytesIO(data))

    upem = inst["head"].unitsPerEm
    cmap = inst.getBestCmap()
    gs = inst.getGlyphSet()
    hmtx = inst["hmtx"]
    os2 = inst["OS/2"]

    k = 1000 / upem  # everything is stored at 1000 units per em
    glyphs = {}
    for ch in CHARS:
        gid = cmap.get(ord(ch))
        if gid is None:
            continue
        pen = PathPen(gs, k)
        gs[gid].draw(pen)
        glyphs[ch] = [round(hmtx[gid][0] * k), "".join(pen.out)]

    # Kerning (GPOS pair adjustments), measured by shaping each pair with HarfBuzz.
    face = hb.Face(data)
    hfont = hb.Font(face)
    kern = {}
    present = [c for c in KERN if c in glyphs]

    def adv(text):
        b = hb.Buffer()
        b.add_str(text)
        b.guess_segment_properties()
        hb.shape(hfont, b, {"liga": False, "clig": False, "calt": False})
        return sum(p.x_advance for p in b.glyph_positions)

    single = {c: adv(c) for c in present}
    for a in present:
        for b in present:
            d = round((adv(a + b) - single[a] - single[b]) * k)
            # Under 1% of the em is invisible at the sizes we set.
            if abs(d) >= 10:
                kern[a + b] = d

    return {
        "upem": 1000,
        "asc": round(inst["hhea"].ascent * k),
        "desc": round(inst["hhea"].descent * k),
        "cap": round((getattr(os2, "sCapHeight", 0) or 0) * k),
        "x": round((getattr(os2, "sxHeight", 0) or 0) * k),
        "glyphs": glyphs,
        "kern": kern,
    }


def main():
    faces = {k: build(rel, axes) for k, (rel, axes) in FACES.items()}
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* eslint-disable */\n")
        f.write("// GENERATED by scripts/og/build-og-fonts.py: do not edit by hand.\n")
        f.write("// Latin subsets of Schibsted Grotesk and Newsreader (SIL Open Font License 1.1),\n")
        f.write("// as relative outlines in font units, plus pair kerning. Used only by src/lib/og.\n")
        f.write("import type { FontData } from \"./raster\";\n\n")
        for k, v in faces.items():
            f.write(f"export const {k.upper()}: FontData = {json.dumps(v, ensure_ascii=False, separators=(',', ':'))};\n")
    size = os.path.getsize(OUT)
    print(f"wrote {OUT} ({size} bytes)")
    for k, v in faces.items():
        print(k, len(v["glyphs"]), "glyphs,", len(v["kern"]), "kern pairs")


if __name__ == "__main__":
    main()
