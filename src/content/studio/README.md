# Buildgena Studio dispatches

Each editor-approved piece from Buildgena Studio is one file here: `<id>.json`, schema
"studio-dispatch v1" (see `src/lib/studio-schema.ts`). Files are read at build time; a piece
goes live at `/desk/<id>` (English) or `/fr/desk/<id>` (French) with the next deploy.

- The file name must equal the `id`.
- Every piece needs at least one https source, an approver, an ISO 8601 `approvedAt` and the
  AI disclosure. Invalid files are left off the site and fail `npx tsx scripts/studio-test.ts`.
- Only approved, real pieces belong here. The example lives in `scripts/fixtures/studio/` and
  must never be copied into this folder.
