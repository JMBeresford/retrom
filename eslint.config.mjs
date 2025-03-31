import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import turbo from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import tanstackQuery from "@tanstack/eslint-plugin-query";

export default tseslint.config(
  { ignores: ["dist", "src/components/ui"] },
  {
    extends: [
      js.configs.recommended,
      turbo.configs["flat/recommended"],
      ...tanstackQuery.configs["flat/recommended"],
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
      },
    },
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@tanstack/query": tanstackQuery,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-misused-promises": [
        "warn",
        { checksVoidReturn: { returns: false, attributes: false } },
      ],
    },
  },
);
