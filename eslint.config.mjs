import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Next 16 enables this React Compiler rule for existing effects as well.
      // The current data hooks intentionally trigger async refreshes on mount.
      "react-hooks/set-state-in-effect": "off",
      // React Hook Form exposes watch(), which is intentionally not compiler-memoizable.
      "react-hooks/incompatible-library": "off",
    },
  },
  globalIgnores([".next/**", ".next-codex/**", "out/**", "build/**", "next-env.d.ts"]),
]);
