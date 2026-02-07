// @ts-check

import fs from "node:fs";
import path from "node:path";

const TAG_VALUE = process.env.TAG_VALUE;
const COMMIT_HASH = process.env.COMMIT_HASH;
const WEB_DIST_SHA = process.env.WEB_DIST_SHA;
const CARGO_DEPS_SHA = process.env.CARGO_DEPS_SHA;

const scriptPath = process.argv[1];
const outputPath = process.argv[2];

console.log("Preparing to generate Flatpak manifest with: ");
console.log(`TAG_VALUE: ${TAG_VALUE}`);
console.log(`COMMIT_HASH: ${COMMIT_HASH}`);
console.log(`WEB_DIST_SHA: ${WEB_DIST_SHA}`);
console.log(`CARGO_DEPS_SHA: ${CARGO_DEPS_SHA}`);

if (!TAG_VALUE || !COMMIT_HASH || !WEB_DIST_SHA || !CARGO_DEPS_SHA) {
  console.error("Missing one or more required environment variables.");
  process.exit(1);
}

const templatePath = path.resolve(
  scriptPath,
  "..",
  "flatpak-manifest-template.yml",
);

let template = fs.readFileSync(templatePath, "utf8");

template = template.replaceAll("{{ TAG_VALUE }}", TAG_VALUE);
template = template.replaceAll("{{ COMMIT_HASH }}", COMMIT_HASH);
template = template.replaceAll("{{ WEB_DIST_SHA }}", WEB_DIST_SHA);
template = template.replaceAll("{{ CARGO_DEPS_SHA }}", CARGO_DEPS_SHA);

if (fs.existsSync(outputPath)) {
  console.log(`Removing existing file at: ${outputPath}`);
  fs.unlinkSync(outputPath);
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

console.log(`Writing Flatpak manifest to: ${outputPath}`);
fs.writeFileSync(outputPath, template, { flag: "w+", encoding: "utf8" });
