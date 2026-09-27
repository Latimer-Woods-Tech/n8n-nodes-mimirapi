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
      // Ratchet closed 2026-09-27: the floors were 0 on all four axes, with the
      // promotion left to a "coverage-ratchet bot". A threshold of 0 cannot
      // reject anything, and nothing registered the ratchet, so it was never
      // going to fire. Set to the MEASURED values instead — 18/18 statements
      // and lines, with 0 branches and 0 functions in a purely declarative
      // node — so adding an uncovered branch now fails here.
      //
      // Read the number honestly: for a declarative n8n node (a `description`
      // object, no `execute()`) statement coverage is close to meaningless. The
      // real guard is `test/mimirapi.property.test.ts`, which quantifies the
      // structural laws — every operation routes somewhere well-formed, every
      // field is gated to a declared operation and lands on the wire, the
      // send-sms surface stays absent, no route ships a workers.dev origin —
      // over the node's own finite declared domain. Coverage pins the file;
      // the property suite pins the behaviour.
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      include: ['nodes/**', 'credentials/**'],
      exclude: ['**/*.test.ts'],
    },
  },
});
