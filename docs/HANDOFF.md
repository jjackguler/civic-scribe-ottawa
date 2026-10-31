# AI Broadsheet: handoff for any new session

Read this first. It is the shared memory between Claude sessions (cloud, this computer, the
AI News project) and Codex. Update it at the end of any session that changes how things run.
Last updated: 31 Oct 2026 (Broadsheet v2 redesign on branch `broadsheet-v2`, PR open, not merged).

## Ground rules from the owner
- Post only from AI Broadsheet's own accounts. Never touch other brands the owner is logged
  into (for example taksim.ca).
- Never ask for or paste secrets in chat. Keys go into GitHub → Settings → Secrets → Actions.
- Don't send the owner's email address to any outside service.
- House rule for news: no stories that could upset people (accusations, crime and courts,
  death and violence, abuse, war and terror, elections). Sensitive but useful stories (health,
  money, security) publish without a human hold. See `scripts/newsroom/upsetting.ts`.
- Every fact comes from a named source; videos list sources on their end card and their page.
  Company statements are shown as claims.
- Red lines: no advertising content, no party politics or political figures, nothing that targets
  anyone, no racism or discrimination, no sexual content, no insults or swearing, nothing that
  mocks a religion, no legal risk. Real people's faces are never shown; quoted lines come only
  from real records. AI use is always disclosed.
- Tone: human-centred AI journalism, neither fear nor hype. Name people's worries plainly, then
  end on what the sources show people can do. Full charter: `src/lib/editorial.ts` and /values.
- Spend carefully: no Lovable credits (everything goes through GitHub), ElevenLabs is on the
  Creator plan (narration per episode, shared music and effects), no paid Gemini images, Suno only
  with a paid plan. No buying followers. Posting or archiving on social needs the owner's explicit yes.
- Talk to the owner in Turkish; narration and social captions are in English.

