# Publisher feed terms (read 2026-10-07)

**Why this matters:** the site shows headlines, short excerpts and photos from publishers' RSS feeds. Once the site carries ads, that is commercial use. Most publishers below limit their feeds to personal, non-commercial use or ask for permission. This is a summary of what their own pages say. It is not legal advice; have a lawyer review it before running ads.

Method: each page was read on the publisher's own site (some in a browser because automated fetches were blocked). Quotes are short excerpts. Where no feed-specific terms exist, the site-wide terms are summarized and marked.

| Publisher | Page read | Commercial use | Links / attribution | Photos / excerpts | Ask |
|---|---|---|---|---|---|
| CBC | cbc.ca/rss, cbc.ca/rss/usingrss, CBC/Radio-Canada Terms of Use (revised Sept 2026), help article 217732857 | Not without an agreement: “Any use other than for private purposes must be subject to an agreement…” | Links allowed; headline + first sentence may be link text; no framing | “You may not use any images…” | cbc.ca/rss/commercial (form) |
| Radio-Canada | ici.radio-canada.ca/info/rss + same corporate terms | Personal use only; commercial use → contact | Brand-appropriate setting | Not addressed on RSS page | distribution@radio-canada.ca |
| The Globe and Mail | Terms and conditions (effective 2015-05-22); no RSS page | Non-commercial only | No aggregating/deep linking without written consent | Content includes photos | egold@globeandmail.com (licensing) |
| La Presse | info.lapresse.ca/conditions-d-utilisation (covers “le fil de nouvelles RSS”) | “personnelles et non-commerciales” | Links encouraged; remove on request | Images protected | none given |
| Wired / Ars Technica (Condé Nast) | condenast.com/user-agreement (updated 2024-10-10) | Personal, non-commercial; RSS under same terms | — | No copying/aggregating without written permission | Condé Nast permissions |
| TechCrunch | techcrunch.com/rss-terms-of-use | Not addressed | Display feed content as provided, attribute TechCrunch, link to full article | Don't modify feed content; don't put ads *into* the feed | — |
| The Verge (PMC terms in footer) | pmc.com/terms-of-use (updated 2026-08-21), Vox licensing page | Commercial exploitation needs prior written permission | Detailed: link straight to the article, attribute, don't edit | “not to … use images hosted on the Services on another website” | licensing@pmc.com |
| MIT Technology Review | Terms of service (updated 2023-09-06), covers RSS | “personal use only” | — | Prior written permission | termsofservice@technologyreview.com |
| Global News (Corus) | corusent.com/terms-of-use | Non-commercial; RSS not mentioned | — | General ban on reproduction | — |
| BetaKit | Terms and conditions (2022-12-15) | Commercial use needs written consent | Link to home page allowed | Photos covered | info@betakit.com |
| VentureBeat | Terms of service (2025-12-16) | No commercial aggregation without permission | “unauthorized … linking” prohibited | Covered | privacy@venturebeat.com |
| IEEE Spectrum | ieee.org site terms (no RSS terms found) — partial | Reproduction needs prior written consent | — | Covered | Reprints & Permissions |
| The Decoder | legal notice (no RSS terms found) — partial | Reproduction needs express consent | — | Covered | hallo(at)the-decoder.com |

Not yet checked: government feeds (Government of Canada, provinces, cities, OPC, CanadaBuys), AI labs (OpenAI, Google, DeepMind, Hugging Face, NVIDIA, AWS, Vector), newsletters (The Batch, Import AI, One Useful Thing, Last Week in AI, The Gradient), specialist beats (UploadVR, Road to VR, The Robot Report, DCD), Hacker News, Hugging Face Papers, AllBusiness, YouTube channels and podcasts.

## What the site does now (changed 31 Oct 2026)

`src/lib/rights.ts` switches any source, or the whole site, between:
- `full` — headline, excerpt and photo
- `headline` — headline, source name, time and link only

**The default is now `headline` for every source** (`DEFAULT_DISPLAY = "headline"`). Recommendation 1 below is done, in its stricter "everyone by default" form. Reason: almost every publisher in the table limits its feed to personal or non-commercial use, forbids reuse of its images, or asks for written permission, and the site is preparing for sponsorship and advertising.

Explicit allowances (`DISPLAY` in `rights.ts`), each tied to the publisher's own terms:

| Source id | Display | Why it is allowed |
|---|---|---|
| `techcrunch` | full | techcrunch.com/rss-terms-of-use: display the feed content as provided, attribute TechCrunch and link to the full article; don't modify it and don't put ads into the feed. Commercial use is not restricted there. |

Everything else is headline-and-link, including:
- every publisher in the table above other than TechCrunch (CBC, Radio-Canada, Globe and Mail, La Presse, Condé Nast titles, The Verge/PMC, MIT Technology Review, Global News, BetaKit, VentureBeat, IEEE Spectrum, The Decoder);
- Government of Canada feeds. canada.ca/en/transparency/terms.html (modified 2025-09-05, read 31 Oct 2026) allows reproduction "for non-commercial purposes" and says materials may not be reproduced "for the purposes of commercial redistribution" without prior written permission. Provincial and municipal feeds have not been checked and follow the same conservative default;
- every source listed under "Not yet checked".

How it is enforced: the feed parser drops the excerpt and photo for headline-only sources, the publisher-photo lookup (og:image) skips them, and the payload is filtered once more before it is served, so a cached copy from before a change cannot leak an excerpt or photo. The shared desk snapshot key moved to `desk:v2` so the old snapshot (built under `full`) is ignored.

What readers see: story pages and cards show the headline, the publisher, the time and a prominent "Read at <publisher>" link; a designed cover (never an AI image) replaces the photo where a layout needs one. Story pages stay `noindex`. Our own work (newsroom summaries, Studio dispatches, videos, guides) is not affected.

To show a source in full again: get written permission (or find terms that allow it), add the source id to `DISPLAY` with a comment naming the page or agreement, and add a row to the table above.

Open question for the owner: the AI desk (`src/lib/ai-desk.server.ts`) writes its own short headline and brief for lead stories. With excerpts no longer collected for headline-only sources, it works from headlines alone. Facts are not copyrightable, and the copy is our own words and labelled, but a lawyer should confirm this before ads run.

## Recommended before ads go live (owner's decision)

1. ~~Switch to headline-and-link for publishers that forbid images or commercial use, or for everyone by default.~~ Done 31 Oct 2026: everyone by default, TechCrunch allowed in full.
2. Write to the licensing contacts above for the publishers you most want to show in full (CBC/Radio-Canada, The Globe and Mail, La Presse, BetaKit).
3. Lean on sources that publish for re-use: government releases, AI labs' own announcements, and your own original writing.
4. Ask a lawyer to review this table and the site's terms.
