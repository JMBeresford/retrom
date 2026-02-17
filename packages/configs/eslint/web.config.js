// @ts-check

import globals from "globals";
import { reactRefresh } from "eslint-plugin-react-refresh";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import { config as reactConfig } from "./react.config.js";
import { defineConfig } from "eslint/config";

const config = defineConfig(
  reactConfig,
  tanstackQuery.configs["flat/recommended"],
  reactRefresh.configs.vite(),
  {
    languageOptions: {
      globals: { ...globals.serviceworker },
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);

export { config };
export default config;
