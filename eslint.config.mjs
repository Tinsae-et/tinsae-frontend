import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Read-only design reference exported from the Claude Design project.
    // Not application code — it targets React 18 UMD + Babel standalone.
    "design_handoff_home/**",
    "design_handoff_search/**",
  ]),
]);

export default eslintConfig;
