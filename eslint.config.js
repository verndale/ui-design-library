import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "storybook-static/**",
      "coverage/**",
      "test-results/**",
      "graphify-out/**",
      ".claude/**",
      ".codex/**",
      ".cursor/**",
      "tests/fixtures/**",
      "scripts/graph/data/**",
      "scripts/graph/viewer/vendor/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{cjs,cts}"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,mts,ts,tsx}"],
    ignores: ["scripts/graph/viewer/*.js"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["components/**/*.tsx", "src/**/*.tsx", "stories/**/*.tsx", ".storybook/**/*.tsx"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: reactHooks.configs.flat.recommended.rules,
  },
  {
    files: ["scripts/graph/viewer/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        Sigma: "readonly",
        graphology: "readonly",
        graphologyLibrary: "readonly",
      },
      sourceType: "script",
    },
  },
);
