# AI Broadsheet Originals (explainer videos)

Twice a day (07:30 and 17:30 Toronto time) a GitHub Action makes one 45–75 second vertical explainer in our newspaper-collage style: the same look as the hand-made explainers (torn clippings, ransom-note letters, scissor-cut archive figures, red pencil, stamps, price tags, receipts, paper wipes, CC0 sounds and a ducked music bed).

1. **Story.** The owner's queue first, then our own newest newsroom article, then the story the most outlets are covering (see [Choosing the story](#choosing-the-story)).
2. **Storyboard.** One model call (Gemini `gemini-3.8-flash` by default, Claude when `ANTHROPIC_API_KEY` is set) returns a whole storyboard in the collage schema. Every spoken line and every on-screen word, number, name and quote goes through the fact guard; one retry with the problems listed; otherwise nothing is made and the story is skipped for a week.
3. **Voice.** ElevenLabs narrates each scene with a stock (premade) voice, never a cloned one. The `/with-timestamps` endpoint gives the time of every character, which becomes `timing.json` (scenes → sentences → words) for the captions and the cues.
4. **Render.** `scripts/originals/collage/render-collage.ts` draws every frame in Chromium (1080×1920, 30 fps), mixes the voice with CC0 sound effects and music, and makes a poster.
5. **Publish.** The MP4 and the poster are committed to the `media` branch under `originals/files/`, then the manifest entry is added with the video URL pinned to that commit on jsDelivr. The site shows it on the home page and at `/originals`. Optional: YouTube upload.

Code: `scripts/originals/`, workflow: `.github/workflows/originals.yml`.

## Choosing the story

In this order:

1. **The owner's queue**: `originals/queue.json` on the `media` branch. Taken from the top, one per run.
2. **Our newsroom**: the newest article in the `newsroom` branch (`index.json`, `articles/<id>.json`) from the last 72 hours that has no video yet and is not in `killed.json`.
3. **The desk**: the story covered by the most outlets in the last 24 hours (at least two) that we haven't explained yet.

Outside the queue the pipeline never picks a story about **children, health, elections, or accusations against people** (lawsuits, police, fraud, firings…). A queued story skips that filter: you chose it.

### How to queue a story

GitHub → branch `media` → `originals/queue.json` → edit (pencil icon) → commit. Create the file if it isn't there:

```json
[
  { "articleId": "1kc5xax", "note": "focus on what it means for small newsrooms" },
  { "url": "https://www.theverge.com/2026/10/09/some-story" },
  { "storyId": "d41d8cd98f" }
]
```

- `articleId`: one of our newsroom articles (the id in its JSON on the `newsroom` branch).
- `url`: a publisher's article. If it's on our desk its sibling reports are used too; if not, the page itself is read (title, description and paragraphs).
- `storyId`: a story id from the desk.
- `note` (optional): what to emphasise. It guides the writer only; it is never a source of facts.

What happened to each item is written to `originals/queue-done.json` (`made` with the video id, or `skipped` with the reason). Items that can't be found are removed with a reason. A run that stops for a missing key or an exhausted quota leaves the queue as it is.

Stories that failed the fact guard are listed in `originals/skipped.json` and not tried again for a week.

## Styles

| `ORIGINALS_STYLE` | What you get |
| --- | --- |
| `collage` (default) | The collage explainer described above. |
| `cards` | The original yellow/black card renderer (`render.ts`), one card per sentence. A fallback if the collage render ever misbehaves. |

Set the repository variable `ORIGINALS_STYLE`, or pick the style when running the workflow by hand.

### Collage scene types

The writer may use these scene types from `collage.html` + `collage-v2.js` (the same engine as the hand-made `storyboard.*.json`): `ransom`, `clippings`, `numbers`, `scraps`, `bigwords`, `note`, `check`, `quote`, `stamp` (notepad page), `bars`, `prices`, `receipt`, `figure`, `crossout`, `outro`. Backgrounds: `newsprint`, `split`, `kraft`, `cream`, `slate`, `yellow`, `board`. The engine's story-specific scenes (`clock`, `dots`, `flood`, `form`, `frames`) stay for the hand-made boards only.

Clippings always show the publishers' real headlines from our source list (the model only says which source and which words to highlight). The storyboard is checked for layout (lengths that fit the frame, 7–10 scenes, 115–175 words) as well as facts. `out/storyboard.json` in a run is the exact board that was rendered.

### Assets (the `assets` branch)

The workflow checks out the `assets` branch (filled by `.github/workflows/fetch-assets.yml`: public-domain/CC0 photos, newspaper pages, sounds and music, each with a credits entry) and builds a kit with `collage/kit.ts`:

- **Figures**: `collage/figures.json` lists the archive photos to cut out (with a short description for the writer and a credit label). They are cut out once with rembg (`prepare_figures.py`) and cached by the workflow; editing `figures.json` makes a new set.
- **Newspaper pages**: two public-domain front pages (1910 and 1920) for backgrounds.
- **Sounds**: CC0 recordings trimmed per cue (snip, slap, stamp, pencil…); anything missing is synthesised.
- **Music**: your own tracks first, if the assets branch has `music/owner/*.mp3` (or `collage/music/owner/*.mp3`); one is picked per run. Optional `credits.json` in that folder: `{"file.mp3": "Music: “Title”, made by AI Broadsheet with Suno"}`. Without owner tracks, one of five CC0 beds chosen by ear (Freesound ids in `kit.ts`). Nothing is downloaded from Suno by the pipeline: add your files to the branch yourself.

The manifest's `credits` names the archive photos, pages, music and sound authors this video actually used, and the voice.

## One-time setup

Lovable's secrets are not visible to GitHub Actions, so the keys have to be added to the repository too.

GitHub → repository → Settings → Secrets and variables → Actions → **New repository secret**:

