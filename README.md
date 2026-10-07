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
| Newsletter address, contact emails | `src/lib/site.ts` |
| Interface text (EN/FR) | `src/lib/i18n.ts` |

## Standards

- Headlines come only from publishers' public feeds and always link to the original. Headlines are never rewritten; machine translations are labelled and link to the original.
- Photos are the publisher's own and are credited; if one fails to load, the story shows without a picture.
- Opinion stays on the Editor's desk and is labelled as opinion.
- Ads are labelled "Advertisement"; sponsored content is labelled and never placed in the news feed. Full policy: `/standards`.

## How we use Claude

Claude (Anthropic) is used for exactly four things:

1. **Translation** — EN↔FR headlines and summaries, labelled "Translated with Claude" on every item, with the original headline shown and the link to the publisher unchanged.
2. **Grouping** — checks whether headlines grouped as one event really are the same event, and splits them if not. It only groups; it writes nothing.
3. **Funding-page change detection** — compares official program pages with `src/lib/funding.ts` and reports what an editor should re-verify. It never edits the file.
4. **Newsletter drafting** — drafts The Morning Broadsheet for an editor to review before sending.

Claude never writes, rewrites or invents news. Headlines and photos remain the publishers' own. Every Claude output is labelled or reviewed by a human editor before publication.

Setup: add `ANTHROPIC_API_KEY` and `EDITOR_PASSCODE` in Project Settings → Secrets (optional `MAX_DAILY_CLAUDE_CALLS`, default 300). Without the key the site works exactly as before. Editor tools live at `/editor/tools` (not linked, noindex).

## Development

```
npm install
npx vite dev
npx vite build
```

The previous Ottawa civic site is preserved on the `civic-ottawa-archive` branch.
