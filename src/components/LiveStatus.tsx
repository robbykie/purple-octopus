"use client";

import { usePortfolio } from "@/hooks/usePortfolio";

const STATES = {
  connecting: { label: "Connecting", dot: "bg-amber", pulse: true },
  connected: { label: "Connected", dot: "bg-sage", pulse: true },
  demo: { label: "Demo data", dot: "bg-amber", pulse: false },
  offline: { label: "Offline", dot: "bg-clay", pulse: false },
} as const;

export function LiveStatus() {
  const { connection } = usePortfolio();
  const state = STATES[connection];

  return (
    <p className="flex items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 text-[0.78rem]">
      <span className="relative flex size-2">
        {state.pulse && (
          <span className={`absolute inline-flex size-full animate-ping rounded-full ${state.dot} opacity-60`} />
        )}
        <span className={`relative inline-flex size-2 rounded-full ${state.dot}`} />
      </span>
      <span className="text-body">Live quote status</span>
      <span className="text-faint">{state.label}</span>
    </p>
  );
}
