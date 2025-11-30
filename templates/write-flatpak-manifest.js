import fs from "node:fs";
import path from "node:path";

const TAG_VALUE = process.env.TAG_VALUE;
const COMMIT_HASH = process.env.COMMIT_HASH;
const WEB_DIST_x64 = process.env.WEB_DIST_x64;
const WEB_DIST_aarch64 = process.env.WEB_DIST_aarch64;
const CARGO_DEPS_x64 = process.env.CARGO_DEPS_x64;
const CARGO_DEPS_aarch64 = process.env.CARGO_DEPS_aarch64;

const scriptPath = process.argv[1];
const outputPath = process.argv[2];

if (
  !TAG_VALUE ||
  !COMMIT_HASH ||
  !WEB_DIST_x64 ||
  !WEB_DIST_aarch64 ||
  !CARGO_DEPS_x64 ||
  !CARGO_DEPS_aarch64
) {
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
template = template.replaceAll("{{ WEB_DIST_x64 }}", WEB_DIST_x64);
template = template.replaceAll("{{ WEB_DIST_aarch64 }}", WEB_DIST_aarch64);
template = template.replaceAll("{{ CARGO_DEPS_x64 }}", CARGO_DEPS_x64);
template = template.replaceAll("{{ CARGO_DEPS_aarch64 }}", CARGO_DEPS_aarch64);

if (fs.existsSync(outputPath)) {
  console.log(`Removing existing file at: ${outputPath}`);
  fs.unlinkSync(outputPath);
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

console.log(`Writing Flatpak manifest to: ${outputPath}`);
fs.writeFileSync(outputPath, template, { flag: "w+", encoding: "utf8" });
