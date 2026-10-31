# AI Broadsheet

The world's AI newspaper, live, in English and French: news from public publisher feeds filed into topic desks, a front page led by the story most outlets are covering, video, interviews and podcasts, a Canadian AI Ministry tracker, ad positions and a media kit.

## Editing content

| What | File |
| --- | --- |
| Site name, domain, tagline | `src/lib/site.ts` |
| News feeds (RSS/Atom) | `src/lib/news-sources.ts` |
| Funding programs (update "last checked" when you re-verify) | `src/lib/funding.ts` |
| AI tools | `src/lib/tools.ts` |
| Guides | `src/lib/guides.ts` |
| Editor's desk columns (e.g. your LinkedIn articles) | `src/lib/editorials.ts` — add a new object at the top of `EDITORIALS` |
| Social media picks (popular X / LinkedIn posts, added by hand) | `src/lib/social.ts` |
| Video channels and podcasts | `src/lib/media-sources.ts` |
| Your own headline for a big story (shown with the original underneath) | `src/lib/desk.ts` |
| Ads: direct campaigns, Google AdSense IDs | `src/lib/ads.ts` (+ `public/ads.txt` once AdSense approves you) |
| Owner details, newsletter, contact emails, analytics token, social links (TODO values) | `src/lib/site.ts` |
| Full story or headline-only per publisher (default: headline-only) | `src/lib/rights.ts` (see `docs/feed-terms.md`) |
| Buildgena Studio pieces (editor-approved, AI-assisted) | `src/content/studio/<id>.json` → `/desk/<id>` (schema in `src/lib/studio-schema.ts`) |
| Founding sponsors of the newsletter | `FOUNDING_SPONSORS` in `src/lib/ads.ts` |
| Corrections log | `src/lib/corrections.ts` |
| Interface text (EN/FR) | `src/lib/i18n.ts` |

## Languages and SEO

English pages live at `/path`, French at `/fr/path` (router rewrite in `src/router.tsx`). Every page sets its title, canonical URL, hreflang alternates, share card and JSON-LD through `seoHead()` in `src/lib/seo.ts`. `/sitemap.xml`, `/rss.xml` and `/fr/rss.xml` are built live from the news desk.

## Reader forms (newsletter, tips)

The Canadian AI Brief sign-up posts to `/api/subscribe`, the tip form to `/api/tip`. Both validate,
forward JSON to a webhook and store nothing (no database, no address or message in logs, nothing in the browser).

| Secret (Project Settings → Secrets) | What it does |
| --- | --- |
| `SUBSCRIBE_WEBHOOK_URL` | https URL that receives each sign-up with its CASL consent record (wording, version, time, page). Without it the form says sign-ups open with issue #1 and offers an email. |
| `SUBSCRIBE_WEBHOOK_SECRET` (optional) | Sent as `Authorization: Bearer …` so the receiver can reject anything else. |
| `TIP_WEBHOOK_URL` / `TIP_WEBHOOK_SECRET` (optional) | Same for tips and pitches. |

If `SITE.newsletter.url` is set in `site.ts`, the sign-up box sends readers to the provider's own page instead (after the consent box is ticked).

## Docs

- `docs/ad-readiness.md` — what advertising needs, and the owner checklist
- `docs/feed-terms.md` — what each publisher's feed terms say
- `docs/proposals.md` — story archive (D1) and global Claude cap (KV), awaiting approval
- `docs/funding-todo.md` — funding programs to verify before adding

## Standards

- Headlines come only from publishers' public feeds and always link to the original. Headlines are never rewritten; machine translations are labelled and link to the original.
- Photos are the publisher's own and are credited; if one fails to load, the story shows without a picture.
- Opinion stays on the Editor's desk and is labelled as opinion.
- Ads are labelled "Advertisement"; sponsored content is labelled and never placed in the news feed. Full policy: `/standards`.

## How we use Claude

Claude (Anthropic) is used for:

1. **AI desk** (`src/lib/ai-desk.server.ts`) — for new lead stories, a headline and a brief of at most two sentences in EN and FR, written only from the publishers' headlines and excerpts for that story. A fact guard rejects the copy if any number (with its scale) or capitalised name is not in the source text; the publisher's headline then stays. Labelled "AI desk headline" on cards and explained on the story page, with the original headline and excerpt. Runs in the background after each desk rebuild (6 stories per run), results shared across isolates.
2. **Translation** — EN↔FR for stories without AI desk copy, labelled "Translated with Claude".
3. **Grouping** — checks whether headlines grouped as one event really are the same event.
4. **Funding-page change detection** and **newsletter drafting** — for an editor to review; never published automatically.

Claude never invents news, never writes about a story no publisher has, and never makes pictures that look like news photos. Stories without a usable photo get a designed cover (`StoryCover`).

Setup: add `ANTHROPIC_API_KEY` and `EDITOR_PASSCODE` in Project Settings → Secrets (optional `MAX_DAILY_CLAUDE_CALLS`, default 300 — each AI desk run is one call). Without the key the site shows publishers' headlines.

## Shared cache

Every Cloudflare isolate keeps its own memory, so `src/lib/shared-cache.ts` keeps the last built news desk, media desk and AI desk in the Workers Cache API. A fresh isolate serves that copy at once and refreshes in the background. /about → Desk status shows where the copy came from.

## Development

```
npm install
npx vite dev
npx vite build
```

The previous Ottawa civic site is preserved on the `civic-ottawa-archive` branch.
