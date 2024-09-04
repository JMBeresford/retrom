import { ServerMismatch } from "./server-mismatch";
import { UpdateAvailable } from "./update-available";

export function VersionChecks() {
  return (
    <>
      <UpdateAvailable />
      <ServerMismatch />
    </>
  );
}
