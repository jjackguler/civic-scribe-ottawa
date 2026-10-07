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

- Headlines come only from publishers' public feeds and always link to the original. No generated or rewritten news.
- Photos are the publisher's own and are credited; if one fails to load, the story shows without a picture.
- Opinion stays on the Editor's desk and is labelled as opinion.
- Ads are labelled "Advertisement"; sponsored content is labelled and never placed in the news feed. Full policy: `/standards`.

## Development

```
npm install
npx vite dev
npx vite build
```

The previous Ottawa civic site is preserved on the `civic-ottawa-archive` branch.
