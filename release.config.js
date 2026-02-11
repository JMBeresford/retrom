import commitPartial from "./release-notes-template.js";

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  repositoryUrl: "https://github.com/JMBeresford/retrom.git",
  branches: ["main", { name: "beta", prerelease: true }],
  dryRun: true,
  preset: "conventionalcommits",
  ci: false,
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        // Breaking changes trigger a minor release, and feature changes
        // trigger a patch release until v1.0.0
        releaseRules: [
          { breaking: true, release: "minor" },
          {
            type: "feat",
            release: "patch",
          },
        ],
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
      "@retrom/flatpak-release",
      {
        manifestFile: "io.github.jmberesford.Retrom.yml",
        metainfoFile: "io.github.jmberesford.Retrom.metainfo.xml",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "CHANGELOG.md",
          "Cargo.toml",
          "Cargo.lock",
          "io.github.jmberesford.Retrom.metainfo.xml",
        ],
        message:
          "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}",
      },
    ],
  ],
};
