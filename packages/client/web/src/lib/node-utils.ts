import { readFileSync } from "fs";
import { resolve } from "path";
import { ServerConfig } from "@retrom/codegen/retrom/server/config";

export function readLocalCargoToml(): string {
  const path = resolve(process.cwd(), "../../../Cargo.toml");

  const data = readFileSync(path);

  const matches = data.toString().match(/^version = "(?<ver>.*)"/m);
  const matchedVersion = matches?.groups?.ver || "0.0.0";

  return matchedVersion;
}

export function readConfigFile(path?: string) {
  path = path || process.env.RETROM_CONFIG;

  if (!path) {
    return undefined;
  }

  try {
    const data = readFileSync(path).toString();

    const parsed = JSON.parse(data) as unknown;
    return ServerConfig.fromJSON(parsed);
  } catch (e) {
    console.error("Failed to read config file:", e);
    return undefined;
  }
}
