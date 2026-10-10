# AI Broadsheet launch handoff — 2026-10-10

## Site and domain

Keep `AI Broadsheet`. Planned domain: `aibroadsheet.com`. Its availability and ownership must be checked at purchase; an earlier RDAP lookup is not a reservation. Keep the current Lovable canonical URL until the new domain answers over HTTPS. Then update `src/lib/site.ts` and `public/robots.txt`, check redirects, canonical links, sitemap and sharing URLs.

Chosen contact addresses:

- `hello@aibroadsheet.com`: general enquiries.
- `corrections@aibroadsheet.com`: correction reports; may forward to the same inbox.
- `advertise@aibroadsheet.com`: optional alias for sponsorship enquiries.

Cloudflare Email Routing can forward incoming mail to an existing verified inbox for free: https://www.cloudflare.com/products/email-routing/ . A sending setup/mailbox is a separate decision; forwarding alone does not provide a conventional inbox. Test receiving and replying before enabling addresses in `SITE.email`. The old unconfigured advertising mailto is hidden. The public editor name and biography still require the owner's factual details; do not invent a person.

## Content production

The reviewed scheduled runs were green but produced no new article/video: newsroom run 38066162334 hit Gemini timeouts then Pro quota 429; Originals run 38067089581 timed out. A render fixture proves the renderer, not API billing or editorial quality.

This patch removes automatic expensive model escalation, bounds requests, counts failed daily newsroom attempts, preserves those counters on writer-step failure, preserves unreadable queued sources, and makes configuration/quota failures visible. It retains the six editorial desks and human review for risky articles. See newsroom-costs.md and originals.md.

Google billing/prepayment and ElevenLabs allowance need the account owner's setup. No billing changes or paid generation are performed by the validation workflow. Once ready, manually run one real newsroom article (`NEWSROOM_MAX_PER_RUN=1`) and one queued video, review the text/audio/credits and measured usage, then restore the desired run limit. Forty is a daily **attempt** ceiling, not a promise of forty publishable articles. Two scheduled video slots do not guarantee two outputs if sources fail editorial checks.

## Music and newsletter

See music-rights.md for paid-plan regeneration or explicitly licensed replacements. Old source files remain available, but the reported free-plan opening video is withheld from the site's list.

Newsletter remains disabled until an actual provider and subscription URL are configured. No fake successful signup is added. Hosting and domain purchase do not establish a newsletter account or a mailbox automatically.
