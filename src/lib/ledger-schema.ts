/**
 * The Open Desk Ledger ("open-desk-record v1"): schema, rules and pure helpers.
 * Kept free of import.meta.glob so tests (tsx) can import it; see ledger.ts for loading.
 *
 * AI Broadsheet is an Open Desk newsroom. Instead of re-summarising other outlets' AI news,
 * the desk records what AI companies and their executives say, tests it against documents,
 * earlier statements and outcomes, and publishes a human-signed status. Each statement is one
 * record with a permanent id (OD-0001, OD-0002 …) and one JSON file:
 *
 *   src/content/ledger/OD-0001.json  →  /ledger/OD-0001  (and /fr/ledger/OD-0001)
 *
 * A record never closes: every status change is appended to `history` with its date, reason
 * and the editor who signed it, and each record comes back to the desk 3 and 6 months later.
 *
 * Rules the schema enforces (a file that breaks one is left off the site and fails
 * scripts/ledger-test.ts in CI):
 *   - The status is written by a named human editor. AI may open a record, split a claim and
 *     flag contradictions, but a history entry signed by an AI, bot or "automated" is rejected.
 *   - Every claim has its source link and an archived copy (Wayback Machine or similar).
 *   - Every record has a right-of-reply request. A verdict beyond "Attributed only" or
 *     "Unresolved" is only allowed once the reply arrived or the deadline (48 h) has passed.
 *   - "Supported" needs at least one independent piece of evidence that supports the claim;
 *     matching the company's own source is not enough.
 *   - "Conflicting evidence" needs at least one piece of evidence that contradicts the claim.
 *   - "Refuted" needs independent contradicting evidence and a second reader other than the editor.
 */
import { z } from "zod";
import type { Bi, Locale } from "./i18n";

/** The five evidence statuses, in the order readers meet them. */
export const STATUSES = ["attributed", "unresolved", "supported", "conflicting", "refuted"] as const;
export type Status = (typeof STATUSES)[number];

/** How the three older stamps carry over (owner plan, 6 Nov 2026). */
export const STAMP_TO_STATUS = {
  "COMPANY CLAIM": "attributed",
  "NOT YET PROVEN": "unresolved",
  CHECKED: "supported",
} as const satisfies Record<string, Status>;

export const STATUS_LABEL: Record<Status, Bi> = {
  attributed: { en: "Attributed only", fr: "Attribué seulement" },
  unresolved: { en: "Unresolved", fr: "Non résolu" },
  supported: { en: "Supported", fr: "Étayé" },
  conflicting: { en: "Conflicting evidence", fr: "Preuves contradictoires" },
  refuted: { en: "Refuted", fr: "Réfuté" },
};

export const STATUS_HELP: Record<Status, Bi> = {
  attributed: {
    en: "The only source is the company or person who made the claim. We have recorded it; we have not tested it yet.",
    fr: "La seule source est l'entreprise ou la personne qui a fait l'affirmation. Nous l'avons consignée sans l'avoir encore vérifiée.",
  },
  unresolved: {
    en: "We are testing the claim, or the evidence so far is not enough to say more.",
    fr: "La vérification est en cours, ou les preuves réunies ne permettent pas encore d'en dire plus.",
  },
  supported: {
    en: "Independent evidence supports the claim. A match with the company's own material is not enough for this status.",
    fr: "Des preuves indépendantes étayent l'affirmation. La concordance avec les documents de l'entreprise elle-même ne suffit pas.",
  },
  conflicting: {
    en: "The company's own documents, its earlier statements or later outcomes conflict with the claim.",
    fr: "Les documents de l'entreprise, ses déclarations antérieures ou les résultats observés contredisent l'affirmation.",
  },
  refuted: {
    en: "The evidence shows the claim is false. This status needs a second reader as well as the editor.",
    fr: "Les preuves montrent que l'affirmation est fausse. Ce statut exige une deuxième lecture en plus de celle du responsable éditorial.",
  },
};

/** Text written in English, with an optional French version (English shows, labelled, when it is missing). */
const text = z.object({
  en: z.string().trim().min(2).max(2000),
  fr: z.string().trim().min(2).max(2000).optional(),
});
export type LedgerText = z.infer<typeof text>;

