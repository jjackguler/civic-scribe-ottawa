/**
 * The Open Desk Ledger ("open-desk-record v2", protocol v1.0): schema, rules and pure helpers.
 * Kept free of import.meta.glob so tests (tsx) can import it; see ledger.ts for loading.
 *
 * AI Broadsheet is an Open Desk newsroom. Instead of re-summarising other outlets' AI news,
 * the desk records what AI companies and their executives say, tests it against documents,
 * earlier statements and outcomes, and publishes a human-signed result. Each statement is one
 * record with a permanent id (OD-0001, OD-0002 …) and one JSON file:
 *
 *   src/content/ledger/OD-0001.json  →  /ledger/OD-0001  (and /fr/ledger/OD-0001)
 *
 * Protocol v1.0 (8 Nov 2026) keeps three things apart that v0.9 folded into one stamp:
 *   - the evidence result (what the evidence shows; the one stamp readers see first),
 *   - the stage of the review (being tested, monitoring, active follow-up closed),
 *   - the right of reply (requested, waiting, received, declined, no reply by the deadline).
 *
 * Rules the schema enforces (a file that breaks one is left off the site and fails
 * scripts/ledger-test.ts in CI):
 *   - A result is written by a named human editor. AI may open a record, split a claim and
 *     flag contradictions, but a history entry signed by an AI, bot or "automated" is rejected.
 *   - Every claim has its source link and an archived copy.
 *   - Every record is split into four parts tested separately: the event, its scale, the
 *     period, and the stated cause. "Jobs were cut" and "AI caused the cuts" are different claims.
 *   - Every record states, when it opens, what will be measured, the scope, which evidence will
 *     count and which documents are expected when. The test is written before the result.
 *   - Every record has a right-of-reply request. The default window is 5 business days, ending
 *     17:00 Ottawa time (Canadian federal and Ontario holidays skipped). A shorter window needs a
 *     written reason and is never under 48 h. A result ("supported", "conflicting", "refuted")
 *     is only allowed once the reply arrived or the window closed. Silence is not evidence.
 *   - Every result has a second reader other than the editor (EFCSN Code §2.J).
 *   - "Supported" needs independent supporting evidence; "Conflicting evidence" needs contradicting
 *     evidence; "Refuted" needs independent contradicting evidence.
 *   - "No conclusion yet" says why: not enough evidence, or the test date has not come.
 *   - Corrections say what kind they are (correction, update, clarification), who signed them
 *     and, for a correction, what caused the error.
 */
import { z } from "zod";
import type { Bi, Locale } from "./i18n";

/** The protocol a record was opened under. Records keep their version when the protocol changes. */
export const PROTOCOL_VERSIONS = ["1.0"] as const;
export const PROTOCOL_VERSION = PROTOCOL_VERSIONS[PROTOCOL_VERSIONS.length - 1];

/** The five evidence results, in the order readers meet them. Not a scale: a record can move either way. */
export const STATUSES = ["attributed", "unresolved", "supported", "conflicting", "refuted"] as const;
export type Status = (typeof STATUSES)[number];
/** Results that are a verdict on the evidence (and so need the reply window, a second reader …). */
export const VERDICTS = ["supported", "conflicting", "refuted"] as const satisfies readonly Status[];
export const isVerdict = (s: Status) => (VERDICTS as readonly Status[]).includes(s);

/** How the three older stamps carry over (owner plan, 6 Nov 2026). */
export const STAMP_TO_STATUS = {
  "COMPANY CLAIM": "attributed",
  "NOT YET PROVEN": "unresolved",
  CHECKED: "supported",
} as const satisfies Record<string, Status>;

export const STATUS_LABEL: Record<Status, Bi> = {
  attributed: { en: "Recorded, not yet tested", fr: "Déclaration consignée" },
  unresolved: { en: "No conclusion yet", fr: "Aucune conclusion à ce stade" },
  supported: { en: "Supported by the evidence", fr: "Étayée par les éléments disponibles" },
  conflicting: { en: "Conflicting evidence", fr: "Éléments de preuve contradictoires" },
  refuted: { en: "Refuted by the evidence", fr: "Réfutée par les éléments de preuve" },
};

