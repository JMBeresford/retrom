import fs from "node:fs";
import {
  GenerateNotesContext,
  PrepareContext,
  VerifyConditionsContext,
  type GlobalConfig,
} from "semantic-release";
import {
  renderClientPackageTemplate,
  renderServicePackageTemplate,
} from "./template.js";

export type PluginConfig = {
  /**
   * Path to output file
   */
  clientPackageFilePath?: string;
  servicePackageFilePath?: string;
} & GlobalConfig;

let pnpmDepsHash: `sha256-${string}` | undefined;
let serviceTemplate: string | undefined;
let clientTemplate: string | undefined;

function verifyConditions(
  pluginConfig: PluginConfig,
  context: VerifyConditionsContext,
) {
  const { env } = context;
  const { clientPackageFilePath, servicePackageFilePath } = pluginConfig;

  if (!clientPackageFilePath || !servicePackageFilePath) {
    throw new Error(
      "Both 'clientPackageFilePath' and 'servicePackageFilePath' options are required.",
    );
  }

  const envHash = env.PNPM_DEPS_HASH;

  const hashValid = /^sha256-[a-zA-Z0-9+/=]+$/.test(envHash);

  if (!hashValid) {
    throw new Error(
      `The 'PNPM_DEPS_HASH' environment variable must be in the format 'sha256-<hash>'. Provided value: ${envHash}`,
    );
  }

  pnpmDepsHash = envHash as `sha256-${string}`;
}

function generateNotes(
  _pluginConfig: PluginConfig,
  context: GenerateNotesContext,
) {
  const { logger } = context;

  if (!pnpmDepsHash) {
    throw new Error(
      "PNPM_DEPS_HASH is not set or invalid. Ensure that 'verifyConditions' has been called and the environment variable is correctly formatted.",
    );
  }

  serviceTemplate = renderServicePackageTemplate({ pnpmDepsHash });
  clientTemplate = renderClientPackageTemplate({ pnpmDepsHash });

  logger.log(`Updated service package.nix file:\n${serviceTemplate}`);
  logger.log(`Updated client package.nix file:\n${clientTemplate}`);
}

function prepare(pluginConfig: PluginConfig, _context: PrepareContext) {
  const { clientPackageFilePath, servicePackageFilePath } = pluginConfig;

  if (!clientPackageFilePath || !servicePackageFilePath) {
    throw new Error(
      "Both 'clientPackageFilePath' and 'servicePackageFilePath' options are required.",
    );
  }

  if (!pnpmDepsHash) {
    throw new Error(
      "PNPM_DEPS_HASH is not set or invalid. Ensure that 'verifyConditions' has been called and the environment variable is correctly formatted.",
    );
  }

  if (!serviceTemplate || !clientTemplate) {
    throw new Error(
      "Templates are not generated. Ensure that 'generateNotes' has been called before 'prepare'.",
    );
  }

  fs.writeFileSync(servicePackageFilePath, serviceTemplate, {
    encoding: "utf-8",
    flag: "w+",
  });

  fs.writeFileSync(clientPackageFilePath, clientTemplate, {
    encoding: "utf-8",
    flag: "w+",
  });
}

export default {
  verifyConditions,
  generateNotes,
  prepare,
};
