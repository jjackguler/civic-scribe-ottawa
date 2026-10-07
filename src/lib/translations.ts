/**
 * Client-side store of Claude translations, keyed by target locale + story id.
 * display() reads it; LocaleProvider fills it and re-renders readers.
 */
import type { Locale } from "./i18n";

export type Translated = { title: string; summary: string };
const store = new Map<string, Translated>();

export const trKey = (locale: Locale, id: string) => `${locale}:${id}`;
export const getTranslation = (locale: Locale, id: string) => store.get(trKey(locale, id));
export const hasTranslation = (locale: Locale, id: string) => store.has(trKey(locale, id));
export function putTranslations(locale: Locale, items: Record<string, Translated>) {
  let n = 0;
  for (const [id, v] of Object.entries(items)) { store.set(trKey(locale, id), v); n++; }
  return n;
}
