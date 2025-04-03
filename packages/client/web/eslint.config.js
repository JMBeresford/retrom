import { config } from "@retrom/configs/eslint/web.config.js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ["tsconfig.json", "tsconfig.node.json"]
      }
    }
  }
];
