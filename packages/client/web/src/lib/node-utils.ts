const readFile = await import("fs").then((mod) => mod.readFileSync);
const resolve = await import("path").then((mod) => mod.resolve);

export function readLocalCargoToml(): string {
  const path = resolve(process.cwd(), "../../../Cargo.toml");

  const data = readFile(path);

  const matches = data.toString().match(/^version = "(?<ver>.*)"/m);
  const matchedVersion = matches?.groups?.ver || "0.0.0";

  return matchedVersion;
}
