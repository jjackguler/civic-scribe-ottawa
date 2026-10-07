# Funding programs to verify before adding

`/funding` lists only programs checked against an official page (see `src/lib/funding.ts`).
The programs below are **candidates**. Nothing about them has been added to the site.

To add one:
1. Find the program's page on the official government or agency site (not a blog or consultant).
2. Read eligibility, amount, intake dates and who applies.
3. Add an entry to `src/lib/funding.ts` with that official `url` and `checked: "YYYY-MM-DD"` (the day you read it), in English and French.
4. Tick it off here.

| Candidate | Level | Official page (fill in) | Checked on | Added |
|---|---|---|---|---|
| Ontario Digital Main Street (DMAP / digital transformation grant) | Ontario | | | ☐ |
| Starter Company Plus | Ontario | | | ☐ |
| CanExport SMEs | Federal (Trade Commissioner Service) | | | ☐ |
| BDC — AI / technology financing ("LIFT" or current name) | Federal Crown corporation | | | ☐ |
| Futurpreneur Canada start-up financing | National non-profit | | | ☐ |
| Digital Main Street (programs open in the reader's region) | Ontario / regional | | | ☐ |

Notes
- Program names change. If a page uses a different name than the one above, use the official name.
- Some of these fund digital adoption in general, not AI specifically. Say so in the card's text.
- Re-check every entry at least once a quarter and update `checked`.