| Secret | Needed | What for |
| --- | --- | --- |
| `GEMINI_API_KEY` | yes (or Anthropic) | Storyboard writing (Google AI Studio key) |
| `ANTHROPIC_API_KEY` | optional | When set, Claude writes the storyboard; Gemini becomes the fallback on a quota or credit error |
| `ELEVENLABS_API_KEY` | yes | Narration (with timestamps) |
| `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` | optional | Upload to YouTube. Without them the site plays its own copy. |

Optional **variables** (same page, Variables tab):

| Variable | Default | |
| --- | --- | --- |
| `ORIGINALS_STYLE` | `collage` | `collage` or `cards` |
| `ORIGINALS_GEMINI_MODEL` | `gemini-3.8-flash` | First model tried; then `gemini-3.8-flash`, `gemini-flash-latest` |
| `CLAUDE_MODEL` | `claude-sonnet-5-5` | |
| `ELEVENLABS_VOICE_ID` | first of George, Brian, Daniel, Adam, Matilda, Rachel | A specific stock voice |
| `ELEVENLABS_MODEL` | `eleven_multilingual_v2` | |
| `ORIGINALS_PRIVACY` | `unlisted` | `public`, `unlisted` or `private` on YouTube |
| `COLLAGE_WORKERS` | `2` | Parallel Chromium renderers (match the runner's CPUs) |

**Missing keys and quotas never fail the run.** A missing secret, a rejected key or an HTTP 429 (Gemini, Claude or ElevenLabs) ends the run with a warning, and the run summary says what happened. Nothing is published and the queue is left untouched; the next scheduled run tries again.

**ElevenLabs usage:** a video is about 900–1,100 characters of narration, so two a day is roughly 60,000 characters a month. Check that your plan's monthly allowance covers it.

### YouTube (optional)

1. Google Cloud Console → new project → enable **YouTube Data API v3**.
2. OAuth consent screen: External, add your own Google account as a test user, scope `https://www.googleapis.com/auth/youtube.upload`.
3. Credentials → Create OAuth client ID → **Web application**, authorised redirect URI `https://developers.google.com/oauthplayground`.
4. Open the OAuth 2.0 Playground → gear icon → "Use your own OAuth credentials" → paste the client ID and secret → select `youtube.upload` → Authorize (sign in with the channel's account) → "Exchange authorization code for tokens" → copy the **refresh token**.
5. Add the three `YOUTUBE_*` secrets.

Note: while a Google Cloud project is unverified, YouTube locks API uploads to **private**. The pipeline detects this and the site then plays its own copy from the media branch instead. To publish on YouTube as unlisted/public, request the YouTube API audit for the project. While the consent screen is in "Testing" mode the refresh token expires after 7 days; set the app to "In production" to keep it.

## Running it

GitHub → Actions → **Originals** → Run workflow.

- Tick **dry_run** first: it renders a ~40-second test video with fixture text, silent narration and placeholder timing (no API calls, no keys needed) and attaches it, the poster and the storyboard to the run as an artifact.
- Then run it without dry_run. The run summary shows the chosen story, the storyboard's scenes, the fact guard result, the narration length and the published URL.

Expected time: about 5 minutes of setup (plus ~2 minutes the first time the figures are cut out), then roughly 8–15 minutes to render a 60–75 second video on a 2-vCPU runner. The job timeout is 40 minutes.

Locally (needs `ffmpeg`; Chromium via Playwright or `CHROMIUM_PATH`):

```sh
cd scripts/originals && npm ci && npx playwright install chromium
git fetch origin assets && git worktree add /tmp/assets assets      # the material
ASSETS_DIR=/tmp/assets npx tsx run.ts --dry-run --out out           # test video: out/explainer.mp4
ASSETS_DIR=/tmp/assets npx tsx run.ts --dry-run --stills auto        # one still per scene, in out/work/
```

For the cut-out figures locally, run `python3 collage/prepare_figures.py collage/figures.json /tmp/assets/collage /tmp/figs` once (needs `rembg`) and add `COLLAGE_FIGS_DIR=/tmp/figs`. `publish.ts --no-push` commits into a media checkout without pushing.

## Standards

- Every name and number spoken or shown must appear in the sources; quotes must be word for word, or are shown as a paraphrase without quotation marks.
- Each video names its sources on the last scene and in the description, and links them on the site. Clippings show the publishers' own headlines.
- The AI voice is disclosed on the last scene, in the description and on the site.
- No cloned or real people's voices, no logos. Archive figures are public-domain photos of anonymous historical people, used as decoration only: never cast as the subject of a story or as wrongdoers.
- House voice: human-centred, never demeaning, family-safe, neither fear nor hype.

## Collage engine files

- `collage.html` + `collage-v2.js`: the scene engine (one storyboard JSON per video; see `storyboard.*.json`).
- `render-collage.ts`: frame-by-frame render, then the mix (voice −18 LUFS, music ~13 LU under and ducked, final −15 LUFS). Writes `sfx-used.json` for the credits.
- `kit.ts`: builds the material from the `assets` branch; `figures.json` + `prepare_figures.py`: the cut-out figures; `prepare_sfx.py`: the same sound preparation in Python, for hand-made work.
- `tts_kokoro.py`: local open-weights narration for hand-made previews (same timing format, without word timings).
- `.github/workflows/fetch-assets.yml` + `scripts/assets/fetch_assets.py`: download the material into the `assets` branch with a credits file. Photos are taken only when Wikimedia Commons marks them public domain or CC0; sounds only from Freesound's CC0 filter and Kenney (CC0).

Content rules for the material: no nudity or sexual imagery, no content promoting or attacking religious belief, no violent headlines; real people only as anonymous historical figures, never cast as wrongdoers.
