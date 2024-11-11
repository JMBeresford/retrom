import { DesktopOnly } from "@/lib/env";
import { ServerMismatch } from "./server-mismatch";
import { UpdateAvailable } from "./update-available";

export function VersionChecks() {
  return (
    <>
      <DesktopOnly>
        <UpdateAvailable />
      </DesktopOnly>
      <ServerMismatch />
    </>
  );
}
