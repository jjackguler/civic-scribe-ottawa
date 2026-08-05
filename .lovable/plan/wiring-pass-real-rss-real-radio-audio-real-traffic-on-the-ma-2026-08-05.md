# Wiring pass — real RSS, real radio audio, real traffic on the map

Plumbing only. No new sections, no nav changes, no backend rewrites.

## Part 1 — Hero + ticker from live RSS

New server route `src/routes/api/public/news-feeds.ts` following the exact pattern already used by `api/public/ottawa-traffic.ts` (in-memory cache, 5-minute TTL, stale-cache-on-failure, normalized JSON output).

Feeds fetched in parallel, each wrapped so one failure never blocks the others (failed feed is logged and reported in the response's `sources` array):

- CBC Ottawa — region OTTAWA
- City of Ottawa — region OTTAWA
- Global News Ottawa — region OTTAWA
- CTV News Ottawa — region OTTAWA
- Canada Revenue Agency and Employment and Social Development Canada — region CANADA (exact feed URLs resolved from the canada.ca web-feeds index during implementation; if either 404s it is marked failed and skipped)

Each item is normalized to: id, title, link, source name, region (`ottawa` | `canada`), publishedAt, image (when the feed provides one), and an `urgent` flag derived from breaking/alert wording in the title.

Client hook `useLiveFeed()` fetches this route, sorts urgent-first then by recency, and re-fetches every 60 seconds.

**Hero (`BreakingHero.tsx`)** — hardcoded card array replaced by the top 5 merged items. Rotating carousel: 8s auto-advance, crossfade, clickable progress dots, pause on hover/focus, and no auto-advance when `prefers-reduced-motion` is set. Re-ranking on the 60s refresh only takes effect between slides, so a slide never changes mid-transition. Keeps the existing developing-story strip below.

**Ticker (`LiveTicker.tsx`)** — component keeps its current markup and animation; homepage/breaking usages are fed from the same merged list instead of the hardcoded `LIVE_TICKERS.breaking` array. Other tickers (sports, food, good news) stay on their existing data.

**Kicker colour rule** — OTTAWA items keep the current red kicker; CANADA items use the existing river-blue token. Same treatment in hero, ticker and story cards. No new nav entry.

**Image fallback** — items with no feed image use the existing `newsprintDataURI` helper with the headline text and the section accent colour, so the placeholder always carries the headline rather than rendering as a flat colour block. Any card path currently producing a text-less placeholder is corrected to pass the headline through.

## Part 2 — Radio uses the existing ElevenLabs endpoint

`TrafficRadio.tsx` only:

- `speak()` POSTs `{ script, locale }` to `/api/public/traffic-radio`.
- If the response is `audio/mpeg`, play it through an `<audio>` element (volume slider and stop button drive that element).
- If the response is JSON with `mock: true`, fall back to `window.speechSynthesis` exactly as today.
- The "generated locally using your browser's speech synthesis" note renders only when the mock path was actually taken; real-audio mode shows an on-air/voice label instead.
- Network error → same speech-synthesis fallback with a short error note.

Backend endpoint untouched.

## Part 3 — Map plots real traffic events

`/map` and the homepage embed fetch `/api/public/ottawa-traffic` and convert events into existing `MapSignal` records of type `traffic` (severity mapped to the current styling). They are merged with the current 311 / road-closure / parks / public-safety signals; none of those generators, the clustering, or the visual style change.

- Events missing lat/lng are not dropped and not given fake coordinates — they appear in a small "Reported, location not mapped" list beside the map.
- The "sample data" badge becomes "Live traffic · City of Ottawa" once real events load, and reverts to the sample wording only if the feed is unavailable.

## Reporting

After the pass: which feeds returned items (with real fetched headlines as proof), which failed and why, and whether the radio returned real ElevenLabs audio or fell back to mock (with the reason, e.g. no API key configured).

## Technical notes

- RSS parsing is done with a small regex/XML extraction in the server route — no new dependency, Worker-safe.
- `process.env` reads stay inside handlers.
- Fetching happens client-side via the public route (not a route loader), so prerender never blocks on upstream feeds.
