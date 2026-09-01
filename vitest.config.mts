import { defineConfig } from "vitest/config";

// Unit tests only, and deliberately narrow: `include` covers lib/, which is
// where the pure logic lives. Components and route handlers need a DOM or a
// running Next server and are verified by `next build` plus the browser passes
// described in docs/architecture.md.
export default defineConfig({
  test: {
    include: ["src/lib/**/*.test.ts"],
    environment: "node",
  },
});
