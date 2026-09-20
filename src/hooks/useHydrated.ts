"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False while server-rendering and during the hydrating render, true after.
 * Lets a component defer browser-only output (a local date, say) without
 * setting state from an effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
