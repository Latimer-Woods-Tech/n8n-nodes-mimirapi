import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      // `json-summary` emits coverage/coverage-summary.json, which the test
      // spine's `.github/scripts/ci-test-report.mjs` (collectCoverage) reads and
      // lands in the Studio Neon `studio_coverage` table. Sense-only: additive
      // reporter output, no threshold change — the vitest floors below stay the
      // sole enforcement.
      reporter: ['text', 'lcov', 'json-summary'],
      // Floor 0 onboarding (testing assembly line 2b): this declarative n8n
      // community node has one smoke test today. Thresholds start at 0 so the
      // package never blocks CI; the coverage-ratchet bot reads the measured
      // numbers from studio_coverage and raises these floors as tests land.
      thresholds: { lines: 0, functions: 0, branches: 0, statements: 0 },
      include: ['nodes/**', 'credentials/**'],
      exclude: ['**/*.test.ts'],
    },
  },
});
