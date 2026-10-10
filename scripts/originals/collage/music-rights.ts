import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

/** Owner attestation tied to the exact file, not a licence inferred from its folder. */
export type MusicRights = {
  commercialUse: true;
  provider: "suno";
  planAtCreation: "pro" | "premier";
  createdAt: string;
  reviewedAt: string;
  reviewedBy: string;
  sourceUrl: string;
  sha256: string;
  credit: string;
};
export function validMusicRights(v: unknown, digest: string): v is MusicRights {
  if (!v || typeof v !== "object") return false;
  const r = v as Partial<MusicRights>;
  const time = (s?: string) => s ? Date.parse(s) : NaN;
  const made = time(r.createdAt), reviewed = time(r.reviewedAt);
  return r.commercialUse === true && r.provider === "suno" && ["pro", "premier"].includes(r.planAtCreation ?? "")
    && Number.isFinite(made) && reviewed >= made && reviewed <= Date.now()
    && typeof r.reviewedBy === "string" && r.reviewedBy.trim().length > 0
    && typeof r.sourceUrl === "string" && /^https:\/\/(?:www\.)?suno\.com\/song\/[a-zA-Z0-9-]+(?:\?.*)?$/.test(r.sourceUrl)
    && /^[a-f0-9]{64}$/.test(r.sha256 ?? "") && r.sha256 === digest
    && typeof r.credit === "string" && r.credit.trim().length > 0;
}
export async function approvedOwnerMusic(file: string): Promise<MusicRights | null> {
  try {
    const manifest = JSON.parse(await readFile(join(dirname(file), "rights.json"), "utf8"));
    const entry = manifest[basename(file)];
    const digest = createHash("sha256").update(await readFile(file)).digest("hex");
    return validMusicRights(entry, digest) ? entry : null;
  } catch { return null; }
}
export const isCc0 = (license?: string) => /^(?:CC0(?:\s+1\.0)?|https?:\/\/creativecommons\.org\/publicdomain\/zero\/1\.0\/?)$/i.test(license?.trim() ?? "");
