# Noir reels

Film-noir news reels (1080x1920, 30 fps, about a minute) for AI Broadsheet.

- `stories/<slug>.json`: the script. Each shot has the narration (`say`), a Gemini still
  prompt (`image`), a camera move (`cam`: `[scale, x, y]` from → to), atmosphere (`fx`: rain,
  snow, fog, glow, flicker, scan), motion-type cards (`ov`) and sound effects (`sfx`).
  A card or effect with `w` starts on that spoken word (plus `at` seconds).
- `produce.mjs`: Gemini stills, ElevenLabs narration with word timings (stock voices only),
  sound effects, a rain bed and a music bed into `build/<slug>/`, then `timeline.json`.
  `--mock` makes placeholders without any API call.
- `reel.html`: draws any moment of the reel on a canvas (`window.frame(t)`).
- `render.mjs`: frames to H.264, narration/effects/music mixed and loudness-normalised.

Runs in GitHub Actions (`.github/workflows/noir.yml`) on a push to the `noir-run` branch.
Locally: `npm i && node produce.mjs <slug> --mock && node render.mjs <slug> --stills 3,20`.
