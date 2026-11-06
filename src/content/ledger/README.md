# The Open Desk Ledger

One JSON file per record, named by its id: `OD-0001.json` → `/ledger/OD-0001`.
Schema and rules: `src/lib/ledger-schema.ts`. How to open, test and sign a record:
`docs/open-desk.md`. A fictional example lives in `scripts/fixtures/ledger/` and must never be
copied here.

`scripts/ledger-test.ts` checks every file in CI; a file that breaks a rule is left off the site.