## Decided 25 Oct 2026
- **One working chat:** the Code session on **This computer**, opened in `Desktop\AI NEWS`. It does
  everything: code, videos, the site, and posting through the owner's logged-in Chrome. No API tokens
  are needed for posting that way; tokens (PR #24) are only for fully automatic posting and are parked.
- **Never post or share anything on social media without asking the owner first**, every time.
- Next project to add to the site: the owner's **immersive journalism** work (Unreal), from the
  same computer.

## Broadsheet v2 (31 Oct 2026, branch `broadsheet-v2`, awaiting the owner's review)
- Redesign: Newsreader serif headlines, warm paper, centred masthead + sticky section bar, text-first
  cards (other publishers' photos are off), new front page, desk, story, footer. The owner authorised
  a broad visual change this time; Ink & Gold is still confined to the logo and brand assets.
- Rights: every publisher is headline-and-link by default; TechCrunch allowed in full. See
  `docs/feed-terms.md`. Shared desk snapshot key is now `desk:v2`.
- Editor named everywhere as **Cem (Jack) Guler** (`SITE.editor.name`). Publisher GEN:A Labs links
  to buildgena.ca (footer, /about#ownership, JSON-LD). `SITE.publisher.mailingAddress` is a TODO (CASL).
- New pages: /how-we-use-ai, /canada (hub), /tips, /desk and /desk/<id> (Buildgena Studio pieces),
  rebuilt /about, /newsletter, /advertise ("Founding sponsors" of The Canadian AI Brief).
- Newsletter: The Canadian AI Brief (weekly). First-party form → `/api/subscribe` → secret
  `SUBSCRIBE_WEBHOOK_URL`; until it is set the form says "opening soon" with an email fallback.
- Studio: approved pieces are committed as `src/content/studio/<id>.json`; `scripts/studio-test.ts`
  validates them in CI. The example is only in `scripts/fixtures/studio/`.
- Dev preview without network: `AIB_NEWS_FIXTURE=1 npx vite dev` serves a fictional desk.

## Generative imagery withdrawn (29 Oct 2026)
- Owner decision: the three Sir Jack special editions made with Google Flow / Veo (Twenty-Three
  Minutes, The Panic That Wasn't, The Wrong Face) are off the site: removed from
  `originals/manifest.json` on `media`, and their `/video/...` pages answer 410 (`src/lib/gone.ts`).
  Social copies were not touched. New work uses code-drawn scenes only, no generated images or video.
- The `/dispatch` page is "Newsroom summaries", not "Our articles": its pieces are AI-assisted
  summaries of other outlets' reporting. Reserve "our articles" for our own reporting.

## Open Desk Journalism (28 Oct 2026)
- Owner approved a /about "How we work" section and a short home-page introduction linking
  to /about#how-we-work, using the existing typography, colours and layout components.
- Owner revised the public positioning: explain editorial leadership, the developing team,
  human-centred journalism and creative/immersive work. Open Desk Journalism combines editorial
  judgment, collaboration and new storytelling; do not promise to reveal the whole operation.
- Remove the public source directory and feed diagnostics/counts from About. Keep the working
  source configuration in code. Simplify standards to editorial principles without sourcing
  inventories, collection methods, model/vendor pipelines or numeric workflow thresholds.
  Keep article-level credits, AI labels and corrections. Do not claim worldwide first use.
- Jack leads editorial direction and is building a small team with volunteer university
  students, beginning with interviews and reporting projects. No institutional affiliation,
  team size or paid staffing is claimed.
- Explain immersive work as developing realistic 3D/360 journalism experiences with Unreal
  Engine, Blender and AI-assisted workflows, clearly identifying reconstructions and uncertainty.
- Distinguish automated routine coverage and source checks from human editorial responsibility;
  do not claim every automated item receives individual human review before publication.

## Immersive Journalism (added 26 Oct 2026)
- `/immersive` (hub) and `/immersive/<slug>` (case page) read from `src/lib/immersive.ts`.
  First case: `/immersive/challenger-1986`. The Dallas 1963 case is **not** published; the owner
  wants to review it first.
- The case page shows Unreal Engine output only: 10 stops (360° view and short film each), a
  walkthrough, the launch film and the teaser. Stop media is under `immersive/challenger-1986/unreal/`
  on `immersive-media`, with `manifest.json` (camera positions and what is estimated). The earlier
  browser (Three.js) build was taken off the site on 26 Oct at the owner's request. Render scripts are
  on the owner's PC: `Scripts\75_web_export.py`, `75_web_export.ps1`, `76_web_manifest.py`.
- Films, stills and 360° views live on branch `immersive-media` and load through jsDelivr pinned to
  its commit (`MEDIA_SHA` in `src/lib/immersive.ts`). To add media, commit there and bump the SHA.
- The Windows (Unreal) edition is on the owner's PC (`D:\Unreal Projects\AIB_Challenger1986\Build\Windows`,
  about 1.14 GB) and is not offered for download yet.

## Which session does what
| Work | Where |
|---|---|
| Code, site pages, newsroom, video production, publishing to the site | Cloud Code session (runs while the computer is off) |
| Instagram, TikTok, YouTube uploads, Search Console, AdSense, anything in the browser or on the desktop | Code session on **This computer** (Computer use + Claude in Chrome). Ask the owner before each post. |
| Planning, scripts, briefs | AI News project chat |

## Brand: Ink & Gold
One visual language everywhere; nothing off-kit is posted. Ink #16181A background, Paper #EFE8DA
text, Gold #D7B54A for our voice (the b logo, key phrase, big numbers), Red #D9412B only for news
(live dot, "The catch", stamps). Headlines in Bodoni Moda caps, text in Schibsted Grotesk, photos
black and white. Stamps: COMPANY CLAIM, NO HUMAN REVIEW, CHECKED, NOT YET PROVEN. The old Hüdhüd
identity and the old yellow are retired. The kit and brand files are on the owner's computer
(`Desktop\AI NEWS\AI-Broadsheet-Devam`: `brand/`, `social/kit/ink-gold-kit.html`).
Bio everywhere: "AI news, with the human stakes left in. One catch a day." Sign-off: "AI news. Humans in charge."

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

## Social channels
- LinkedIn is the channel that brings readers: the owner's personal profile (about 1,940
  followers) shares the long films and tags AI Broadsheet. The "Introducing AI Broadsheet"
  carousel is live there. Posts went to 5 groups; some are waiting for admin approval.
- All accounts got the Ink & Gold avatar, banner, bio and UTM link on 18 Oct. Exception: the
  TikTok avatar and bio reverted twice (on 25 Oct the avatar was still a cartoon figure, not the
  Ink & Gold logo), so check them from the phone. The Instagram highlight
  covers (The Catch, Prove It, AI vs Real Life, About) aren't set yet, and there is no Threads
  account yet.
- Recurring series: The Catch, Prove It, AI vs Real Life, The Sir Jack Files.
- Automatic posting to Instagram, Facebook and LinkedIn is written but **not merged**: PR #24 (Ink & Gold explainers plus
  `.github/workflows/social.yml`, three runs a day). It posts only once these GitHub secrets
  exist: `META_PAGE_TOKEN`, `FB_PAGE_ID`, `IG_USER_ID`, `LINKEDIN_TOKEN`, `LINKEDIN_ORG_ID`
  (LinkedIn org 143990012). PR #23 was folded into #24.
- After every Facebook or Instagram post, check that the caption is not empty (Business Suite
  sometimes drops it). The Sir Jack Case 03 caption on Facebook is still empty.
- The Instagram grid still shows an old "NOV 3 ELECTION DAY" post (red line: elections). Archive
  it only after the owner says yes.
- Posting the 18 MB videos from the owner's Chrome (worked on 25 Oct):
  - YouTube Studio: fetch the mp4 from `raw.githubusercontent.com/.../media/originals/files/<id>.mp4`
    inside the page and put it on `input[name=Filedata]`. Title, description and tags come from
    `scripts/originals/noir-publish/youtube.json` on `claude/noir-publish`.
  - Instagram and TikTok block that fetch. Split the mp4 into 9 MB parts inside the session
    folder, upload each part to a hidden file input (10 MB per call), join them in the page with
    `new File(parts)` and hand that to the site's video input. Delete the parts afterwards.
  - Instagram: "Original" crop, the poster jpg as cover, "Add AI label" on. Line breaks in the
    caption need real Enter presses.
  - TikTok: type the description with real keystrokes (scripted text insertion crashes the
    editor), one hashtag at a time. "AI-generated content" is under "Show more". A new post
    shows "Only me" while it is under review, then turns to Everyone.
  - Every caption carries the AI disclosure and the source names.

## Podcast
"After the Headline": 2 episodes, feed at `aibroadsheet.com/podcast.xml`. It has not been submitted to
Spotify or Apple Podcasts yet; the owner does that.

## State on 25 Oct 2026
- Newsroom is publishing again after the 11–24 Oct outage: Gemini 503s, a two-source rule,
  150 s timeouts and drafts waiting for an approver. All four are fixed (#19, #20, #22, #30, #32).
  Output watch went red on 19–23 Oct and nobody acted on it.
- Latest videos: Sir Jack #12 *The Locked Room* (OpenAI takes frontier training offline) and
  #13 *The Table of Contents* (Meta Muse share links in public DNS). Both are on the site and,
  since 25 Oct, public on YouTube (shorts/YUONbChX5ZQ, shorts/hEo1XyKYRes), Instagram
  (reel/De5sjz0xWc1, reel/De5s2yqxm1f) and TikTok (video/7700437192111426824,
  video/7700437675630759176). Not posted to LinkedIn, Facebook or X.
- Captions for every video, per platform: `docs/social-kit.md`.
- AdSense: publisher `ca-pub-2619122418823802` is in `src/lib/ads.ts`, and `ads.txt` is generated.
  Serving is **off** in code (`ADSENSE_SERVING_ENABLED = false`). The account lives on
  **aibroadsheet@gmail.com**. On 25 Oct it said "Your account wasn't approved" (program
  policies, no more detail). Resubmitting means ticking the policy box, so that is the owner's call.
- Search Console: domain property `aibroadsheet.com` on **jjackguler@gmail.com** (not on
  aibroadsheet@gmail.com). Last 28 days to 22 Oct: 3 clicks, about 3,000 impressions, average
  position 55; top queries "ai news" and "what is an algorithm in ai". 264 pages indexed. 707
  pages are excluded by noindex: the `/story` and `/fr/story` summaries, noindex on purpose.
  84 more are "discovered, not indexed". Search Console's 3 clicks against Lovable's 366
  "Google" visits backs the automated-traffic suspicion.
- Traffic (Lovable, 10–24 Oct): about 2,000 visitors, but most look automated
  (`/news`, desktop, direct, 1 page). Google brought 366 visits. Social referrals were tiny.
- Held newsroom draft: Meta Muse (`drafts/1hxzldk.json`), left unpublished on purpose.

## Owner to-do (only the owner can do these)
- Add the YouTube secrets, and the Meta and LinkedIn secrets if PR #24 is merged.
- Submit the podcast feed to Spotify and Apple.
- TikTok: delete the Trump Jr. and Burger King videos for good, and make the Ohio video private (red lines).
- Answer the open LinkedIn Premium (1 month) question.
- Decide whether to resubmit AdSense (aibroadsheet@gmail.com → Home → policy box → Resubmit).
- Say yes or no to archiving the "NOV 3 ELECTION DAY" Instagram post.

## Ideas waiting
- Sir Jack candidates: France's CNAF risk-scoring algorithm ("The Second Suspicion Machine",
  follow-up to Rotterdam), the Mechanical Turk and Amazon, AlphaGo, ELIZA, and current human-rights
  and AI stories. Series idea: "They Said It Would Ruin Us".
- Three new bulletins in the style of the Netflix sample (waiting for the owner's approval).
- Topic sub-shelves on /originals (work, crime, privacy, philosophy, children, algorithms and
  justice). Character explainers (Pip & Quill sample) 2–3 a day if the budget allows.
- Answer the unanswered YouTube comment under the Titanic video.

## Next
1. Post #12 and #13 on LinkedIn (owner's profile, tag AI Broadsheet, links in the first
   comment), Facebook and X, with the captions in `docs/social-kit.md`. Ask the owner first.
2. Add UTM links to the bios (`?utm_source=instagram`, `tiktok`).
3. One Sir Jack case per day from the newsroom's best story. Post it on every platform the
   same day.
4. Find and filter the automated `/news` traffic so the visitor numbers mean something.
