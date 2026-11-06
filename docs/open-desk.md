# Open Desk: how the ledger works

AI Broadsheet is now **an Open Desk newsroom**. The publication keeps its name; *Open Desk
Journalism* is the method, and **The Open Desk Ledger** (`/ledger`) is the public record of the
claims we test. Plan and decisions: the owner's "AI Broadsheet'i Open Desk masasına çevirme planı"
(6 Nov 2026).

## What changed on the site

| Piece | Where |
| --- | --- |
| Naming (publication, method, ledger, protocol version) | `SITE.openDesk` in `src/lib/site.ts` |
| Record schema and rules | `src/lib/ledger-schema.ts` |
| Records (one JSON file each) | `src/content/ledger/OD-0001.json` → `/ledger/OD-0001` |
| Ledger list with status filter | `/ledger` (`?status=conflicting` etc.) |
| Record page (claim, evidence, reply, signed status, history, reopen dates) | `/ledger/<id>`, ClaimReview JSON-LD |
| Open data | `/api/ledger.json` |
| Standards = Open Desk protocol v0.9 (roles, five statuses, AI rules, reply, archiving, reopening) | `/standards` (`#statuses`, `#roles`, `#reply`, `#reopen`) |
| Front page: the ledger leads, other outlets' news follows under "On our watch" | `src/routes/index.tsx`, `src/components/Ledger.tsx` |
| Corrections to records join the site corrections log | `/corrections` |
| A Studio piece can cite its record(s) | `"records": ["OD-0001"]` in `src/content/studio/<id>.json` |
| CI | `scripts/ledger-test.ts` in Production checks |

Until the first record is committed, `/ledger` is noindex and the front page shows a short
"first records open soon" band.

## The five statuses

| Old stamp | Status | Meaning | Rule the schema enforces |
| --- | --- | --- | --- |
| COMPANY CLAIM | Attributed only | Only source is the claimant | — |
| NOT YET PROVEN | Unresolved | Testing, or not enough evidence | — |
| CHECKED | Supported | Independent evidence supports it | needs `independent: true` + `stance: "supports"` evidence |
| — | Conflicting evidence | Own documents, earlier words or outcomes conflict | needs `stance: "contradicts"` evidence |
| — | Refuted | Evidence shows it is false | needs independent contradicting evidence + `secondReader` ≠ editor |

Any status beyond Attributed/Unresolved is accepted only after the reply arrived or the reply
window (at least 48 h) has closed. A history entry signed by "AI", "Claude", "bot", "automated",
"system" etc. is rejected: **only a named human editor writes a status.**

## Adding a record (the editor's steps)

1. Copy `scripts/fixtures/ledger/OD-9999.json` (fictional, never ship it) to
   `src/content/ledger/OD-00NN.json` with the next free number; set `"id"` to match.
2. Fill `headline`, `actor`, `claim` (verbatim quote, source link **and** archive link, e.g.
   `https://web.archive.org/save/<url>`), `parts`, `evidence`.
3. Send the right-of-reply email; record `rightOfReply.requestedAt` and `to`.
4. Add the first `history` entry (`attributed` or `unresolved`) signed with your name.
5. When the window closes (or the answer arrives), add the verdict entry with its reason.
   Never edit or delete an earlier entry; append a new one.
6. Commit to a branch and open a PR. CI runs `npx tsx scripts/ledger-test.ts`; a bad file fails
   the check and is left off the site.
7. On the reopen dates (3 and 6 months, shown on the record page), look again and append a
   new entry even if the status stays the same.

French text is optional per field (`"fr"`); the French page shows the English text, marked,
until a human-checked translation is added.

## Daily rhythm (one-person desk, about 3 hours, target 5 records a week)

08:00 AI scans the watch list → 08:30 AI splits and matches claims → 09:00 editor picks 1–2
and opens records → 09:15 reporter tests, sends questions (48 h) → editor signs the verdict →
same day: record page, short story, 60 s vertical video, creator pack → Friday: The Weekly Catch
(the week's five records).

## Not done yet (next 10 weeks)

- Automatic scanning and archiving (Browsertrix), and an editor desk so records need no JSON.
- Turning `/dispatch` newsroom summaries into short "watch notes" (the newsroom pipeline is unchanged in this PR).
- Embeddable card `<open-desk-claim id="OD-0001">`.
- Weekly Catch issue template and the creator pack.

## Watch list: draft for the owner to approve

Day-2 draft, not used by any code yet. Companies whose public statements about AI and jobs are
frequent and testable against filings and job postings: Klarna, IBM, Salesforce, Amazon,
Microsoft, Meta, Alphabet/Google, Duolingo, Shopify, Dropbox, Chegg, UPS, Intuit, Workday,
Accenture, Block, HP, Recruit/Indeed, BT Group, Telus. Add or remove freely; Canadian names first
if the beat should stay Canada-led.
