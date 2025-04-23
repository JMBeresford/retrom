import { config } from "@retrom/configs/eslint/web.config.js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ["./eslint.config.js"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true
      }
    }
  }
];
