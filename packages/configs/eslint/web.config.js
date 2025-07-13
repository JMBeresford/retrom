import globals from "globals";
import reactRefresh from "eslint-plugin-react-refresh";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import tseslint from "typescript-eslint";
import { config as reactConfig } from "./react.config.js";

/** @type {import("typescript-eslint").ConfigArray} */
const config = tseslint.config(
  reactConfig,
  tanstackQuery.configs["flat/recommended"],
  {
    languageOptions: {
      globals: { ...globals.serviceworker },
    },
  },
  {
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    extends: tanstackQuery.configs["flat/recommended"],
  },
);

export { config };
export default config;
