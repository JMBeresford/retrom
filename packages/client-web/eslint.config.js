// @ts-check

import { config as base } from "@retrom/configs/eslint/web.config.js";
import { defineConfig } from "eslint/config";

const config = defineConfig(base, {
  rules: {
    "react/react-in-jsx-scope": "off",
    "react-hooks/refs": "warn",
    "react-hooks/immutability": "warn",
    "react-hooks/static-components": "warn",
    "react/prop-types": ["off"],
    "react/no-unknown-property": ["off"],
    "react-hooks/preserve-manual-memoization": ["off"]
  }
});

export default config;
