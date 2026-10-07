# Proposals (not implemented — need the owner's approval)

## 0. Share the news desk across Cloudflare isolates (most urgent)

**Seen live on 2026-10-07:** every Cloudflare isolate keeps its own copy of the desk in memory. A fresh isolate starts empty and needs several seconds to fetch feeds, and it only gets through the first ~30 feeds before it is replaced. Effects: the RSS feed was briefly empty, and slower feeds (provincial and city governments, CBC city desks, the new Canadian sources) rarely appear. The feed order now rotates so each fresh isolate fetches a different slice, and RSS answers 503 instead of an empty feed. Those are stopgaps.

**Proposal.** Store the built desk (the JSON payload, ~200–400 KB) and each feed's last result in a shared store, so every isolate starts warm:
- **Cloudflare Cache API** (`caches.default`): no setup or bindings, shared per data centre. Cheapest first step, if Lovable's hosting exposes it.
- **Workers KV**: shared worldwide, needs a namespace binding.
Either one also fixes most of the "story has left the live desk" cases below.

## 1. Story archive so story pages stay up (audit item 16)

**Problem.** Stories live only in memory (`globalThis`) for ~30 days. After that, or after a cold start on a new Cloudflare isolate, `/story/$id` shows "This story has left the live desk". Google will have indexed those URLs; when they turn thin or empty, the site looks low-quality to search and to ad reviewers.

**Proposal.**
- Store every story the desk publishes in **Cloudflare D1** (SQLite): `stories(id PK, title, summary, link, source, source_id, lang, published_at, image, tags, first_seen, last_seen)`.
- On each news rebuild, upsert the stories (one batched statement — counts as one subrequest).
- `/story/$id` loader: memory first, then D1. Pages stay up permanently.
- Sitemap: split into `/sitemap-pages.xml` and monthly `/sitemap-stories-YYYY-MM.xml`, listed from a sitemap index.
- Keep pages older than 90 days indexable only if they have our own text (editor headline, note or cluster). Otherwise set `noindex, follow` and keep them for readers.

**Alternative.** Lovable Cloud's Postgres (Supabase) if D1 bindings can't be configured from Lovable hosting.

**Cost.** D1's free tier is likely enough at launch; confirm current limits on Cloudflare's pricing page before deciding.

**Needs:** a D1 database bound to the Worker (wrangler config) — confirm Lovable hosting allows custom bindings.

## 2. A real, global daily cap on Claude spend (audit item 17)

**Problem.** `MAX_DAILY_CLAUDE_CALLS` and the cache live per isolate. Cloudflare can run many isolates, so the real daily total can be a multiple of the cap.

**Proposal.**
- Store the counter in **Workers KV** (or a Durable Object for exact counts): key `claude:calls:YYYY-MM-DD`, read before each call, increment after, TTL 48h.
- KV is eventually consistent, so use the cap as a soft limit, and keep a lower per-isolate limit as a backstop. A Durable Object gives an exact count, if that matters more than cost.
- Also cache translations in KV (key = target + story id + title hash) so each headline is translated once globally, not once per isolate.
- Set a monthly spend limit on the Anthropic account as the hard stop.

**Needs:** a KV namespace binding; `ANTHROPIC_API_KEY`, `MAX_DAILY_CLAUDE_CALLS` secrets.
