# Maple Wire

Live AI news for Canada, in English and French: a headline wire from public publisher feeds, AI funding programs checked against their official pages, a tools list, plain-language guides, and an editor's column.

## Editing content

| What | File |
| --- | --- |
| Site name, domain, tagline | `src/lib/site.ts` |
| News feeds (RSS/Atom) | `src/lib/news-sources.ts` |
| Funding programs (update "last checked" when you re-verify) | `src/lib/funding.ts` |
| AI tools | `src/lib/tools.ts` |
| Guides | `src/lib/guides.ts` |
| Editor's desk columns (e.g. your LinkedIn articles) | `src/lib/editorials.ts` — add a new object at the top of `EDITORIALS` |
| Interface text (EN/FR) | `src/lib/i18n.ts` |

## Standards

- Headlines come only from publishers' public feeds and always link to the original. No generated or rewritten news.
- Photos are the publisher's own and are credited; if one fails to load, the story shows without a picture.
- Opinion stays on the Editor's desk and is labelled as opinion.

## Development

```
npm install
npx vite dev
npx vite build
```

The previous Ottawa civic site is preserved on the `civic-ottawa-archive` branch.
