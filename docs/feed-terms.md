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

## What the code can do now

`src/lib/rights.ts` switches any source, or the whole site, between:
- `full` — headline, excerpt and photo (today)
- `headline` — headline and link only

## Recommended before ads go live (owner's decision)

1. Switch to headline-and-link for publishers that forbid images or commercial use (at minimum CBC/Radio-Canada and The Verge, whose terms name images), or for everyone by default.
2. Write to the licensing contacts above for the publishers you most want to show in full (CBC/Radio-Canada, The Globe and Mail, La Presse, BetaKit).
3. Lean on sources that publish for re-use: government releases, AI labs' own announcements, and your own original writing.
4. Ask a lawyer to review this table and the site's terms.
