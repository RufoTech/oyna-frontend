import { useSyncExternalStore } from "react";

type LoadState = { progress: number; done: boolean };

let state: LoadState = { progress: 0, done: false };
const listeners = new Set<() => void>();

const emit = () => {
  for (const l of listeners) l();
};

export function setLoadProgress(p: number): void {
  const next = Math.min(1, Math.max(state.progress, p, 0));
  if (next === state.progress) return;
  state = { ...state, progress: next };
  emit();
}

export function markLoaded(): void {
  if (state.done) return;
  state = { progress: 1, done: true };
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function useLoadState(): LoadState {
  return useSyncExternalStore(subscribe, () => state);
}

// Safety: a slow network must never block the site forever.
setTimeout(markLoaded, 25000);
