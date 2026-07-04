// @ts-check

import globals from "globals";
import { reactRefresh } from "eslint-plugin-react-refresh";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import { tanstackConfig } from "@tanstack/eslint-config";
import { config as reactConfig } from "./react.config.js";
import { defineConfig } from "eslint/config";

const config = defineConfig({
  name: "web",
  extends: [
    reactRefresh.configs.vite({
      extraHOCs: ["createFileRoute", "createRootRouteWithContext"],
    }),
    tanstackConfig,
    tanstackQuery.configs["flat/recommended"],
    reactConfig,
  ],
  languageOptions: {
    globals: { ...globals.serviceworker },
  },
  rules: {
    "react-refresh/only-export-components": "warn",
  },
});

export { config };
export default config;
