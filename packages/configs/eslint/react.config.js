// @ts-check

import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { config as baseConfig } from "./base.config.js";
import { defineConfig } from "eslint/config";

const config = defineConfig(
  baseConfig,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
      "react/prop-types": ["off"],
      "react/no-unknown-property": ["off"],
    },
  },
);

export { config };
export default config;
