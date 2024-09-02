import { Version } from "@/generated/retrom/server/server-info";

export function versionCompare(a: Version, b: Version): number {
  const { major: aMajor, minor: aMinor } = a;
  const { major: bMajor, minor: bMinor } = b;

  if (aMajor !== bMajor) {
    return aMajor - bMajor;
  }

  if (aMinor !== bMinor) {
    return aMinor - bMinor;
  }

  if (a.patch !== b.patch) {
    return a.patch - b.patch;
  }

  return 0;
}

export function versionsEqual(a: Version, b: Version): boolean {
  console.log({ a, b });
  console.log(versionCompare(a, b) === 0);
  return versionCompare(a, b) === 0;
}

export function parseVersion(version: string): Version {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map(Number);

  return { major, minor, patch };
}

export function versionToString(version: Version) {
  return `v${version.major}.${version.minor}.${version.patch}`;
}
