/** Private, bounded preferences. These are not public engagement counts. */
export const BRIEF_PREFS_KEY = "ab-brief-preferences-v1";
export type BriefPreferences = { liked: string[]; following: string[] };
export function parseBriefPreferences(raw: string | null): BriefPreferences {
  try {
    const data = JSON.parse(raw || "{}");
    const strings = (value: unknown, max: number) =>
      Array.isArray(value)
        ? [
            ...new Set(
              value.filter(
                (v): v is string => typeof v === "string" && v.length > 0 && v.length <= 160,
              ),
            ),
          ].slice(0, max)
        : [];
    return { liked: strings(data?.liked, 500), following: strings(data?.following, 50) };
  } catch {
    return { liked: [], following: [] };
  }
}
export function topicKey(topic: string) {
  const key = topic.trim().toLowerCase();
  return key === "culture ia" ? "ai literacy" : key;
}
