/** Only public story metadata is saved, on this device. Never credentials or full publisher articles. */
export const SAVED_KEY = 'ab-saved-v1';
export const READER_KEY = 'ab-reader-size-v1';
export const SAVED_EVENT = 'ab-saved-changed';
export type SavedStory = { path: string; title: string; summary: string; source: string; publishedAt: string; savedAt: string; locale: 'en' | 'fr' };
export function safeStoryPath(value: unknown): value is string {
  return typeof value === 'string' && /^\/(?:fr\/)?(?:story|article)\/[a-zA-Z0-9_%.-]+$/.test(value) && !/%(?:2f|5c|00)/i.test(value) && value.length < 300;
}
const text = (v: unknown, n: number) => typeof v === 'string' ? v.slice(0, n) : '';
export function parseSaved(raw: string | null): SavedStory[] {
  try {
    const parsed: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter((s): s is Record<string, unknown> => !!s && typeof s === 'object').flatMap(s => {
      if (!safeStoryPath(s.path) || !text(s.title, 300) || seen.has(s.path)) return [];
      seen.add(s.path);
      return [{ path: s.path, title: text(s.title, 300), summary: text(s.summary, 1400), source: text(s.source, 120), publishedAt: text(s.publishedAt, 40), savedAt: text(s.savedAt, 40), locale: s.locale === 'fr' ? 'fr' as const : 'en' as const }];
    }).slice(0, 100);
  } catch { return []; }
}
export function readSaved(): SavedStory[] {
  try { return parseSaved(localStorage.getItem(SAVED_KEY)); } catch { return []; }
}
export function writeSaved(items: SavedStory[]): boolean {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(parseSaved(JSON.stringify(items))));
    window.dispatchEvent(new Event(SAVED_EVENT));
    return true;
  } catch { return false; }
}
export function readerSize(raw: string | null): 'normal' | 'large' | 'larger' {
  return raw === 'large' || raw === 'larger' ? raw : 'normal';
}
