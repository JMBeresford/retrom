// @ts-check

import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import { resolve } from "node:path";

const __dirname = resolve(process.cwd());

const config = defineConfig(
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          tsconfigRootDir: __dirname,
          allowDefaultProject: ["*.js", "*.config.ts"],
        },
      },
    },
  },
  {
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
  },
  { ignores: ["dist/**", "**/vite.config.ts.timestamp*"] },
);

export { config };
export default config;
