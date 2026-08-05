# Live secondary grid + guaranteed headline image fallback

## 1. Headline fallback everywhere a live item renders

The newsprint SVG fallback (headline text over the section accent colour) already exists in `src/lib/image-fallback.ts`. The gap is that live RSS items with an empty/missing `image` can reach an `<img>` with an empty or broken `src`, which paints a flat grey box instead of firing the fallback.

Fix in one place so every live surface inherits it:

- Add a small `LiveImage` wrapper (or extend `NewsImage`) that treats missing, empty, or non-`http` `src` as "no image" and renders the newsprint data URI built from the item's headline plus its region accent (civic red for OTTAWA, river blue for CANADA) — never an empty `src`.
- Keep the existing `onError` fallback so remote images that fail to load also fall back to the headline SVG.
- Apply it to every live-fed card surface: hero carousel slides, the new secondary grid, and any other component consuming `useLiveFeed`.

## 2. Secondary story grid pulls from the live feed

The 2-up section directly under the hero on `src/routes/index.tsx` currently renders `ARTICLES[0..2]` (the stale "OC Transpo" / "Council approves 312 units" mock cards).

- New `LiveStoryCard` component rendering a live feed item: image (with the fallback above), region kicker (`OTTAWA` red / `CANADA` river blue) plus the source name, headline linking out to the source in a new tab, and a relative timestamp.
- Replace the mock lead block with items ranked #2–#5 from the same merged `useLiveFeed()` list the hero uses: item #2 as the large card, #3–#5 in the side column.
- Timestamps use the existing client-only relative formatting so SSR and client agree (no hydration mismatch).
- If the live feed is empty or still loading, keep the current mock article cards as the fallback so the page is never blank.

Untouched: Kids & Family, Youth, Sales & Deals, Canada guides, Citizen Reports, nav, and the feed backend.

## Verification

Fetch `/api/public/news-feeds`, then load the homepage in a headless browser and report the actual headlines rendered in the grid, plus a screenshot proving a CBC item with no feed image shows its headline on the newsprint background.
