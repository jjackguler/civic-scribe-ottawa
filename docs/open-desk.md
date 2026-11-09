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
| Ledger list with result filter | `/ledger` (`?status=conflicting` etc.) |
| Record page (claim in four parts, test plan, evidence, reply, signed result + stage + reply lines, history, return dates) | `/ledger/<id>`, ClaimReview JSON-LD only on verdicts, no numeric rating |
| Open data (v2: result, stage, reply state and deadline, schedule, "not in ledger" note) | `/api/ledger.json` |
| Standards = Open Desk protocol v1.1 (roles, test first, five results, reply, reopening, corrections, conflicts, how statements are chosen, changelog) | `/standards` (`#roles`, `#test`, `#statuses`, `#reply`, `#reopen`, `#sources`, `#record-corrections`, `#conflicts`, `#proposals`, `#changes`) |
| Front page: the ledger leads, other outlets' news follows under "On our watch" | `src/routes/index.tsx`, `src/components/Ledger.tsx` |
| Corrections to records join the site corrections log | `/corrections` |
| A Studio piece can cite its record(s) | `"records": ["OD-0001"]` in `src/content/studio/<id>.json` |
| CI | `scripts/ledger-test.ts` in Production checks |

Until the first record is committed, `/ledger` is noindex and the front page shows a short
"first records open soon" band.

## Open Desk page, video, theme and motion (7 Nov 2026)

- `/open-desk` (EN/FR): what Open Desk Journalism is, why, four aims, the interactive desk
  walkthrough (`src/components/DeskWalkthrough.tsx`, fictional Halvorsen case, labelled), who does
  what, the five statuses, six commitments (from the concept paper v2), first-season targets
  (marked as goals, not results), what we don't claim, and how to take part.
