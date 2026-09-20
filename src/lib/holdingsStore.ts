import { loadHoldings, saveHoldings } from "./storage";
import type { Holding } from "./types";

/**
 * Holdings live in localStorage, which is an external system rather than React
 * state — so they are exposed as a `useSyncExternalStore` source. That keeps
 * the read out of an effect, gives server rendering a stable empty snapshot to
 * hydrate against, and lets a second tab's edits land here through the
 * browser's `storage` event.
 */

const SERVER_SNAPSHOT: Holding[] = [];

let cache: Holding[] | null = null;
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

/** Must be referentially stable between calls, or React re-renders forever. */
export function getSnapshot(): Holding[] {
  cache ??= loadHoldings();
  return cache;
}

export function getServerSnapshot(): Holding[] {
  return SERVER_SNAPSHOT;
}

export function setHoldings(next: Holding[]): void {
  cache = next;
  saveHoldings(next);
  emit();
}

export function updateHoldings(recipe: (current: Holding[]) => Holding[]): void {
  setHoldings(recipe(getSnapshot()));
}

/** Another tab wrote to localStorage; drop the cache and let subscribers re-read. */
function onStorage(event: StorageEvent) {
  if (event.key !== null && !event.key.startsWith("northstar.")) return;
  cache = null;
  emit();
}

function emit() {
  for (const listener of listeners) listener();
}
