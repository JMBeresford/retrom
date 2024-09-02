"use server";

import { parseVersion } from "@/components/prompts/version-checks/utils";
import { readFile } from "fs";
import { resolve } from "path";

export async function readLocalCargoToml() {
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
