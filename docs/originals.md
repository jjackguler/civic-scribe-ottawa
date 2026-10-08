# AI Broadsheet Originals (explainer videos)

Twice a day (07:30 and 17:30 Toronto time) a GitHub Action makes one 45–70 second vertical explainer about the AI story the most newsrooms are covering:

1. The news desk (same engine as the site) picks the story with the most outlets in the last 24 hours that we haven't explained yet.
2. Claude writes the script from the publishers' own headlines and excerpts. The fact guard rejects any name or number that isn't in the sources (one retry, then nothing is published).
3. ElevenLabs narrates each card with a stock (premade) voice. Never a cloned voice.
4. Optional: Gemini draws an abstract illustration per card. No people, logos or text; the card says "AI illustration".
5. The cards are rendered in the house style (yellow/black) and joined with FFmpeg at 1080×1920.
6. The video and a poster are kept as a GitHub release. Optional: the video is uploaded to YouTube with the synthetic-media flag.
7. The entry is added to `originals/manifest.json` on the `media` branch. The site reads it and shows the newest explainers on the home page and at `/originals`.

Code: `scripts/originals/`, workflow: `.github/workflows/originals.yml`.

## One-time setup

Lovable's secrets are not visible to GitHub Actions, so the keys have to be added to the repository too.

GitHub → repository → Settings → Secrets and variables → Actions → **New repository secret**:

| Secret | Needed | What for |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Script writing |
| `ELEVENLABS_API_KEY` | yes | Narration |
| `GEMINI_API_KEY` | optional | Illustrations (Google AI Studio key). Without it the cards are plain yellow. |
| `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` | optional | Upload to YouTube. Without them the site plays its own copy. |

Optional **variables** (same page, Variables tab):

| Variable | Default | |
| --- | --- | --- |
| `ORIGINALS_PRIVACY` | `unlisted` | `public`, `unlisted` or `private` on YouTube |
| `ELEVENLABS_VOICE_ID` | first of George, Brian, Daniel, Adam, Matilda, Rachel | A specific stock voice |
| `GEMINI_IMAGE_MODEL` | `gemini-2.5-flash-image` | |
| `CLAUDE_MODEL` | `claude-sonnet-5-5` | |

### YouTube (optional)

1. Google Cloud Console → new project → enable **YouTube Data API v3**.
2. OAuth consent screen: External, add your own Google account as a test user, scope `https://www.googleapis.com/auth/youtube.upload`.
3. Credentials → Create OAuth client ID → **Web application**, authorised redirect URI `https://developers.google.com/oauthplayground`.
4. Open the OAuth 2.0 Playground → gear icon → "Use your own OAuth credentials" → paste the client ID and secret → select `youtube.upload` → Authorize (sign in with the channel's account) → "Exchange authorization code for tokens" → copy the **refresh token**.
5. Add the three `YOUTUBE_*` secrets.

Note: while a Google Cloud project is unverified, YouTube locks API uploads to **private**. The pipeline detects this and the site then plays its own copy from the GitHub release instead. To publish on YouTube as unlisted/public, request the YouTube API audit for the project. While the consent screen is in "Testing" mode the refresh token expires after 7 days; set the app to "In production" to keep it.

## Running it

GitHub → Actions → **Originals** → Run workflow.

- Tick **dry_run** first: it renders a test video without calling any API and attaches it to the run as an artifact.
- Then run it without dry_run. The log shows the chosen story, the fact guard result and the YouTube link.

Locally: `cd scripts/originals && npm ci && npx playwright install chromium && npx tsx run.ts --dry-run` (needs `ffmpeg`).

## Standards

- Every name and number spoken or shown must appear in the publishers' text.
- Each video names its sources on the last card and in the description, and links them on the site.
- AI voice and AI illustrations are disclosed on the card, in the description and on the site.
- No cloned or real people's voices, no logos. AI-generated images never show people. Archive photos of people are public domain historical images, used as illustration only and never cast as the subject of a story.

## Collage style (v2)

`scripts/originals/collage/` renders the newspaper-collage look: torn clippings, ransom-note letters, scissor-cut figures from public-domain photos, red pencil, price tags, receipts and paper wipes, with real CC0 sound effects and a ducked CC0 music bed.

- `collage.html` + `collage-v2.js`: the scene engine (one storyboard JSON per video; see `storyboard.*.json`).
- `prepare_figures.py`: cuts people out of public-domain photos (rembg) and adds the white scissor rim.
- `prepare_sfx.py`: trims and levels CC0 recordings into a cue library (`sfx-map.json`).
- `render-collage.ts`: frame-by-frame render, then the mix (voice −18 LUFS, music ~13 LU under and ducked, final −15 LUFS).
- `.github/workflows/fetch-assets.yml` + `scripts/assets/fetch_assets.py`: download the material into the `assets` branch with a credits file. Photos are taken only when Wikimedia Commons marks them public domain or CC0; sounds only from Freesound's CC0 filter and Kenney (CC0).

Content rules for the material: no nudity or sexual imagery, no content promoting or attacking religious belief, no violent headlines; real people only as anonymous historical figures, never cast as wrongdoers.
