/**
 * Young Lab stamps live only in this browser (localStorage). Nothing is sent
 * anywhere, there is no account, and no name is ever asked for. Every read
 * and write is wrapped: a private window or blocked storage simply means the
 * passport starts empty.
 *
 * No streak to lose: "lab days" only counts up, and breaks are encouraged.
 */
import { useSyncExternalStore } from "react";
import type { ActivityId } from "./young-lab";

const KEY = "aib-young-v1";

export type StampRec = { at: string; best?: number; times: number };
export type YoungState = { stamps: Partial<Record<ActivityId, StampRec>>; days: string[] };

const EMPTY: YoungState = { stamps: {}, days: [] };
let cache: YoungState | null = null;
const listeners = new Set<() => void>();

function read(): YoungState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const v = JSON.parse(raw) as YoungState;
    if (!v || typeof v !== "object" || typeof v.stamps !== "object" || !Array.isArray(v.days)) return EMPTY;
    return { stamps: v.stamps ?? {}, days: v.days.filter(d => typeof d === "string").slice(-400) };
  } catch {
    return EMPTY;
  }
}

function snapshot(): YoungState {
  if (cache === null) cache = read();
  return cache;
}

function commit(next: YoungState) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: stamps still work for this visit */
  }
  listeners.forEach(l => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) { cache = read(); l(); }
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* ------------------------------------------------------------------ */
/* Gentle "take a break": counted for this visit only.                 */
/* ------------------------------------------------------------------ */

/* Kept in sessionStorage so it survives page loads within one visit and is
   forgotten when the tab closes. Falls back to memory when storage is blocked. */
const SESSION_KEY = "aib-young-session";
type Session = { start: number; finished: number; nudgedAt: number };
let memSession: Session = { start: 0, finished: 0, nudgedAt: 0 };
const BREAK_AFTER_FINISHES = 3;
const BREAK_AFTER_MS = 25 * 60_000;

function getSession(): Session {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const v = JSON.parse(raw) as Session;
      if (typeof v.start === "number" && typeof v.finished === "number" && typeof v.nudgedAt === "number") return v;
    }
  } catch { /* blocked: use memory */ }
  return memSession;
}

function setSession(next: Session) {
  memSession = next;
  try { window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* blocked: memory only */ }
}

/** Call when a young person starts playing; starts the visit clock once. */
export function markPlaying() {
  const s = getSession();
  if (!s.start) setSession({ ...s, start: Date.now() });
}

/** True when it's time to suggest a break: after every three finished games, or once after 25 minutes. */
export function shouldSuggestBreak(): boolean {
  const s = getSession();
  if (!s.start) return false;
  const sinceNudge = s.finished - s.nudgedAt;
  const long = Date.now() - s.start > BREAK_AFTER_MS && s.nudgedAt === 0;
  return sinceNudge >= BREAK_AFTER_FINISHES || long;
}

export function breakShown() {
  const s = getSession();
  setSession({ ...s, nudgedAt: Math.max(s.finished, 1), start: Date.now() });
}

function countFinish() {
  const s = getSession();
  setSession({ ...s, start: s.start || Date.now(), finished: s.finished + 1 });
}

export function useYoungProgress() {
  const state = useSyncExternalStore(subscribe, snapshot, () => EMPTY);

  /** Award (or re-award) a stamp. Returns true the first time it is earned. */
  const award = (id: ActivityId, score?: number) => {
    const s = snapshot();
    const cur = s.stamps[id];
    const best = score === undefined ? cur?.best : Math.max(score, cur?.best ?? 0);
    const d = today();
    const days = s.days.includes(d) ? s.days : [...s.days, d].slice(-400);
    countFinish();
    commit({ stamps: { ...s.stamps, [id]: { at: cur?.at ?? new Date().toISOString(), best, times: (cur?.times ?? 0) + 1 } }, days });
    return !cur;
  };

  const clear = () => commit({ stamps: {}, days: [] });

  return { state, award, clear };
}

export const stampCount = (s: YoungState) => Object.keys(s.stamps).length;
