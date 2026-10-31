/**
 * Buildgena Studio dispatches ("studio-dispatch v1"): schema and pure helpers.
 * Kept free of import.meta.glob so tests (tsx) can import it; see studio.ts for loading.
 *
 * Buildgena Studio dispatches ("studio-dispatch v1").
 *
 * Buildgena Studio is GEN:A Labs' editor-approved newsroom app. It runs on the
 * owner's computer; when an editor approves a piece there, it is committed to
 * this repository as one JSON file in src/content/studio/<id>.json. Files are
 * read at build time (import.meta.glob), so a piece goes live with the next
 * deploy and never depends on a database or an API being up.
 *
 * Each piece has one language and one stable address:
 *   English → /desk/<id>      French → /fr/desk/<id>
 *
 * Schema (version 1):
 * {"version":1,"id":"kebab-slug","lang":"en"|"fr","title":"…","dek":"one-sentence summary",
 *  "body":"markdown","sources":[{"title":"…","url":"https://…","publisher":"…"}],
 *  "stamps":["CHECKED"|"COMPANY CLAIM"|"NOT YET PROVEN"],"approvedBy":"editor name",
 *  "approvedAt":"ISO 8601","cover":"optional image URL","producedWith":"Buildgena Studio 0.1.x",
 *  "aiDisclosure":"Drafted with AI assistance; edited and approved by a human editor."}
 *
 * A file that fails validation is left off the site (and fails scripts/studio-test.ts in CI),
 * so one bad file can never take the paper down.
 */
import { z } from "zod";
import type { Bi } from "./i18n";

export const STAMPS = ["CHECKED", "COMPANY CLAIM", "NOT YET PROVEN"] as const;
export type Stamp = (typeof STAMPS)[number];

const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine((u) => /^https:\/\//i.test(u), "must be an https:// URL");

export const studioDispatchSchema = z.object({
  version: z.literal(1),
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be a kebab-case slug")
    .max(120),
  lang: z.enum(["en", "fr"]),
  title: z.string().trim().min(8).max(200),
  dek: z.string().trim().min(20).max(400),
  body: z.string().trim().min(80),
  sources: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(300),
        url: httpsUrl,
        publisher: z.string().trim().min(2).max(120),
      }),
    )
    .min(1, "a Studio piece must cite at least one source"),
  stamps: z.array(z.enum(STAMPS)).default([]),
  approvedBy: z.string().trim().min(2).max(120),
  approvedAt: z
    .string()
    .refine(
      (v) => !Number.isNaN(Date.parse(v)) && /^\d{4}-\d{2}-\d{2}T/.test(v),
      "approvedAt must be an ISO 8601 date-time",
    ),
  cover: httpsUrl.optional().or(z.literal("").transform(() => undefined)),
  producedWith: z
    .string()
    .trim()
    .regex(
      /^Buildgena Studio \d+\.\d+\.\d+/,
      'producedWith must read "Buildgena Studio <version>"',
    ),
  aiDisclosure: z.string().trim().min(20).max(400),
});

export type StudioDispatch = z.infer<typeof studioDispatchSchema>;

export type StudioParse =
  { ok: true; piece: StudioDispatch } | { ok: false; file: string; errors: string[] };

/** Validate one file's parsed JSON. The file name (without .json) must equal the id. */
export function parseStudioFile(file: string, data: unknown): StudioParse {
  const r = studioDispatchSchema.safeParse(data);
  if (!r.success)
    return {
      ok: false,
      file,
      errors: r.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    };
  const base = file
    .split("/")
    .pop()!
    .replace(/\.json$/, "");
  if (base !== r.data.id)
    return {
      ok: false,
      file,
      errors: [`id "${r.data.id}" must match the file name "${base}.json"`],
    };
  return { ok: true, piece: r.data };
}

/** Validate a set of files: pieces newest first, plus every rejection (duplicate ids are rejected too). */
export function loadStudioFiles(files: Record<string, unknown>): {
  pieces: StudioDispatch[];
  rejected: Extract<StudioParse, { ok: false }>[];
} {
  const pieces: StudioDispatch[] = [];
  const rejected: Extract<StudioParse, { ok: false }>[] = [];
  const seen = new Set<string>();
  for (const [file, mod] of Object.entries(files)) {
    const data =
      mod && typeof mod === "object" && "default" in mod
        ? (mod as { default: unknown }).default
        : mod;
    const r = parseStudioFile(file, data);
    if (!r.ok) {
      rejected.push(r);
      continue;
    }
    if (seen.has(r.piece.id)) {
      rejected.push({ ok: false, file, errors: [`duplicate id "${r.piece.id}"`] });
      continue;
    }
    seen.add(r.piece.id);
    pieces.push(r.piece);
  }
  pieces.sort((a, b) => b.approvedAt.localeCompare(a.approvedAt));
  return { pieces, rejected };
}

export const STAMP_LABEL: Record<Stamp, Bi> = {
  CHECKED: { en: "Checked", fr: "Vérifié" },
  "COMPANY CLAIM": { en: "Company claim", fr: "Affirmation d'entreprise" },
  "NOT YET PROVEN": { en: "Not yet proven", fr: "Pas encore prouvé" },
};

export const STAMP_HELP: Record<Stamp, Bi> = {
  CHECKED: {
    en: "The editor checked the central facts against the sources listed below.",
    fr: "Le responsable éditorial a vérifié les faits essentiels auprès des sources citées ci-dessous.",
  },
  "COMPANY CLAIM": {
    en: "Some statements come from a company about itself and have not been independently confirmed.",
    fr: "Certaines affirmations viennent d'une entreprise à son propre sujet et n'ont pas été confirmées de façon indépendante.",
  },
  "NOT YET PROVEN": {
    en: "The piece describes something that has been announced or claimed but not yet shown to work.",
    fr: "L'article décrit une chose annoncée ou affirmée, mais dont l'efficacité n'est pas encore démontrée.",
  },
};

/** Rough reading time from the markdown body (230 words a minute). */
export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 230));
}
