/**
 * Labs progress lives only in this browser (localStorage). Nothing is sent
 * anywhere. Every read and write is wrapped: private windows, blocked storage
 * or a corrupt value simply mean "no progress yet".
 */
import { useSyncExternalStore } from "react";
import { PATHS, requiredSteps, type LabPath } from "./labs";

const KEY = "aib-labs-v1";

export type PathProgress = { done: string[]; at: string; completedAt?: string };
export type LabsState = {
  paths: Record<string, PathProgress>;
  /** The step the reader last opened or ticked, for "continue where you left off". */
  last?: { path: string; step: string; at: string };
  /** Name for the completion certificate, if the reader typed one. */
  name?: string;
  /** Last path the picker recommended. */
  picked?: string;
};

const EMPTY: LabsState = { paths: {} };
let cache: LabsState | null = null;
const listeners = new Set<() => void>();

function read(): LabsState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const v = JSON.parse(raw) as LabsState;
    return v && typeof v === "object" && v.paths && typeof v.paths === "object" ? v : EMPTY;
  } catch {
    return EMPTY;
  }
}

function snapshot(): LabsState {
  if (cache === null) cache = read();
  return cache;
}

function commit(next: LabsState) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: progress still works for this visit */
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

const now = () => new Date().toISOString();

export function isComplete(p: LabPath, s: LabsState) {
  const done = new Set(s.paths[p.id]?.done ?? []);
  return requiredSteps(p).every(st => done.has(st.id));
}

export function pathFraction(p: LabPath, s: LabsState) {
  const done = new Set(s.paths[p.id]?.done ?? []);
  const req = requiredSteps(p);
  return req.length ? req.filter(st => done.has(st.id)).length / req.length : 0;
}

/** Where to pick up: the last path touched and its first unfinished required step. */
export function resumePoint(s: LabsState): { path: LabPath; stepId: string; fraction: number } | null {
  const last = s.last ? PATHS.find(p => p.id === s.last!.path) : undefined;
  const candidates = last ? [last] : [];
  // Fall back to the most recently touched path with progress.
  const touched = Object.entries(s.paths).sort((a, b) => b[1].at.localeCompare(a[1].at)).map(([id]) => PATHS.find(p => p.id === id)).filter(Boolean) as LabPath[];
  for (const p of [...candidates, ...touched]) {
    if (isComplete(p, s)) continue;
    const done = new Set(s.paths[p.id]?.done ?? []);
    const next = p.steps.find(st => !st.optional && !done.has(st.id)) ?? p.steps[0];
    return { path: p, stepId: next.id, fraction: pathFraction(p, s) };
  }
  return null;
}

export function useLabsProgress() {
  const state = useSyncExternalStore(subscribe, snapshot, () => EMPTY);

  const toggle = (pathId: string, stepId: string) => {
    const s = snapshot();
    const cur = s.paths[pathId] ?? { done: [], at: now() };
    const has = cur.done.includes(stepId);
    const done = has ? cur.done.filter(d => d !== stepId) : [...cur.done, stepId];
    const p = PATHS.find(x => x.id === pathId);
    const nextPath: PathProgress = { done, at: now(), completedAt: cur.completedAt };
    const nextState: LabsState = { ...s, paths: { ...s.paths, [pathId]: nextPath }, last: { path: pathId, step: stepId, at: now() } };
    if (p) nextPath.completedAt = isComplete(p, nextState) ? cur.completedAt ?? now() : undefined;
    commit(nextState);
    return !has;
  };

  const touch = (pathId: string, stepId: string) => {
    const s = snapshot();
    const cur = s.paths[pathId] ?? { done: [], at: now() };
    commit({ ...s, paths: { ...s.paths, [pathId]: { ...cur, at: now() } }, last: { path: pathId, step: stepId, at: now() } });
  };

  const setName = (name: string) => commit({ ...snapshot(), name: name.slice(0, 80) });
  const setPicked = (id: string) => commit({ ...snapshot(), picked: id });
  const resetPath = (pathId: string) => {
    const s = snapshot();
    const paths = { ...s.paths };
    delete paths[pathId];
    commit({ ...s, paths, last: s.last?.path === pathId ? undefined : s.last });
  };

  return { state, toggle, touch, setName, setPicked, resetPath };
}

/** True after hydration, so client-only bits (progress, "continue") don't flash on the server render. */
export function useHydrated() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}