export const STATUS_HELP: Record<Status, Bi> = {
  attributed: {
    en: "We recorded who said it, where and when. This is not a verdict: we have not tested the claim yet.",
    fr: "Nous avons consigné qui l'a dit, où et quand. Ce n'est pas un verdict : l'affirmation n'a pas encore été vérifiée.",
  },
  unresolved: {
    en: "We have looked, and the evidence so far is not enough for a conclusion, or the documents that will settle it are not out yet.",
    fr: "Nous avons vérifié, mais les éléments réunis ne permettent pas encore de conclure, ou les documents qui trancheront ne sont pas encore publiés.",
  },
  supported: {
    en: "Independent evidence supports the claim, within the scope and on the date stated. A match with the company's own material is not enough.",
    fr: "Des éléments indépendants étayent l'affirmation, dans la portée et à la date indiquées. La concordance avec les documents de l'entreprise elle-même ne suffit pas.",
  },
  conflicting: {
    en: "Relevant, reliable evidence points in different directions. This is not a finding that the claim is false.",
    fr: "Des éléments pertinents et fiables vont dans des sens différents. Ce n'est pas un constat de fausseté.",
  },
  refuted: {
    en: "Independent evidence shows the claim, as recorded, is false. It says nothing about intent.",
    fr: "Des éléments indépendants montrent que l'affirmation, telle que consignée, est fausse. Cela ne dit rien de l'intention.",
  },
};

/** Where the review stands. Shown as a small line under the result. */
export const STAGES = ["testing", "monitoring", "closed"] as const;
export type Stage = (typeof STAGES)[number];
export const STAGE_LABEL: Record<Stage, Bi> = {
  testing: { en: "Being tested", fr: "En cours de vérification" },
  monitoring: { en: "Monitoring", fr: "Sous surveillance" },
  closed: { en: "Active follow-up closed", fr: "Suivi actif terminé" },
};

/** Why there is no conclusion yet. */
export const PENDING = ["insufficient-evidence", "test-date-not-reached"] as const;
export type Pending = (typeof PENDING)[number];
export const PENDING_LABEL: Record<Pending, Bi> = {
  "insufficient-evidence": { en: "not enough evidence yet", fr: "données insuffisantes" },
  "test-date-not-reached": { en: "the test date has not come", fr: "échéance de vérification non atteinte" },
};

/** The four parts every AI-and-work claim is split into, tested one by one. */
export const ASPECTS = ["event", "scale", "period", "cause"] as const;
export type Aspect = (typeof ASPECTS)[number];
export const ASPECT_LABEL: Record<Aspect, Bi> = {
  event: { en: "What happened", fr: "Ce qui s'est passé" },
  scale: { en: "How many", fr: "Combien" },
  period: { en: "When", fr: "Quand" },
  cause: { en: "Stated cause", fr: "Cause invoquée" },
};
export const FINDINGS = ["untested", ...STATUSES.filter((s) => s !== "attributed")] as const;
export type Finding = (typeof FINDINGS)[number];

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

/** Words that mark an entry as machine-signed. The result field is human-only. */
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
  /** Why: required on every entry. */
  reason: text,
  stage: z.enum(STAGES).default("testing"),
  /** Required for "unresolved": why there is no conclusion yet. */
  pending: z.enum(PENDING).optional(),
  /** The human editor who signs this entry. Never an AI. */
  editor: personName,
  /** Required for every verdict: a second person who read the evidence before publication. */
  secondReader: personName.optional(),
});
export type HistoryEntry = z.infer<typeof historySchema>;

const partSchema = z.object({
  aspect: z.enum(ASPECTS),
  text,
  finding: z.enum(FINDINGS).default("untested"),
});
export type Part = z.infer<typeof partSchema>;

