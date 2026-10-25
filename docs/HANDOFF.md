# AI Broadsheet: handoff for any new session

Read this first. It is the shared memory between Claude sessions (cloud, this computer, the
AI News project) and Codex. Update it at the end of any session that changes how things run.
Last updated: 25 Oct 2026.

## Ground rules from the owner
- Post only from AI Broadsheet's own accounts. Never touch other brands the owner is logged
  into (for example taksim.ca).
- Never ask for or paste secrets in chat. Keys go into GitHub → Settings → Secrets → Actions.
- Don't send the owner's email address to any outside service.
- House rule for news: no stories that could upset people (accusations, crime and courts,
  death and violence, abuse, war and terror, elections). Sensitive but useful stories (health,
  money, security) publish without a human hold. See `scripts/newsroom/upsetting.ts`.
- Every fact comes from a named source; videos list sources on their end card and their page.

## Which session does what
| Work | Where |
|---|---|
| Code, site pages, newsroom, video production, publishing to the site | Cloud Code session (runs while the computer is off) |
| Instagram, TikTok, YouTube uploads, Search Console, AdSense, anything in the browser or on the desktop | Code session on **This computer** (Computer use + Claude in Chrome). Ask the owner before each post. |
| Planning, scripts, briefs | AI News project chat |

## The site
- aibroadsheet.com, TanStack Start, hosted by Lovable (project `8cf3a964-c242-4823-bdc2-f54267f264f9`).
  After a PR merges to `main`, Lovable syncs the commit; publish with Lovable `deploy_project`.
- Store branches: `newsroom` (articles, drafts, attempts), `media` (videos and
  `originals/manifest.json`, `originals/scheduled.json`).
- Every published video has its own page at `/video/<slug of its title>` (transcript, sources,
  VideoObject) and is listed in `sitemap.xml`.
- Analytics: Lovable project analytics; Cloudflare Web Analytics is also installed
  (`cloudflareAnalyticsToken` in `src/lib/site.ts`).
- Social profiles are in `src/lib/site.ts` (`social`).

## Pipelines
- **Newsroom** (`.github/workflows/newsroom.yml`, every 30 min). Gemini writes; writer timeout
  280 s (`NEWSROOM_TIMEOUT_MS`). `NEWSROOM_REVIEW`: `auto` (default), `hold`, `off`.
- **Output watch** (`.github/workflows/output-watch.yml`, daily). Goes red when no article for
  24 h or no new video for 72 h. **When it is red, that is the first job of the day.**
- **Originals** (`.github/workflows/originals.yml`): daily news explainers.
- **The Sir Jack Files** (noir reels, branch `noir-run`, `scripts/originals/noir/`):
  1. Write `stories/<slug>.json` and draw its scenes in a new `scenes<N>.js` (add it to `reel.html`).
     Test locally: `node produce.mjs <slug> --mock && rm -rf build/<slug>/img && node render.mjs <slug> --stills …`.
  2. Put the slug in `queue.txt` and push `noir-run`: the workflow adds ElevenLabs voice, effects
     and music, renders, and uploads an artifact.
  3. Publish from branch `claude/noir-publish`: set `ENTRY`, `SOURCE_RUN`, `ARTIFACT` in
     `noir-publish.yml` (with `LIST: "false"` the files land on `media` for review), push.
  4. Watch the file from `media`, then add the manifest entry pinned to that files commit on
     jsDelivr (`https://cdn.jsdelivr.net/gh/jjackguler/civic-scribe-ottawa@<sha>/originals/files/<id>.mp4`).
- **YouTube Shorts** (`claude/noir-publish`, `noir-youtube.yml` + `scripts/originals/noir-publish/youtube.json`).
  Needs `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` and `YOUTUBE_REFRESH_TOKEN` in GitHub
  secrets. **These are empty today**, so earlier uploads were done from the owner's computer.

## State on 25 Oct 2026
- Newsroom is publishing again after the 11–24 Oct outage: Gemini 503s, a two-source rule,
  150 s timeouts and drafts waiting for an approver. All four are fixed (#19, #20, #22, #30, #32).
  Output watch went red on 19–23 Oct and nobody acted on it.
- Latest videos: Sir Jack #12 *The Locked Room* (OpenAI takes frontier training offline) and
  #13 *The Table of Contents* (Meta Muse share links in public DNS). Both are on the site.
  They are not yet on YouTube, Instagram or TikTok.
- Captions for every video, per platform: `docs/social-kit.md`.
- AdSense: publisher `ca-pub-2619122418823802` is in `src/lib/ads.ts`, and `ads.txt` is generated.
  Serving is **off** in code (`ADSENSE_SERVING_ENABLED = false`). Approval status is unknown and
  must be checked in AdSense → Sites.
- Search Console: we don't know which Google account holds it. There is no verification tag
  in the code, so it is likely DNS-verified.
- Traffic (Lovable, 10–24 Oct): about 2,000 visitors, but most look automated
  (`/news`, desktop, direct, 1 page). Google brought 366 visits. Social referrals were tiny.
- Held newsroom draft: Meta Muse (`drafts/1hxzldk.json`), left unpublished on purpose.

## Next
1. From this computer: post #12 and #13 to Instagram, TikTok and YouTube. Find the Search
   Console account and read its numbers. Read the AdSense status.
2. Add UTM links to the bios (`?utm_source=instagram`, `tiktok`).
3. One Sir Jack case per day from the newsroom's best story. Post it on every platform the
   same day.
4. Find and filter the automated `/news` traffic so the visitor numbers mean something.
