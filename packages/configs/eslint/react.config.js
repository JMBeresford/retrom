// @ts-check

import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { config as baseConfig } from "./base.config.js";
import { defineConfig } from "eslint/config";

const config = defineConfig({
  name: "react",
  extends: [
    baseConfig,
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    reactHooks.configs.flat.recommended,
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
});

export { config };
export default config;
