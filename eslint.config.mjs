import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // React Compiler rule. Remaining hits are deliberate: localStorage/URL reads after hydration,
      // resetting a sheet when it opens, fetch-on-mount loaders. Fix them when touching those files.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Not app code: vendored agent skills, generated graphs, test output
    ".agents/**",
    ".claude/**",
    "agent/**",
    ".taste-skill/**",
    "graphify-out/**",
    "src/graphify-out/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
