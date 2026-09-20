import { defineConfig } from "vitest/config";

export default defineConfig({
  // The unit tests are pure TypeScript, so skip Vite's PostCSS discovery —
  // Tailwind's plugin is meant for Next's build, not for this runner.
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
