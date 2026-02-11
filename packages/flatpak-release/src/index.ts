import fs from "node:fs";
import {
  GenerateNotesContext,
  PrepareContext,
  VerifyConditionsContext,
  type GlobalConfig,
} from "semantic-release";

export type PluginConfig = {
  /**
   * Path to the metainfo file
   */
  metainfoFile?: string;
} & GlobalConfig;

let updatedMetainfo: string | null = null;

function verifyConditions(
  pluginConfig: PluginConfig,
  _context: VerifyConditionsContext,
) {
  const { metainfoFile } = pluginConfig;

  if (!metainfoFile) {
    throw new Error("The 'metainfoFile' option is required.");
  }
}

function generateNotes(
  pluginConfig: PluginConfig,
  context: GenerateNotesContext,
) {
  const { metainfoFile } = pluginConfig;
  const { nextRelease, logger } = context;

  if (!metainfoFile) {
    throw new Error("The 'metainfoFile' option is required.");
  }

  let currentMetainfo: string;

  try {
    currentMetainfo = fs.readFileSync(metainfoFile, "utf8");
  } catch (error) {
    throw new Error(
      `Failed to read the metainfo file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const lines = currentMetainfo.split("\n");
  const beforeLines = [];
  const afterLines = [];

  let foundReleases = false;
  for (const line of lines) {
    if (!foundReleases) {
      if (line.includes("<releases>")) {
        foundReleases = true;
      }

      beforeLines.push(line);
    } else {
      afterLines.push(line);
    }
  }

  if (beforeLines.length === 0 || afterLines.length === 0) {
    throw new Error(
      "The metainfo file does not contain a valid <releases> section. " +
        "Please check the file and update it manually if needed.",
    );
  }

  const before = beforeLines.join("\n");
  const after = afterLines.join("\n");

  const date = new Date();
  const dateIso = date.toISOString().split("T")[0];

  if (after.includes(`version=${nextRelease.version}`)) {
    throw new Error(
      `The metainfo file already contains a release entry for version ${nextRelease.version}. ` +
        "Please check the file and update it manually if needed.",
    );
  }

  const nextVersion = /* xml */ `
    <release date="${dateIso}" version="${nextRelease.version}">
      <url type="details">https://github.com/JMBeresford/retrom/releases/tag/${nextRelease.gitTag}</url>
    </release>
  `.replace("\n", "");

  updatedMetainfo = /* xml */ `
${before}
${nextVersion}
${after}
`;

  logger.log(`Updated metainfo file:\n${updatedMetainfo}`);
}

function prepare(pluginConfig: PluginConfig, _context: PrepareContext) {
  const { metainfoFile } = pluginConfig;
  if (!metainfoFile) {
    throw new Error("The 'metainfoFile' option is required.");
  }

  if (updatedMetainfo) {
    fs.writeFileSync(metainfoFile, updatedMetainfo, "utf8");
  }
}

export default {
  verifyConditions,
  generateNotes,
  prepare,
};
