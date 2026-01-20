import Handlebars from "handlebars";

Handlebars.registerHelper("indent", (text) =>
  text
    .split("\n")
    .map((line) => "\t" + line)
    .join("\n"),
);

const commitPartial = `
* {{header}}

{{~!-- commit link --}}
{{~#if @root.linkReferences}} ([{{hash}}](
  {{~#if @root.repository}}
    {{~#if @root.host}}
      {{~@root.host}}/
    {{~/if}}
    {{~#if @root.owner}}
      {{~@root.owner}}/
    {{~/if}}
    {{~@root.repository}}
  {{~else}}
    {{~@root.repoUrl}}
  {{~/if}}/
  {{~@root.commit}}/{{hash}}))
{{~else if hash}} {{hash}}{{~/if}}

{{~!-- commit references --}}
{{~#if references~}}
  , closes
  {{~#each references}} {{#if @root.linkReferences~}}
    [
    {{~#if this.owner}}
      {{~this.owner}}/
    {{~/if}}
    {{~this.repository}}#{{this.issue}}](
    {{~#if @root.repository}}
      {{~#if @root.host}}
        {{~@root.host}}/
      {{~/if}}
      {{~#if this.repository}}
        {{~#if this.owner}}
          {{~this.owner}}/
        {{~/if}}
        {{~this.repository}}
      {{~else}}
        {{~#if @root.owner}}
          {{~@root.owner}}/
        {{~/if}}
          {{~@root.repository}}
        {{~/if}}
    {{~else}}
      {{~@root.repoUrl}}
    {{~/if}}/
    {{~@root.issue}}/{{this.issue}})
  {{~else}}
    {{~#if this.owner}}
      {{~this.owner}}/
    {{~/if}}
    {{~this.repository}}#{{this.issue}}
  {{~/if}}{{/each}}
{{~/if}}

{{~#if body}}

  {{indent body}}
{{/if}}
`;

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  repositoryUrl: "https://github.com/JMBeresford/retrom",
  branches: ["main"],
  dryRun: true,
  plugins: [
    "@semantic-release/commit-analyzer",
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
    "@semantic-release/github",
  ],
  preset: "conventionalcommits",
  ci: false,
};
