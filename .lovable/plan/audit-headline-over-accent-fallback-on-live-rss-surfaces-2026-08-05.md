# Audit: headline-over-accent fallback on live RSS surfaces

## What the audit found

Four surfaces render live RSS items today:

| Surface | File | Image? | Fallback status |
| --- | --- | --- | --- |
| Hero carousel | `BreakingHero.tsx` | yes | Partial — see gaps below |
| Secondary live grid | `index.tsx` → `LiveStoryCard` → `LiveImage` | yes | Correct |
| Ticker / live alerts rail | `BreakingNewsBar.tsx` | no images rendered | N/A |
| Breaking page (`/breaking`) | `breaking.tsx` | no live feed, mock only | N/A |

So the only real gap is the hero carousel. It builds `image: item.image || newsprintDataURI(...)` and has an `onError` handler, which covers the common cases but differs from the hardened `LiveImage` logic in three ways:

1. A whitespace-only or non-`http` `image` value (relative path, `data:`, junk from a feed) passes the `||` check and reaches the DOM as a real `src`. It only recovers after a network failure, so the slide can flash an empty box.
2. The hero's `onError` clears `onerror` immediately, so if the newsprint data URI itself were ever rejected there is no guard — `LiveImage` uses a `data-fallbackStep` marker for this.
3. The fallback logic is duplicated rather than shared, so future live surfaces can drift again.

## The fix

- Swap the hero's raw `<img>` for the existing `LiveImage` component, passing `headline={c.title}` and `region={c.region}`. This makes the "missing, empty, or non-http src never reaches the DOM" rule identical across every live surface.
- Drop the now-redundant `image` field from the hero's `BreakingCard` mapping (and the `newsprintDataURI` call in `toCard`/`fallbackCards`), letting `LiveImage` own placeholder generation. Keep the mock fallback cards rendering through the same component so both paths behave identically.
- No visual change: `LiveImage` forwards `className`, `loading`, and `alt`, so the carousel keeps its `object-cover` full-bleed styling and eager/lazy behaviour.

Nothing else changes — ticker, breaking page, editorial cards, and the feed backend stay as-is.

## Verification

Fetch `/api/public/news-feeds` to identify which current items have no `image`, then load the homepage headless and confirm each hero slide for those items paints the headline on the region accent (red for OTTAWA, river blue for CANADA) with no blank frame, including immediately on first paint before any network error fires.
