import baseConfig from "./eslint/base.config.js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config} */
const config = tseslint.config(...baseConfig, {
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ["*.js"]
      }
    }
  }
});

export default config;
