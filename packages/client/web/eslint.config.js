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
    },
    rules: {
      // Temporarily disable unsafe rules during migration from ts-proto to protobuf-es
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off"
    }
  },
  { ignores: ["eslint.config.js"] }
);

export default config;