- Explainer video: `public/open-desk/open-desk-explainer-en.mp4` (re-encoded to 10 MB from the
  project's 19 MB master), poster and chapters next to it; `src/components/ExplainerVideo.tsx`.
  Also on the front page in the Open Desk band. VideoObject JSON-LD on /open-desk.
- Light / dark / system theme: toggle in the utility bar (`ThemeToggle`), choice kept in this
  browser only (`localStorage["aib-theme"]`), applied before first paint (`THEME_BOOT` in
  `src/lib/theme.ts`). Dark tokens are in `src/styles.css`; Young Lab stays light.
- Micro-interactions (`src/components/Motion.tsx` + CSS): stamps land when they scroll into view,
  marker highlight sweeps, sections rise in, cards lift, counters count up, copy link/citation
  on record pages, the theme icon turns. All off under `prefers-reduced-motion`; content is
  visible without JavaScript.

## The five statuses

### Protocol v1.0 (8 Nov 2026): three fields, one stamp

Readers see **one stamp** (the evidence result) and **two small lines** under it (stage, right of
reply). The record file keeps them apart:

| Field | Values | Where |
| --- | --- | --- |
| Evidence result (the stamp) | `attributed` Recorded, not yet tested · `unresolved` No conclusion yet · `supported` Supported by the evidence · `conflicting` Conflicting evidence · `refuted` Refuted by the evidence | `history[].status` |
| Why no conclusion | `insufficient-evidence` · `test-date-not-reached` (required with `unresolved`) | `history[].pending` |
| Stage | `testing` Being tested · `monitoring` Monitoring · `closed` Active follow-up closed | `history[].stage` |
| Right of reply | Reply requested (with deadline) · Reply received · Declined to comment · No reply by the deadline | computed from `rightOfReply` |
| Company's own later action | `corrected` · `withdrawn` · `stood-by` (not our result) | `rightOfReply.actorAction` |

| Old stamp | Result | Rule the schema enforces |
| --- | --- | --- |
| COMPANY CLAIM | Recorded, not yet tested | — |
| NOT YET PROVEN | No conclusion yet | needs `pending` (why) |
| CHECKED | Supported by the evidence | independent `supports` evidence + second reader |
| — | Conflicting evidence | `contradicts` evidence + second reader |
| — | Refuted by the evidence | independent `contradicts` evidence + second reader |

### Protocol v1.1 (9 Nov 2026, after the Gemini review)

- **Publication gate (owner decision).** A record is public only once it has left `attributed`,
  and any entry after `attributed` must come after `rightOfReply.requestedAt`. A file still at
  `attributed` is valid but stays off the site, the API and the sitemap. The repository may be
  public, so keep such files on a branch until the questions are sent.
- **Two sources (EFCSN 2.G).** Only evidence with `independent: true` and `anonymous: false`
  counts. `supported` needs two such supporting items, `refuted` two such contradicting items,
  `conflicting` a contradicting item plus two counted items.
- **Anonymous sources** (`anonymous: true`) are shown as "Unnamed source" and never count.
- **No pay for information** (CAJ, RTDNA 3.3). `licensed: true` marks a disclosed licence fee for
  a named person's own photos or video; it cannot be combined with `anonymous`.
- **One extension** at most, ending no later than 5 business days after the base deadline.
- **Cause.** `parts[aspect=cause].finding = "refuted"` needs a `note` on the direct evidence.
- First season: every `refuted` result is read by a media lawyer before it is committed.

Other rules (CI rejects a file that breaks one):

- **Four parts.** `parts` has one entry each for `event`, `scale`, `period`, `cause` (write "not
  stated" if the claim does not say), each with its own `finding`.
- **Test first.** `test` says what is measured, the baseline, the scope, which evidence counts and
  the documents expected (`checks[]`, each with `expectedBy`). Each check date is a return date.
- **Right of reply.** Default deadline: 5 business days after the request, 17:00 Ottawa time,
  skipping weekends and the holidays in `DESK_HOLIDAYS` (`src/lib/ledger-schema.ts`; add next
  year's dates each December). A shorter `deadline` needs `expedited.reason` and is never under
  48 h. `extensions[]` push the deadline (each must end later than the last). A verdict is only
  accepted after the reply (`response`, `kind` `answered` or `declined`) or the deadline.
- **Second reader on every verdict**, not the editor. Editors, second readers and correction
  signers must be people: "AI", "Claude", "bot", "automated", "system" etc. are rejected.
- **Corrections** have a `kind` (`correction`, `update`, `clarification`), an `editor`, and a
  `cause` when the kind is `correction`. **Redactions** record what kind of material was removed,
  when and why (`source-safety`, `personal-data`, `legal`), never the material itself.
- **Return dates:** 3-month review, 6-month review (continue or close active follow-up; no verdict
  is forced) and every `test.checks[].expectedBy`. `reopen` overrides the 3/6-month dates.
  Records at stage `closed` leave the to-do list.

## Adding a record (the editor's steps)

1. Copy `scripts/fixtures/ledger/OD-9999.json` (fictional, never ship it) to
   `src/content/ledger/OD-00NN.json` with the next free number; set `"id"` to match.
2. Fill `headline`, `actor`, `claim` (verbatim quote, source link **and** archive link, e.g.
   `https://web.archive.org/save/<url>`), the four `parts`, and the `test` **before** any result.
3. Send the right-of-reply email; record `rightOfReply.requestedAt` and `to`. The record page
   shows the deadline (5 business days, 17:00 Ottawa time). Only now does the record go public:
   add the next `history` entry (`unresolved` with `pending`) after the request time.
4. Add the first `history` entry (`attributed`, or `unresolved` with `pending`) signed with your
   name; add `evidence` as you go.
5. When the deadline passes (or the reply arrives), have a second person read the evidence, then
   add the verdict entry with its reason, `stage` and `secondReader`.
   Never edit or delete an earlier entry; append a new one.
6. Commit to a branch and open a PR. CI runs `npx tsx scripts/ledger-test.ts`; a bad file fails
   the check and is left off the site.
7. On each return date (test checks, 3 and 6 months, shown on the record page), look again and
   append a new entry even if the result stays the same. At 6 months set `stage` to `monitoring`
   or `closed`.

French text is optional per field (`"fr"`); the French page shows the English text, marked,
until a human-checked translation is added.

## Daily rhythm (one-person desk, about 3 hours, target 5 records a week)

08:00 AI scans the watch list → 08:30 AI splits and matches claims → 09:00 editor picks 1–2
and opens records → 09:15 reporter tests, sends questions (5 business days) → second reader reads, editor signs the verdict →
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
