// @ts-check

import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import { resolve } from "node:path";

const __dirname = resolve(process.cwd());

const config = defineConfig({
  name: "base",
  extends: [tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    parserOptions: {
      project: false,
      projectService: {
        tsconfigRootDir: __dirname,
        allowDefaultProject: ["*.js", "*.config.ts"],
      },
    },
  },
  ignores: ["dist/**", "**/vite.config.ts.timestamp*"],
  rules: {
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
    "@typescript-eslint/no-misused-promises": [
      "warn",
      { checksVoidReturn: { returns: false, attributes: false } },
    ],
  },
});

export { config };
export default config;