export const recordSchema = z
  .object({
    version: z.literal(2),
    /** The protocol this record was opened under. */
    protocol: z.enum(PROTOCOL_VERSIONS).default(PROTOCOL_VERSION),
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
    /** The claim split into the event, its scale, the period and the stated cause, tested one by one. */
    parts: z.array(partSchema).min(4).max(12),
    /** Written when the record opens, before any result: what will settle it. */
    test: z.object({
      /** What is measured, in which unit: "roles cut in dispatch and back office (headcount)". */
      measure: text,
      /** The starting value, if there is one: "1,850 dispatch staff at 31 Dec 2025 (annual report)". */
      baseline: text.optional(),
      /** Which company, units, countries and period the test covers. */
      scope: text,
      /** Which evidence will count, and which will not. */
      evidenceAccepted: text,
      /** Documents expected, and by when. Each one is a check date on the record. */
      checks: z
        .array(z.object({ document: z.string().trim().min(3).max(200), expectedBy: isoDate }))
        .min(1)
        .max(8),
    }),
    evidence: z.array(evidenceSchema).max(60).default([]),
    rightOfReply: z.object({
      requestedAt: isoDateTime,
      /** Who was asked: "Media relations, Example Corp". */
      to: z.string().trim().min(2).max(200),
      /** Only when it differs from the default (5 business days, 17:00 Ottawa time). */
      deadline: isoDateTime.optional(),
      /** Required when the window is shorter than the default; never under 48 h. */
      expedited: z.object({ reason: text }).optional(),
      /** Extra time given, for a stated reason (a new substantive point, a fair request). */
      extensions: z
        .array(z.object({ at: isoDateTime, until: isoDateTime, reason: text }))
        .max(5)
        .default([]),
      response: z
        .object({
          receivedAt: isoDateTime,
          kind: z.enum(["answered", "declined"]).default("answered"),
          summary: text,
          url: httpsUrl.optional(),
        })
        .nullable()
        .default(null),
      /** What the company did about its own statement afterwards (not our result). */
      actorAction: z
        .object({ at: isoDate, kind: z.enum(["corrected", "withdrawn", "stood-by"]), note: text })
        .optional(),
    }),
    /** Oldest first; the last entry is the current result. */
    history: z.array(historySchema).min(1, "a record needs at least one signed entry"),
    /** Optional override of the automatic 3- and 6-month review dates. */
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
    /** Changes to the record itself (result changes live in history). */
    corrections: z
      .array(
        z.object({
          at: isoDate,
          kind: z.enum(["correction", "update", "clarification"]),
          what: text,
          /** For a correction: how the error happened. */
          cause: text.optional(),
          editor: personName,
        }),
      )
      .max(30)
      .default([]),
    /** Material removed to protect a source or personal data. The removal is recorded, not the material. */
    redactions: z
      .array(z.object({ at: isoDate, what: text, reason: z.enum(["source-safety", "personal-data", "legal"]), editor: personName }))
      .max(20)
      .default([]),
    /** What AI did on this record, what it did not do, and who checked it. */
    aiAssistance: text,
  })
  .superRefine((r, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

    // Four parts: event, scale, period, cause.
    for (const a of ASPECTS)
      if (!r.parts.some((p) => p.aspect === a))
        issue(["parts"], `the claim must be split into event, scale, period and cause; "${a}" is missing (write "not stated" if the claim does not say)`);

    // History is chronological and human-signed.
    r.history.forEach((h, i) => {
      if (MACHINE_SIGNER.test(h.editor))
        issue(["history", i, "editor"], "a result is signed by a human editor, never by an AI or a system");
      if (h.secondReader && MACHINE_SIGNER.test(h.secondReader))
        issue(["history", i, "secondReader"], "the second reader must be a person");
      if (i > 0 && Date.parse(h.at) < Date.parse(r.history[i - 1].at))
        issue(["history", i, "at"], "history must be oldest first");
      if (h.status === "unresolved" && !h.pending)
        issue(["history", i, "pending"], '"unresolved" says why: "insufficient-evidence" or "test-date-not-reached"');
      if (h.status !== "unresolved" && h.pending)
        issue(["history", i, "pending"], '"pending" only goes with "unresolved"');
    });
    r.corrections.forEach((c, i) => {
      if (MACHINE_SIGNER.test(c.editor)) issue(["corrections", i, "editor"], "a correction is signed by a person");
      if (c.kind === "correction" && !c.cause) issue(["corrections", i, "cause"], "a correction says how the error happened");
    });

    // Right of reply: 5 business days by default; shorter only with a reason, never under 48 h.
    const reply = r.rightOfReply;
    const requested = Date.parse(reply.requestedAt);
    const standard = Date.parse(businessDeadline(reply.requestedAt));
    if (reply.deadline) {
      const set = Date.parse(reply.deadline);
      if (set < requested + 48 * 3600_000) issue(["rightOfReply", "deadline"], "the reply window is never shorter than 48 hours");
      else if (set < standard && !reply.expedited)
        issue(["rightOfReply", "expedited"], "a window shorter than 5 business days needs a written reason");
    }
    let last = Date.parse(baseDeadline(r));
    reply.extensions.forEach((x, i) => {
      if (Date.parse(x.until) <= last) issue(["rightOfReply", "extensions", i, "until"], "an extension must end after the current deadline");
      last = Math.max(last, Date.parse(x.until));
    });
    const deadline = Date.parse(replyDeadline(r));
    const independent = (stance: Evidence["stance"]) =>
      r.evidence.some((e) => e.stance === stance && e.independent);

    r.history.forEach((h, i) => {
      if (!isVerdict(h.status)) return;
      const at = Date.parse(h.at);
      const answered = reply.response && Date.parse(reply.response.receivedAt) <= at;
      if (!answered && at < deadline)
        issue(["history", i, "at"], `a "${h.status}" result needs the reply or the end of the reply window`);
      if (!h.secondReader) issue(["history", i, "secondReader"], `"${h.status}" needs a second reader before publication`);
      else if (h.secondReader.trim().toLowerCase() === h.editor.trim().toLowerCase())
        issue(["history", i, "secondReader"], "the second reader must be someone other than the editor");
      if (h.status === "supported" && !independent("supports"))
        issue(["history", i, "status"], '"supported" needs independent evidence that supports the claim');
      if (h.status === "conflicting" && !r.evidence.some((e) => e.stance === "contradicts"))
        issue(["history", i, "status"], '"conflicting" needs evidence that contradicts the claim');
      if (h.status === "refuted" && !independent("contradicts"))
        issue(["history", i, "status"], '"refuted" needs independent evidence that contradicts the claim');
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

/** The current result: the last signed entry. */
export const currentEntry = (r: LedgerRecord): HistoryEntry => r.history[r.history.length - 1];
export const currentStatus = (r: LedgerRecord): Status => currentEntry(r).status;
export const currentStage = (r: LedgerRecord): Stage => currentEntry(r).stage;
/** When the record was opened (its first signed entry). */
export const openedAt = (r: LedgerRecord) => r.history[0].at;
/** The latest change. */
export const lastChange = (r: LedgerRecord) => currentEntry(r).at;

/* ---------- Dates: business days in Ottawa ---------- */

/**
 * Canadian federal and Ontario statutory holidays the desk does not count (observed dates).
 * Add each year in December. Listed in docs/open-desk.md.
 */
export const DESK_HOLIDAYS: readonly string[] = [
  "2026-01-01", "2026-02-16", "2026-04-03", "2026-05-18", "2026-07-01", "2026-08-03", "2026-09-07",
  "2026-09-30", "2026-10-12", "2026-11-11", "2026-12-25", "2026-12-28",
  "2027-01-01", "2027-02-15", "2027-03-26", "2027-05-24", "2027-07-01", "2027-08-02", "2027-09-06",
  "2027-09-30", "2027-10-11", "2027-11-11", "2027-12-27", "2027-12-28",
];
export const REPLY_BUSINESS_DAYS = 5;
const DESK_TZ = "America/Toronto";

/** The calendar day in Ottawa for an instant. */
function ottawaDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: DESK_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

/** The UTC instant of 17:00 Ottawa time on a given day. */
function ottawaFivePm(day: string): string {
  const probe = new Date(`${day}T12:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", { timeZone: DESK_TZ, timeZoneName: "shortOffset" })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name);
  const offsetMin = m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : -300;
  return new Date(Date.parse(`${day}T17:00:00Z`) - offsetMin * 60_000).toISOString().replace(".000Z", "Z");
}

const isBusinessDay = (day: string) => {
  const wd = new Date(`${day}T12:00:00Z`).getUTCDay();
  return wd !== 0 && wd !== 6 && !DESK_HOLIDAYS.includes(day);
};
const nextDay = (day: string) => new Date(Date.parse(`${day}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

/** N business days after an instant, at 17:00 Ottawa time. The day of the request does not count. */
export function businessDeadline(requestedAt: string, days = REPLY_BUSINESS_DAYS): string {
  let day = ottawaDay(requestedAt);
  for (let n = 0; n < days; ) {
    day = nextDay(day);
    if (isBusinessDay(day)) n++;
  }
  return ottawaFivePm(day);
}

/** The deadline before extensions: the one set on the record, else the 5-business-day default. */
const baseDeadline = (r: LedgerRecord) => r.rightOfReply.deadline ?? businessDeadline(r.rightOfReply.requestedAt);

/** The reply deadline in force, extensions included. */
export function replyDeadline(r: LedgerRecord): string {
  return [baseDeadline(r), ...r.rightOfReply.extensions.map((x) => x.until)].reduce((a, b) =>
    Date.parse(b) > Date.parse(a) ? b : a,
  );
}

export type ReplyState = "waiting" | "answered" | "declined" | "no-response";
export const REPLY_LABEL: Record<ReplyState, Bi> = {
  waiting: { en: "Reply requested", fr: "Réponse attendue" },
  answered: { en: "Reply received", fr: "Réponse reçue" },
  declined: { en: "Declined to comment", fr: "A refusé de commenter" },
  "no-response": { en: "No reply by the deadline", fr: "Aucune réponse reçue à l'échéance" },
};
export const ACTOR_ACTION_LABEL: Record<"corrected" | "withdrawn" | "stood-by", Bi> = {
  corrected: { en: "The company corrected its statement", fr: "L'entreprise a corrigé sa déclaration" },
  withdrawn: { en: "The company withdrew its statement", fr: "L'entreprise a retiré sa déclaration" },
  "stood-by": { en: "The company stands by its statement", fr: "L'entreprise maintient sa déclaration" },
};

/** How the right of reply stands at a given moment. */
export function replyState(r: LedgerRecord, now = Date.now()): ReplyState {
  const res = r.rightOfReply.response;
  if (res) return res.kind === "declined" ? "declined" : "answered";
  return now < Date.parse(replyDeadline(r)) ? "waiting" : "no-response";
}

/** Add whole months in UTC, clamping to the month's last day (31 Aug + 6 months → 28/29 Feb). */
export function addMonths(isoDay: string, months: number): string {
  const [y, m, d] = isoDay.slice(0, 10).split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

export type ScheduleItem = { date: string; kind: "review" | "decision" | "check"; label?: string };

/**
 * When the record comes back to the desk: a 3-month review, a 6-month decision (continue or close
 * active follow-up; no verdict is forced) and every document check from the test plan.
 */
export function reviewSchedule(r: LedgerRecord): ScheduleItem[] {
  const start = openedAt(r).slice(0, 10);
  const reviews: ScheduleItem[] = r.reopen?.length
    ? [...r.reopen].sort().map((date, i, all) => ({ date, kind: i === all.length - 1 ? "decision" : "review" }))
    : [{ date: addMonths(start, 3), kind: "review" }, { date: addMonths(start, 6), kind: "decision" }];
  const checks: ScheduleItem[] = r.test.checks.map((c) => ({ date: c.expectedBy, kind: "check", label: c.document }));
  return [...reviews, ...checks].sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind));
}

/** Every date the record comes back to the desk, oldest first. */
export const reopenDates = (r: LedgerRecord): string[] => [...new Set(reviewSchedule(r).map((s) => s.date))];

/** Records whose next date has come and has no signed entry on or after it (the desk's to-do list). */
export function dueForReopen(list: LedgerRecord[], today = new Date().toISOString().slice(0, 10)) {
  return list.filter((r) => {
    if (currentStage(r) === "closed") return false;
    const due = reopenDates(r).filter((d) => d <= today);
    return due.some((d) => !r.history.some((h) => h.at.slice(0, 10) >= d));
  });
}

/** Count of records per current result (every result present, zero included). */
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

/** What a missing record means, for the open data and the ledger page. */
export const NOT_IN_LEDGER: Bi = {
  en: "A statement that is not in the ledger has not been assessed. Its absence is not a verdict.",
  fr: "Une déclaration absente du registre n'a pas été évaluée. Son absence n'est pas un verdict.",
};

/** A plain, public JSON view of a record with its computed fields (for /api/ledger.json). */
export function publicRecord(r: LedgerRecord) {
  return {
    ...r,
    status: currentStatus(r),
    statusLabel: STATUS_LABEL[currentStatus(r)].en,
    stage: currentStage(r),
    openedAt: openedAt(r),
    updatedAt: lastChange(r),
    replyState: replyState(r),
    replyDeadline: replyDeadline(r),
    schedule: reviewSchedule(r),
  };
}
