/**
 * Small shared helpers for the Originals pipeline: env, the run summary
 * ($GITHUB_STEP_SUMMARY) and the recoverable error for setup gaps and quotas.
 */
import { appendFile } from "node:fs/promises";

export const env = (k: string) => process.env[k]?.trim() || "";

export function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

/**
 * A run that cannot go ahead for a reason outside the code: a missing key, an
 * exhausted quota, a rejected key. The job fails visibly; the story is not consumed.
 */
export class SkipRun extends Error {
  constructor(public title: string, message: string) { super(message); this.name = "SkipRun"; }
}

/** HTTP statuses that mean "no key / no quota / not allowed" rather than a bug. */
export const LIMIT_STATUSES = [401, 402, 403, 429];

/** Turns an API error response into SkipRun when it is about keys or quota. */
export function limitError(service: string, status: number, body: string): SkipRun | null {
  const quota = status === 429 || /quota|rate.?limit|exceeded|insufficient|credit|billing/i.test(body);
  if (status === 429 || status === 402 || (quota && status >= 400 && status < 500)) {
    return new SkipRun(`${service} quota`, `${service} answered HTTP ${status} (quota or rate limit). Nothing was published; the next scheduled run will try again.`);
  }
  if (status === 401 || status === 403) {
    return new SkipRun(`${service} key`, `${service} rejected the key (HTTP ${status}). Check the repository secret.`);
  }
  return null;
}

/** Lines for the run summary: printed now, written to $GITHUB_STEP_SUMMARY at the end. */
const lines: string[] = [];
export function note(line: string) { console.log(line); lines.push(line); }
export function warn(title: string, message: string) {
  console.log(`::warning title=${title}::${message}`);
  lines.push(`> **${title}:** ${message}`);
}
export async function flushSummary(heading: string) {
  const f = env("GITHUB_STEP_SUMMARY");
  if (!f || !lines.length) return;
  await appendFile(f, `### ${heading}\n\n${lines.map(l => (l.startsWith(">") ? l : `- ${l}`)).join("\n")}\n\n`);
  lines.length = 0;
}
