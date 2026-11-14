# Ledger drafts: the first five records

Drafts prepared for the editor (14 Nov 2026). **Nothing here is on the site.** Each file already
passes the record rules (`npx tsx scripts/ledger-drafts-test.ts`); only the editor's checks,
the reply request and the signature are missing. CI fails if a file in `src/content/ledger/`
still says `EDITOR SIGNS HERE`.

| Draft | Claim | Source used | Check before opening |
| --- | --- | --- | --- |
| OD-0001 | Klarna: AI assistant does "the equivalent work of 700 full-time agents" (27 Feb 2024) | Klarna press release (primary) | Archive link resolves |
| OD-0002 | Amazon, Andy Jassy: AI will "reduce our total corporate workforce" (17 Jun 2025) | Amazon's own post (primary) | Read the full sentence on the page; the quote uses […] for the gap |
| OD-0003 | Shopify, Tobi Lütke: teams must show AI can't do the work before asking for headcount (7 Apr 2025) | TechCrunch | Match the wording to the memo image in the CEO's post on X (TechCrunch links x.com/tobi/status/1909231499448401946) and switch the source to it |
| OD-0004 | Salesforce, Marc Benioff: support cut "from 9,000 heads to about 5,000" (2025) | IT Pro | Find the Logan Bartlett Show episode, set `madeAt` to its real date and use it as the source |
| OD-0005 | IBM, Arvind Krishna: AI replaced HR roles but "total employment has actually gone up" (5 May 2025) | Entrepreneur | Read the Wall Street Journal original and switch the source to it |

Quotes 1, 2 and 5 were checked word for word against the pages on 14 Nov 2026. The archive links
are `web.archive.org/web/<date>/<url>` (nearest copy); open each one, and if no copy exists use
`https://web.archive.org/save/<url>` and paste the result.

## Leads for evidence (not checked yet, not in the files)

- Klarna: reports from 2025 that Klarna began hiring human agents again; Klarna's IPO prospectus (2025) for customer service staffing.
- Amazon: the October 2025 corporate job cuts and the reasons Amazon gave for them.
- Shopify: headcount in the 2024 and 2025 annual reports.
- Salesforce: WARN filings and the fiscal 2026 annual report.
- IBM: headcount in the 2024 and 2025 annual reports.

Add each one as `evidence` only after reading it, with its own link and archive copy.

## To open a record

1. Do the "check before opening" item above. Fill the `baseline` figure from the named document.
2. Send the right-of-reply email. Put the real time in `rightOfReply.requestedAt` and the open time in `history[0].at` (the drafts use 17 Nov 2026 as a placeholder).
3. Replace `EDITOR SIGNS HERE` with your name.
4. Move the file to `src/content/ledger/` and open a PR. CI checks it.
