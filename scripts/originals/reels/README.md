# Reels

Hand-written vertical explainers (1080×1920, 40–47 s) in the collage style, cut for
Instagram Reels, YouTube Shorts and TikTok. Each `*.json` here is one storyboard
with `"format": "reel"`; `collage/reel.js` draws it.

What a reel does differently from the long explainers:

- The hook is on screen from the first frame: ransom letters over a halftone photo.
- Captions are big, two or three words at a time, inside the platforms' safe zone
  (y 1268–1420, clear of the right-hand buttons).
- A sticker logo replaces the header bar; there is no progress bar.
- The last scene (`ask`) repeats the hook's photo and letters, so the loop back to
  frame one looks continuous, and asks a question to start the comments.

Scene types: `hook`, `ask`, `count`, `pullquote`, `bill`, `sides`, `doc`, `rules`,
`toggles`, `flipstat`, `versus`, `cards`, `timeline` (see `collage/reel.js`).

## Making one

```sh
# narration (Kokoro, local) — or reels/narrate-reels.ts with an ElevenLabs key
NARRATE_LEAD_IN=0.1 NARRATE_SCENE_GAP=0.3 NARRATE_SENT_GAP=0.2 NARRATE_TAIL=1.2 KOKORO_SPEED=1.12 \
  python3 collage/tts_kokoro.py reels/power-bill.json WORK kokoro.onnx voices.bin
# review stills, then the full render
COLLAGE_ASSETS=ASSETS npx tsx collage/render-collage.ts reels/power-bill.json WORK out.mp4 --stills 1,5,10
COLLAGE_ASSETS=ASSETS COLLAGE_MUSIC=music.mp3 COLLAGE_MUSIC_LUFS=-27 \
  npx tsx collage/render-collage.ts reels/power-bill.json WORK out.mp4
```

`ASSETS` needs `figs/` (cut-out figures), `newsprint/page-a.jpg` and `page-b.jpg`,
and the photos the boards name under `reel/` (public-domain photos from the
`assets` branch).

Every number and name in `say` must come from the board's `sources`. Paraphrases
are never shown in quotation marks; only real quotes are (`pullquote` without
`"plain": true`).
