/**
 * Deterministic time helpers that are safe for SSR.
 *
 * Rules:
 *  - Never call Date.now() at render time (hydration mismatch).
 *  - For mock/prototype data, return a stable "Prototype" label.
 *  - For real data, compute relative time only on the client after mount.
 */

export function isPlausibleRecent(iso?: string | null, maxDays = 14): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return false;
  const now = Date.now();
  const diff = now - t;
  return diff >= -60_000 && diff <= maxDays * 24 * 60 * 60 * 1000;
}

export function relativeMinutes(iso: string): number | null {
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return null;
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 0 || mins > 60 * 24 * 14) return null;
  return Math.max(1, mins);
}

export function formatRelative(iso: string, locale: "en" | "fr"): string {
  const m = relativeMinutes(iso);
  if (m == null) return locale === "fr" ? "Prototype" : "Prototype";
  if (m < 60) return `${m} ${locale === "fr" ? "min" : "min ago"}`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${locale === "fr" ? "h" : "h ago"}`;
  const d = Math.round(h / 24);
  return `${d} ${locale === "fr" ? "j" : "d ago"}`;
}
