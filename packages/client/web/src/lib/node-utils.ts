import { parseVersion } from "@/components/prompts/version-checks/utils";
import { Version } from "@/generated/retrom/server/server-info";

export async function readLocalCargoToml(): Promise<Version> {
  if (!import.meta.env.SSR) {
    return parseVersion("0.0.0");
  }

  const { readFile } = await import("fs");
  const { resolve } = await import("path");

  const path = resolve(process.cwd(), "../../../Cargo.toml");
  readFile(path, (err, data) => {
    if (err) {
      console.error(err);
      throw new Error("No version found");
    }

    const matches = data.toString().match(/^version = "(?<ver>.*)"/m);
    const version = matches?.groups?.ver || "0.0.0";

    return parseVersion(version);
  });

  return parseVersion("0.0.0");
}
