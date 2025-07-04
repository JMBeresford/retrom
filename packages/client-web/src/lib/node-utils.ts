import { readFileSync } from "fs";
import { resolve } from "path";

export function readLocalCargoToml(): string {
  const path = resolve(__dirname, "../../../../Cargo.toml");

  const data = readFileSync(path);

  const matches = data.toString().match(/^version = "(?<ver>.*)"/m);
  const matchedVersion = matches?.groups?.ver || "0.0.0";

  return matchedVersion;
}
