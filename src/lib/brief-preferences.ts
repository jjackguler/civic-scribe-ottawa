import { DESKS, TOPIC_DESK } from "./desks";
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
/**
 * What "Follow topic" stores: a desk id for anything that belongs to a desk, in either language
 * ("Rights & power", "Droits et pouvoir", an old "policy" follow → "rights"), so the topics a
 * reader can follow stay the five desks plus the app's own shelves (AI literacy, Originals).
 */
const DESK_KEYS = new Map<string, string>(
  DESKS.flatMap(d => [[d.label.en.toLowerCase(), d.id], [d.label.fr.toLowerCase(), d.id]] as [string, string][]),
);
export function topicKey(topic: string) {
  const key = topic.trim().toLowerCase();
  if (key === "culture ia") return "ai literacy";
  if (key === "originals · en") return "originals";
  return DESK_KEYS.get(key) ?? TOPIC_DESK[key] ?? key;
}
