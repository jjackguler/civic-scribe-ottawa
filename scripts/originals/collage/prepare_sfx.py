"""
Builds the sound-effect library for the collage renderer from CC0 recordings
(Freesound CC0 previews and Kenney packs): trims leading silence, cuts each
take to a sensible length for its cue, fades the tail, peak-normalises, and
writes sfx-map.json ({cue: [wav, ...]}).

  python3 prepare_sfx.py ASSET_SFX_DIR OUT_DIR
"""
import glob, json, os, subprocess, sys

src, out = sys.argv[1:3]
os.makedirs(out, exist_ok=True)

# cue -> (filename patterns, max seconds, skip into file seconds, takes)
PLAN = {
    "snip": (["fs-scissors-cutting-paper--*", "fs-scissors-snip--*"], 0.32, 0, 6),
    "slap": (["fs-paper-slide--*", "fs-paper-slide-table--*", "fs-paper-rustle--*", "kenney-rpg-audio--cloth*"], 0.42, 0, 6),
    "slide": (["fs-paper-slide-table--*", "fs-paper-slide--*"], 0.6, 0, 4),
    "thump": (["kenney-impact-sounds--impactplank-medium*", "kenney-impact-sounds--impactsoft-heavy*", "kenney-impact-sounds--impactwood-heavy*", "fs-rubber-stamp--*"], 0.5, 0, 5),
    "stamp": (["fs-rubber-stamp--*"], 0.55, 0, 4),
    "pencil": (["fs-pencil-scribble--*", "fs-marker-pen-writing--*"], 0.9, 0.05, 5),
    "scribble": (["fs-pencil-scribble--*"], 0.8, 0.05, 4),
    "marker": (["fs-marker-pen-writing--*"], 0.6, 0.05, 4),
    "paper": (["fs-paper-crumple--*", "fs-page-turn--*", "fs-newspaper--*", "fs-paper-rustle--*"], 0.75, 0, 8),
    "tear": (["fs-paper-tear--*", "fs-tape-rip--*", "fs-tape--*"], 0.8, 0, 4),
    "type": (["fs-typewriter-key--*", "fs-typewriter--*"], 0.14, 0, 6),
    "click": (["kenney-interface-sounds--click*", "kenney-ui-audio--click*", "fs-typewriter-key--*"], 0.12, 0, 5),
    "shutter": (["fs-camera-shutter--*"], 0.45, 0, 4),
    "whoosh": (["fs-whoosh-paper--*", "fs-whoosh--*"], 0.75, 0, 5),
    "sweep": (["fs-whoosh-paper--*", "fs-whoosh--*"], 0.9, 0, 3),
    "tick": (["kenney-interface-sounds--tick*"], 0.12, 0, 3),
}


def dur(f):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", f], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0


mapping, report = {}, []
for cue, (pats, maxs, skip, takes) in PLAN.items():
    files = []
    for pat in pats:
        files += sorted(glob.glob(os.path.join(src, pat)))
    files = [f for f in files if dur(f) > 0.05][: takes]
    outs = []
    for k, f in enumerate(files):
        o = os.path.join(out, f"{cue}-{k}.wav")
        fade = min(0.12, maxs * 0.4)
        af = (
            f"atrim=start={skip},silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.01,"
            f"atrim=0:{maxs},afade=t=out:st={max(0, maxs - fade):.3f}:d={fade:.3f},"
            "highpass=f=60,dynaudnorm=f=150:g=5:p=0.9,alimiter=limit=0.89"
        )
        r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f, "-af", af, "-ar", "48000", "-ac", "2", o], capture_output=True, text=True)
        if r.returncode == 0 and dur(o) > 0.03:
            outs.append(os.path.abspath(o))
    if outs:
        mapping[cue] = outs
    report.append(f"{cue}: {len(outs)} takes from {len(files)} files")

json.dump(mapping, open(os.path.join(out, "sfx-map.json"), "w"), indent=1)
print("\n".join(report))
