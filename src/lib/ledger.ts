/**
 * Loads the Open Desk Ledger records committed to src/content/ledger/*.json at build time.
 * Schema, rules and helpers live in ledger-schema.ts.
 */
import { loadLedgerFiles, type LedgerRecord } from "./ledger-schema";

export * from "./ledger-schema";

// Build time: every record file in src/content/ledger/ (sub-folders are not read).
const FILES = import.meta.glob("../content/ledger/*.json", { eager: true });
const loaded = loadLedgerFiles(FILES);
if (loaded.rejected.length && typeof console !== "undefined") {
  for (const r of loaded.rejected)
    console.warn(`[ledger] ${r.file} left off the site: ${r.errors.join("; ")}`);
}

/** Every valid record, latest status change first. */
export const LEDGER: LedgerRecord[] = loaded.records;

export const recordById = (id: string) => LEDGER.find((r) => r.id === id.toUpperCase()) ?? null;

/** Internal path of a record (the router adds /fr for French pages). */
export const recordPath = (r: Pick<LedgerRecord, "id">) => `/ledger/${r.id}`;

/** "6 novembre 2026" / "November 6, 2026", in Ottawa time. */
export function ledgerDate(iso: string, locale: "en" | "fr") {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
  return d.toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Toronto",
  });
}
