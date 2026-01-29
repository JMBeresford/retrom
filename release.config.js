import commitPartial from "./release-notes-template.js";

const DRAFT_RELEASE = !!process.env.DRAFT_RELEASE;

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  repositoryUrl: "https://github.com/JMBeresford/retrom",
  branches: ["main", { name: "beta", prerelease: true }],
  dryRun: true,
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        // Breaking changes trigger a minor release until v1.0.0
        releaseRules: [{ breaking: true, release: "minor" }],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        writerOpts: {
          commitPartial,
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    "@semantic-release-cargo/semantic-release-cargo",
    [
      "@semantic-release/github",
      {
        draftRelease: DRAFT_RELEASE,
      },
    ],
  ],
  preset: "conventionalcommits",
  ci: false,
};