const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine((u) => /^https:\/\//i.test(u), "must be an https:// URL");

const isoDateTime = z
  .string()
  .refine(
    (v) => !Number.isNaN(Date.parse(v)) && /^\d{4}-\d{2}-\d{2}T/.test(v),
    "must be an ISO 8601 date-time",
  );
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date (YYYY-MM-DD)")
  .refine((v) => !Number.isNaN(Date.parse(v)), "must be a real date");

const personName = z.string().trim().min(2).max(120);

/** Words that mark an entry as machine-signed. The status field is human-only. */
const MACHINE_SIGNER =
  /\b(ai|a\.i\.|claude|gpt|chatgpt|gemini|llm|bot|robot|automated|automatic|system|script|agent)\b/i;

export const RECORD_ID = /^OD-\d{4,}$/;

const source = z.object({
  title: z.string().trim().min(2).max(300),
  url: httpsUrl,
  publisher: z.string().trim().min(2).max(160),
});

export const evidenceSchema = source.extend({
  /** An archived copy, so the evidence survives if the page changes. */
  archiveUrl: httpsUrl.optional(),
  stance: z.enum(["supports", "contradicts", "context"]),
  /** True when the evidence does not come from the actor (or a party paid by it). */
  independent: z.boolean(),
  note: text,
  addedAt: isoDate,
});
export type Evidence = z.infer<typeof evidenceSchema>;

export const historySchema = z.object({
  status: z.enum(STATUSES),
  at: isoDateTime,
  reason: text,
  /** The human editor who signs this status. Never an AI. */
  editor: personName,
  /** Required for "refuted": a second person who read the evidence. */
  secondReader: personName.optional(),
});
export type HistoryEntry = z.infer<typeof historySchema>;

export const recordSchema = z
  .object({
    version: z.literal(1),
    id: z.string().regex(RECORD_ID, 'id must look like "OD-0001"'),
    /** The beat this record belongs to. The desk starts with AI and work. */
    beat: z.enum(["ai-and-work"]).default("ai-and-work"),
    /** A one-line headline for lists and the front page. */
    headline: text,
    actor: z.object({
      name: z.string().trim().min(2).max(160),
      kind: z.enum(["company", "executive", "institution", "public-figure"]),
      /** For an executive: their title and company, e.g. "CEO, Example Corp". */
      role: z.string().trim().max(200).optional(),
    }),
    claim: z.object({
      /** The words as said or published, in their original language. */
      quote: z.string().trim().min(10).max(1500),
      lang: z.string().regex(/^[a-z]{2}$/, "a two-letter language code"),
      /** Where it was said: "Q3 earnings call", "Press release", "Post on LinkedIn" … */
      context: z.string().trim().min(3).max(200),
      madeAt: isoDate,
      source,
      archiveUrl: httpsUrl,
    }),
    /** The claim split into parts that can be tested one by one. */
    parts: z.array(text).max(12).default([]),
    evidence: z.array(evidenceSchema).max(60).default([]),
    rightOfReply: z.object({
      requestedAt: isoDateTime,
      /** Who was asked: "Media relations, Example Corp". */
      to: z.string().trim().min(2).max(200),
      deadlineHours: z.number().int().min(48).max(24 * 30).default(48),
      response: z
        .object({
          receivedAt: isoDateTime,
          summary: text,
          url: httpsUrl.optional(),
        })
        .nullable()
        .default(null),
    }),
    /** Oldest first; the last entry is the current status. */
    history: z.array(historySchema).min(1, "a record needs at least one signed status"),
    /** Optional override of the automatic 3- and 6-month reopen dates. */
    reopen: z.array(isoDate).max(6).optional(),
    /** Our story or video built on this record. */
    coverage: z
      .array(
        z.object({
          kind: z.enum(["story", "video"]),
          title: z.string().trim().min(2).max(300),
          /** A path on this site ("/desk/…", "/video/…") or an https URL. */
          href: z.string().trim().refine((h) => /^\/[a-z0-9]/i.test(h) || /^https:\/\//i.test(h), "a site path or https URL"),
        }),
      )
      .max(10)
      .default([]),
    /** Corrections to the record itself (not status changes, which live in history). */
    corrections: z.array(z.object({ at: isoDate, what: text })).max(30).default([]),
    /** What AI did on this record, in plain words. */
    aiAssistance: text,
  })
  .superRefine((r, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

    // History is chronological and human-signed.
    r.history.forEach((h, i) => {
      if (MACHINE_SIGNER.test(h.editor))
        issue(["history", i, "editor"], "a status is signed by a human editor, never by an AI or a system");
      if (h.secondReader && MACHINE_SIGNER.test(h.secondReader))
        issue(["history", i, "secondReader"], "the second reader must be a person");
      if (i > 0 && Date.parse(h.at) < Date.parse(r.history[i - 1].at))
        issue(["history", i, "at"], "history must be oldest first");
    });

    const reply = r.rightOfReply;
    const deadline = Date.parse(reply.requestedAt) + reply.deadlineHours * 3600_000;
    const independent = (stance: Evidence["stance"]) =>
      r.evidence.some((e) => e.stance === stance && e.independent);

    r.history.forEach((h, i) => {
      const at = Date.parse(h.at);
      if (h.status !== "attributed" && h.status !== "unresolved") {
        const answered = reply.response && Date.parse(reply.response.receivedAt) <= at;
        if (!answered && at < deadline)
          issue(["history", i, "at"], `a "${h.status}" status needs the reply or the end of the ${reply.deadlineHours} h reply window`);
      }
      if (h.status === "supported" && !independent("supports"))
        issue(["history", i, "status"], '"supported" needs independent evidence that supports the claim');
      if (h.status === "conflicting" && !r.evidence.some((e) => e.stance === "contradicts"))
        issue(["history", i, "status"], '"conflicting" needs evidence that contradicts the claim');
      if (h.status === "refuted") {
        if (!independent("contradicts"))
          issue(["history", i, "status"], '"refuted" needs independent evidence that contradicts the claim');
        if (!h.secondReader) issue(["history", i, "secondReader"], '"refuted" needs a second reader');
        else if (h.secondReader.trim().toLowerCase() === h.editor.trim().toLowerCase())
          issue(["history", i, "secondReader"], "the second reader must be someone other than the editor");
      }
    });
  });

export type LedgerRecord = z.infer<typeof recordSchema>;

export type LedgerParse =
  | { ok: true; record: LedgerRecord }
  | { ok: false; file: string; errors: string[] };

/** Validate one file's parsed JSON. The file name (without .json) must equal the id. */
export function parseLedgerFile(file: string, data: unknown): LedgerParse {
  const r = recordSchema.safeParse(data);
  if (!r.success)
    return {
      ok: false,
      file,
      errors: r.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    };
  const base = file.split("/").pop()!.replace(/\.json$/, "");
  if (base !== r.data.id)
    return { ok: false, file, errors: [`id "${r.data.id}" must match the file name "${base}.json"`] };
  return { ok: true, record: r.data };
}

/** Validate a set of files: records newest change first, plus every rejection (duplicate ids too). */
export function loadLedgerFiles(files: Record<string, unknown>): {
  records: LedgerRecord[];
  rejected: Extract<LedgerParse, { ok: false }>[];
} {
  const records: LedgerRecord[] = [];
  const rejected: Extract<LedgerParse, { ok: false }>[] = [];
  const seen = new Set<string>();
  for (const [file, mod] of Object.entries(files)) {
    const data =
      mod && typeof mod === "object" && "default" in mod ? (mod as { default: unknown }).default : mod;
    const r = parseLedgerFile(file, data);
    if (!r.ok) {
      rejected.push(r);
      continue;
    }
    if (seen.has(r.record.id)) {
      rejected.push({ ok: false, file, errors: [`duplicate id "${r.record.id}"`] });
      continue;
    }
    seen.add(r.record.id);
    records.push(r.record);
  }
  records.sort((a, b) => lastChange(b).localeCompare(lastChange(a)) || b.id.localeCompare(a.id));
  return { records, rejected };
}

/** The current status: the last signed entry. */
export const currentEntry = (r: LedgerRecord): HistoryEntry => r.history[r.history.length - 1];
export const currentStatus = (r: LedgerRecord): Status => currentEntry(r).status;
/** When the record was opened (its first signed entry). */
export const openedAt = (r: LedgerRecord) => r.history[0].at;
/** The latest status change. */
export const lastChange = (r: LedgerRecord) => currentEntry(r).at;

/** Add whole months in UTC, clamping to the month's last day (31 Aug + 6 months → 28/29 Feb). */
export function addMonths(isoDay: string, months: number): string {
  const [y, m, d] = isoDay.slice(0, 10).split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

/** The dates the record comes back to the desk: the override, else 3 and 6 months after it opened. */
export function reopenDates(r: LedgerRecord): string[] {
  if (r.reopen?.length) return [...r.reopen].sort();
  const start = openedAt(r).slice(0, 10);
  return [addMonths(start, 3), addMonths(start, 6)];
}

/** Records whose next reopen date has come (the desk's to-do list). */
export function dueForReopen(list: LedgerRecord[], today = new Date().toISOString().slice(0, 10)) {
  return list.filter((r) => {
    const due = reopenDates(r).filter((d) => d <= today);
    // Due when a reopen date has passed with no signed entry on or after it.
    return due.some((d) => !r.history.some((h) => h.at.slice(0, 10) >= d));
  });
}

/** How the right of reply stands at a given moment. */
export function replyState(r: LedgerRecord, now = Date.now()): "answered" | "waiting" | "no-response" {
  if (r.rightOfReply.response) return "answered";
  const deadline = Date.parse(r.rightOfReply.requestedAt) + r.rightOfReply.deadlineHours * 3600_000;
  return now < deadline ? "waiting" : "no-response";
}

/** Count of records per current status (every status present, zero included). */
export function statusCounts(list: LedgerRecord[]): Record<Status, number> {
  const out = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const r of list) out[currentStatus(r)]++;
  return out;
}

/** Pick the reader's language; `fallback` is true when French was asked for but only English exists. */
export function pickText(t: LedgerText, locale: Locale): { text: string; fallback: boolean } {
  if (locale === "fr" && t.fr) return { text: t.fr, fallback: false };
  return { text: t.en, fallback: locale === "fr" };
}

export const isStatus = (v: unknown): v is Status => typeof v === "string" && (STATUSES as readonly string[]).includes(v);

/** A plain, public JSON view of a record with its computed fields (for /api/ledger.json). */
export function publicRecord(r: LedgerRecord) {
  return {
    ...r,
    status: currentStatus(r),
    statusLabel: STATUS_LABEL[currentStatus(r)].en,
    openedAt: openedAt(r),
    updatedAt: lastChange(r),
    reopenDates: reopenDates(r),
    replyState: replyState(r),
  };
}
