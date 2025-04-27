import { config as base } from "@retrom/configs/eslint/web.config.js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config} */
const config = tseslint.config(
  base,
  {
    ignores: ["eslint.config.js"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true
      }
    }
  },
  { ignores: ["eslint.config.js"] }
);

export default config;
