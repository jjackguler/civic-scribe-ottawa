# AI Broadsheet: handoff for any new session

Read this first. It is the shared memory between Claude sessions (cloud, this computer, the
AI News project) and Codex. Update it at the end of any session that changes how things run.
Last updated: 25 Oct 2026 (merged with the AI News project's notes of 18–19 Oct).

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
  TikTok avatar and bio reverted twice, so check them from the phone. The Instagram highlight
  covers (The Catch, Prove It, AI vs Real Life, About) aren't set yet, and there is no Threads
  account yet.
- Recurring series: The Catch, Prove It, AI vs Real Life, The Sir Jack Files.
- Automatic posting to Instagram, Facebook and LinkedIn is written but **not merged**: PR #24 (Ink & Gold explainers plus
  `.github/workflows/social.yml`, three runs a day). It posts only once these GitHub secrets
  exist: `META_PAGE_TOKEN`, `FB_PAGE_ID`, `IG_USER_ID`, `LINKEDIN_TOKEN`, `LINKEDIN_ORG_ID`
  (LinkedIn org 143990012). PR #23 was folded into #24.
- After every Facebook or Instagram post, check that the caption is not empty (Business Suite
  sometimes drops it). The Sir Jack Case 03 caption on Facebook is still empty.

## Podcast
"After the Headline": 2 episodes, feed at `aibroadsheet.com/podcast.xml`. It has not been submitted to
Spotify or Apple Podcasts yet; the owner does that.

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

## Owner to-do (only the owner can do these)
- Add the YouTube secrets, and the Meta and LinkedIn secrets if PR #24 is merged.
- Submit the podcast feed to Spotify and Apple.
- TikTok: delete the Trump Jr. and Burger King videos for good, and make the Ohio video private (red lines).
- Answer the open LinkedIn Premium (1 month) question.

## Ideas waiting
- Sir Jack candidates: France's CNAF risk-scoring algorithm ("The Second Suspicion Machine",
  follow-up to Rotterdam), the Mechanical Turk and Amazon, AlphaGo, ELIZA, and current human-rights
  and AI stories. Series idea: "They Said It Would Ruin Us".
- Vertical trailers for the specials The Panic That Wasn't and Twenty-Three Minutes.
- Three new bulletins in the style of the Netflix sample (waiting for the owner's approval).
- Topic sub-shelves on /originals (work, crime, privacy, philosophy, children, algorithms and
  justice). Character explainers (Pip & Quill sample) 2–3 a day if the budget allows.
- Answer the unanswered YouTube comment under the Titanic video.

## Next
1. From this computer: post #12 and #13 to Instagram, TikTok and YouTube. Find the Search
   Console account and read its numbers. Read the AdSense status.
2. Add UTM links to the bios (`?utm_source=instagram`, `tiktok`).
3. One Sir Jack case per day from the newsroom's best story. Post it on every platform the
   same day.
4. Find and filter the automated `/news` traffic so the visitor numbers mean something.
