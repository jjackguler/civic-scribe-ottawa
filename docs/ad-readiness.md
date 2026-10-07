# Getting AI Broadsheet ready for advertising

Two kinds of advertising: **direct campaigns** you sell yourself (media kit at `/advertise`, slots in `src/lib/ads.ts`) and **an ad network** such as Google AdSense. Both need the same basics.

## Done in the code
- Standard IAB ad slots, labelled “Advertisement”, filled by direct campaigns → AdSense (once configured) → house ads.
- Media kit at `/advertise`; editorial independence rules on `/standards`.
- Trust pages: `/about` (who runs this), `/standards`, `/corrections` (dated log), `/privacy` (Claude, analytics, CASL), `/terms`.
- Crawlable English and French pages, canonical and hreflang tags, share cards, JSON-LD, live sitemap, RSS.
- Cookieless Cloudflare Web Analytics, ready for a token — this gives you real audience numbers for advertisers.

## The two risks the code can't fix

### 1. Original content
AdSense commonly rejects sites for “low value content”, and a site made mostly of other publishers' headlines and excerpts is exposed to that. The fix is writing of your own, published on a schedule. Software must not write the news (see `/standards`), so this is the editor's job.

A realistic launch rhythm for one person:
- **Daily (10 minutes):** an editor's headline and one line of context for the top story of the day (`src/lib/desk.ts`). Shown with the publisher's original headline.
- **Twice a week:** a short column on the Editor's desk (`src/lib/editorials.ts`): what a story means for Canadian businesses, workers or government.
- **Monthly:** one practical guide (`src/lib/guides.ts`) and one refresh of `/funding` (see `docs/funding-todo.md`).
- Apply to AdSense after about 20–30 original pieces and a few weeks of steady traffic.

### 2. Publisher feed terms
Most publishers' feed terms limit use to personal, non-commercial purposes, and some forbid using their photos on other sites. Details and contacts: `docs/feed-terms.md`. Before ads go live, decide how much of each feed to show (`src/lib/rights.ts` switches a source to headline-and-link only) and ask the publishers you most want in full. Get a lawyer's view.

## Owner checklist before applying to AdSense
- [ ] Register the domain, connect it in Lovable, publish.
- [ ] Fill in the TODO values in `src/lib/site.ts` (editor name, role, bio, email; newsletter; analytics token; social links).
- [ ] Set up email forwarding for the editor and advertise addresses.
- [ ] Decide the display mode per source (`src/lib/rights.ts`).
- [ ] Publish original pieces on the rhythm above.
- [ ] Submit the sitemap in Google Search Console.
- [ ] Apply to AdSense; once approved, set `ADSENSE_CLIENT` and slot IDs in `src/lib/ads.ts` and add `public/ads.txt` with the line Google gives you.
