# Motion comics

Long-form (3–5 minute) motion-comic investigations for AI Broadsheet, 1920x1080, 30 fps.
The first is *The Wrong Face* (The Sir Jack Files, special edition).

- `stories/<slug>.json`: the script, as pages. Each shot has the narration (`say`), its
  `panels` (a scene from `comic-scenes.js`, a rectangle on the page, the word it slides in on),
  a caption-box position (`cap`), overlays (`ov`: chapter, title, balloon, sfx lettering,
  counter, doc, split, check, stamp, type) and sound effects (`sfx`). Narration appears in
  caption boxes; quotes appear in balloons, attributed.
- `comic-scenes.js`: every panel, drawn in code. People are anonymous silhouettes; no likeness.
- `produce.mjs`: ElevenLabs narration with word timings (stock voices only), effects, ambience
  and a score into `build/<slug>/`, then `timeline.json`. `--mock` makes silent placeholders.
- `comic.html`: draws any moment (`window.frame(t)`); `render.mjs`: frames to H.264 plus the mix.

Runs in GitHub Actions (`.github/workflows/comic.yml`) on a push to `comic-run`.
Locally: `npm i && node produce.mjs <slug> --mock && node render.mjs <slug> --stills 10,60`.

Standards: every fact is sourced (the story's `sources`, shown on the end card); claims from
one side's filings are attributed ("his lawsuit says"); dialogue only where a source records it.
