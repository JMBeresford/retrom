import commitPartial from "./release-notes-template.js";

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  repositoryUrl: "git@github.com:JMBeresford/retrom.git",
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
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "cargo workspaces version --all --force '*' --no-git-commit --yes custom ${nextRelease.version}",
      },
    ],
    [
      "@semantic-release/github",
      {
        draftRelease: true,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "Cargo.toml", "Cargo.lock"],
        message:
          "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}",
      },
    ],
  ],
  preset: "conventionalcommits",
  ci: false,
};
