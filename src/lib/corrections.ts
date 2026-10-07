import type { Bi } from "./i18n";

/**
 * Public corrections log, newest first. Add an entry whenever we fix
 * something a reader could have relied on: a wrong credit, a story filed
 * under the wrong desk, a factual error in our own writing (editorials,
 * guides, funding entries, editor headlines).
 *
 * Example:
 * {
 *   date: "2026-10-12",
 *   page: "/funding",
 *   what: { en: "The CanExport SMEs deadline was wrong. It is …", fr: "La date limite … était erronée. Il s'agit du …" },
 * },
 */
export type Correction = { date: string; page: string; what: Bi };

export const CORRECTIONS: Correction[] = [];
